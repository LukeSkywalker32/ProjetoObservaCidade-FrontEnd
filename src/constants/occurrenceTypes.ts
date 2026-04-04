export const OCCURRENCE_TYPES = {
    furto: {
        label: "Furto",
        color: "#ef4444",
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
    },
    "atividade suspeita": {
        label: "Atividade Suspeita",
        color: "#f59e0b",
        icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
    },
    roubo: {
        label: "Roubo",
        color: "#008000",
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
    },
    vandalismo: {
        label: "Vandalismo",
        color: "#8b5cf6",
        icon: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
    },
    outros: {
        label: "Outros",
        color: "#6b7280",
        icon: "http://maps.google.com/mapfiles/ms/icons/gray-dot.png"
    },
} as const;