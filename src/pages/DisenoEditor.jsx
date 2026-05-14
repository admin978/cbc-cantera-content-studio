import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2 } from "lucide-react";
import CuadranteCanteraEditor from "@/components/cuadrante/CuadranteCanteraEditor";
import CuadranteCantera22Editor from "@/components/cuadrante22/CuadranteCantera22Editor";
import LideresEditor from "@/components/LideresEditor";

export default function DisenoEditor() {
  const { slug } = useParams();
  const [diseno, setDiseno] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Diseno.filter({ slug }).then((res) => {
      setDiseno(res[0] || null);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!diseno) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-semibold">Diseño no encontrado</p>
        <Link to="/disenos" className="text-purple-700 text-sm underline mt-2 inline-block">
          ← Volver a diseños
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Back header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <Link
          to="/disenos"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#6B21A8] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a diseños
        </Link>
        <span className="text-gray-300">|</span>
        <h1
          className="text-xl font-black uppercase text-[#1E1B4B]"
          style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
        >
          {diseno.nombre}
        </h1>
      </div>

      {/* Render the correct editor based on slug */}
      {slug === "cuadrante-cantera" && <CuadranteCanteraEditor />}

      {slug === "cuadrante-cantera-22" && <CuadranteCantera22Editor />}

      {slug === "lideres-estadisticos" && <LideresEditor />}

      {slug !== "cuadrante-cantera" && slug !== "cuadrante-cantera-22" && slug !== "lideres-estadisticos" && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Editor no disponible para este diseño.
        </div>
      )}
    </div>
  );
}