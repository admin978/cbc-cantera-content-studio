export default function TemplateMinimalista({ partido, jugadores, entrenador, ayudante, categoria, format }) {
  const { width, height } = format;

  return (
    <div
      style={{ width, height, fontFamily: "'Inter', sans-serif" }}
      className="relative bg-white overflow-hidden flex flex-col"
    >
      {/* Top accent bar */}
      <div className="h-2 bg-[#6B21A8]" />

      {/* Content */}
      <div className="flex-1 px-10 py-8 flex flex-col">
        {/* Category tag */}
        <p className="text-xs tracking-[0.3em] text-[#6B21A8] font-semibold uppercase mb-4">
          {categoria?.nombre || "CATEGORÍA"} · CONVOCATORIA
        </p>

        {/* Rival name */}
        <h1
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          className="text-[#6B21A8] font-black text-6xl uppercase leading-none mb-4"
        >
          vs {partido?.rival || "RIVAL"}
        </h1>

        {/* Match details row */}
        <div className="flex items-center gap-4 text-sm text-[#1E1B4B]/70 mb-6 pb-6 border-b-2 border-[#1E1B4B]/10">
          <span>{partido?.fecha || "—"}</span>
          <span className="text-[#6B21A8]">·</span>
          <span>{partido?.hora || "—"}</span>
          <span className="text-[#6B21A8]">·</span>
          <span>{partido?.pabellon || "—"}</span>
          {partido?.jornada && (
            <>
              <span className="text-[#6B21A8]">·</span>
              <span>Jornada {partido.jornada}</span>
            </>
          )}
        </div>

        {/* Players list */}
        <div className="flex-1 space-y-0">
          {jugadores.map((j, i) => (
            <div
              key={j.id}
              className="flex items-center gap-4 py-2.5 border-b border-[#1E1B4B]/5"
            >
              <span
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                className="text-[#6B21A8] font-bold text-xl w-8 text-right"
              >
                {j.dorsal}
              </span>
              <span className="w-px h-5 bg-[#1E1B4B]/10" />
              <span className="font-semibold text-[#1E1B4B] text-sm flex-1">
                {j.nombre_completo}
              </span>
              <span className="text-xs text-[#1E1B4B]/40 uppercase tracking-wider">
                {j.posicion}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-6 mt-auto flex justify-between items-end">
          <div className="text-xs text-[#1E1B4B]/60">
            <p className="font-semibold">Entrenador: {entrenador}</p>
            {ayudante && <p>Ayudante: {ayudante}</p>}
          </div>
          <div className="text-right">
            <p
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              className="text-[#6B21A8] font-bold text-sm tracking-wider"
            >
              CBC VALLADOLID
            </p>
            <p className="text-[10px] text-[#1E1B4B]/30 tracking-widest">
              #SomosCantera
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}