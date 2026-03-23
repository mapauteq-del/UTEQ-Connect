// hooks/useGraph.ts
import { useState, useEffect } from 'react';
import { API_URL } from '../api/config';
import {
  GraphNode,
  GraphEdge,
  AdjacencyMap,
  buildAdjacencyMap,
} from '../utils/dijkstra';

interface GraphState {
  nodes:   GraphNode[];
  edges:   GraphEdge[];
  map:     AdjacencyMap;
  loaded:  boolean;
  error:   string | null;
}

export const useGraph = (): GraphState => {
  const [state, setState] = useState<GraphState>({
    nodes:  [],
    edges:  [],
    map:    {},
    loaded: false,
    error:  null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_URL}/grafo`);
        const json = await res.json();
        if (!json.success) throw new Error('Error cargando grafo');

        const { nodes, edges } = json.data as { nodes: GraphNode[]; edges: GraphEdge[] };
        const map = buildAdjacencyMap(edges);

        setState({ nodes, edges, map, loaded: true, error: null });
      } catch (e: any) {
        console.error('useGraph error:', e);
        setState(prev => ({ ...prev, loaded: true, error: e.message }));
      }
    };

    load();
  }, []);

  return state;
};