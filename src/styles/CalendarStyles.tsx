import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 16,
        marginTop: 8,
    },

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
        color: '#1a73e8',
        fontWeight: '600',
    },

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
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
    },

    weekRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    weekDay: {
        flex: 1,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sunday: {
        color: '#ef4444',
    },

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
        marginVertical: 2,
    },

    cellToday: {
        backgroundColor: '#e8f0fe',
        borderWidth: 1.5,
        borderColor: '#1a73e8',
    },

    cellSelected: {
        backgroundColor: '#0d47a1',
    },

    cellHasEvents: {
        backgroundColor: '#1a73e8',
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
        color: '#1a73e8',
        fontWeight: '800',
    },
    selectedText: {
        color: '#fff',
        fontWeight: '700',
    },
    hasEventsText: {
        fontWeight: '700',
        color: '#fff',
    },

    dotsRow: {
        flexDirection: 'row',
        gap: 3,
        marginTop: 3,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },

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
        backgroundColor: '#1a73e8',
    },
    legendText: {
        fontSize: 12,
        color: '#94a3b8',
    },

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
        color: '#1a73e8',
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

    fullCalBtn: {
        backgroundColor: '#1a73e8',
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
    cellPast: {
        opacity: 0.35,
    },
    pastText: {
        color: '#9ca3af',
        fontWeight: '400',
    },
});