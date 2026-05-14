import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import moment from "moment";

export default function StepDatos({ data, onChange, categorias, onNext }) {
  const [partidos, setPartidos] = useState([]);
  const [loadingPartidos, setLoadingPartidos] = useState(false);

  useEffect(() => {
    if (data.categoria) {
      setLoadingPartidos(true);
      base44.entities.Partido.filter({ categoria: data.categoria })
        .then((parts) => {
          const upcoming = parts
            .filter((p) => new Date(p.fecha) >= new Date(new Date().setHours(0, 0, 0, 0)))
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
          setPartidos(upcoming);
          setLoadingPartidos(false);
        });
    } else {
      setPartidos([]);
    }
  }, [data.categoria]);

  const selectedPartido = partidos.find((p) => p.id === data.partido);

  const handleSelectPartido = (partidoId) => {
    const p = partidos.find((x) => x.id === partidoId);
    onChange({
      ...data,
      partido: partidoId,
      _partidoData: p,
    });
  };

  const canProceed = data.categoria && data.partido && data.entrenador;

  return (
    <div className="space-y-6">
      {/* Categoria */}
      <div>
        <Label className="text-sm font-semibold">Categoría *</Label>
        <Select
          value={data.categoria || ""}
          onValueChange={(v) =>
            onChange({ ...data, categoria: v, partido: "", _partidoData: null })
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecciona la categoría" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c.color_acento }}
                  />
                  {c.nombre}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Partidos */}
      {data.categoria && (
        <div>
          <Label className="text-sm font-semibold">Próximo partido *</Label>
          {loadingPartidos ? (
            <div className="py-4 text-center text-muted-foreground text-sm">
              Cargando partidos...
            </div>
          ) : partidos.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground text-sm bg-muted rounded-lg mt-1">
              No hay próximos partidos para esta categoría.
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {partidos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPartido(p.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    data.partido === p.id
                      ? "border-primary bg-secondary"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-barlow font-bold">
                        {p.es_local
                          ? `CBC Valladolid vs ${p.rival}`
                          : `${p.rival} vs CBC Valladolid`}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {moment(p.fecha).format("DD MMM")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {p.hora}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {p.pabellon}
                        </span>
                      </div>
                    </div>
                    <Badge variant={p.es_local ? "default" : "secondary"} className="text-xs">
                      {p.es_local ? "LOCAL" : "VISIT."}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Auto-filled partido info */}
      {selectedPartido && (
        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
          <p>
            <strong>Rival:</strong> {selectedPartido.rival}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {moment(selectedPartido.fecha).format("DD/MM/YYYY")} a las{" "}
            {selectedPartido.hora}
          </p>
          <p>
            <strong>Pabellón:</strong> {selectedPartido.pabellon}
          </p>
          <p>
            <strong>Competición:</strong> {selectedPartido.competicion}
          </p>
          {selectedPartido.jornada && (
            <p>
              <strong>Jornada:</strong> {selectedPartido.jornada}
            </p>
          )}
        </div>
      )}

      {/* Entrenador */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold">Entrenador *</Label>
          <Input
            className="mt-1"
            value={data.entrenador || ""}
            onChange={(e) => onChange({ ...data, entrenador: e.target.value })}
            placeholder="Nombre del entrenador"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold">Ayudante</Label>
          <Input
            className="mt-1"
            value={data.ayudante || ""}
            onChange={(e) => onChange({ ...data, ayudante: e.target.value })}
            placeholder="Nombre del ayudante"
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <Label className="text-sm font-semibold">Notas</Label>
        <Textarea
          className="mt-1"
          value={data.notas || ""}
          onChange={(e) => onChange({ ...data, notas: e.target.value })}
          placeholder="Notas opcionales..."
          rows={2}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed}>
          Siguiente: Convocatoria →
        </Button>
      </div>
    </div>
  );
}