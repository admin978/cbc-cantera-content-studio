// Template gráfico — Cuadrante Cantera
// Dimensiones reales: 3440px × 2477px con imagen de fondo como <img> para CORS

const FONDO_URL = "https://res.cloudinary.com/dxmn0rojy/image/upload/fl_attachment:false/v1776263915/Cuadrante_Cantera_Fondo_bdfld2.jpg";

const ROW_TOPS = [
  21.46, 25.50, 29.39, 33.29, 37.24, 41.20, 45.30, 49.39,
  53.45, 57.49, 61.37, 65.26, 69.22, 73.17, 77.09, 81.01, 84.88, 88.58,
];

const W = 1720;
const H = 1238;

export default function CuadranteCanteraTemplate({ partidos = [], etiquetaFecha = "", ajusteCols = {} }) {
  // Array plano unificado — el bloque es solo informativo, no afecta al orden
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
      id="cuadrante-grafico"
      style={{
        position: "relative",
        width: W,
        height: H,
        overflow: "hidden",
        backgroundColor: "#3B0764",
      }}
    >
      {/* CAPA 1: imagen de fondo */}
      <img
        src={FONDO_URL}
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

      {/* CAPA 2: textos encima */}

      {/* ETIQUETA FECHA */}
      <div style={{ ...textStyle(54, 800), left: "75.6%", top: "5.9%" }}>
        {etiquetaFecha}
      </div>

      {/* FILAS */}
      {ROW_TOPS.map((topPct, i) => (
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