import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

function parseSheet(rows) {
  const partidos = [];
  let bloque = null;
  let orden = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const first = (row[0] || "").toString().trim().toUpperCase();
    const second = (row[1] || "").toString().trim().toUpperCase();

    // Detect section headers
    if (first.includes("CANTERA") || second.includes("CANTERA")) { bloque = "CANTERA"; continue; }
    if (first.includes("ESCUELA") || second.includes("ESCUELA")) { bloque = "ESCUELA"; continue; }
    if (!bloque) continue;

    // Skip empty or header rows
    const equipo = (row[0] || "").toString().trim();
    if (!equipo || equipo.toUpperCase() === "EQUIPO") continue;

    // col: 0=equipo, 1=vs(ignore), 2=rival, 3=pabellon, 4=dia, 5=fecha(ignore), 6=hora
    const rival = (row[2] || "").toString().trim();
    const pabellon = (row[3] || "").toString().trim();
    const dia = (row[4] || "").toString().trim();
    const hora = (row[6] || "").toString().trim();

    const descansa = rival.includes("Descansa") || rival.includes("--") || rival.includes("· Descansa");

    partidos.push({
      bloque,
      equipo,
      rival: descansa ? "" : rival,
      descansa,
      dia: dia.toLowerCase().includes("dom") ? "Domingo" : "Sábado",
      hora,
      pabellon,
      orden: orden++,
      visible_en_grafico: !descansa,
    });
  }
  return partidos;
}

export default function ImportExcelModal({ open, onOpenChange, semanaId, onImported }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const { toast } = useToast();

  const handleFile = async (file) => {
    setLoading(true);
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const parsed = parseSheet(rows);
    setPreview(parsed);
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = async () => {
    setSaving(true);
    // Delete existing
    const existing = await base44.entities.HorarioPartido.filter({ semana: semanaId });
    await Promise.all(existing.map((p) => base44.entities.HorarioPartido.delete(p.id)));
    // Create new
    await base44.entities.HorarioPartido.bulkCreate(
      preview.map((p) => ({ ...p, semana: semanaId }))
    );
    setSaving(false);
    toast({ title: `${preview.length} partidos importados` });
    onImported();
    onOpenChange(false);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-xl">
            Importar desde Excel
          </DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div
            className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />
            <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground">
              {loading ? "Procesando..." : "Arrastra el .xlsx aquí o haz clic para seleccionar"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Formatos soportados: .xlsx, .xls
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              {preview.length} filas detectadas
            </div>

            <div className="border border-border rounded-lg overflow-auto max-h-72 text-xs">
              <table className="w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-semibold">Bloque</th>
                    <th className="text-left p-2 font-semibold">Equipo</th>
                    <th className="text-left p-2 font-semibold">Rival</th>
                    <th className="text-left p-2 font-semibold">Día</th>
                    <th className="text-left p-2 font-semibold">Hora</th>
                    <th className="text-left p-2 font-semibold">Pabellón</th>
                    <th className="text-left p-2 font-semibold">Descansa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.map((p, i) => (
                    <tr key={i} className={p.descansa ? "opacity-40" : ""}>
                      <td className="p-2 font-semibold" style={{ color: "#6B21A8" }}>{p.bloque}</td>
                      <td className="p-2 font-medium">{p.equipo}</td>
                      <td className="p-2">{p.rival || "—"}</td>
                      <td className="p-2">{p.dia}</td>
                      <td className="p-2">{p.hora}</td>
                      <td className="p-2">{p.pabellon}</td>
                      <td className="p-2">{p.descansa ? "✓" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPreview(null)}>
                Volver
              </Button>
              <Button className="flex-1" onClick={handleConfirm} disabled={saving}>
                {saving ? "Importando..." : "Confirmar importación"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}