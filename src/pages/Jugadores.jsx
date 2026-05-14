import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import PlayerAvatar from "../components/PlayerAvatar";
import JugadorDialog from "../components/JugadorDialog";

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterPos, setFilterPos] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJugador, setEditingJugador] = useState(null);
  const { toast } = useToast();

  const loadData = async () => {
    const [jugs, cats] = await Promise.all([
      base44.entities.Jugador.list("-created_date", 200),
      base44.entities.Categoria.filter({ activa: true }),
    ]);
    setJugadores(jugs);
    setCategorias(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleActivo = async (jugador) => {
    await base44.entities.Jugador.update(jugador.id, {
      activo: !jugador.activo,
    });
    toast({
      title: jugador.activo ? "Jugador desactivado" : "Jugador activado",
    });
    loadData();
  };

  const getCategoriaName = (id) =>
    categorias.find((c) => c.id === id)?.nombre || "—";

  const filtered = jugadores.filter((j) => {
    if (
      search &&
      !j.nombre_completo.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (filterCat !== "all" && j.categoria !== filterCat) return false;
    if (filterPos !== "all" && j.posicion !== filterPos) return false;
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
          <h1 className="text-3xl font-barlow font-bold">Jugadores</h1>
          <p className="text-muted-foreground">
            {jugadores.length} jugadores registrados
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingJugador(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Añadir jugador
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
        <Select value={filterPos} onValueChange={setFilterPos}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Posición" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las posiciones</SelectItem>
            {["Base", "Escolta", "Alero", "Ala-Pívot", "Pívot"].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Jugador</th>
                <th className="text-left p-4 font-semibold hidden sm:table-cell">
                  Dorsal
                </th>
                <th className="text-left p-4 font-semibold hidden md:table-cell">
                  Posición
                </th>
                <th className="text-left p-4 font-semibold hidden lg:table-cell">
                  Categoría
                </th>
                <th className="text-center p-4 font-semibold">Activo</th>
                <th className="text-right p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((j) => (
                <tr
                  key={j.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar
                        nombre={j.nombre_completo}
                        foto_url={j.foto_url}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">{j.nombre_completo}</p>
                        {j.apodo && (
                          <p className="text-xs text-muted-foreground">
                            "{j.apodo}"
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="font-barlow font-bold text-lg text-primary">
                      #{j.dorsal}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell">{j.posicion}</td>
                  <td className="p-4 hidden lg:table-cell">
                    {getCategoriaName(j.categoria)}
                  </td>
                  <td className="p-4 text-center">
                    <Switch
                      checked={j.activo}
                      onCheckedChange={() => toggleActivo(j)}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingJugador(j);
                        setDialogOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No se encontraron jugadores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <JugadorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        jugador={editingJugador}
        categorias={categorias}
        onSaved={loadData}
      />
    </div>
  );
}