import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";
import PartidoDialog from "../components/PartidoDialog";

export default function Partidos() {
  const [partidos, setPartidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("all");
  const [filterComp, setFilterComp] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartido, setEditingPartido] = useState(null);

  const loadData = async () => {
    const [parts, cats] = await Promise.all([
      base44.entities.Partido.list("-fecha", 100),
      base44.entities.Categoria.filter({ activa: true }),
    ]);
    setPartidos(parts);
    setCategorias(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCategoriaName = (id) =>
    categorias.find((c) => c.id === id)?.nombre || "—";

  const filtered = partidos.filter((p) => {
    if (filterCat !== "all" && p.categoria !== filterCat) return false;
    if (filterComp !== "all" && p.competicion !== filterComp) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-barlow font-bold">Partidos</h1>
          <p className="text-muted-foreground">
            {partidos.length} partidos registrados
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingPartido(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Nuevo partido
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterComp} onValueChange={setFilterComp}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Competición" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {["Liga Autonómica", "Copa", "Torneo"].map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Match list */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const isPast = new Date(p.fecha) < new Date();
          return (
            <div
              key={p.id}
              className="bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <span className="font-barlow font-bold text-primary text-lg">
                      J{p.jornada || "—"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-barlow font-bold text-lg">
                        {p.es_local
                          ? `CBC Valladolid vs ${p.rival}`
                          : `${p.rival} vs CBC Valladolid`}
                      </h3>
                      <Badge
                        variant={p.es_local ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {p.es_local ? "LOCAL" : "VISITANTE"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {moment(p.fecha).format("DD MMM YYYY")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {p.hora}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {p.pabellon}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <Badge variant="outline">{getCategoriaName(p.categoria)}</Badge>
                  <Badge variant={isPast ? "secondary" : "default"}>
                    {isPast ? "Jugado" : "Próximo"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPartido(p);
                      setDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-card rounded-xl p-8 text-center text-muted-foreground border border-border">
            No se encontraron partidos.
          </div>
        )}
      </div>

      <PartidoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partido={editingPartido}
        categorias={categorias}
        onSaved={loadData}
      />
    </div>
  );
}