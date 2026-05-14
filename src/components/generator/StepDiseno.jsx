import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function StepDiseno({ data, onChange, onNext, onBack }) {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Plantilla_Diseno.filter({ activa: true }).then((p) => {
      setPlantillas(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Cargando plantillas...
      </div>
    );
  }

  const previewImages = {
    clasico: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
    bold: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=300&fit=crop",
    minimalista: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=300&fit=crop",
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Elige el diseño para tu cuadrante de convocatoria.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {plantillas.map((p) => {
          const isSelected = data.plantilla_id === p.template_key;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                onChange({ ...data, plantilla_id: p.template_key })
              }
              className={`relative rounded-xl border-2 transition-all overflow-hidden text-left ${
                isSelected
                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-border hover:border-primary/30 hover:shadow-md"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-50 overflow-hidden">
                <img
                  src={p.preview_url || previewImages[p.template_key] || ""}
                  alt={p.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
              <div className="p-4">
                <h3 className="font-barlow font-bold text-lg">{p.nombre}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {p.descripcion}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {plantillas.length === 0 && (
        <div className="py-12 text-center text-muted-foreground bg-muted rounded-lg">
          No hay plantillas activas. Activa alguna en la sección de Plantillas.
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Volver
        </Button>
        <Button onClick={onNext} disabled={!data.plantilla_id}>
          Siguiente: Preview →
        </Button>
      </div>
    </div>
  );
}