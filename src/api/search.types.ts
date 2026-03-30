// ─── IEspacio ─────────────────────────────────────────────────────────────────
export interface IEspacio {
    _id: string;
    nombre: string;
    destino?: string | IDestino;
    cupos: number;
    ocupado: boolean;
    planta: "alta" | "baja" | "única";
    descripcion?: string;
}

// ─── Matching IDestino ────────────────────────────────────────────────────────
export interface IDestino {
    _id: string;
    nombre: string;
    posicion: {
        latitude: number;
        longitude: number;
    };
    image?: string;
    espacios?: IEspacio[];   // populated when fetched with espacios
    rutaPregrabada?: {
        origen: string;
        puntos: { latitude: number; longitude: number }[];
    };
    createdAt?: string;
    updatedAt?: string;
}

// ─── Matching IEvent ──────────────────────────────────────────────────────────
export interface IEvent {
    _id: string;
    titulo: string;
    descripcion?: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    destino: string | IDestino;
    espacio?: string | IEspacio; // populated or ObjectId string
    cupos: number;
    cuposDisponibles: number;
    creadoPor?: string;
    activo: boolean;
    desactivarEn?: string;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

// ─── Matching IPersonal ───────────────────────────────────────────────────────
export interface IPersonal {
    _id: string;
    numeroEmpleado: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    imagenPerfil?: string;
    telefono: string;
    departamento: string;
    cargo: string;
    cubiculo?: string;
    planta?: string;
    fechaIngreso: string;
    estatus: "activo" | "inactivo";
    rol: "admin" | "superadmin";
    createdAt?: string;
    updatedAt?: string;
    nombreCompleto?: string;
}

// ─── Search ───────────────────────────────────────────────────────────────────
export type SearchCategory = "all" | "places" | "events" | "people";

export type SearchResult =
    | { kind: "place";  data: IDestino  }
    | { kind: "event";  data: IEvent    }
    | { kind: "person"; data: IPersonal };