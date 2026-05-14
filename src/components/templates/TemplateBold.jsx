export default function TemplateBold({ partido, jugadores, entrenador, ayudante, categoria, format }) {
  const { width, height } = format;
  const isStory = height > width;
  const cols = isStory ? 1 : 2;

  return (
    <div
      style={{
        width,
        height,
        fontFamily: "'Inter', sans-serif",
        background: "linear-gradient(135deg, #3B0764 0%, #6B21A8 50%, #9333EA 100%)",
      }}
      className="relative overflow-hidden flex flex-col"
    >
      {/* Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.08 }}
      >
        <span
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: width * 0.22 }}
          className="font-black text-white uppercase text-center leading-none"
        >
          {partido?.rival || "RIVAL"}
        </span>
      </div>

      {/* Header */}
      <div className="relative z-10 px-8 pt-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="font-bold text-white text-lg">
            CBC
          </span>
        </div>
        <div>
          <p className="text-white/60 text-xs tracking-widest uppercase">
            {categoria?.nombre || "CATEGORÍA"}
          </p>
          <p className="text-white font-semibold text-sm">CONVOCATORIA</p>
        </div>
      </div>

      {/* Match info */}
      <div className="relative z-10 px-8 py-6 text-center">
        <h1
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          className="text-white font-black text-5xl uppercase tracking-tight"
        >
          vs {partido?.rival || "RIVAL"}
        </h1>
        <div className="flex justify-center gap-6 mt-3 text-white/70 text-sm">
          <span>📅 {partido?.fecha || "—"}</span>
          <span>🕐 {partido?.hora || "—"}</span>
          <span>📍 {partido?.pabellon || "—"}</span>
        </div>
      </div>

      {/* Players list */}
      <div className="relative z-10 flex-1 px-8 overflow-hidden">
        <div
          className="grid gap-x-6 gap-y-1"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {jugadores.map((j) => (
            <div
              key={j.id}
              className="flex items-center gap-3 py-2 border-b border-white/10"
            >
              <span
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                className="text-purple-300 font-bold text-2xl w-10 text-right"
              >
                {j.dorsal}
              </span>
              <div>
                <p className="text-white font-semibold text-sm">
                  {j.nombre_completo}
                </p>
                <p className="text-white/40 text-xs">{j.posicion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-8 py-4 bg-black/20">
        <div className="flex justify-between items-center">
          <div className="text-white/80 text-xs">
            <p className="font-semibold">Entrenador: {entrenador}</p>
            {ayudante && <p className="text-white/50">Ayudante: {ayudante}</p>}
          </div>
          <p
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            className="text-white/40 font-bold text-sm tracking-wider"
          >
            #SomosCantera
          </p>
        </div>
      </div>
    </div>
  );
}