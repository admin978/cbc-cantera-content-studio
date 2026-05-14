import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CalendarDays, ClipboardList, Trophy, Lock, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import "moment/locale/es";
moment.locale("es");

const modules = [
  {
    title: "Horarios Semanales",
    desc: "Genera el gráfico de horarios del fin de semana para redes sociales.",
    icon: CalendarDays,
    to: "/horarios",
    active: true,
    color: "#6B21A8",
  },
  {
    title: "Cuadrantes",
    desc: "Crea cuadrantes de convocatoria para cada partido.",
    icon: ClipboardList,
    to: "#",
    active: false,
  },
  {
    title: "Resultados",
    desc: "Publica los resultados del fin de semana.",
    icon: Trophy,
    to: "#",
    active: false,
  },
];

export default function Dashboard() {
  const [semanas, setSemanas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.HorarioSemana.list("-created_date", 3).then((d) => {
      setSemanas(d);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10">
      <div>
        <h1
          className="text-4xl font-black text-foreground uppercase tracking-tight"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          CBC Valladolid — Content Studio
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tu hub de contenido visual para la cantera
        </p>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Módulos disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.title} to={m.to} className={m.active ? "" : "pointer-events-none"}>
                <div
                  className={`relative bg-card rounded-xl p-6 border-2 transition-all group ${
                    m.active
                      ? "border-primary/20 hover:border-primary hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                      : "border-border opacity-50"
                  }`}
                >
                  {!m.active && (
                    <div className="absolute top-3 right-3">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: m.active ? "#6B21A8" : "#e5e7eb" }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3
                    className="font-bold text-lg text-foreground"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {m.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                  {!m.active && (
                    <Badge variant="secondary" className="mt-3 text-xs">Próximamente</Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent weeks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Últimas semanas generadas
          </h2>
          <Link to="/horarios">
            <Button variant="ghost" size="sm" className="gap-1 text-primary text-xs">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">
            Cargando...
          </div>
        ) : semanas.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <CalendarDays className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Todavía no hay semanas creadas.</p>
            <Link to="/horarios">
              <Button size="sm" className="mt-3 gap-2">
                <Plus className="w-4 h-4" /> Crear primera semana
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {semanas.map((s) => (
              <Link key={s.id} to={`/horarios/${s.id}`}>
                <div className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors">
                  <div>
                    <p
                      className="font-bold text-base"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {s.etiqueta_fecha}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Creado {moment(s.created_date).fromNow()}
                    </p>
                  </div>
                  <Badge variant={s.estado === "Publicado" ? "default" : "secondary"}>
                    {s.estado}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}