import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, FileSpreadsheet, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";
import "moment/locale/es";
moment.locale("es");

export default function Horarios() {
  const [semanas, setSemanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDialog, setNewDialog] = useState(false);
  const [form, setForm] = useState({ etiqueta_fecha: "", fecha_inicio: "", fecha_fin: "" });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const load = () =>
    base44.entities.HorarioSemana.list("-created_date", 100).then((d) => {
      setSemanas(d);
      setLoading(false);
    });

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.etiqueta_fecha) return;
    setSaving(true);
    const created = await base44.entities.HorarioSemana.create({
      etiqueta_fecha: form.etiqueta_fecha,
      fecha_inicio: form.fecha_inicio || undefined,
      fecha_fin: form.fecha_fin || undefined,
      estado: "Borrador",
    });
    setSaving(false);
    setNewDialog(false);
    navigate(`/horarios/${created.id}`);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    await base44.entities.HorarioSemana.delete(id);
    toast({ title: "Semana eliminada" });
    load();
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Horarios Semanales
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{semanas.length} semanas creadas</p>
        </div>
        <Button className="gap-2" onClick={() => setNewDialog(true)}>
          <Plus className="w-4 h-4" /> Nueva semana
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Cargando...</div>
        ) : semanas.length === 0 ? (
          <div className="p-10 text-center">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No hay semanas creadas todavía.</p>
            <Button size="sm" className="mt-4" onClick={() => setNewDialog(true)}>
              Crear la primera
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Etiqueta</th>
                <th className="text-left p-4 font-semibold hidden md:table-cell">Creado</th>
                <th className="text-center p-4 font-semibold">Estado</th>
                <th className="text-right p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {semanas.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <p className="font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {s.etiqueta_fecha}
                    </p>
                    {s.fecha_inicio && (
                      <p className="text-xs text-muted-foreground">
                        {moment(s.fecha_inicio).format("D MMM")} — {moment(s.fecha_fin).format("D MMM YYYY")}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">
                    {moment(s.created_date).fromNow()}
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={s.estado === "Publicado" ? "default" : "secondary"}>
                      {s.estado}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/horarios/${s.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Abrir <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(e, s.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New dialog */}
      <Dialog open={newDialog} onOpenChange={setNewDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Nueva semana de horarios
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Etiqueta de fecha *</Label>
              <Input
                className="mt-1"
                placeholder="7-8 MAR."
                value={form.etiqueta_fecha}
                onChange={(e) => setForm({ ...form, etiqueta_fecha: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Texto libre que aparece en el gráfico, ej: "7-8 MAR."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fecha inicio</Label>
                <Input type="date" className="mt-1" value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} />
              </div>
              <div>
                <Label>Fecha fin</Label>
                <Input type="date" className="mt-1" value={form.fecha_fin}
                  onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} />
              </div>
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={saving || !form.etiqueta_fecha}>
              {saving ? "Creando..." : "Crear y editar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}