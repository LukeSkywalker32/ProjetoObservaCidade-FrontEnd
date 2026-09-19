import { useEffect, useState } from "react";

interface UserLocation {
  lat: number;
  lng: number;
}

interface UseUserLocationOptions {
  /** Se false, não busca automaticamente no mount */
  enabled?: boolean;
  /** Timeout em ms pro navigator.geolocation (default: 10000) */
  timeout?: number;
}

export function useUserLocation(options: UseUserLocationOptions = {}) {
  const { enabled = true, timeout = 10000 } = options;
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const getLocation = async () => {
      setLoading(true);
      setError(null);

      try {
        // Detecta plataforma — Capacitor injeta window.Capacitor global em native
        const isNative =
          typeof window !== "undefined" &&
          // @ts-expect-error - Capacitor injeta essa var global no native
          (window.Capacitor?.isNativePlatform?.() ?? false);

        if (isNative) {
          // Lazy import — Capacitor só carrega se tiver native
          const { Geolocation } = await import("@capacitor/geolocation");
          const permission = await Geolocation.requestPermissions();

          if (permission.location !== "granted") {
            setError("Permissão de localização negada");
            return;
          }

          const position = await Geolocation.getCurrentPosition();
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        } else if (navigator.geolocation) {
          // Web — API nativa do navegador
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout,
              });
            },
          );
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        } else {
          setError("Geolocalização não suportada neste ambiente");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro desconhecido";
        console.warn("[useUserLocation]", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, [enabled, timeout]);

  return { location, loading, error };
}
