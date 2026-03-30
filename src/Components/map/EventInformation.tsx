import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    Image,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface EventData {
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
    destinoNombre?: string;
    espacioNombre?: string;
    encargado?: string;
    encargadoEmail?: string;
}

interface Props {
    event?: EventData | null;
    visible: boolean;
    onClose: () => void;
}

const EventInformation: React.FC<Props> = ({ event, visible, onClose }) => {

    const formatDate = (iso: string) => {
        if (!iso) return 'Fecha no disponible';
        const date = new Date(iso);
        if (isNaN(date.getTime())) return 'Fecha no disponible';
        return date.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    };

    const cuposPercent =
        event && event.cupos > 0
            ? Math.min(100, Math.round((event.cuposDisponibles / event.cupos) * 100))
            : 0;

    const cuposColor =
        cuposPercent > 50 ? "#34A853" : cuposPercent > 20 ? "#FB8C00" : "#E53935";

    return (
        console.log('event completo:', JSON.stringify(event, null, 2)),
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={s.overlay}>
                <View style={s.sheet}>

                    {/* ── Header ────────────────────────────────────── */}
                    <View style={s.header}>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Ionicons name="close" size={26} color="#5F6368" />
                        </TouchableOpacity>
                        <Text style={s.headerTitle}>Información del Evento</Text>
                        <View style={{ width: 26 }} />
                    </View>

                    {/* ── Empty state ───────────────────────────────── */}
                    {!event ? (
                        <View style={s.empty}>
                            <Text style={s.emptyText}>Sin información disponible</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>

                            {/* Banner */}
                            {event.image ? (
                                <Image source={{ uri: event.image }} style={s.banner} resizeMode="cover" />
                            ) : (
                                <View style={s.bannerPlaceholder}>
                                    <Ionicons name="calendar" size={52} color="#FB8C00" />
                                </View>
                            )}

                            {/* Título + badge */}
                            <View style={s.section}>
                                <View style={s.titleRow}>
                                    <Text style={s.title}>{event.titulo}</Text>
                                    <View style={[s.badge, { backgroundColor: event.activo ? "#E8F5E9" : "#FCECEA" }]}>
                                        <Text style={[s.badgeText, { color: event.activo ? "#2E7D32" : "#C62828" }]}>
                                            {event.activo ? "Activo" : "Inactivo"}
                                        </Text>
                                    </View>
                                </View>
                                {!!event.descripcion && (
                                    <Text style={s.description}>{event.descripcion}</Text>
                                )}
                            </View>

                            {/* Fecha y hora */}
                            <View style={s.section}>
                                <View style={s.row}>
                                    <Ionicons name="calendar-outline" size={18} color="#4285F4" />
                                    <Text style={s.label}>Fecha</Text>
                                </View>
                                <Text style={s.info}>{formatDate(event.fecha)}</Text>

                                <View style={[s.row, { marginTop: 8 }]}>
                                    <Ionicons name="time-outline" size={18} color="#4285F4" />
                                    <Text style={s.info}>{event.horaInicio} – {event.horaFin}</Text>
                                </View>
                            </View>

                            {/* Lugar */}
                            {(event.destinoNombre || event.espacioNombre) && (
                                <View style={s.section}>
                                    <View style={s.row}>
                                        <Ionicons name="location-outline" size={18} color="#4285F4" />
                                        <Text style={s.label}>Lugar</Text>
                                    </View>
                                    {!!event.destinoNombre && (
                                        <Text style={s.info}>{event.destinoNombre}</Text>
                                    )}
                                    {!!event.espacioNombre && (
                                        <Text style={[s.info, { color: "#888" }]}>
                                            Espacio: {event.espacioNombre}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {/* Cupos */}
                            <View style={s.section}>
                                <View style={s.row}>
                                    <Ionicons name="people-outline" size={18} color="#4285F4" />
                                    <Text style={s.label}>Cupos disponibles</Text>
                                </View>
                                <View style={s.cuposRow}>
                                    <Text style={[s.cuposNum, { color: cuposColor }]}>
                                        {event.cuposDisponibles}
                                    </Text>
                                    <Text style={s.cuposTotal}> / {event.cupos}</Text>
                                </View>
                                <View style={s.progressBg}>
                                    <View
                                        style={[
                                            s.progressFill,
                                            { width: `${cuposPercent}%` as any, backgroundColor: cuposColor },
                                        ]}
                                    />
                                </View>
                            </View>

                            {!!event.encargado && (
                                <View style={s.section}>
                                    <View style={s.row}>
                                        <Ionicons name="person-outline" size={18} color="#4285F4" />
                                        <Text style={s.label}>Encargado</Text>
                                    </View>
                                    <Text style={s.info}>{event.encargado}</Text>
                                    {!!event.encargadoEmail && (
                                        <Text style={[s.info, { color: "#888" }]}>{event.encargadoEmail}</Text>
                                    )}
                                </View>
                            )}

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};


const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e0e0e0",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#202124",
    },
    closeBtn: { padding: 4 },
    empty: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    emptyText: { color: "#999", fontSize: 14 },
    banner: { width: "100%", height: 180 },
    bannerPlaceholder: {
        height: 110,
        backgroundColor: "#FFF3E0",
        alignItems: "center",
        justifyContent: "center",
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#f0f0f0",
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#202124",
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginTop: 3,
    },
    badgeText: { fontSize: 11, fontWeight: "600" },
    description: {
        fontSize: 14,
        color: "#5F6368",
        lineHeight: 20,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4285F4",
    },
    info: {
        fontSize: 14,
        color: "#202124",
        lineHeight: 20,
        marginLeft: 24,
    },
    cuposRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginLeft: 24,
        marginBottom: 6,
    },
    cuposNum: { fontSize: 24, fontWeight: "700" },
    cuposTotal: { fontSize: 14, color: "#888" },
    progressBg: {
        height: 6,
        backgroundColor: "#e0e0e0",
        borderRadius: 3,
        marginLeft: 24,
        overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: 3 },
});

export default EventInformation;