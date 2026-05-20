import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, FileImage, Save, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import CuadranteCanteraTemplate from "./CuadranteCanteraTemplate";
import EditorFilas from "./EditorFilas";
import ImportExcelModal from "./ImportExcelModal";

const SCALES = ["50", "60", "75", "100"];
const FONDO_URL = "https://res.cloudinary.com/dxmn0rojy/image/upload/fl_attachment:false/v1776263915/Cuadrante_Cantera_Fondo_bdfld2.jpg";

export default function CuadranteCanteraEditor() {
  const [cuadrante, setCuadrante] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [etiqueta, setEtiqueta] = useState("");
  const [estado, setEstado] = useState("Borrador");
  const [zoom, setZoom] = useState("50");
  const [ajusteCols, setAjusteCols] = useState({ equipo: 0, rival: 0, fecha: 0, pabellon: 0 });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fondoCargado, setFondoCargado] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setFondoCargado(true);
    img.onerror = () => setFondoCargado(true);
    img.src = FONDO_URL;
  }, []);

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
      const parts = await base44.entities.CuadrantePartido.filter({ cuadrante: found.id });
      const sorted = [...parts].sort((a, b) => (a.orden || 0) - (b.orden || 0));
      console.log('Partidos cargados desde DB:', sorted.length, JSON.stringify(sorted[0]));
      // Actualizar todo en batch para evitar renders intermedios inconsistentes
      setCuadrante(found);
      setEtiqueta(found.etiqueta_fecha || "");
      setEstado(found.estado || "Borrador");
      setPartidos(sorted);
    } else {
      setPartidos([]);
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
      const W = 1720, H = 1238;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { ctx.drawImage(img, 0, 0, W, H); resolve(); };
        img.onerror = reject;
        img.src = FONDO_URL + "?t=" + Date.now();
      });

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

      const txtFit = (texto, leftPct, topPct, size, weight, maxWidth) => {
        if (!texto) return;
        let s = size;
        ctx.font = weight + ' ' + s + 'px "Barlow Condensed"';
        while (ctx.measureText(String(texto).toUpperCase()).width > maxWidth && s > 10) {
          s -= 1;
          ctx.font = weight + ' ' + s + 'px "Barlow Condensed"';
        }
        ctx.fillText(String(texto).toUpperCase(), W * leftPct, H * topPct);
      };

      txt(etiqueta, 0.756, 0.081, 54, 800);

      const filasY = [
        0.2146, 0.2550, 0.2939, 0.3329, 0.3724,
        0.4120, 0.4530, 0.4939, 0.5345, 0.5749,
        0.6137, 0.6526, 0.6922, 0.7317, 0.7709,
        0.8101, 0.8488, 0.8858,
      ];

      const ordenados = [...partidos]
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        .filter((p) => p.visible !== false)
        .slice(0, 18);

      ctx.textBaseline = 'middle';

      filasY.forEach((topPct, i) => {
        const p = ordenados[i];
        if (!p || p.descansa) return;

        ctx.font = '700 26px "Barlow Condensed"';
        ctx.fillText((p.equipo || '').toUpperCase(), W * (0.0656 + (ajusteCols.equipo || 0) / 100), H * topPct);

        ctx.font = '700 26px "Barlow Condensed"';
        ctx.fillText((p.rival || '').toUpperCase(), W * (0.3154 + (ajusteCols.rival || 0) / 100), H * topPct);

        const fechaTxt = (p.dia && p.hora)
          ? (p.dia + ' ' + String(p.hora).replace(':', '.'))
          : '';
        ctx.fillText(fechaTxt.toUpperCase(), W * (0.5561 + (ajusteCols.fecha || 0) / 100), H * topPct);

        ctx.font = '600 26px "Barlow Condensed"';
        ctx.fillText((p.pabellon || '').toUpperCase(), W * (0.7293 + (ajusteCols.pabellon || 0) / 100), H * topPct);
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

  const scalePct = parseFloat(zoom) / 100;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
      {/* ── EDITOR ── */}
      <div className="w-full lg:w-[40%] overflow-y-auto p-5 space-y-4 border-r border-gray-200">

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
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setImportOpen(true)}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Importar Excel
            </Button>
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

        {/* Card: Ajuste de columnas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1E1B4B] text-sm uppercase tracking-wide">Ajuste de columnas</h2>
            <button
              onClick={() => setAjusteCols({ equipo: 0, rival: 0, fecha: 0, pabellon: 0 })}
              style={{ padding: "4px 10px", fontSize: "11px", border: "1px solid #D1D5DB", borderRadius: "4px", background: "white", cursor: "pointer", color: "#6B7280" }}
            >
              Reset todo
            </button>
          </div>
          {[
            { key: "equipo", label: "Equipo" },
            { key: "rival", label: "Rival" },
            { key: "fecha", label: "Fecha" },
            { key: "pabellon", label: "Pabellón" },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: key === "pabellon" ? 0 : 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6B21A8" }}>
                  {ajusteCols[key] > 0 ? "+" : ""}{ajusteCols[key].toFixed(1)}%
                </span>
              </div>
              <input
                type="range" min={-5} max={5} step={0.1}
                value={ajusteCols[key]}
                onChange={(e) => setAjusteCols({ ...ajusteCols, [key]: parseFloat(e.target.value) })}
                style={{ width: "100%", cursor: "pointer", accentColor: "#6B21A8" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── PREVIEW ── */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden bg-gray-50">
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
            <CuadranteCanteraTemplate partidos={partidos} etiquetaFecha={etiqueta} ajusteCols={ajusteCols} />
          </div>
        </div>
      </div>

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