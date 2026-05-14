import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Loader2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function DisenosGrid() {
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: "", slug: "", descripcion: "", preview_url: "", activo: true });
  const { toast } = useToast();

  const load = async () => {
    const list = await base44.entities.Diseno.list("nombre", 50);
    setDisenos(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.nombre || !form.slug) return;
    setSaving(true);
    await base44.entities.Diseno.create(form);
    setSaving(false);
    setModalOpen(false);
    setForm({ nombre: "", slug: "", descripcion: "", preview_url: "", activo: true });
    toast({ title: "Diseño creado" });
    load();
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-black uppercase tracking-tight text-[#1E1B4B]"
          style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
        >
          Diseños Gráficos
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Selecciona un diseño para generar tu pieza</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {disenos.map((d) => (
            <DisenoCard key={d.id} diseno={d} />
          ))}

          {/* Card: Nuevo diseño */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/40 transition-all min-h-[280px] group"
          >
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Plus className="w-7 h-7 text-[#6B21A8]" />
            </div>
            <span className="text-sm font-semibold text-gray-500 group-hover:text-[#6B21A8]">Nuevo diseño</span>
          </button>
        </div>
      )}

      {/* Modal crear diseño */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Barlow Condensed',sans-serif" }} className="text-xl">
              Nuevo diseño
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs">Nombre</Label>
              <Input className="mt-1" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Cuadrante Cantera" />
            </div>
            <div>
              <Label className="text-xs">Slug (URL)</Label>
              <Input className="mt-1" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="cuadrante-cantera" />
            </div>
            <div>
              <Label className="text-xs">Descripción</Label>
              <Input className="mt-1" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Breve descripción..." />
            </div>
            <div>
              <Label className="text-xs">URL de preview (imagen)</Label>
              <Input className="mt-1" value={form.preview_url} onChange={(e) => setForm({ ...form, preview_url: e.target.value })} placeholder="https://..." />
            </div>
            <Button className="w-full mt-2" onClick={handleCreate} disabled={saving || !form.nombre || !form.slug}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear diseño"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DisenoCard({ diseno }) {
  const activo = diseno.activo !== false;

  return (
    <div className={`group bg-white rounded-xl border overflow-hidden shadow-sm transition-all duration-200 flex flex-col
      ${activo
        ? "hover:shadow-lg hover:border-[#6B21A8] cursor-pointer"
        : "opacity-60 cursor-default"
      }`}
    >
      {/* Preview imagen */}
      <div className="relative h-[180px] bg-[#3B0764] overflow-hidden">
        {diseno.preview_url ? (
          <img
            src={diseno.preview_url}
            alt={diseno.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-white/60 text-lg font-black uppercase tracking-widest text-center px-4"
              style={{ fontFamily: "'Barlow Condensed',sans-serif" }}
            >
              {diseno.nombre}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[#1E1B4B] text-base leading-tight">{diseno.nombre}</h3>
          <Badge variant={activo ? "default" : "secondary"} className="text-[11px] flex-shrink-0 mt-0.5">
            {activo ? "● Activo" : "Inactivo"}
          </Badge>
        </div>
        {diseno.descripcion && (
          <p className="text-xs text-gray-500 leading-snug">{diseno.descripcion}</p>
        )}

        <div className="mt-auto pt-2">
          {activo ? (
            <Link to={`/disenos/${diseno.slug}`} className="block">
              <Button size="sm" className="w-full gap-2 text-xs" style={{ backgroundColor: "#6B21A8" }}>
                Abrir y editar <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" className="w-full text-xs" disabled>
              Inactivo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}