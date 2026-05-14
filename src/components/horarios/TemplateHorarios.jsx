// Template gráfico: 1200×850px
// Renderiza el gráfico de horarios semanales

const W = 1200;
const H = 850;
const HEADER_H = 110;
const COL_HEADER_H = 48;
const ROW_H = 38;
const FOOTER_H = 80;

const COL_WIDTHS = {
  equipo: W * 0.25,
  rival: W * 0.30,
  fecha: W * 0.20,
  pabellon: W * 0.25,
};

export default function TemplateHorarios({ semana, partidos }) {
  const cantera = partidos
    .filter((p) => p.bloque === "CANTERA" && p.visible_en_grafico)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const escuela = partidos
    .filter((p) => p.bloque === "ESCUELA" && p.visible_en_grafico)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const allRows = [
    ...cantera.map((p, i) => ({ ...p, _sectionLabel: i === 0 ? "CANTERA" : null, _idx: i })),
    ...escuela.map((p, i) => ({ ...p, _sectionLabel: i === 0 ? "ESCUELA" : null, _idx: cantera.length + i })),
  ];

  const contentH = H - HEADER_H - COL_HEADER_H - FOOTER_H;

  return (
    <div
      id="horario-template"
      style={{
        width: W,
        height: H,
        backgroundColor: "#3B0764",
        fontFamily: "'Barlow Condensed', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: HEADER_H,
          backgroundColor: "#3B0764",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          borderBottom: "2px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Logo left */}
        <div
          style={{
            width: 220,
            height: 72,
            border: "2px solid rgba(255,255,255,0.5)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 24 }}>🏀</span>
          <span style={{ color: "white", fontWeight: 800, fontSize: 18, letterSpacing: 2 }}>
            IVECO ACADEMY
          </span>
        </div>

        {/* Title center */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <span
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 90,
              lineHeight: 1,
              letterSpacing: -2,
              textTransform: "uppercase",
            }}
          >
            HORARIOS
          </span>
        </div>

        {/* Date right */}
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: 52,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {semana?.etiqueta_fecha || ""}
          </span>
        </div>
      </div>

      {/* COL HEADER */}
      <div
        style={{
          height: COL_HEADER_H,
          backgroundColor: "#3B0764",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "3px solid rgba(255,255,255,0.2)",
        }}
      >
        {[
          { key: "equipo", label: "EQUIPO" },
          { key: "rival", label: "RIVAL" },
          { key: "fecha", label: "FECHA" },
          { key: "pabellon", label: "PABELLÓN" },
        ].map((col) => (
          <div
            key={col.key}
            style={{ width: COL_WIDTHS[col.key], fontWeight: 700, fontSize: 16, color: "white", letterSpacing: 2, textTransform: "uppercase" }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* ROWS */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {allRows.map((p, i) => {
          const isEven = i % 2 === 0;
          const bg = isEven ? "#7C3AED" : "#6D28D9";
          const fechaText = p.descansa
            ? "· DESCANSA ·"
            : `${(p.dia || "").toUpperCase()} ${p.hora || ""}`;
          const rivalText = p.descansa ? "· DESCANSA ·" : (p.rival || "");

          return (
            <div key={p.id || i}>
              {/* Section label */}
              {p._sectionLabel && (
                <div
                  style={{
                    backgroundColor: "#1E1B4B",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 4,
                    padding: "4px 16px",
                    textTransform: "uppercase",
                  }}
                >
                  {p._sectionLabel}
                </div>
              )}
              <div
                style={{
                  height: ROW_H,
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  borderBottom: "1px solid rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ width: COL_WIDTHS.equipo, color: "white", fontWeight: 700, fontSize: 18, textTransform: "uppercase", letterSpacing: 1 }}>
                  {p.equipo || ""}
                </div>
                <div
                  style={{
                    width: COL_WIDTHS.rival,
                    color: p.descansa ? "rgba(255,255,255,0.4)" : "white",
                    fontWeight: 600,
                    fontSize: 17,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {rivalText}
                </div>
                <div
                  style={{
                    width: COL_WIDTHS.fecha,
                    color: p.descansa ? "rgba(255,255,255,0.4)" : "white",
                    fontWeight: 600,
                    fontSize: 17,
                    letterSpacing: 0.5,
                  }}
                >
                  {fechaText}
                </div>
                <div style={{ width: COL_WIDTHS.pabellon, color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 16 }}>
                  {p.pabellon || ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: FOOTER_H,
          backgroundColor: "#3B0764",
          borderTop: "2px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 32px",
        }}
      >
        {[
          { label: "IVECO", sub: "" },
          { label: "⚜ CRZA", sub: "" },
          { label: "🏛 JUNTA DE CASTILLA Y LEÓN", sub: "" },
          { label: "AYTO. VALLADOLID / FMD", sub: "" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}