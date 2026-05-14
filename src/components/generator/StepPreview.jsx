import { useState } from "react";
import { Download, FileText, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TemplateClasico from "../templates/TemplateClasico";
import TemplateBold from "../templates/TemplateBold";
import TemplateMinimalista from "../templates/TemplateMinimalista";
import { exportToPNG, exportToPDF, FORMAT_SIZES } from "../../lib/exportUtils";

const templates = {
  clasico: TemplateClasico,
  bold: TemplateBold,
  minimalista: TemplateMinimalista,
};

export default function StepPreview({
  data,
  partido,
  jugadores,
  categoria,
  onSave,
  onPublish,
  onBack,
  saving,
}) {
  const [format, setFormat] = useState("story");
  const [exporting, setExporting] = useState(false);

  const Template = templates[data.plantilla_id] || TemplateClasico;
  const formatSize = FORMAT_SIZES[format];

  const scale = Math.min(
    (window.innerWidth > 768 ? 500 : window.innerWidth - 80) / formatSize.width,
    600 / formatSize.height
  );

  const handleExportPNG = async () => {
    setExporting(true);
    await exportToPNG(
      "cuadrante-preview",
      `cuadrante_${partido?.rival || "cbc"}_${format}`
    );
    setExporting(false);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    const orientation = formatSize.width > formatSize.height ? "landscape" : "portrait";
    await exportToPDF(
      "cuadrante-preview",
      `cuadrante_${partido?.rival || "cbc"}_${format}`,
      orientation
    );
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Format selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <label className="text-sm font-semibold block mb-1">
            Formato de salida
          </label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FORMAT_SIZES).map(([key, val]) => (
                <SelectItem key={key} value={key}>
                  {val.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExportPNG}
            disabled={exporting}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            PNG
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exporting}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Preview container */}
      <div className="bg-muted/30 rounded-xl p-6 flex justify-center overflow-auto">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            width: formatSize.width,
            height: formatSize.height,
          }}
        >
          <div id="cuadrante-preview">
            <Template
              partido={partido}
              jugadores={jugadores}
              entrenador={data.entrenador}
              ayudante={data.ayudante}
              categoria={categoria}
              format={formatSize}
            />
          </div>
        </div>
      </div>

      {/* Spacer for scaled content */}
      <div
        style={{ height: Math.max(0, formatSize.height * scale - 400) }}
      />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          ← Volver
        </Button>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onSave}
            disabled={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar borrador"}
          </Button>
          <Button
            onClick={onPublish}
            disabled={saving}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {saving ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </div>
    </div>
  );
}