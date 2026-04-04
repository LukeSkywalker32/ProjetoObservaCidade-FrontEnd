/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLEMAPS_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}