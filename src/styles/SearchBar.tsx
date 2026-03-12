import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 100,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  container: {
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#fff",
    borderRadius: 25,
    borderColor: "#ccc",
    borderWidth: 1,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});

export default styles;
