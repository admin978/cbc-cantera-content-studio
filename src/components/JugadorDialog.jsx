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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const posiciones = ["Base", "Escolta", "Alero", "Ala-Pívot", "Pívot"];

export default function JugadorDialog({
  open,
  onOpenChange,
  jugador,
  categorias,
  onSaved,
}) {
  const [form, setForm] = useState({
    nombre_completo: "",
    apodo: "",
    dorsal: "",
    posicion: "",
    categoria: "",
    foto_url: "",
    activo: true,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (jugador) {
      setForm({
        nombre_completo: jugador.nombre_completo || "",
        apodo: jugador.apodo || "",
        dorsal: jugador.dorsal || "",
        posicion: jugador.posicion || "",
        categoria: jugador.categoria || "",
        foto_url: jugador.foto_url || "",
        activo: jugador.activo !== false,
      });
    } else {
      setForm({
        nombre_completo: "",
        apodo: "",
        dorsal: "",
        posicion: "",
        categoria: "",
        foto_url: "",
        activo: true,
      });
    }
  }, [jugador, open]);

  const handleSave = async () => {
    if (!form.nombre_completo || !form.dorsal || !form.posicion || !form.categoria) {
      toast({
        title: "Campos obligatorios",
        description: "Completa nombre, dorsal, posición y categoría.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const data = { ...form, dorsal: Number(form.dorsal) };
    if (jugador) {
      await base44.entities.Jugador.update(jugador.id, data);
      toast({ title: "Jugador actualizado" });
    } else {
      await base44.entities.Jugador.create(data);
      toast({ title: "Jugador creado" });
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
            {jugador ? "Editar jugador" : "Nuevo jugador"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Nombre completo *</Label>
            <Input
              value={form.nombre_completo}
              onChange={(e) =>
                setForm({ ...form, nombre_completo: e.target.value })
              }
              placeholder="Pablo García López"
            />
          </div>
          <div>
            <Label>Apodo</Label>
            <Input
              value={form.apodo}
              onChange={(e) => setForm({ ...form, apodo: e.target.value })}
              placeholder="Pablito"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dorsal *</Label>
              <Input
                type="number"
                value={form.dorsal}
                onChange={(e) => setForm({ ...form, dorsal: e.target.value })}
                placeholder="7"
              />
            </div>
            <div>
              <Label>Posición *</Label>
              <Select
                value={form.posicion}
                onValueChange={(v) => setForm({ ...form, posicion: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {posiciones.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Categoría *</Label>
            <Select
              value={form.categoria}
              onValueChange={(v) => setForm({ ...form, categoria: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
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
            <Label>URL de foto</Label>
            <Input
              value={form.foto_url}
              onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando..." : jugador ? "Actualizar" : "Crear jugador"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}