import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Location, PersonData } from "../../types";
import { getLocations } from "../../api/locations";
import styles from "../../styles/SearchBar";
import { API_URL } from "../../api/config";

interface PersonaResult {
  numeroEmpleado: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  cubiculo?: string;
  planta?: string;
  ubicacion: {
    nombre: string;
    coordenadas: { latitude: number; longitude: number };
  } | null;
}

export interface EventResult {
  _id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cupos: number;
  cuposDisponibles: number;
  activo: boolean;
  image?: string;
  destino?: {
    _id: string;
    nombre: string;
    posicion?: { latitude: number; longitude: number };
  };
  espacio?: { _id: string; nombre: string };
  creadoPor?: { nombre: string; apellidoPaterno: string; email: string };
}

type SuggestionItem =
  | { type: "location"; data: Location }
  | { type: "person"; data: PersonaResult }
  | { type: "event"; data: EventResult };

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSelectLocation?: (location: Location, personData?: PersonData) => void;
}

const SearchBar = ({ value, onChange, onSelectLocation }: Props) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocations().then(setLocations);
  }, []);

  useEffect(() => {
    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(() => runSearch(value.trim()), 300);
    return () => clearTimeout(timer);
  }, [value, locations]);

  const runSearch = async (query: string) => {
    setLoading(true);
    try {
      const q = query.toLowerCase();

      const filteredLocations: SuggestionItem[] = locations
        .filter((loc) => loc.nombre.toLowerCase().includes(q))
        .map((loc) => ({ type: "location", data: loc }));

      const [personasRes, eventosRes] = await Promise.allSettled([
        fetch(`${API_URL}/personal/buscar?q=${encodeURIComponent(query)}`),
        fetch(`${API_URL}/events/active`),
      ]);

      let filteredPersonas: SuggestionItem[] = [];
      if (personasRes.status === "fulfilled") {
        const json = await personasRes.value.json();
        const personas: PersonaResult[] = json.success ? json.data : [];
        filteredPersonas = personas
          .filter((p) => p.ubicacion?.coordenadas)
          .map((p) => ({ type: "person", data: p }));
      }

      let filteredEvents: SuggestionItem[] = [];
      if (eventosRes.status === "fulfilled") {
        const json = await eventosRes.value.json();
        const eventos: EventResult[] = json.success ? json.data : [];
        filteredEvents = eventos
          .filter(
            (e) =>
              e.destino?.posicion &&
              (e.titulo.toLowerCase().includes(q) ||
                e.descripcion?.toLowerCase().includes(q) ||
                e.destino?.nombre?.toLowerCase().includes(q))
          )
          .map((e) => ({ type: "event", data: e }));
      }

      const merged = [...filteredPersonas, ...filteredLocations, ...filteredEvents];
      setSuggestions(merged);
      setShowSuggestions(merged.length > 0);
    } catch (error) {
      console.error("Error en búsqueda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (loc: Location) => {
    onChange(loc.nombre);
    setShowSuggestions(false);
    onSelectLocation?.(loc);
  };

  const handleSelectPerson = (persona: PersonaResult) => {
    onChange(persona.nombreCompleto);
    setShowSuggestions(false);
    if (!persona.ubicacion) return;

    const location: Location = {
      _id: persona.numeroEmpleado,
      nombre: persona.ubicacion.nombre,
      posicion: {
        latitude: persona.ubicacion.coordenadas.latitude,
        longitude: persona.ubicacion.coordenadas.longitude,
      },
    };
    const personData: PersonData = {
      numeroEmpleado: persona.numeroEmpleado,
      nombreCompleto: persona.nombreCompleto,
      email: persona.email,
      telefono: persona.telefono,
      cargo: persona.cargo,
      departamento: persona.departamento,
      cubiculo: persona.cubiculo,
      planta: persona.planta,
    };
    onSelectLocation?.(location, personData);
  };

  const handleSelectEvent = (event: EventResult) => {
    onChange(event.titulo);
    setShowSuggestions(false);
    if (!event.destino?.posicion) return;

    // Pack every event field into the Location object.
    // MapViewContainer.handleLocationSelect receives this exactly as-is
    // because personData is undefined, so no isPerson overwrite happens.
    const location: Location = {
      _id: event._id,
      nombre: event.destino.nombre,
      posicion: {
        latitude: event.destino.posicion.latitude,
        longitude: event.destino.posicion.longitude,
      },
      isEvent: true,
      eventId: event._id,
      eventTitulo: event.titulo,
      eventDescripcion: event.descripcion,
      eventFecha: event.fecha,
      eventHoraInicio: event.horaInicio,
      eventHoraFin: event.horaFin,
      eventCupos: event.cupos,
      eventCuposDisponibles: event.cuposDisponibles,
      eventActivo: event.activo,
      eventImage: event.image,
      eventEspacioNombre: event.espacio?.nombre,
      eventEncargado: event.creadoPor
        ? `${event.creadoPor.nombre} ${event.creadoPor.apellidoPaterno}`
        : undefined,
      eventEncargadoEmail: event.creadoPor?.email,
    };

    onSelectLocation?.(location);   // no personData → handleLocationSelect won't overwrite isEvent
  };

const formatEventDate = (fecha: string) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString("es-MX", {
        day: "numeric", month: "short", timeZone: "UTC"
    });
};

  const renderItem = ({ item }: { item: SuggestionItem }) => {
    if (item.type === "location") {
      return (
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => handleSelectLocation(item.data)}
        >
          <MaterialIcons name="place" size={20} color="#4285F4" />
          <Text style={styles.suggestionText}>{item.data.nombre}</Text>
        </TouchableOpacity>
      );
    }
    if (item.type === "person") {
      return (
        <TouchableOpacity
          style={styles.suggestionItem}
          onPress={() => handleSelectPerson(item.data)}
        >
          <MaterialIcons name="person-pin" size={20} color="#E53935" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.suggestionText}>{item.data.nombreCompleto}</Text>
            <Text style={{ fontSize: 12, color: "#888" }}>
              {item.data.cargo} · {item.data.ubicacion?.nombre}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    // "event"
    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSelectEvent(item.data)}
      >
        <MaterialIcons name="event" size={20} color="#FB8C00" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.suggestionText}>{item.data.titulo}</Text>
          <Text style={{ fontSize: 12, color: "#888" }}>
            {formatEventDate(item.data.fecha)}{" "}
            {item.data.horaInicio}–{item.data.horaFin}
            {item.data.destino?.nombre ? ` · ${item.data.destino.nombre}` : ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialIcons name="search" size={24} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Buscar lugar, persona o evento..."
          value={value}
          onChangeText={onChange}
          style={styles.input}
        />
        {loading && (
          <ActivityIndicator size="small" color="#4285F4" style={{ marginRight: 8 }} />
        )}
        {value.length > 0 && !loading && (
          <TouchableOpacity
            onPress={() => {
              onChange("");
              setSuggestions([]);
              setShowSuggestions(false);
            }}
          >
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => {
              if (item.type === "location") return `loc-${item.data._id}`;
              if (item.type === "person")
                return `person-${item.data.numeroEmpleado}-${index}`;
              return `event-${item.data._id}-${index}`;
            }}
            renderItem={renderItem}
          />
        </View>
      )}
    </View>
  );
};

export default SearchBar;