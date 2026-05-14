import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function PartidoDialog({
  open,
  onOpenChange,
  partido,
  categorias,
  onSaved,
}) {
  const [form, setForm] = useState({
    categoria: "",
    fecha: "",
    hora: "",
    rival: "",
    es_local: true,
    pabellon: "",
    jornada: "",
    competicion: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (partido) {
      setForm({
        categoria: partido.categoria || "",
        fecha: partido.fecha || "",
        hora: partido.hora || "",
        rival: partido.rival || "",
        es_local: partido.es_local !== false,
        pabellon: partido.pabellon || "",
        jornada: partido.jornada || "",
        competicion: partido.competicion || "",
      });
    } else {
      setForm({
        categoria: "",
        fecha: "",
        hora: "",
        rival: "",
        es_local: true,
        pabellon: "",
        jornada: "",
        competicion: "",
      });
    }
  }, [partido, open]);

  const handleSave = async () => {
    if (
      !form.categoria ||
      !form.fecha ||
      !form.hora ||
      !form.rival ||
      !form.pabellon ||
      !form.competicion
    ) {
      toast({
        title: "Campos obligatorios",
        description: "Completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const data = { ...form, jornada: form.jornada ? Number(form.jornada) : undefined };
    if (partido) {
      await base44.entities.Partido.update(partido.id, data);
      toast({ title: "Partido actualizado" });
    } else {
      await base44.entities.Partido.create(data);
      toast({ title: "Partido creado" });
    }
    setSaving(false);
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-barlow">
            {partido ? "Editar partido" : "Nuevo partido"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Categoría *</Label>
            <Select
              value={form.categoria}
              onValueChange={(v) => setForm({ ...form, categoria: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Rival *</Label>
            <Input
              value={form.rival}
              onChange={(e) => setForm({ ...form, rival: e.target.value })}
              placeholder="Club Río Duero"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>
            <div>
              <Label>Hora *</Label>
              <Input
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                placeholder="18:00"
              />
            </div>
          </div>
          <div>
            <Label>Pabellón *</Label>
            <Input
              value={form.pabellon}
              onChange={(e) => setForm({ ...form, pabellon: e.target.value })}
              placeholder="Pabellón Pisuerga"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Jornada</Label>
              <Input
                type="number"
                value={form.jornada}
                onChange={(e) => setForm({ ...form, jornada: e.target.value })}
              />
            </div>
            <div>
              <Label>Competición *</Label>
              <Select
                value={form.competicion}
                onValueChange={(v) => setForm({ ...form, competicion: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {["Liga Autonómica", "Copa", "Torneo"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.es_local}
              onCheckedChange={(v) => setForm({ ...form, es_local: v })}
            />
            <Label>{form.es_local ? "Local" : "Visitante"}</Label>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving
              ? "Guardando..."
              : partido
              ? "Actualizar"
              : "Crear partido"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}