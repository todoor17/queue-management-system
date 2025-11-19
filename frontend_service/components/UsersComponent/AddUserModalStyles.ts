import { Theme } from "@mui/material";

interface AddUserModalStylesProps {
  container: React.CSSProperties;
  title: React.CSSProperties;
  subtitle: React.CSSProperties;
  form: React.CSSProperties;
  actions: React.CSSProperties;
  button: React.CSSProperties;
  errorText: React.CSSProperties;
}

const addUserModalStyles = (theme: Theme): AddUserModalStylesProps => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 4px 16px 4px",
    minWidth: 380,
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    color: "#111827",
    marginTop: 8,
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: "0.9rem",
    color: "#374151",
    marginTop: 4,
    marginBottom: 8,
  },
  form: {
    width: "100%",
    marginTop: 8,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    width: "100%",
    marginTop: 16,
  },
  button: {
    backgroundColor: "#000000",
    borderRadius: "10px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "0.85rem",
    textAlign: "center",
    textTransform: "none",
  },
  errorText: {
    width: "100%",
    textAlign: "left",
    marginTop: 6,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "0.8rem",
    color: "#dc2626",
  },
});

export default addUserModalStyles;
