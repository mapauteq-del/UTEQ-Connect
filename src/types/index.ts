// ==================== COORDINATES ====================

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Location {
    _id: string;
    nombre: string;
    posicion: Coordinates;
    personData?: PersonData;

    // Propiedades opcionales para lugares
    direccion?: string;
    telefono?: string;
    horario?: string;
    sitioWeb?: string;
    calificacion?: number;
    totalResenas?: number;
    descripcion?: string;
    tipo?: string;
    fotos?: string[];

    // Propiedades opcionales para personas
    isPerson?: boolean;
    numeroEmpleado?: string;
    nombreCompleto?: string;
    email?: string;
    cargo?: string;
    departamento?: string;
    cubiculo?: string;
    planta?: string;
}

export interface RouteInfo {
    distancia: string;
    duracion: string;
    distanciaValor: number;
    duracionValor: number;
}

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

// ==================== LOCATION ====================

export interface Location {
    _id: string;
    nombre: string;
    posicion: {
        latitude: number;
        longitude: number;
    };
    // Optional person fields — populated when selected via person search
    isPerson?: boolean;
    numeroEmpleado?: string;
    nombreCompleto?: string;
    email?: string;
    telefono?: string;
    cargo?: string;
    departamento?: string;
    cubiculo?: string;
    planta?: string;
}

// ==================== ROUTE INFO ====================

export interface RouteInfo {
    distancia: string;
    duracion: string;
    distanciaValor: number;
    duracionValor: number;
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
        coordenadas: {
            latitude: number;
            longitude: number;
        };
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
        coordenadas: {
            latitude: number;
            longitude: number;
        };
        id: string;
        comoLlegar: string;
    } | null;
}