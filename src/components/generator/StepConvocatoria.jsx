import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PlayerAvatar from "../PlayerAvatar";

const MAX_CONVOCADOS = 12;

export default function StepConvocatoria({ data, onChange, onNext, onBack }) {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data.categoria) {
      base44.entities.Jugador.filter({
        categoria: data.categoria,
        activo: true,
      }).then((jugs) => {
        setJugadores(jugs.sort((a, b) => a.dorsal - b.dorsal));
        setLoading(false);
      });
    }
  }, [data.categoria]);

  const selected = data.convocados || [];

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange({ ...data, convocados: selected.filter((x) => x !== id) });
    } else if (selected.length < MAX_CONVOCADOS) {
      onChange({ ...data, convocados: [...selected, id] });
    }
  };

  const canProceed = selected.length > 0;

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Cargando jugadores...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Convocados</span>
          <span className="font-barlow font-bold text-lg text-primary">
            {selected.length}/{MAX_CONVOCADOS}
          </span>
        </div>
        <Progress value={(selected.length / MAX_CONVOCADOS) * 100} className="h-2" />
      </div>

      {/* Players grid */}
      {jugadores.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-muted rounded-lg">
          No hay jugadores activos en esta categoría.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {jugadores.map((j) => {
            const isSelected = selected.includes(j.id);
            const isDisabled = !isSelected && selected.length >= MAX_CONVOCADOS;
            return (
              <button
                key={j.id}
                type="button"
                onClick={() => !isDisabled && toggle(j.id)}
                className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? "border-primary bg-secondary shadow-md"
                    : isDisabled
                    ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                    : "border-border hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
                <div className="flex justify-center mb-2">
                  <PlayerAvatar
                    nombre={j.nombre_completo}
                    foto_url={j.foto_url}
                    size="lg"
                  />
                </div>
                <p className="font-semibold text-sm truncate">
                  {j.apodo || j.nombre_completo.split(" ")[0]}
                </p>
                <p className="font-barlow font-bold text-primary text-lg">
                  #{j.dorsal}
                </p>
                <p className="text-xs text-muted-foreground">{j.posicion}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Volver
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Siguiente: Diseño →
        </Button>
      </div>
    </div>
  );
}