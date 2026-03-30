import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'https://uteq-connect-server-production.up.railway.app/api';

const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAYS_ES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// Colores para distinguir múltiples eventos en un mismo día
const EVENT_COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#06b6d4', '#eab308'];

interface Event {
    _id: string;
    titulo: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    destino?: { nombre: string };
    cuposDisponibles: number;
    cupos: number;
    activo: boolean;
}

interface CalendarSectionProps {
    onEventPress?: (event: Event) => void;
    onVerTodos?: () => void;
}

const CalendarSection = ({ onEventPress, onVerTodos }: CalendarSectionProps) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/events/active`);
            setEvents(res.data.data || []);
        } catch (e) {
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    // Mapear eventos por fecha "YYYY-MM-DD"
    const eventsByDate: Record<string, Event[]> = {};
    events.forEach((ev) => {
        const key = ev.fecha.slice(0, 10);
        if (!eventsByDate[key]) eventsByDate[key] = [];
        eventsByDate[key].push(ev);
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const todayStr = new Date().toISOString().slice(0, 10);

    const getDayKey = (day: number) => {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    };

    const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : [];

    // Construir grid del mes
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <View style={styles.wrapper}>
            {/* Header sección */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Eventos este mes</Text>
                <TouchableOpacity onPress={onVerTodos} style={styles.verTodosBtn}>
                    <Text style={styles.verTodosText}>Ver todos</Text>
                    <Ionicons name="arrow-forward" size={13} color="#6366f1" />
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                {/* Navegación mes */}
                <View style={styles.monthNav}>
                    <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                        <Ionicons name="chevron-back" size={18} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>
                        {MONTHS_ES[month]} {year}
                    </Text>
                    <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                        <Ionicons name="chevron-forward" size={18} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Días de la semana */}
                <View style={styles.weekRow}>
                    {DAYS_ES.map((d, i) => (
                        <Text key={i} style={[styles.weekDay, i === 0 && styles.sunday]}>
                            {d}
                        </Text>
                    ))}
                </View>

                {/* Grid días */}
                {loading ? (
                    <ActivityIndicator color="#6366f1" style={{ marginVertical: 24 }} />
                ) : (
                    <View style={styles.grid}>
                        {cells.map((day, idx) => {
                            if (!day) return <View key={idx} style={styles.cell} />;
                            const key = getDayKey(day);
                            const dayEvents = eventsByDate[key] || [];
                            const isToday = key === todayStr;
                            const isSelected = key === selectedDay;
                            const isSunday = idx % 7 === 0;

                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.cell,
                                        isToday && styles.cellToday,
                                        isSelected && styles.cellSelected,
                                    ]}
                                    onPress={() => setSelectedDay(isSelected ? null : key)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        isSunday && styles.sundayText,
                                        isToday && styles.todayText,
                                        isSelected && styles.selectedText,
                                    ]}>
                                        {day}
                                    </Text>

                                    {/* Dots de eventos */}
                                    {dayEvents.length > 0 && (
                                        <View style={styles.dotsRow}>
                                            {dayEvents.slice(0, 3).map((_, i) => (
                                                <View
                                                    key={i}
                                                    style={[
                                                        styles.dot,
                                                        { backgroundColor: isSelected ? '#fff' : EVENT_COLORS[i % EVENT_COLORS.length] }
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Leyenda contador */}
                <View style={styles.legendRow}>
                    <View style={styles.legendDot} />
                    <Text style={styles.legendText}>
                        {Object.keys(eventsByDate).filter(k => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} días con eventos este mes
                    </Text>
                </View>
            </View>

            {/* Panel eventos del día seleccionado */}
            {selectedDay && (
                <View style={styles.eventsPanel}>
                    <Text style={styles.eventsPanelTitle}>
                        {selectedEvents.length > 0
                            ? `${selectedEvents.length} evento${selectedEvents.length > 1 ? 's' : ''} — ${selectedDay}`
                            : `Sin eventos — ${selectedDay}`}
                    </Text>

                    {selectedEvents.length === 0 && (
                        <View style={styles.emptyDay}>
                            <Ionicons name="calendar-outline" size={32} color="#d1d5db" />
                            <Text style={styles.emptyDayText}>No hay eventos este día</Text>
                        </View>
                    )}

                    {selectedEvents.map((ev, i) => {
                        const pct = (ev.cuposDisponibles / ev.cupos) * 100;
                        const color = pct <= 20 ? '#ef4444' : pct <= 50 ? '#f97316' : '#22c55e';
                        return (
                            <TouchableOpacity
                                key={ev._id}
                                style={styles.eventRow}
                                onPress={() => onEventPress?.(ev)}
                                activeOpacity={0.85}
                            >
                                <View style={[styles.eventAccent, { backgroundColor: EVENT_COLORS[i % EVENT_COLORS.length] }]} />
                                <View style={styles.eventRowContent}>
                                    <Text style={styles.eventRowTitle} numberOfLines={1}>{ev.titulo}</Text>
                                    <View style={styles.eventRowMeta}>
                                        <Ionicons name="time-outline" size={12} color="#9ca3af" />
                                        <Text style={styles.eventRowMetaText}>{ev.horaInicio} – {ev.horaFin}</Text>
                                        {ev.destino?.nombre && (
                                            <>
                                                <Text style={styles.metaSep}>·</Text>
                                                <Ionicons name="location-outline" size={12} color="#9ca3af" />
                                                <Text style={styles.eventRowMetaText} numberOfLines={1}>
                                                    {ev.destino.nombre}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.eventRowCupos}>
                                    <View style={[styles.cuposDot, { backgroundColor: color }]} />
                                    <Text style={[styles.cuposText, { color }]}>{ev.cuposDisponibles}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            <TouchableOpacity style={styles.fullCalBtn} onPress={onVerTodos} activeOpacity={0.85}>
                <Ionicons name="calendar" size={15} color="#fff" />
                <Text style={styles.fullCalBtnText}>Ver calendario completo</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 16,
        marginTop: 8,
    },

    // Header sección
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0f172a',
    },
    verTodosBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    verTodosText: {
        fontSize: 13,
        color: '#6366f1',
        fontWeight: '600',
    },

    // Card calendario
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    // Navegación mes
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    navBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
    },

    // Días semana
    weekRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDay: {
        flex: 1,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    sunday: {
        color: '#ef4444',
    },

    // Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginVertical: 1,
    },
    cellToday: {
        backgroundColor: '#eef2ff',
    },
    cellSelected: {
        backgroundColor: '#6366f1',
    },
    dayText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    sundayText: {
        color: '#ef4444',
    },
    todayText: {
        color: '#6366f1',
        fontWeight: '700',
    },
    selectedText: {
        color: '#fff',
        fontWeight: '700',
    },

    // Dots
    dotsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 2,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },

    // Leyenda
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6366f1',
    },
    legendText: {
        fontSize: 12,
        color: '#94a3b8',
    },

    // Panel eventos
    eventsPanel: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    eventsPanelTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6366f1',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyDay: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    emptyDayText: {
        fontSize: 13,
        color: '#9ca3af',
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
        gap: 10,
    },
    eventAccent: {
        width: 4,
        height: 40,
        borderRadius: 2,
    },
    eventRowContent: {
        flex: 1,
    },
    eventRowTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    eventRowMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
    },
    eventRowMetaText: {
        fontSize: 11,
        color: '#9ca3af',
    },
    metaSep: {
        color: '#d1d5db',
        fontSize: 11,
    },
    eventRowCupos: {
        alignItems: 'center',
        gap: 2,
    },
    cuposDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    cuposText: {
        fontSize: 12,
        fontWeight: '700',
    },

    // Botón full
    fullCalBtn: {
        backgroundColor: '#6366f1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 13,
        borderRadius: 14,
        marginTop: 12,
        marginBottom: 8,
    },
    fullCalBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default CalendarSection;