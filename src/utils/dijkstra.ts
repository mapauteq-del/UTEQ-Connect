// utils/dijkstra.ts

export interface GraphNode {
  nodeId:    string;
  lat:       number;
  lng:       number;
  label?:    string;
  destinoId: string | null;
}

export interface GraphEdge {
  from:      string;
  to:        string;
  distance:  number;
  waypoints: { lat: number; lng: number }[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type AdjacencyMap = Record<
  string,
  { to: string; distance: number; waypoints: { lat: number; lng: number }[] }[]
>;

// ─── Min-Heap simple para Dijkstra eficiente O(n log n) ──────────────────────

class MinHeap {
  private heap: [number, string][] = [];

  push(item: [number, string]) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop(): [number, string] | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size() { return this.heap.length; }

  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[parent][0] <= this.heap[i][0]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private _sinkDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
      if (r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

// ─── Construir mapa de adyacencia ─────────────────────────────────────────────

export const buildAdjacencyMap = (edges: GraphEdge[]): AdjacencyMap => {
  const map: AdjacencyMap = {};
  for (const e of edges) {
    if (!map[e.from]) map[e.from] = [];
    map[e.from].push({ to: e.to, distance: e.distance, waypoints: e.waypoints ?? [] });
  }
  return map;
};

// ─── Haversine ────────────────────────────────────────────────────────────────

export const haversine = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Bearing entre dos puntos (grados 0-360) ─────────────────────────────────

export const bearing = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1R = (lat1 * Math.PI) / 180;
  const lat2R = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2R);
  const x = Math.cos(lat1R) * Math.sin(lat2R) - Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

// ─── Nodo más cercano ─────────────────────────────────────────────────────────

export const nearestNode = (
  nodes: GraphNode[],
  lat: number,
  lng: number
): GraphNode => {
  let best = nodes[0];
  let bestDist = Infinity;
  for (const n of nodes) {
    const d = haversine(lat, lng, n.lat, n.lng);
    if (d < bestDist) { bestDist = d; best = n; }
  }
  return best;
};

// ─── Snap de coordenada GPS al punto más cercano de la ruta ──────────────────
// Proyecta el punto sobre cada segmento y elige la proyección más cercana

export const snapToRoute = (
  lat: number,
  lng: number,
  route: { latitude: number; longitude: number }[]
): { latitude: number; longitude: number; index: number; distance: number } => {
  let bestDist = Infinity;
  let bestPoint = route[0];
  let bestIndex = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const A = route[i];
    const B = route[i + 1];

    // Vector AB
    const abLat = B.latitude  - A.latitude;
    const abLng = B.longitude - A.longitude;
    const abLen2 = abLat * abLat + abLng * abLng;

    if (abLen2 === 0) continue;

    // Proyección de P sobre AB, clampada a [0,1]
    const t = Math.max(0, Math.min(1,
      ((lat - A.latitude) * abLat + (lng - A.longitude) * abLng) / abLen2
    ));

    const projLat = A.latitude  + t * abLat;
    const projLng = A.longitude + t * abLng;
    const d = haversine(lat, lng, projLat, projLng);

    if (d < bestDist) {
      bestDist = d;
      bestPoint = { latitude: projLat, longitude: projLng };
      bestIndex = i;
    }
  }

  return { ...bestPoint, index: bestIndex, distance: bestDist };
};

// ─── Dijkstra con Min-Heap ────────────────────────────────────────────────────

export const dijkstra = (
  map: AdjacencyMap,
  allNodeIds: string[],
  startId: string,
  endId: string
): string[] => {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const heap = new MinHeap();

  for (const id of allNodeIds) { dist[id] = Infinity; prev[id] = null; }
  dist[startId] = 0;
  heap.push([0, startId]);

  while (heap.size > 0) {
    const item = heap.pop();
    if (!item) break;
    const [d, u] = item;

    if (visited.has(u)) continue;
    visited.add(u);
    if (u === endId) break;

    for (const { to, distance } of map[u] ?? []) {
      if (visited.has(to)) continue;
      const alt = d + distance;
      if (alt < dist[to]) {
        dist[to] = alt;
        prev[to] = u;
        heap.push([alt, to]);
      }
    }
  }

  const path: string[] = [];
  let cur: string | null = endId;
  while (cur !== null) { path.unshift(cur); cur = prev[cur] ?? null; }
  return path[0] === startId ? path : [];
};

// ─── Convertir path a coordenadas con waypoints ───────────────────────────────

export const pathToCoordinates = (
  path: string[],
  nodes: GraphNode[],
  map: AdjacencyMap
): { latitude: number; longitude: number }[] => {
  const nodeMap = new Map(nodes.map(n => [n.nodeId, n]));
  const coords: { latitude: number; longitude: number }[] = [];

  for (let i = 0; i < path.length; i++) {
    const node = nodeMap.get(path[i]);
    if (!node) continue;

    coords.push({ latitude: node.lat, longitude: node.lng });

    if (i < path.length - 1) {
      const edge = map[path[i]]?.find(e => e.to === path[i + 1]);
      if (edge?.waypoints?.length) {
        for (const wp of edge.waypoints) {
          coords.push({ latitude: wp.lat, longitude: wp.lng });
        }
      }
    }
  }

  return coords;
};

// ─── Distancia total ──────────────────────────────────────────────────────────

export const routeDistance = (path: string[], map: AdjacencyMap): number => {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = map[path[i]]?.find(e => e.to === path[i + 1]);
    if (edge) total += edge.distance;
  }
  return total;
};

// ─── Tiempo caminando (1.4 m/s ≈ 5 km/h) ────────────────────────────────────

export const walkingTime = (distanceMeters: number): string => {
  const minutes = Math.ceil(distanceMeters / 1.4 / 60);
  return minutes <= 1 ? '1 min' : `${minutes} min`;
};

// ─── Instrucciones de giro ────────────────────────────────────────────────────

export type TurnInstruction = {
  instruction: string;
  distance:    number;
  coords:      { latitude: number; longitude: number };
};

export const buildTurnInstructions = (
  coords: { latitude: number; longitude: number }[]
): TurnInstruction[] => {
  const instructions: TurnInstruction[] = [];
  if (coords.length < 2) return instructions;

  instructions.push({
    instruction: 'Inicia el recorrido',
    distance: 0,
    coords: coords[0],
  });

  const TURN_THRESHOLD = 30; // grados mínimos para considerar un giro

  for (let i = 1; i < coords.length - 1; i++) {
    const b1 = bearing(
      coords[i-1].latitude, coords[i-1].longitude,
      coords[i].latitude,   coords[i].longitude
    );
    const b2 = bearing(
      coords[i].latitude,   coords[i].longitude,
      coords[i+1].latitude, coords[i+1].longitude
    );

    let diff = b2 - b1;
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;

    // Calcular distancia acumulada desde el último punto de instrucción
    const dist = haversine(
      coords[i-1].latitude, coords[i-1].longitude,
      coords[i].latitude,   coords[i].longitude
    );

    if (Math.abs(diff) >= TURN_THRESHOLD) {
      const turn = diff > 0 ? 'Gira a la derecha' : 'Gira a la izquierda';
      instructions.push({ instruction: turn, distance: Math.round(dist), coords: coords[i] });
    }
  }

  instructions.push({
    instruction: 'Has llegado a tu destino',
    distance: 0,
    coords: coords[coords.length - 1],
  });

  return instructions;
};