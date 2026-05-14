import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function Plantillas() {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    const data = await base44.entities.Plantilla_Diseno.list("-created_date", 50);
    setPlantillas(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleActive = async (p) => {
    await base44.entities.Plantilla_Diseno.update(p.id, {
      activa: !p.activa,
    });
    toast({ title: p.activa ? "Plantilla desactivada" : "Plantilla activada" });
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-barlow font-bold">Plantillas de diseño</h1>
        <p className="text-muted-foreground">
          Gestiona las plantillas disponibles para los cuadrantes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plantillas.map((p) => (
          <div
            key={p.id}
            className={`bg-card rounded-xl shadow-sm border-2 transition-all overflow-hidden ${
              p.activa ? "border-primary/30" : "border-border opacity-60"
            }`}
          >
            {/* Preview */}
            <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
              {p.preview_url ? (
                <img
                  src={p.preview_url}
                  alt={p.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <span className="font-barlow font-bold text-2xl text-primary/40">
                    {p.template_key?.toUpperCase()}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vista previa
                  </p>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-barlow font-bold text-lg">{p.nombre}</h3>
                  <p className="text-sm text-muted-foreground">
                    {p.descripcion}
                  </p>
                </div>
                <Switch
                  checked={p.activa}
                  onCheckedChange={() => toggleActive(p)}
                />
              </div>
              <div className="flex gap-2 mt-3">
                {(p.formatos_disponibles || "story,post,banner")
                  .split(",")
                  .map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs">
                      {f.trim()}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        ))}
        {plantillas.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No hay plantillas definidas.
          </div>
        )}
      </div>
    </div>
  );
}