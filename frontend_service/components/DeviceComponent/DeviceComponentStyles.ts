import { Theme } from "@mui/material";

interface DeviceComponentStylesProps {
  deviceContainer: React.CSSProperties;
  header: React.CSSProperties;
  textContainer: React.CSSProperties;
  title: React.CSSProperties;
  regularText: React.CSSProperties;
  button: React.CSSProperties;
  rowContainer: React.CSSProperties;
  headerCell: React.CSSProperties;
  contentCell: React.CSSProperties;
  linkedIndicator: (linked: boolean) => React.CSSProperties;
}

const deviceComponentStyles = (theme: Theme): DeviceComponentStylesProps => ({
  deviceContainer: {
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
  rowContainer: {
    height: "30px",
    width: "100%",
    display: "grid",
    alignItems: "center",
    gridTemplateColumns: "1fr 1fr 1fr 0.6fr 0.4fr 0.5fr",
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
  linkedIndicator: (linked: boolean) => ({
    display: "inline-flex",
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginRight: 8,
    backgroundColor: linked ? "#22c55e" : "#ef4444",
  }),
});

export default deviceComponentStyles;
