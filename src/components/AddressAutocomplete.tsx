import { MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AddressAutocompleteProps {
	value: string;
	onChange: (value: string) => void;
	userLocation?: { lat: number; lng: number } | null;
	placeholder?: string;
}

export function AddressAutocomplete({
	value,
	onChange,
	userLocation,
	placeholder = "Digite o endereço...",
}: AddressAutocompleteProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		// Aguarda a API do Google Maps estar disponível
		const initAutocomplete = () => {
			if (!inputRef.current || !window.google?.maps?.places) return;

			const options: google.maps.places.AutocompleteOptions = {
				componentRestrictions: { country: "br" },
				types: ["address", "city"],
				fields: ["address_components", "geometry", "name"],
			};

			if (userLocation) {
				const userBounds = {
					north: userLocation.lat + 0.5,
					south: userLocation.lat - 0.5,
					east: userLocation.lng + 0.5,
					west: userLocation.lng - 0.5,
				};
				options.bounds = userBounds;
				options.strictBounds = true;
			}

			autocompleteRef.current = new window.google.maps.places.Autocomplete(
				inputRef.current,
				options,
			);

			// Listener: quando o usuário seleciona uma sugestão
			autocompleteRef.current.addListener("place_changed", () => {
				const place = autocompleteRef.current?.getPlace();
				if (place?.address_components) {
					const componentsToInclude = [
						"route", //Rua
						"street_number", //Número
						"sublocality_level_1", //Bairro
						"locality", //Cidade
						"administrative_area_level_1", //Estado
					];
					const addressParts = place.address_components
						.filter((c) =>
							c.types.some((type) => componentsToInclude.includes(type)),
						)
						.map((c) => c.long_name);

					const cleanAddress = addressParts.join(", ");

					onChange(cleanAddress);
				}
			});

			setIsReady(true);
		};

		// Tenta inicializar imediatamente ou aguarda a API carregar
		if (window.google?.maps?.places) {
			initAutocomplete();
		} else {
			// Polling simples para aguardar a API — ela é carregada pelo useJsApiLoader do Map
			const interval = setInterval(() => {
				if (window.google?.maps?.places) {
					clearInterval(interval);
					initAutocomplete();
				}
			}, 300);
			return () => clearInterval(interval);
		}

		return () => {
			// Remove o listener ao desmontar
			if (autocompleteRef.current) {
				window.google?.maps?.event?.clearInstanceListeners(
					autocompleteRef.current,
				);
			}
		};
	}, [onChange, userLocation]);

	const handleClear = () => {
		onChange("");
		inputRef.current?.focus();
	};

	return (
		<div className="relative">
			{/* Ícone de pin à esquerda */}
			<MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10b981] z-10 pointer-events-none" />

			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={!isReady ? "Carregando autocomplete..." : placeholder}
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
		</div>
	);
}
