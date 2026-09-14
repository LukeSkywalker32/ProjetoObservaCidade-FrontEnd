import { MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AddressAutocompleteProps {
	value: string;
	onChange: (value: string) => void;
	userLocation?: { lat: number; lng: number } | null;
	placeholder?: string;
}

// Formato de cada sugestão retornada pela Autocomplete API do Geoapify
// (usando format=json). Nem todo campo vem preenchido em toda sugestão —
// por isso todos são opcionais, exceto os que a API sempre retorna.
interface GeoapifySuggestion {
	place_id: string;
	formatted: string;
	street?: string;
	housenumber?: string;
	suburb?: string;
	district?: string;
	city?: string;
	county?: string;
	state?: string;
}

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

export function AddressAutocomplete({
	value,
	onChange,
	userLocation,
	placeholder = "Digite o endereço...",
}: AddressAutocompleteProps) {
	const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Busca sugestões na Autocomplete API do Geoapify.
	// Diferente do Google (que tinha um componente de UI pronto, o
	// google.maps.places.Autocomplete), o Geoapify só devolve dados —
	// a gente que monta o dropdown na mão. Por isso o debounce de 400ms
	// aqui: sem ele, cada tecla digitada dispararia uma requisição nova.
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);

		if (!value || value.trim().length < 3) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		debounceRef.current = setTimeout(async () => {
			setIsLoading(true);
			try {
				const params = new URLSearchParams({
					text: value,
					apiKey: GEOAPIFY_API_KEY,
					filter: "countrycode:br",
					lang: "pt",
					format: "json",
					limit: "5",
				});

				if (userLocation) {
					// ↑ prioriza sugestões perto da localização do usuário —
					// é o equivalente do "bounds" + "strictBounds" que o
					// Google usava, mas o Geoapify chama isso de "bias"
					params.set(
						"bias",
						`proximity:${userLocation.lng},${userLocation.lat}`,
					);
				}

				const response = await fetch(
					`https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
				);
				const data = await response.json();
				setSuggestions(data.results || []);
				setShowSuggestions(true);
			} catch (error) {
				console.error("Erro ao buscar sugestões de endereço:", error);
				setSuggestions([]);
			} finally {
				setIsLoading(false);
			}
		}, 400);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [value, userLocation]);

	// Fecha o dropdown ao clicar fora do componente
	// (o google.maps.places.Autocomplete fazia isso sozinho; aqui
	// precisamos escutar cliques no documento manualmente)
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Monta o endereço "limpo" a partir dos campos estruturados da
	// sugestão escolhida — mesma ideia do filtro por address_components
	// que existia na versão Google, só que os nomes dos campos mudam:
	// route→street, street_number→housenumber, sublocality_level_1→suburb,
	// administrative_area_level_2→city (ou county quando a cidade não vem),
	// administrative_area_level_1→state
	const handleSelect = (suggestion: GeoapifySuggestion) => {
		// district às vezes vem igual ao city (confirmado com dado real de
		// Araçatuba) — só usamos como "bairro" quando for diferente da cidade,
		// senão o endereço final duplicaria o nome da cidade
		const neighborhood =
			suggestion.suburb ||
			(suggestion.district !== suggestion.city ? suggestion.district : undefined);

		const addressParts = [
			suggestion.street,
			suggestion.housenumber,
			neighborhood,
			suggestion.city || suggestion.county,
			suggestion.state,
		].filter(Boolean);

		const cleanAddress = addressParts.join(", ");
		onChange(cleanAddress);
		setShowSuggestions(false);
		setSuggestions([]);
	};

	const handleClear = () => {
		onChange("");
		setSuggestions([]);
		setShowSuggestions(false);
	};

	return (
		<div className="relative" ref={containerRef}>
			{/* Ícone de pin à esquerda */}
			<MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10b981] z-10 pointer-events-none" />

			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
				placeholder={placeholder}
				className="w-full pl-12 pr-10 py-3 border-2 border-[#e5e7eb] rounded-xl
                   focus:border-[#2563eb] focus:outline-none transition-colors
                   bg-[#f9fafb] text-black disabled:opacity-60"
			/>

			{/* Botão de limpar — só aparece quando há texto */}
			{value && (
				<button
					type="button"
					onClick={handleClear}
					className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                     text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
					aria-label="Limpar endereço"
				>
					<X className="w-4 h-4" />
				</button>
			)}

			{/* Dropdown de sugestões — não existia no Google porque o
			    próprio google.maps.places.Autocomplete renderizava isso */}
			{showSuggestions && suggestions.length > 0 && (
				<ul className="absolute z-20 w-full mt-1 bg-white border-2 border-[#e5e7eb] rounded-xl shadow-lg max-h-60 overflow-y-auto">
					{suggestions.map((suggestion) => (
						<li key={suggestion.place_id}>
							<button
								type="button"
								onClick={() => handleSelect(suggestion)}
								className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
							>
								{suggestion.formatted}
							</button>
						</li>
					))}
				</ul>
			)}

			{isLoading && (
				<p className="absolute text-xs text-gray-400 mt-1 pl-4">
					Buscando...
				</p>
			)}
		</div>
	);
}