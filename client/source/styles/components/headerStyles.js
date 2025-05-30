import { StyleSheet } from "react-native";

export const headerStyles = StyleSheet.create({
  headerLeft: {
    marginLeft: 16,
  },
  headerLeftText: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff", // White text for contrast on dark background
  },
  headerRight: {
    flexDirection: "row",
    marginRight: 16,
  },
  logo: {
    marginTop: 6,
    width: 25,
  },
  createButtonText: {
    fontSize: 12,
    color: "#696969",
    fontWeight: "600",
  },
  createButtonTextActive: {
    color: "#6AB952",
    fontWeight: "700",
  },
  saveButtonText: {
    fontSize: 12,
    color: "#696969",
    fontWeight: "600",
  },
  saveButtonTextActive: {
    color: "#6AB952",
    fontWeight: "700",
  },

  // === SearchHeader === //

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60, // Adjust for status bar
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "#121212", // Dark background for header
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1C",
  },
  searchBarContainer: {
    flex: 1, // Allow the search bar to take available width
    marginHorizontal: 10, // Add spacing between icons and the search bar
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },

  // === FloatingHeader === //

  floatingHeaderContainer: {
    position: "relative", // Relative positioning for flexibility
    backgroundColor: "#121212", // Dark background
    paddingTop: 60, // Adjust for status bar
    paddingBottom: 24, // Padding below for spacing
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1C",
  },
  contentContainer: {
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  sideContainer: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  rightContainer: {
    justifyContent: "flex-end",
  },
  titleContainer: {
    position: "absolute",
    top: 4,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },

  // === ExploreHeader === //

  headerContainer: {
    paddingTop: 60, // Space for status bar
    paddingBottom: 8,
    backgroundColor: "#121212", // Dark background
    flexDirection: "row",
    alignItems: "center",
  },
  defaultMargin: {
    marginHorizontal: 16, // Margins on left and right when not focused
  },
  backArrowContainer: {
    marginLeft: 16, // Space for the back arrow when focused
  },
  searchBarContainer: {
    flex: 1,
  },
  focusedSearchBar: {
    marginLeft: 10,
    marginRight: 16,
  },

  // === HeaderMain === //

  mainHeaderContainer: {
    backgroundColor: "#121212",
    paddingTop: 56,
    paddingBottom: 8,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    borderBottomColor: "#1C1C1C",
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonSpacing: {
    marginLeft: 16,
  },

  // === HeaderStack === //

  stackHeaderContainer: {
    paddingTop: 60,
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: "#121212",
  },
  stackTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  stackTitleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6AB952",
  },
  stackSideContainer: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  stackRightContainer: {
    justifyContent: "flex-end",
  },
  stackButtonSpacing: {
    marginLeft: 16,
  },
  logo: {
    width: 100,
    height: 40,
  },

  // === Camera Header === //

  shotsLeftContainer: {
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  shotsLeftText: {
    color: "#696969", // Light grey text
    fontSize: 12,
    fontWeight: "500",
  },
});
