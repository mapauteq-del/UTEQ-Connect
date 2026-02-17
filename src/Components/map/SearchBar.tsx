import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, TouchableOpacity, Text, ActivityIndicator } from "react-native";
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
    coordenadas: {
      latitude: number;
      longitude: number;
    };
  } | null;
}

// Unified suggestion item
type SuggestionItem =
  | { type: "location"; data: Location }
  | { type: "person"; data: PersonaResult };

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSelectLocation?: (location: Location, personData?: PersonData) => void;
};

const SearchBar = ({ value, onChange, onSelectLocation }: Props) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load all locations once on mount
  useEffect(() => {
    getLocations().then(setLocations);
  }, []);

  // Debounced search whenever value changes
  useEffect(() => {
    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      runSearch(value.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [value, locations]);

  const runSearch = async (query: string) => {
    setLoading(true);
    try {
      // 1. Filter locations locally (already loaded)
      const filteredLocations: SuggestionItem[] = locations
        .filter(loc => loc.nombre.toLowerCase().includes(query.toLowerCase()))
        .map(loc => ({ type: "location", data: loc }));

      // 2. Fetch people from API
      const response = await fetch(
        `${API_URL}/personal/buscar?q=${encodeURIComponent(query)}`
      );
      const json = await response.json();
      const personas: PersonaResult[] = json.success ? json.data : [];

      // Only include people who have a known location with coordinates
      const filteredPersonas: SuggestionItem[] = personas
        .filter(p => p.ubicacion?.coordenadas)
        .map(p => ({ type: "person", data: p }));

      // Merge: people first, then locations (or adjust order to taste)
      const merged = [...filteredPersonas, ...filteredLocations];

      setSuggestions(merged);
      setShowSuggestions(merged.length > 0);
    } catch (error) {
      console.error("Error en búsqueda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location: Location) => {
    onChange(location.nombre);
    setShowSuggestions(false);
    onSelectLocation?.(location);
  };

  const handleSelectPerson = (persona: PersonaResult) => {
    onChange(persona.nombreCompleto);
    setShowSuggestions(false);

    if (!persona.ubicacion) return;

    // Build a Location object from the person's ubicacion
    const location: Location = {
      _id: persona.numeroEmpleado,
      nombre: persona.ubicacion.nombre,
      posicion: {
        latitude: persona.ubicacion.coordenadas.latitude,
        longitude: persona.ubicacion.coordenadas.longitude,
      },
    };

    // Build PersonData to pass alongside
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

    console.log("👤 Persona seleccionada:", persona.nombreCompleto);
    console.log("📍 Dirigiendo a:", location.nombre);

    onSelectLocation?.(location, personData);
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

    // Person result
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
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialIcons name="search" size={24} color="#999" style={styles.icon} />
        <TextInput
          placeholder="Buscar lugar o persona..."
          value={value}
          onChangeText={onChange}
          style={styles.input}
        />
        {loading && <ActivityIndicator size="small" color="#4285F4" style={{ marginRight: 8 }} />}
        {value.length > 0 && !loading && (
          <TouchableOpacity onPress={() => { onChange(""); setSuggestions([]); setShowSuggestions(false); }}>
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) =>
              item.type === "location" ? item.data._id : `person-${item.data.numeroEmpleado}-${index}`
            }
            renderItem={renderItem}
          />
        </View>
      )}
    </View>
  );
};

export default SearchBar;