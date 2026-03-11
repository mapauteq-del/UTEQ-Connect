import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomNav: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 40,
        backgroundColor: "#fff",
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        minWidth: 64,
    },
    navLabel: {
        fontSize: 12,
        color: "#555",
        fontWeight: "600",
    },
});

export default styles;
