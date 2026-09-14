import L from "leaflet";

export function createMarkerIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  `;

  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  // ↑ gera a URL do SVG, igual antes — isso não depende de nenhuma API de mapa

  return L.icon({
    iconUrl: url,
    iconSize: [32, 32],
    // ↑ equivalente ao scaledSize do Google — tamanho do ícone em pixels
    iconAnchor: [16, 32],
    // ↑ equivalente ao anchor do Google — ponto do ícone que fica exatamente
    // sobre a coordenada (aqui: centro horizontal, base do pin)
  });
}