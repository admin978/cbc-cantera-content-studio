import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const MAX_FILAS = 18;

function parseExcel(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: true });

  const partidos = [];
  let bloqueActual = "CANTERA";
  let primeraFilaVaciaEncontrada = false;
  let orden = 1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];

    const primeraCelda = String(row[0] || "").trim().toUpperCase();
    if (primeraCelda === "EQUIPO") continue;

    const esVacia = row.every((c) => c === null || c === "" || c === undefined);
    if (esVacia) {
      if (!primeraFilaVaciaEncontrada) {
        bloqueActual = "ESCUELA";
        primeraFilaVaciaEncontrada = true;
      }
      continue;
    }

    const equipo = String(row[0] || "").trim();
    if (!equipo) continue;

    const rivalRaw = String(row[1] || "").trim();
    const descansa = !rivalRaw || rivalRaw === "---";

    let dia = String(row[2] || "").trim();
    const diaLower = dia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (diaLower.includes("lun")) dia = "Lunes";
    else if (diaLower.includes("mar") && !diaLower.includes("marzo")) dia = "Martes";
    else if (diaLower.includes("mie")) dia = "Miércoles";
    else if (diaLower.includes("jue")) dia = "Jueves";
    else if (diaLower.includes("vie")) dia = "Viernes";
    else if (diaLower.includes("sab")) dia = "Sábado";
    else if (diaLower.includes("dom")) dia = "Domingo";
    else dia = dia || "";

    const hora = String(row[3] || "").trim().replace(":", ".");
    const pabellon = String(row[4] || "").trim();

    let equipoNorm = equipo.toUpperCase();
    const noPrefijo = ["IVECO", "CAJA RURAL", "BABYS", "FILIAL"];
    if (!noPrefijo.some((p) => equipoNorm.startsWith(p))) {
      equipoNorm = "IVECO " + equipoNorm;
    }

    partidos.push({
      equipo: equipoNorm,
      rival: descansa ? "" : rivalRaw,
      dia: descansa ? "" : dia,
      hora: descansa ? "" : hora,
      pabellon: descansa ? "" : pabellon,
      bloque: bloqueActual,
      orden: orden++,
      descansa,
      visible: true,
    });
  }

  return partidos;
}

export default function ImportExcelModal({ open, onOpenChange, cuadranteId, onImported }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("replace");
  const fileRef = useRef();
  const { toast } = useToast();

  const handleFile = async (file) => {
    setLoading(true);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const partidos = parseExcel(wb);
    setPreview(partidos);
    setLoading(false);
  };

  const cantera = (preview || []).filter((p) => p.bloque === "CANTERA");
  const escuela = (preview || []).filter((p) => p.bloque === "ESCUELA");
  const total = (preview || []).length;
  const excede = total > MAX_FILAS;

  const handleConfirm = async () => {
    if (saving) return;
    setSaving(true);
    if (mode === "replace") {
      const existing = await base44.entities.CuadrantePartido.filter({ cuadrante: cuadranteId });
      await Promise.all(existing.map((p) => base44.entities.CuadrantePartido.delete(p.id)));
    }
    await base44.entities.CuadrantePartido.bulkCreate(
      preview.map((p) => ({
        cuadrante: cuadranteId,
        bloque: p.bloque, equipo: p.equipo, rival: p.rival,
        descansa: p.descansa, dia: p.dia, hora: p.hora,
        pabellon: p.pabellon, orden: p.orden, visible: p.visible,
      }))
    );
    setSaving(false);
    toast({ title: `${total} partidos importados correctamente`, duration: 3000 });
    setPreview(null);
    await onImported();
    onOpenChange(false);
  };

  const reset = () => setPreview(null);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Barlow Condensed',sans-serif" }} className="text-xl">
            Importar desde Excel
          </DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-14 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700">
              {loading ? "Procesando archivo..." : "Arrastra tu Excel aquí o haz click para seleccionar"}
            </p>
            <p className="text-sm text-gray-400 mt-1">Formatos: .xlsx, .xls · Columnas: Equipo | Rival | Día | Hora | Pabellón</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5 bg-green-50 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                {cantera.length} partidos CANTERA + {escuela.length} partidos ESCUELA detectados
              </div>
            </div>

            {excede && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-700">
                ⚠️ Hay {total} partidos. El diseño tiene {MAX_FILAS} filas. Los últimos se ocultarán.
              </div>
            )}

            <div className="border border-gray-200 rounded-lg overflow-auto max-h-64 text-xs">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {["Bloque", "Equipo", "Rival", "Día", "Hora", "Pabellón"].map((h) => (
                      <th key={h} className="text-left p-2 font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((p, i) => (
                    <tr key={i} className={p.descansa ? "opacity-40 bg-gray-50" : i >= MAX_FILAS ? "opacity-40" : ""}>
                      <td className="p-2 font-semibold" style={{ color: "#6B21A8" }}>{p.bloque}</td>
                      <td className="p-2 font-medium">{p.equipo}</td>
                      <td className="p-2">{p.descansa ? <Badge variant="secondary" className="text-[10px] py-0">Descansa</Badge> : p.rival}</td>
                      <td className="p-2">{p.dia}</td>
                      <td className="p-2">{p.hora}</td>
                      <td className="p-2 text-gray-500 max-w-32 truncate">{p.pabellon}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <RadioGroup value={mode} onValueChange={setMode} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="replace" id="r1" />
                <Label htmlFor="r1" className="text-sm cursor-pointer">Reemplazar datos actuales</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="add" id="r2" />
                <Label htmlFor="r2" className="text-sm cursor-pointer">Añadir a los existentes</Label>
              </div>
            </RadioGroup>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={reset}>✕ Cancelar</Button>
              <Button className="flex-1" onClick={handleConfirm} disabled={saving}>
                {saving ? "Importando..." : "✓ Confirmar importación"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}