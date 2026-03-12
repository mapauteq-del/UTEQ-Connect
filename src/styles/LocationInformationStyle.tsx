import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8EAED',
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#202124',
    },
    scrollView: {
        flex: 1,
    },
    photosContainer: {
        paddingVertical: 16,
        paddingLeft: 20,
    },
    photo: {
        width: 280,
        height: 180,
        borderRadius: 16,
        marginRight: 12,
        backgroundColor: '#F0F0F0',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    placeName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#202124',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    typeTag: {
        backgroundColor: '#E8F0FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    typeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4285F4',
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
        marginRight: 8,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#202124',
        marginRight: 4,
    },
    reviewsText: {
        fontSize: 14,
        color: '#5F6368',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#202124',
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#5F6368',
    },
    infoText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#202124',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    actionButton: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4285F4',
    },
    coordinatesSection: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        marginBottom: 20,
    },
    coordinatesText: {
        fontSize: 12,
        color: '#5F6368',
        fontFamily: 'monospace',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#5F6368',
        marginTop: 16,
    },
});