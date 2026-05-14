import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import StepDatos from "../components/generator/StepDatos";
import StepConvocatoria from "../components/generator/StepConvocatoria";
import StepDiseno from "../components/generator/StepDiseno";
import StepPreview from "../components/generator/StepPreview";

const STEPS = [
  { key: "datos", label: "Datos del partido" },
  { key: "convocatoria", label: "Convocatoria" },
  { key: "diseno", label: "Diseño" },
  { key: "preview", label: "Preview y Export" },
];

export default function Generador() {
  const [step, setStep] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [allJugadores, setAllJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const { toast } = useToast();

  const [data, setData] = useState({
    categoria: "",
    partido: "",
    _partidoData: null,
    entrenador: "",
    ayudante: "",
    notas: "",
    convocados: [],
    plantilla_id: "",
  });

  useEffect(() => {
    const loadInit = async () => {
      const [cats, jugs] = await Promise.all([
        base44.entities.Categoria.filter({ activa: true }),
        base44.entities.Jugador.filter({ activo: true }),
      ]);
      setCategorias(cats);
      setAllJugadores(jugs);

      // Check for edit mode
      const urlParams = new URLSearchParams(window.location.search);
      const editParam = urlParams.get("edit");
      if (editParam) {
        const cuadrante = await base44.entities.Cuadrante.filter({ id: editParam });
        if (cuadrante.length > 0) {
          const c = cuadrante[0];
          const partido = await base44.entities.Partido.filter({ id: c.partido });
          setData({
            categoria: c.categoria,
            partido: c.partido,
            _partidoData: partido[0] || null,
            entrenador: c.entrenador || "",
            ayudante: c.ayudante || "",
            notas: c.notas || "",
            convocados: c.convocados || [],
            plantilla_id: c.plantilla_id || "",
          });
          setEditId(c.id);
        }
      }
      setLoading(false);
    };
    loadInit();
  }, []);

  const selectedCategoria = categorias.find((c) => c.id === data.categoria);
  const selectedJugadores = allJugadores.filter((j) =>
    (data.convocados || []).includes(j.id)
  );

  const handleSave = async (estado = "Borrador") => {
    setSaving(true);
    const payload = {
      partido: data.partido,
      categoria: data.categoria,
      convocados: data.convocados,
      entrenador: data.entrenador,
      ayudante: data.ayudante || undefined,
      notas: data.notas || undefined,
      plantilla_id: data.plantilla_id,
      estado,
    };
    if (editId) {
      await base44.entities.Cuadrante.update(editId, payload);
    } else {
      const created = await base44.entities.Cuadrante.create(payload);
      setEditId(created.id);
    }
    toast({
      title: estado === "Publicado" ? "¡Cuadrante publicado!" : "Borrador guardado",
    });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-barlow font-bold">
          Generador de cuadrantes
        </h1>
        <p className="text-muted-foreground">
          Crea la convocatoria paso a paso
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                i === step
                  ? "bg-primary text-primary-foreground shadow-md"
                  : i < step
                  ? "bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80"
                  : "bg-muted text-muted-foreground cursor-default"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 h-px ${
                  i < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        {step === 0 && (
          <StepDatos
            data={data}
            onChange={setData}
            categorias={categorias}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepConvocatoria
            data={data}
            onChange={setData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepDiseno
            data={data}
            onChange={setData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepPreview
            data={data}
            partido={data._partidoData}
            jugadores={selectedJugadores}
            categoria={selectedCategoria}
            onSave={() => handleSave("Borrador")}
            onPublish={() => handleSave("Publicado")}
            onBack={() => setStep(2)}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}