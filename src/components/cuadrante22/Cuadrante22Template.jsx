import { FONDO_22_URL } from "../../lib/fondo22";

const ROW_TOPS_22 = [
  20.3, 23.5, 26.7, 29.9, 33.1, 36.3, 39.5, 42.7,
  45.9, 49.1, 52.3, 55.5, 58.7, 61.9, 65.1, 68.3,
  71.5, 74.7, 77.9, 81.1, 84.3, 87.5,
];

const W = 1720;
const H = 1400;

export default function Cuadrante22Template({ partidos = [], etiquetaFecha = "", ajusteCols = {} }) {
  const visibles = [...partidos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  const getCell = (rowIdx, col) => {
    const p = visibles[rowIdx];
    if (!p || p.visible === false) return "";
    if (p.descansa) return "";
    if (col === "equipo") return (p.equipo || "").toUpperCase();
    if (col === "rival") return (p.rival || "").toUpperCase();
    if (col === "fecha") return `${(p.dia || "").toUpperCase()} ${p.hora || ""}`.trim();
    if (col === "pabellon") return p.pabellon || "";
    return "";
  };

  const textStyle = (size, weight = 600, extra = {}) => ({
    position: "absolute",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: size,
    fontWeight: weight,
    color: "#FFFFFF",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    overflow: "hidden",
    lineHeight: 1,
    ...extra,
  });

  return (
    <div
      id="cuadrante22-grafico"
      style={{
        position: "relative",
        width: W,
        height: H,
        overflow: "hidden",
        backgroundColor: "#3B0764",
      }}
    >
      <img
        src={FONDO_22_URL}
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
        alt=""
      />

      {/* Etiqueta fecha */}
      <div style={{ ...textStyle(54, 800), left: "75.6%", top: "5.5%" }}>
        {etiquetaFecha}
      </div>

      {/* 22 filas */}
      {ROW_TOPS_22.map((topPct, i) => (
        <div key={i} style={{ position: "absolute", top: `${topPct}%`, left: 0, right: 0, transform: "translateY(-50%)" }}>
          <div style={{ ...textStyle(26, 700), left: `${6.56 + (ajusteCols.equipo || 0)}%`, maxWidth: "22%", textOverflow: "ellipsis" }}>{getCell(i, "equipo")}</div>
          <div style={{ ...textStyle(26, 700), left: `${31.54 + (ajusteCols.rival || 0)}%`, maxWidth: "20%", textOverflow: "ellipsis" }}>{getCell(i, "rival")}</div>
          <div style={{ ...textStyle(26, 700), left: `${55.61 + (ajusteCols.fecha || 0)}%`, maxWidth: "16%", textOverflow: "ellipsis" }}>{getCell(i, "fecha")}</div>
          <div style={{ ...textStyle(26, 600), left: `${72.93 + (ajusteCols.pabellon || 0)}%`, maxWidth: "24%", textOverflow: "ellipsis" }}>{getCell(i, "pabellon")}</div>
        </div>
      ))}
    </div>
  );
}