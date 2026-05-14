import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Loader2, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function PlantillaModal({ open, onOpenChange, plantilla, onSaved }) {
  const [form, setForm] = useState({ nombre: "", slug: "", descripcion: "", preview_url: "", activo: true });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (plantilla) {
      setForm({
        nombre: plantilla.nombre || "",
        slug: plantilla.slug || "",
        descripcion: plantilla.descripcion || "",
        preview_url: plantilla.preview_url || "",
        activo: plantilla.activo !== false,
      });
    } else {
      setForm({ nombre: "", slug: "", descripcion: "", preview_url: "", activo: true });
    }
  }, [plantilla, open]);

  const handleNombre = (v) => setForm((f) => ({ ...f, nombre: v, slug: plantilla ? f.slug : slugify(v) }));

  const handleSave = async () => {
    if (!form.nombre || !form.slug) {
      toast({ title: "El nombre y el slug son obligatorios", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (plantilla) {
      await base44.entities.Diseno.update(plantilla.id, form);
    } else {
      await base44.entities.Diseno.create(form);
    }
    setSaving(false);
    toast({ title: plantilla ? "Plantilla actualizada" : "Plantilla creada" });
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Barlow Condensed',sans-serif" }} className="text-xl">
            {plantilla ? "Editar plantilla" : "Nueva plantilla"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-medium">Nombre *</Label>
            <Input className="mt-1" value={form.nombre} onChange={(e) => handleNombre(e.target.value)} placeholder="Cuadrante Cantera" />
          </div>
          <div>
            <Label className="text-xs font-medium">Slug (identificador) *</Label>
            <Input className="mt-1 font-mono text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="cuadrante-cantera" />
            <p className="text-xs text-gray-400 mt-1">Identifica la plantilla internamente. No cambiar una vez creado.</p>
          </div>
          <div>
            <Label className="text-xs font-medium">Descripción</Label>
            <Input className="mt-1" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Breve descripción..." />
          </div>
          <div>
            <Label className="text-xs font-medium">URL de preview (imagen)</Label>
            <Input className="mt-1" value={form.preview_url} onChange={(e) => setForm({ ...form, preview_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.activo} onCheckedChange={(v) => setForm({ ...form, activo: v })} />
            <Label className="text-sm">{form.activo ? "Activa" : "Inactiva"}</Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving} style={{ backgroundColor: "#6B21A8" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar plantilla"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Plantillas() {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    const list = await base44.entities.Diseno.list("nombre", 50);
    setPlantillas(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await base44.entities.Diseno.delete(id);
    toast({ title: "Plantilla eliminada" });
    load();
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setModalOpen(true); };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-black uppercase tracking-tight text-[#1E1B4B]"
            style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
          >
            Plantillas
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Selecciona una plantilla para generar tu pieza gráfica</p>
        </div>
        <Button onClick={openCreate} style={{ backgroundColor: "#6B21A8" }} className="gap-2">
          <Plus className="w-4 h-4" /> Nueva plantilla
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : plantillas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No hay plantillas todavía.{" "}
          <button onClick={openCreate} className="text-purple-700 font-medium underline">Crear la primera</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillas.map((p) => {
            const activa = p.activo !== false;
            return (
              <div
                key={p.id}
                className={`group bg-white rounded-xl border overflow-hidden shadow-sm transition-all duration-200 flex flex-col ${
                  activa ? "hover:shadow-lg hover:border-[#6B21A8]" : "opacity-60"
                }`}
              >
                <div className="relative h-[180px] bg-[#3B0764] overflow-hidden">
                  {p.preview_url ? (
                    <img src={p.preview_url} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span
                        className="text-white/60 text-lg font-black uppercase tracking-widest text-center px-4"
                        style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
                      >
                        {p.nombre}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[#1E1B4B] text-base leading-tight">{p.nombre}</h3>
                    <Badge variant={activa ? "default" : "secondary"} className="text-[11px] flex-shrink-0 mt-0.5">
                      {activa ? "● Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  {p.descripcion && (
                    <p className="text-xs text-gray-500 leading-snug">{p.descripcion}</p>
                  )}

                  <div className="mt-auto pt-2 flex gap-2">
                    {activa ? (
                      <Link to={`/plantillas/${p.slug}`} className="flex-1">
                        <Button size="sm" className="w-full gap-2 text-xs" style={{ backgroundColor: "#6B21A8" }}>
                          Abrir y usar <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1 text-xs" disabled>
                        Inactiva
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="px-2.5" onClick={() => openEdit(p)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="px-2.5 text-red-400 hover:text-red-600" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PlantillaModal open={modalOpen} onOpenChange={setModalOpen} plantilla={editing} onSaved={load} />
    </div>
  );
}
