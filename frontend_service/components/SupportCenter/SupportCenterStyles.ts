import { Theme } from "@mui/material";

const supportCenterStyles = (theme: Theme) => ({
  container: {
    display: "flex",
    flexDirection: "column" as const,
    height: "90%", // Updated to 90% as per your component
    padding: "20px",
    backgroundColor: "#f5f5f5",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column" as const,
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
  },
  regularText: {
    fontSize: "1rem",
    color: "#666",
  },
  statusIndicator: {
    fontSize: "0.9rem",
    color: "#555",
  },
  statusText: (isConnected: boolean) => ({
    fontWeight: "bold" as const,
    color: isConnected ? "green" : "red",
  }),
  selectWrapper: {
    marginBottom: "12px",
  },
  selectInput: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontFamily: "inherit",
  },
  panels: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  panel: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  chatList: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "15px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  emptyChat: {
    textAlign: "center" as const,
    color: "#888",
    marginTop: 20,
  },
  chatBubble: (variant: "outbound" | "inbound" | "system") => {
    const isOutbound = variant === "outbound";
    const isSystem = variant === "system";

    return {
      alignSelf: isSystem ? "center" : isOutbound ? "flex-end" : "flex-start",
      backgroundColor: isSystem
        ? "#eeeeee"
        : isOutbound
        ? "#1976d2" // Matches your button color
        : "#e0e0e0",
      color: isOutbound ? "white" : "black",
      padding: "10px 15px",
      borderRadius: isSystem ? "4px" : "15px",
      maxWidth: isSystem ? "90%" : "70%",
      fontSize: isSystem ? "0.75rem" : "1rem", // System text matches your 0.75rem logic
      marginBottom: "8px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    };
  },
  senderLabel: {
    fontSize: "0.75rem",
    opacity: 0.8,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: "0.65rem",
    opacity: 0.6,
    textAlign: "right" as const,
    marginTop: 5,
  },
  chatFooter: {
    padding: "15px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: "10px",
  },
  chatInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none" as const,
    fontFamily: "inherit",
  },
  sendButton: {
    height: "50px",
    backgroundColor: "#1976d2",
    color: "white",
  },
});

export default supportCenterStyles;
