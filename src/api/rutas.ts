import { API_URL } from './config';
import { Coordinates } from '../types';

export interface RutaManual {
    _id: string;
    nombre: string;
    descripcion?: string;
    origen: Coordinates;
    destino: string | { _id: string; nombre: string; posicion: Coordinates };
    puntos: Coordinates[];
    activa: boolean;
    color?: string;
}

// ── Haversine: distancia en metros ────────────────────────────────────────────
const haversineM = (a: Coordinates, b: Coordinates): number => {
    const R  = 6371000;
    const φ1 = (a.latitude  * Math.PI) / 180;
    const φ2 = (b.latitude  * Math.PI) / 180;
    const Δφ = ((b.latitude  - a.latitude)  * Math.PI) / 180;
    const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
    const x  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

/**
 * Busca todas las rutas activas de un destino y devuelve
 * la que tenga el origen más cercano al usuario.
 * Retorna null si no hay rutas → MapViewContainer cae a Google.
 */
export const getRutaMasCercana = async (
    destinoId: string,
    ubicacionUsuario: Coordinates,
): Promise<RutaManual | null> => {
    try {
        console.log(`[rutas] buscando rutas para destino: ${destinoId}`);

        // Sin AbortSignal.timeout — no está soportado en React Native / Hermes
        const res = await fetch(`${API_URL}/rutas/destino/${destinoId}`);

        console.log(`[rutas] respuesta HTTP: ${res.status}`);

        if (!res.ok) {
            console.log(`[rutas] respuesta no OK: ${res.status}`);
            return null;
        }

        const data = await res.json();
        console.log(`[rutas] rutas encontradas: ${data.data?.length ?? 0}`);

        const rutas: RutaManual[] = (data.data || []).filter((r: RutaManual) => r.activa);
        console.log(`[rutas] rutas activas: ${rutas.length}`);

        if (rutas.length === 0) return null;
        if (rutas.length === 1) return rutas[0];

        // Elige la más cercana al usuario
        const elegida = rutas.reduce((mejor, ruta) => {
            const distMejor = haversineM(ubicacionUsuario, mejor.origen);
            const distRuta  = haversineM(ubicacionUsuario, ruta.origen);
            return distRuta < distMejor ? ruta : mejor;
        });

        console.log(`[rutas] ruta elegida: ${elegida.nombre}`);
        return elegida;

    } catch (err) {
        console.error('[rutas] error en getRutaMasCercana:', err);
        return null;
    }
};

/**
 * Convierte puntos de ruta manual al formato Coordinates[] para Polyline.
 */
export const puntosToCoordinates = (ruta: RutaManual): Coordinates[] =>
    ruta.puntos.map(p => ({ latitude: p.latitude, longitude: p.longitude }));