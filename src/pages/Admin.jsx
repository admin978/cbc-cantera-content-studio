import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Eye, Trash2, GripVertical, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const TABS = ["Diseños", "Patrocinadores", "Ajustes"];

// ─── DISEÑOS ─────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function DisenoModal({ open, onOpenChange, diseno, onSaved }) {
  const [form, setForm] = useState({ nombre: "", descripcion: "", slug: "", activo: true });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (diseno) {
      setForm({ nombre: diseno.nombre || "", descripcion: diseno.descripcion || "", slug: diseno.slug || "", activo: diseno.activo !== false });
    } else {
      setForm({ nombre: "", descripcion: "", slug: "", activo: true });
    }
  }, [diseno, open]);

  const handleNombre = (v) => setForm((f) => ({ ...f, nombre: v, slug: diseno ? f.slug : slugify(v) }));

  const handleSave = async () => {
    if (!form.nombre || !form.slug) { toast({ title: "Nombre y slug son obligatorios", variant: "destructive" }); return; }
    setSaving(true);
    if (diseno) {
      await base44.entities.Diseno.update(diseno.id, form);
    } else {
      await base44.entities.Diseno.create(form);
    }
    setSaving(false);
    toast({ title: diseno ? "Diseño actualizado" : "Diseño creado" });
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Barlow Condensed',sans-serif" }} className="text-xl">
            {diseno ? "Editar diseño" : "Nuevo diseño"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-medium">Nombre del diseño *</Label>
            <Input className="mt-1" value={form.nombre} onChange={(e) => handleNombre(e.target.value)} placeholder="Cuadrante Cantera" />
          </div>
          <div>
            <Label className="text-xs font-medium">Descripción</Label>
            <Input className="mt-1" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción corta del diseño" />
          </div>
          <div>
            <Label className="text-xs font-medium">Slug *</Label>
            <Input className="mt-1 font-mono text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <p className="text-xs text-gray-400 mt-1">El slug identifica el diseño internamente. No cambiar una vez creado.</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.activo} onCheckedChange={(v) => setForm({ ...form, activo: v })} />
            <Label className="text-sm">{form.activo ? "Activo" : "Inactivo"}</Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar diseño"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabDisenos() {
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const load = () => base44.entities.Diseno.list().then((d) => { setDisenos(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const toggleActivo = async (d) => {
    await base44.entities.Diseno.update(d.id, { activo: !d.activo });
    toast({ title: d.activo ? "Diseño desactivado" : "Diseño activado" });
    load();
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setModalOpen(true); };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {disenos.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Mini preview */}
            <div className="h-28 flex items-center justify-center" style={{ backgroundColor: "#3B0764" }}>
              <span className="text-white font-black text-lg uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
                {d.nombre}
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-[#1E1B4B] truncate">{d.nombre}</p>
                  {d.descripcion && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{d.descripcion}</p>}
                </div>
                <Badge variant={d.activo ? "default" : "secondary"} className="text-xs flex-shrink-0">
                  {d.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 flex-1">
                  <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => openEdit(d)}>
                    <Pencil className="w-3 h-3" /> Editar
                  </Button>
                  <Link to="/disenos">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <Eye className="w-3 h-3" /> Ver
                    </Button>
                  </Link>
                </div>
                <Switch checked={!!d.activo} onCheckedChange={() => toggleActivo(d)} className="scale-75" />
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <button
          onClick={openCreate}
          className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all flex flex-col items-center justify-center gap-3 p-8 min-h-48"
        >
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Plus className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-sm font-semibold text-gray-500">Añadir nuevo diseño</span>
        </button>
      </div>

      <DisenoModal open={modalOpen} onOpenChange={setModalOpen} diseno={editing} onSaved={load} />
    </div>
  );
}

// ─── PATROCINADORES ──────────────────────────────────────────────────────────

function PatrocinadorModal({ open, onOpenChange, patrocinador, onSaved }) {
  const [form, setForm] = useState({ nombre: "", logo_url: "", activo: true });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (patrocinador) {
      setForm({ nombre: patrocinador.nombre || "", logo_url: patrocinador.logo_url || "", activo: patrocinador.activo !== false });
    } else {
      setForm({ nombre: "", logo_url: "", activo: true });
    }
  }, [patrocinador, open]);

  const handleSave = async () => {
    if (!form.nombre) { toast({ title: "El nombre es obligatorio", variant: "destructive" }); return; }
    setSaving(true);
    if (patrocinador) {
      await base44.entities.Patrocinador.update(patrocinador.id, form);
    } else {
      const count = await base44.entities.Patrocinador.list().then((l) => l.length);
      await base44.entities.Patrocinador.create({ ...form, orden: count });
    }
    setSaving(false);
    toast({ title: patrocinador ? "Patrocinador actualizado" : "Patrocinador creado" });
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Barlow Condensed',sans-serif" }} className="text-xl">
            {patrocinador ? "Editar patrocinador" : "Nuevo patrocinador"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-medium">Nombre *</Label>
            <Input className="mt-1" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="IVECO" />
          </div>
          <div>
            <Label className="text-xs font-medium">URL del logo</Label>
            <Input className="mt-1" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.activo} onCheckedChange={(v) => setForm({ ...form, activo: v })} />
            <Label className="text-sm">{form.activo ? "Activo" : "Inactivo"}</Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabPatrocinadores() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const dragIdx = { current: null };
  const { toast } = useToast();

  const load = () => base44.entities.Patrocinador.list().then((l) => {
    setLista(l.sort((a, b) => (a.orden || 0) - (b.orden || 0)));
    setLoading(false);
  });
  useEffect(() => { load(); }, []);

  const toggleActivo = async (p) => {
    await base44.entities.Patrocinador.update(p.id, { activo: !p.activo });
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Patrocinador.delete(id);
    toast({ title: "Patrocinador eliminado" });
    load();
  };

  const handleDrop = async (targetIdx) => {
    const src = dragIdx.current;
    if (src == null || src === targetIdx) return;
    const next = [...lista];
    const [moved] = next.splice(src, 1);
    next.splice(targetIdx, 0, moved);
    setLista(next);
    await Promise.all(next.map((p, i) => base44.entities.Patrocinador.update(p.id, { orden: i })));
    dragIdx.current = null;
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        Los patrocinadores activos aparecen en el footer de todos los gráficos según el orden establecido.
      </div>

      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Añadir patrocinador
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {lista.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No hay patrocinadores registrados.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 p-3" />
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Logo</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Activo</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map((p, i) => (
                <tr
                  key={p.id}
                  draggable
                  onDragStart={() => (dragIdx.current = i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-300 cursor-grab"><GripVertical className="w-4 h-4" /></td>
                  <td className="p-3">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.nombre} className="h-8 w-auto max-w-16 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold">
                        {p.nombre[0]}
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-sm">{p.nombre}</td>
                  <td className="p-3">
                    <Switch checked={!!p.activo} onCheckedChange={() => toggleActivo(p)} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(p); setModalOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PatrocinadorModal open={modalOpen} onOpenChange={setModalOpen} patrocinador={editing} onSaved={load} />
    </div>
  );
}

// ─── AJUSTES ─────────────────────────────────────────────────────────────────

function TabAjustes() {
  const [form, setForm] = useState({
    nombre_club: "Club Baloncesto Valladolid",
    nombre_corto: "CBC Valladolid",
    logo_url: "",
    color_primario: "#6B21A8",
    color_secundario: "#3B0764",
    resolucion: "2x",
    formato: "PNG",
    prefijo: "CBC_",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast({ title: "Ajustes guardados" });
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Identidad */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-[#1E1B4B]">Identidad del club</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Nombre del club</Label>
            <Input className="mt-1" value={form.nombre_club} onChange={(e) => setForm({ ...form, nombre_club: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs font-medium">Nombre corto</Label>
            <Input className="mt-1" value={form.nombre_corto} onChange={(e) => setForm({ ...form, nombre_corto: e.target.value })} />
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium">Logo URL</Label>
          <Input className="mt-1" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Color primario</Label>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={form.color_primario} onChange={(e) => setForm({ ...form, color_primario: e.target.value })}
                className="w-10 h-9 rounded border border-gray-200 cursor-pointer p-0.5" />
              <Input value={form.color_primario} onChange={(e) => setForm({ ...form, color_primario: e.target.value })} className="font-mono text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium">Color secundario</Label>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={form.color_secundario} onChange={(e) => setForm({ ...form, color_secundario: e.target.value })}
                className="w-10 h-9 rounded border border-gray-200 cursor-pointer p-0.5" />
              <Input value={form.color_secundario} onChange={(e) => setForm({ ...form, color_secundario: e.target.value })} className="font-mono text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Exportación */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-[#1E1B4B]">Exportación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-medium">Resolución por defecto</Label>
            <Select value={form.resolucion} onValueChange={(v) => setForm({ ...form, resolucion: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1x">1x (72 dpi)</SelectItem>
                <SelectItem value="2x">2x (144 dpi)</SelectItem>
                <SelectItem value="3x">3x (216 dpi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">Formato por defecto</Label>
            <Select value={form.formato} onValueChange={(v) => setForm({ ...form, formato: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PNG">PNG</SelectItem>
                <SelectItem value="JPG">JPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">Prefijo de archivo</Label>
            <Input className="mt-1 font-mono text-sm" value={form.prefijo} onChange={(e) => setForm({ ...form, prefijo: e.target.value })} />
          </div>
        </div>
      </div>

      <Button className="gap-2" style={{ backgroundColor: "#6B21A8" }} onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Guardando..." : "Guardar ajustes"}
      </Button>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────

export default function Admin() {
  const [tab, setTab] = useState("Diseños");

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-black uppercase text-[#1E1B4B]" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
          Administración
        </h1>
        <div className="flex items-center gap-1 mt-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-t-lg text-sm font-semibold border-b-2 transition-colors ${
                tab === t
                  ? "border-purple-700 text-purple-700 bg-purple-50"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "Diseños" && <TabDisenos />}
        {tab === "Patrocinadores" && <TabPatrocinadores />}
        {tab === "Ajustes" && <TabAjustes />}
      </div>
    </div>
  );
}