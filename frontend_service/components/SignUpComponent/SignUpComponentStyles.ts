import { Theme } from "@emotion/react";

interface SignUpComponentStylesProps {
  container: any;
  signUpContainer: any;
  title: any;
  boldText: any;
  formContainer: any;
  button: any;
  signIn: any;
  errorText: any;
}

const signUpComponentStyles = (theme: Theme): SignUpComponentStylesProps => ({
  container: {
    height: "100%",
    widht: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e5ecff",
  },
  signUpContainer: {
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
  formContainer: {
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
    textTransform: "none",
  },
  signIn: {
    color: "#006FA5",
    fontWeight: 600,
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  errorText: {
    width: "100%",
    marginTop: "10px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "0.85rem",
    color: "#dc2626",
  },
});

export default signUpComponentStyles;
