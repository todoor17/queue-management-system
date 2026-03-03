import { Theme } from "@mui/material";

interface UsersComponentStylesProps {
  container: React.CSSProperties;
  header: React.CSSProperties;
  textContainer: React.CSSProperties;
  title: React.CSSProperties;
  regularText: React.CSSProperties;
  button: React.CSSProperties;
  row: React.CSSProperties;
  headerCell: React.CSSProperties;
  contentCell: React.CSSProperties;
  rolePill: (role?: string | null) => React.CSSProperties;
}

const usersComponentStyles = (theme: Theme): UsersComponentStylesProps => ({
  container: {
    marginTop: "20px",
    width: "100%",
    height: "auto",
    borderRadius: "10px",
    padding: "20px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    border: "1px solid #dfdfdf",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    height: "auto",
    width: "100%",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: "6px",
    display: "flex",
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    textAlign: "center",
    color: "#111827",
    marginBottom: "0.35rem",
  },
  regularText: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: "1.1rem",
    textAlign: "center",
    color: "#374151",
    marginBottom: "0.25rem",
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
  row: {
    height: "30px",
    width: "100%",
    display: "grid",
    alignItems: "center",
    gridTemplateColumns: "1.2fr 1.4fr 1.4fr 0.8fr 0.5fr",
    borderBottom: "1px solid #dfdfdf",
  },
  headerCell: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "left",
    alignItems: "center",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "14px",
    color: "#111827",
  },
  contentCell: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "left",
    alignItems: "center",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: "14px",
    color: "#111827",
  },
  rolePill: (role?: string | null) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 22,
    padding: "0 8px",
    borderRadius: 999,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    textTransform: "lowercase",
    color: role?.toUpperCase() === "ADMIN" ? "#ffffff" : "#111827",
    backgroundColor:
      role?.toUpperCase() === "ADMIN" ? "#000000" : "#e5e7eb",
  }),
});

export default usersComponentStyles;
