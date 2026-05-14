import PlayerAvatar from "../PlayerAvatar";

export default function TemplateClasico({ partido, jugadores, entrenador, ayudante, categoria, format }) {
  const { width, height } = format;
  const isStory = height > width;
  const isBanner = width > height && width >= 1920;
  
  const gridCols = isBanner ? 4 : 3;

  return (
    <div
      style={{ width, height, fontFamily: "'Inter', sans-serif" }}
      className="relative bg-white overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#3B0764] px-8 py-6 flex items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#9333EA] flex items-center justify-center">
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="font-bold text-white text-xl">
            CBC
          </span>
        </div>
        <div className="text-center">
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-white font-bold text-2xl tracking-wide uppercase">
            CBC Valladolid
          </h1>
          <p className="text-purple-300 text-xs tracking-widest uppercase">
            Cantera Baloncesto
          </p>
        </div>
      </div>

      {/* Category stripe */}
      <div
        className="py-2 text-center text-white font-bold text-sm tracking-widest uppercase"
        style={{ backgroundColor: categoria?.color_acento || "#9333EA" }}
      >
        {categoria?.nombre || "CATEGORÍA"}
      </div>

      {/* Match info */}
      <div className="bg-[#3B0764] px-8 py-5 text-center">
        <p className="text-purple-300 text-xs mb-1 tracking-wider">CONVOCATORIA</p>
        <h2
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          className="text-white font-bold text-3xl uppercase"
        >
          vs {partido?.rival || "RIVAL"}
        </h2>
        <div className="flex justify-center gap-6 mt-3 text-purple-200 text-sm">
          <span>📅 {partido?.fecha || "—"}</span>
          <span>🕐 {partido?.hora || "—"}</span>
          <span>📍 {partido?.pabellon || "—"}</span>
        </div>
      </div>

      {/* Players grid */}
      <div className="flex-1 px-6 py-5">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
        >
          {jugadores.map((j) => (
            <div key={j.id} className="text-center">
              <div className="mx-auto mb-1">
                <PlayerAvatar nombre={j.nombre_completo} foto_url={j.foto_url} size="lg" />
              </div>
              <p className="font-bold text-[#1E1B4B] text-xs">
                {j.apodo || j.nombre_completo.split(" ")[0]}
              </p>
              <p
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                className="text-[#6B21A8] font-bold text-lg"
              >
                #{j.dorsal}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#3B0764] px-8 py-4 flex justify-between items-center">
        <div className="text-white text-xs">
          <p className="font-semibold">Entrenador: {entrenador}</p>
          {ayudante && <p className="text-purple-300">Ayudante: {ayudante}</p>}
        </div>
        <p
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          className="text-purple-400 font-bold text-sm tracking-wider"
        >
          #SomosCantera
        </p>
      </div>
    </div>
  );
}