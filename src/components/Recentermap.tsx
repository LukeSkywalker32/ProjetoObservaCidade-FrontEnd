import type { LatLngExpression } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

// O <MapContainer> do react-leaflet só lê a prop "center" na primeira
// renderização — diferente do <GoogleMap>, ele NÃO recentraliza sozinho
// quando "center" muda depois (ex: quando a geolocalização do usuário
// chega de forma assíncrona). Esse componente corrige isso "escutando"
// a mudança e chamando map.setView() manualmente.
// Usado tanto em Map.tsx quanto em Admin.tsx — extraído aqui para não
// duplicar a mesma lógica nos dois lugares.


export function RecenterMap ({ center }: { center:LatLngExpression}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map])
  return null;
}
