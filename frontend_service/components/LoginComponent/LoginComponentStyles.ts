import { Theme } from "@mui/material";

interface LoginComponentStylesProps {
  container: any;
  loginContainer: any;
  title: any;
  boldText: any;
  normalText: any;
  formContainer: any;
  button: any;
  signUp: any;
  errorText: any;
}

const loginComponentStyles = (theme: Theme): LoginComponentStylesProps => ({
  container: {
    height: "100%",
    widht: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e5ecff",
  },
  loginContainer: {
    height: "90%",
    width: "30%",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    textAlign: "center",
    color: "#111827", // dark neutral
    marginBottom: "0.35rem",
  },

  boldText: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: "1.1rem",
    textAlign: "center",
    color: "#374151", // slightly softer gray
    marginBottom: "0.25rem",
  },

  normalText: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: "0.9rem",
    lineHeight: 1.45,
    textAlign: "center",
    color: "#6B7280", // subtle gray
    maxWidth: "50ch",
    margin: "0 auto",
  },
  formContainer: {
    marginTop: "30px",
    width: "100%",
    height: "auto",
    display: "flex",
    flexDirection: "column",
  },
  button: {
    backgroundColor: "#000000",
    borderRadius: "10px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "0.85rem",
    textAlign: "center",
  },
  signUp: {
    color: "#006FA5",
    fontWeight: 600,
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  errorText: {
    color: "#dc2626",
    fontSize: "0.8rem",
    fontWeight: 500,
    marginTop: "10px",
  },
});

export default loginComponentStyles;
