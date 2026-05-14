import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, FileImage, Save, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import CuadranteCanteraTemplate from "../components/cuadrante/CuadranteCanteraTemplate";
import EditorFilas from "@/components/cuadrante/EditorFilas";
import ImportExcelModal from "../components/cuadrante/ImportExcelModal";

const SCALES = ["50", "60", "75", "100"];

export default function Disenos() {
  const [disenos, setDisenos] = useState([]);
  const [activeDiseno, setActiveDiseno] = useState(null);
  const [cuadrante, setCuadrante] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [etiqueta, setEtiqueta] = useState("");
  const [estado, setEstado] = useState("Borrador");
  const [zoom, setZoom] = useState("50");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fondoCargado, setFondoCargado] = useState(false);
  const { toast } = useToast();

  const FONDO_URL = "https://res.cloudinary.com/dxmn0rojy/image/upload/fl_attachment:false/v1776263915/Cuadrante_Cantera_Fondo_bdfld2.jpg";

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setFondoCargado(true);
    img.onerror = () => setFondoCargado(true); // permitir exportar aunque falle
    img.src = FONDO_URL;
  }, []);

  useEffect(() => {
    base44.entities.Diseno.filter({ activo: true }).then((d) => {
      setDisenos(d);
      if (d.length > 0) setActiveDiseno(d[0].slug || d[0].id);
    });
  }, []);

  // Load or init cuadrante (use URL param ?id= or the most recent one)
  const loadOrCreate = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get("id");
    let found = null;

    if (idParam) {
      const res = await base44.entities.CuadranteCantera.filter({ id: idParam });
      found = res[0] || null;
    }

    if (!found) {
      const list = await base44.entities.CuadranteCantera.list("-created_date", 1);
      found = list[0] || null;
    }

    if (found) {
      setCuadrante(found);
      setEtiqueta(found.etiqueta_fecha || "");
      setEstado(found.estado || "Borrador");
      const parts = await base44.entities.CuadrantePartido.filter({ cuadrante: found.id });
      setPartidos(parts.sort((a, b) => (a.orden || 0) - (b.orden || 0)));
    }
    setLoading(false);
  };

  useEffect(() => { loadOrCreate(); }, []);

  const ensureCuadrante = async () => {
    if (cuadrante) return cuadrante;
    const created = await base44.entities.CuadranteCantera.create({
      etiqueta_fecha: etiqueta || "SIN FECHA",
      estado,
    });
    setCuadrante(created);
    return created;
  };

  const handleSave = async (estadoOverride) => {
    setSaving(true);
    const c = await ensureCuadrante();
    await base44.entities.CuadranteCantera.update(c.id, {
      etiqueta_fecha: etiqueta,
      estado: estadoOverride || estado,
    });
    if (estadoOverride) setEstado(estadoOverride);

    // Upsert partidos
    const existing = partidos.filter((p) => p.id && !p._new);
    const newOnes = partidos.filter((p) => !p.id || p._new);
    await Promise.all(existing.map((p) =>
      base44.entities.CuadrantePartido.update(p.id, {
        bloque: p.bloque, equipo: p.equipo, rival: p.rival || "",
        descansa: !!p.descansa, dia: p.dia || "Sábado", hora: p.hora || "",
        pabellon: p.pabellon || "", orden: p.orden || 0,
        visible: p.visible !== false, cuadrante: c.id,
      })
    ));
    if (newOnes.length > 0) {
      await base44.entities.CuadrantePartido.bulkCreate(newOnes.map((p) => ({
        cuadrante: c.id, bloque: p.bloque, equipo: p.equipo, rival: p.rival || "",
        descansa: !!p.descansa, dia: p.dia || "Sábado", hora: p.hora || "",
        pabellon: p.pabellon || "", orden: p.orden || 0, visible: p.visible !== false,
      })));
    }
    setSaving(false);
    toast({ title: estadoOverride === "Publicado" ? "¡Publicado!" : "Borrador guardado" });
    loadOrCreate();
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const W = 1720;
      const H = 1238;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      // Dibujar fondo con crossOrigin (sin CORS issues)
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { ctx.drawImage(img, 0, 0, W, H); resolve(); };
        img.onerror = reject;
        img.src = FONDO_URL + "?t=" + Date.now();
      });

      // Cargar fuentes
      await document.fonts.load('800 54px "Barlow Condensed"');
      await document.fonts.load('700 29px "Barlow Condensed"');
      await document.fonts.load('600 22px "Barlow Condensed"');

      ctx.fillStyle = "#FFFFFF";
      ctx.textBaseline = "middle";

      const txt = (texto, leftPct, topPct, size, weight = 600) => {
        if (!texto) return;
        ctx.font = weight + ' ' + size + 'px "Barlow Condensed"';
        ctx.fillText(String(texto).toUpperCase(), W * leftPct, H * topPct);
      };

      // Etiqueta fecha
      txt(etiqueta, 0.756, 0.081, 54, 800);

      // 18 filas
      const filasY = [
        0.2075, 0.2459, 0.2858, 0.3266, 0.3646,
        0.4053, 0.4453, 0.4861, 0.5264, 0.5668,
        0.6068, 0.6476, 0.6799, 0.7206, 0.7549,
        0.7933, 0.8341, 0.8773,
      ];

      const cantera = partidos.filter((p) => p.bloque === "CANTERA").sort((a, b) => (a.orden || 0) - (b.orden || 0));
      const escuela = partidos.filter((p) => p.bloque === "ESCUELA").sort((a, b) => (a.orden || 0) - (b.orden || 0));
      const ordenados = [...cantera, ...escuela].filter((p) => p.visible !== false).slice(0, 18);

      filasY.forEach((topPct, i) => {
        const p = ordenados[i];
        if (!p || p.descansa) return;
        const y = topPct + 0.012;
        txt(p.equipo || "", 0.064, y, 19, 700);
        txt(p.rival || "", 0.311, y, 18, 600);
        const fechaTxt = (p.dia && p.hora) ? p.dia + " " + String(p.hora).replace(":", ".") : "";
        txt(fechaTxt, 0.552, y, 18, 600);
        txt(p.pabellon || "", 0.724, y, 17, 600);
      });

      const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
      const fechaNombre = (etiqueta || "cuadrante").replace(/[\s\.]/g, "_");
      canvas.toBlob((blob) => {
        setExporting(false);
        if (!blob) { alert("Error al generar la imagen."); return; }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `CBC_Cantera_${fechaNombre}.${format}`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, mimeType, 0.95);
    } catch (err) {
      setExporting(false);
      alert("Error al exportar: " + err.message);
    }
  };

  const handleNewCuadrante = async () => {
    const created = await base44.entities.CuadranteCantera.create({
      etiqueta_fecha: "NUEVA FECHA",
      estado: "Borrador",
    });
    setCuadrante(created);
    setEtiqueta("NUEVA FECHA");
    setEstado("Borrador");
    setPartidos([]);
    toast({ title: "Nuevo cuadrante creado" });
  };

  const scalePct = parseFloat(zoom) / 100;

  return (
    <div className="h-full flex flex-col">
      {/* PAGE HEADER */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black uppercase text-[#1E1B4B]" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
            Diseños gráficos
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4">
          {disenos.length === 0 ? (
            <span className="text-sm text-gray-400 italic">No hay diseños activos.</span>
          ) : (
            disenos.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDiseno(d.slug || d.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold border-b-2 transition-colors ${
                  activeDiseno === (d.slug || d.id)
                    ? "border-purple-700 text-purple-700 bg-purple-50"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {d.nombre}
                {activeDiseno === (d.slug || d.id) && <span className="text-green-500 text-xs">✓</span>}
              </button>
            ))
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* ── LEFT COLUMN ── */}
          <div className="w-full lg:w-[45%] overflow-y-auto p-5 space-y-4 border-r border-gray-200">

            {/* Card: Configuración */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-[#1E1B4B] text-sm uppercase tracking-wide">Configuración</h2>
              <div>
                <Label className="text-xs font-medium text-gray-600">Etiqueta de fecha</Label>
                <Input
                  className="mt-1 font-semibold"
                  placeholder="7-8 MAR."
                  value={etiqueta}
                  onChange={(e) => setEtiqueta(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Este texto aparece en la esquina superior derecha del gráfico.
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Borrador">Borrador</SelectItem>
                    <SelectItem value="Publicado">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Card: Datos */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[#1E1B4B] text-sm uppercase tracking-wide">Datos del cuadrante</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setImportOpen(true)}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Importar Excel
                  </Button>
                </div>
              </div>
              <EditorFilas partidos={partidos} onChange={setPartidos} />
            </div>

            {/* Card: Exportar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-[#1E1B4B] text-sm uppercase tracking-wide">Exportar</h2>
              {!fondoCargado && (
                <p className="text-xs text-amber-600 text-center flex items-center justify-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Cargando imagen de fondo...
                </p>
              )}
              <Button
                className="w-full gap-2 text-base font-bold h-11"
                style={{ backgroundColor: "#6B21A8" }}
                onClick={() => handleExport("png")}
                disabled={exporting || !fondoCargado}
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Exportar PNG
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleExport("jpg")}
                disabled={exporting || !fondoCargado}
              >
                <FileImage className="w-4 h-4" /> Exportar JPG
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2 text-gray-600"
                onClick={() => handleSave("Borrador")}
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar borrador"}
              </Button>
              <p className="text-xs text-gray-400 text-center">Resolución de exportación: 1720×1238px (Canvas API)</p>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="hidden lg:flex flex-col flex-1 overflow-hidden bg-gray-50">
            {/* Sticky header */}
            <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Preview en tiempo real</span>
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                  En vivo
                </span>
              </div>
              <div className="flex items-center gap-1">
                {SCALES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setZoom(s)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      zoom === s
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-auto p-6 flex justify-start items-start">
              <div
                style={{
                  transformOrigin: "top left",
                  transform: `scale(${scalePct})`,
                  width: 1720,
                  height: 1238,
                  flexShrink: 0,
                  boxShadow: "0 8px 48px rgba(0,0,0,0.18)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <CuadranteCanteraTemplate
                  partidos={partidos}
                  etiquetaFecha={etiqueta}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {cuadrante && (
        <ImportExcelModal
          open={importOpen}
          onOpenChange={setImportOpen}
          cuadranteId={cuadrante.id}
          onImported={loadOrCreate}
        />
      )}
    </div>
  );
}