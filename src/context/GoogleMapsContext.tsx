import { useJsApiLoader } from "@react-google-maps/api";
import { createContext, useContext } from "react";

const libraries: ["places"] = ["places"];

interface GoogleMapsContextType {
   isLoaded:boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({ isLoaded: false});
export function GoogleMapsProvider({ children}: { children: React.ReactNode}) {
   const { isLoaded } = useJsApiLoader({
      googleMapsApiKey: import.meta.env.VITE_GOOGLEMAPS_API_KEY,
      libraries,
      language: "pt-BR",
   })

   return (
      <GoogleMapsContext.Provider value={{ isLoaded}}>
         {children}
      </GoogleMapsContext.Provider>
   )
}

export function useGoogleMaps() {
   return useContext(GoogleMapsContext);
}