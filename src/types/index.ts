// ==================== COORDINATES ====================

export interface Coordinates {
    latitude: number;
    longitude: number;
}

// ==================== LOCATION ====================

export interface Location {
    _id: string;
    nombre: string;
    posicion: {
        latitude: number;
        longitude: number;
    };

    // ── Optional place fields ──────────────────────────
    direccion?: string;
    telefono?: string;
    horario?: string;
    sitioWeb?: string;
    calificacion?: number;
    totalResenas?: number;
    descripcion?: string;
    tipo?: string;
    fotos?: string[];

    // ── Person fields (isPerson = true) ───────────────
    isPerson?: boolean;
    numeroEmpleado?: string;
    nombreCompleto?: string;
    email?: string;
    cargo?: string;
    departamento?: string;
    cubiculo?: string;
    planta?: string;

    // ── Event fields (isEvent = true) ─────────────────
    isEvent?: boolean;
    eventId?: string;
    eventTitulo?: string;
    eventDescripcion?: string;
    eventFecha?: string;
    eventHoraInicio?: string;
    eventHoraFin?: string;
    eventCupos?: number;
    eventCuposDisponibles?: number;
    eventActivo?: boolean;
    eventImage?: string;
    eventEspacioNombre?: string;
    eventEncargado?: string;
    eventEncargadoEmail?: string;
}

// ==================== ROUTE INFO ====================

export interface RouteInfo {
    distancia: string;
    duracion: string;
    distanciaValor: number;
    duracionValor: number;
}

// ==================== PERSON DATA ====================

export interface PersonData {
    numeroEmpleado: string;
    nombreCompleto: string;
    email: string;
    telefono: string;
    cargo: string;
    departamento: string;
    cubiculo?: string;
    planta?: string;
}

// ==================== PERSONAL (from API) ====================

export interface Personal {
    numeroEmpleado: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    telefono: string;
    departamento: string;
    cargo: string;
    cubiculo?: string;
    planta?: string;
    fechaIngreso: Date;
    estatus: string;
}

export interface PersonalConUbicacion {
    departamento: string;
    ubicacion: {
        nombre: string;
        coordenadas: { latitude: number; longitude: number };
        id: string;
    } | null;
    personal: Array<{
        numeroEmpleado: string;
        nombreCompleto: string;
        email: string;
        telefono: string;
        cargo: string;
        cubiculo?: string;
        planta?: string;
        estatus: string;
    }>;
    total: number;
}

export interface ProfesorConUbicacion {
    profesor: {
        numeroEmpleado: string;
        nombreCompleto: string;
        email: string;
        telefono: string;
        departamento: string;
        cargo: string;
        cubiculo?: string;
        planta?: string;
        fechaIngreso: Date;
        estatus: string;
    };
    ubicacion: {
        nombre: string;
        coordenadas: { latitude: number; longitude: number };
        id: string;
        comoLlegar: string;
    } | null;
}