import { MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  placeholder?: string;
}

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
        // Antes: chamava Geoapify direto com a chave no bundle.
        // Agora: chama o proxy do backend. Chave fica protegida.
        const params: Record<string, string> = {
          text: value,
          limit: "5",
        };

        if (userLocation) {
          params.bias = `proximity:${userLocation.lng},${userLocation.lat}`;
        }

        const response = await api.get("/geocode/autocomplete", { params });
        const results: GeoapifySuggestion[] = response.data?.results ?? [];
        setSuggestions(results);
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

  const handleSelect = (suggestion: GeoapifySuggestion) => {
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
    <div ref={containerRef} className="relative">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 border-2 border-[#e5e7eb] rounded-xl focus:border-[#2563eb] focus:outline-none transition-colors bg-[#f9fafb] text-black disabled:opacity-60"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
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
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
          <span className="text-sm text-gray-500">Buscando...</span>
        </div>
      )}
    </div>
  );
}
