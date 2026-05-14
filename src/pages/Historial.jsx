import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Download, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import CuadranteCanteraTemplate from "../components/cuadrante/CuadranteCanteraTemplate";
import moment from "moment";
import "moment/locale/es";
moment.locale("es");

export default function Historial() {
  const [cuadrantes, setCuadrantes] = useState([]);
  const [partidos, setPartidos] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [deleteId, setDeleteId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    const list = await base44.entities.CuadranteCantera.list("-created_date", 50);
    setCuadrantes(list);
    // Load partido counts
    const counts = {};
    await Promise.all(
      list.map(async (c) => {
        const parts = await base44.entities.CuadrantePartido.filter({ cuadrante: c.id });
        counts[c.id] = parts;
      })
    );
    setPartidos(counts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const parts = await base44.entities.CuadrantePartido.filter({ cuadrante: deleteId });
    await Promise.all(parts.map((p) => base44.entities.CuadrantePartido.delete(p.id)));
    await base44.entities.CuadranteCantera.delete(deleteId);
    toast({ title: "Cuadrante eliminado" });
    setDeleteId(null);
    load();
  };

  // Hidden render for export
  const handleExport = async (cuadrante) => {
    setExportingId(cuadrante.id);
    await new Promise((r) => setTimeout(r, 100));
    const el = document.getElementById(`export-${cuadrante.id}`);
    if (!el) { setExportingId(null); return; }
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#3B0764", logging: false });
    const link = document.createElement("a");
    link.download = `CBC_Cantera_${(cuadrante.etiqueta_fecha || "cuadrante").replace(/\s/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setExportingId(null);
  };

  const filtered = cuadrantes.filter((c) => filtro === "Todos" || c.estado === filtro);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase text-[#1E1B4B]" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
          Historial
        </h1>
        <div className="flex gap-1">
          {["Todos", "Borrador", "Publicado"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtro === f ? "bg-[#6B21A8] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No hay cuadrantes que mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const count = (partidos[c.id] || []).length;
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Mini preview */}
                <div className="aspect-[16/9] bg-[#3B0764] flex items-center justify-center">
                  <span className="text-white/50 text-xs font-medium tracking-widest">CUADRANTE CANTERA</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-[#1E1B4B] text-lg" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
                        {c.etiqueta_fecha}
                      </p>
                      <p className="text-xs text-gray-400">{moment(c.created_date).fromNow()} · {count} partidos</p>
                    </div>
                    <Badge variant={c.estado === "Publicado" ? "default" : "secondary"} className="text-xs mt-0.5">
                      {c.estado}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/disenos?id=${c.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                        <Edit className="w-3.5 h-3.5" /> Ver/Editar
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => handleExport(c)}
                      disabled={exportingId === c.id}
                    >
                      {exportingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-600"
                      onClick={() => setDeleteId(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Hidden export element */}
                {exportingId === c.id && (
                  <div style={{ position: "fixed", left: -9999, top: -9999 }}>
                    <CuadranteCanteraTemplate
                      partidos={partidos[c.id] || []}
                      etiquetaFecha={c.etiqueta_fecha}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuadrante?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}