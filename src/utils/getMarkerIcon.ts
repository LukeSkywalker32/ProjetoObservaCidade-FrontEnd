export function createMarkerIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  `;

  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  // ↑ gera a URL do SVG independente da API do Google Maps

  try {
    return {
      url,
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 32),
      // ↑ tenta usar Size e Point da API do Google Maps
      // se a API ainda não estiver pronta, cai no catch
    };
  } catch {
    return { url };
    // ↑ fallback seguro — retorna só a URL sem scaledSize
    // o marker ainda aparece, apenas sem o tamanho customizado
    // na próxima renderização a API já estará pronta e o ícone ficará correto
  }
}
