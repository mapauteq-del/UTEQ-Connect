import { Coordinates } from "../types";

// ─── Haversine ────────────────────────────────────────────────────────────────

export const calcularDistancia = (punto1: Coordinates, punto2: Coordinates): number => {
    const R = 6371000;
    const lat1Rad = (punto1.latitude  * Math.PI) / 180;
    const lat2Rad = (punto2.latitude  * Math.PI) / 180;
    const deltaLat = ((punto2.latitude  - punto1.latitude)  * Math.PI) / 180;
    const deltaLon = ((punto2.longitude - punto1.longitude) * Math.PI) / 180;
    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Punto más cercano en la ruta (proyección sobre segmentos) ────────────────

export const encontrarPuntoMasCercano = (
    posicionActual: Coordinates,
    rutaPuntos: Coordinates[]
): { puntoMasCercano: Coordinates; distancia: number; indice: number } => {

    let bestDist = Infinity;
    let bestPoint = rutaPuntos[0];
    let bestIndex = 0;

    for (let i = 0; i < rutaPuntos.length - 1; i++) {
        const A = rutaPuntos[i];
        const B = rutaPuntos[i + 1];

        const abLat = B.latitude  - A.latitude;
        const abLng = B.longitude - A.longitude;
        const abLen2 = abLat * abLat + abLng * abLng;

        let projLat: number, projLng: number;

        if (abLen2 === 0) {
            projLat = A.latitude;
            projLng = A.longitude;
        } else {
            const t = Math.max(0, Math.min(1,
                ((posicionActual.latitude  - A.latitude)  * abLat +
                 (posicionActual.longitude - A.longitude) * abLng) / abLen2
            ));
            projLat = A.latitude  + t * abLat;
            projLng = A.longitude + t * abLng;
        }

        const d = calcularDistancia(posicionActual, { latitude: projLat, longitude: projLng });
        if (d < bestDist) {
            bestDist  = d;
            bestPoint = { latitude: projLat, longitude: projLng };
            bestIndex = i;
        }
    }

    // Último punto también
    const dLast = calcularDistancia(posicionActual, rutaPuntos[rutaPuntos.length - 1]);
    if (dLast < bestDist) {
        bestDist  = dLast;
        bestPoint = rutaPuntos[rutaPuntos.length - 1];
        bestIndex = rutaPuntos.length - 1;
    }

    return { puntoMasCercano: bestPoint, distancia: bestDist, indice: bestIndex };
};

// ─── Verificar desvío ─────────────────────────────────────────────────────────

export const estaFueraDeRuta = (
    posicionActual: Coordinates,
    rutaPuntos: Coordinates[],
    umbralMetros: number = 30
): boolean => {
    if (rutaPuntos.length === 0) return false;
    const { distancia } = encontrarPuntoMasCercano(posicionActual, rutaPuntos);
    return distancia > umbralMetros;
};

// ─── Recortar ruta — elimina tramos ya recorridos ────────────────────────────
// Devuelve la subruta desde el punto más cercano al usuario hasta el final.
// También devuelve el punto snap (proyectado sobre el segmento) como primer punto.

export const recortarRuta = (
    posicionActual: Coordinates,
    rutaPuntos: Coordinates[]
): Coordinates[] => {
    if (rutaPuntos.length < 2) return rutaPuntos;

    const { indice, puntoMasCercano } = encontrarPuntoMasCercano(posicionActual, rutaPuntos);

    // El snap es el primer punto; luego todos los que siguen
    const restante = rutaPuntos.slice(indice + 1);
    return [puntoMasCercano, ...restante];
};

// ─── Distancia restante hasta el final de la ruta ────────────────────────────

export const distanciaRestante = (
    posicionActual: Coordinates,
    rutaPuntos: Coordinates[]
): number => {
    const recortada = recortarRuta(posicionActual, rutaPuntos);
    let total = 0;
    for (let i = 0; i < recortada.length - 1; i++) {
        total += calcularDistancia(recortada[i], recortada[i + 1]);
    }
    return total;
};

// ─── Bearing entre dos puntos (para rotar el mapa) ───────────────────────────

export const calcularBearing = (from: Coordinates, to: Coordinates): number => {
    const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude   * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};