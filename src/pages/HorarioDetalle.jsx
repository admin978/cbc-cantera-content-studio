import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Download, FileImage, FileSpreadsheet, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import TemplateHorarios from "../components/horarios/TemplateHorarios";
import EditorPartidos from "../components/horarios/EditorPartidos";
import ImportExcelModal from "../components/horarios/ImportExcelModal";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

export default function HorarioDetalle() {
  const { id } = useParams();
  const [semana, setSemana] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [scale, setScale] = useState("50");
  const [etiqueta, setEtiqueta] = useState("");
  const { toast } = useToast();

  const load = async () => {
    const [s, parts] = await Promise.all([
      base44.entities.HorarioSemana.filter({ id }),
      base44.entities.HorarioPartido.filter({ semana: id }),
    ]);
    if (s[0]) {
      setSemana(s[0]);
      setEtiqueta(s[0].etiqueta_fecha || "");
    }
    setPartidos(parts.sort((a, b) => (a.orden || 0) - (b.orden || 0)));
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async (estado) => {
    setSaving(true);
    // Update semana
    await base44.entities.HorarioSemana.update(id, {
      etiqueta_fecha: etiqueta,
      estado: estado || semana?.estado || "Borrador",
    });
    // Upsert partidos
    const existing = partidos.filter((p) => p.id && !p._isNew);
    const newOnes = partidos.filter((p) => !p.id || p._isNew);
    await Promise.all(
      existing.map((p) =>
        base44.entities.HorarioPartido.update(p.id, {
          bloque: p.bloque,
          equipo: p.equipo,
          rival: p.rival || "",
          descansa: p.descansa,
          dia: p.dia,
          hora: p.hora || "",
          pabellon: p.pabellon || "",
          orden: p.orden || 0,
          visible_en_grafico: p.visible_en_grafico !== false,
          semana: id,
        })
      )
    );
    if (newOnes.length > 0) {
      await base44.entities.HorarioPartido.bulkCreate(
        newOnes.map((p) => ({
          semana: id,
          bloque: p.bloque,
          equipo: p.equipo,
          rival: p.rival || "",
          descansa: p.descansa || false,
          dia: p.dia || "Sábado",
          hora: p.hora || "",
          pabellon: p.pabellon || "",
          orden: p.orden || 0,
          visible_en_grafico: p.visible_en_grafico !== false,
        }))
      );
    }
    setSaving(false);
    toast({ title: estado === "Publicado" ? "Publicado" : "Guardado como borrador" });
    load();
  };

  const handleExport = async (format) => {
    setExporting(true);
    const el = document.getElementById("horario-template");
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
    const filename = `horarios_${etiqueta.replace(/\s/g, "_")}`;
    if (format === "jpg") {
      const link = document.createElement("a");
      link.download = `${filename}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    } else {
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const scalePct = parseFloat(scale) / 100;

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
        <Link to="/horarios">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ChevronLeft className="w-4 h-4" /> Volver
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <Input
            className="h-8 font-bold max-w-xs"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            placeholder="Etiqueta de fecha..."
          />
          <Badge variant={semana?.estado === "Publicado" ? "default" : "secondary"} className="text-xs">
            {semana?.estado}
          </Badge>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="gap-2 hidden sm:flex"
          >
            <FileSpreadsheet className="w-4 h-4" /> Importar Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("png")}
            disabled={exporting}
            className="gap-1"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileImage className="w-3.5 h-3.5" />}
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("jpg")}
            disabled={exporting}
            className="gap-1"
          >
            JPG
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={saving}
            className="gap-2"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </Button>
        </div>
      </div>

      {/* Main split */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Editor */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-5 border-r border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Editor de partidos
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImportOpen(true)}
              className="gap-1 text-xs sm:hidden"
            >
              <FileSpreadsheet className="w-3 h-3" /> Excel
            </Button>
          </div>
          <EditorPartidos partidos={partidos} onChange={setPartidos} />
          <div className="pt-2 border-t border-border flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSave("Borrador")}
              disabled={saving}
            >
              Guardar borrador
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleSave("Publicado")}
              disabled={saving}
            >
              Publicar
            </Button>
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="hidden lg:flex flex-col flex-1 overflow-hidden bg-muted/20">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Preview en tiempo real
            </span>
            <Select value={scale} onValueChange={setScale}>
              <SelectTrigger className="w-28 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="40">40%</SelectItem>
                <SelectItem value="50">50%</SelectItem>
                <SelectItem value="60">60%</SelectItem>
                <SelectItem value="75">75%</SelectItem>
                <SelectItem value="100">100%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 overflow-auto p-6 flex justify-center">
            <div
              style={{
                transformOrigin: "top center",
                transform: `scale(${scalePct})`,
                width: 1200,
                flexShrink: 0,
              }}
            >
              <TemplateHorarios
                semana={{ ...semana, etiqueta_fecha: etiqueta }}
                partidos={partidos}
              />
            </div>
          </div>
        </div>
      </div>

      <ImportExcelModal
        open={importOpen}
        onOpenChange={setImportOpen}
        semanaId={id}
        onImported={load}
      />
    </div>
  );
}