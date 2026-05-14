import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Palette, FolderOpen, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import "moment/locale/es";
moment.locale("es");

export default function Inicio() {
  const [recientes, setRecientes] = useState([]);

  useEffect(() => {
    base44.entities.CuadranteCantera.list("-created_date", 3).then(setRecientes);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#1E1B4B]" style={{ fontFamily: "'Barlow Condensed',sans-serif" }}>
          Bienvenido al Content Studio
        </h1>
        <p className="text-[#6B7280] mt-1">Genera piezas gráficas del CBC Valladolid en segundos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: "Cuadrante Cantera", desc: "Genera el horario semanal del fin de semana.", icon: Palette, to: "/disenos", color: "#6B21A8", active: true },
          { title: "Historial", desc: "Revisa y descarga los cuadrantes guardados.", icon: FolderOpen, to: "/historial", color: "#374151", active: true },
        ].map((card) => (
          <Link key={card.title} to={card.to}>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: card.color }}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-[#1E1B4B]">{card.title}</h3>
              <p className="text-sm text-[#6B7280] mt-1">{card.desc}</p>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-purple-700 group-hover:translate-x-0.5 transition-transform">
                Abrir <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#1E1B4B]">Últimas piezas generadas</h2>
          <Link to="/historial" className="text-xs text-purple-700 hover:underline font-medium flex items-center gap-1">
            Ver todas <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {recientes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-[#6B7280] text-sm">
            Todavía no hay piezas generadas.{" "}
            <Link to="/disenos" className="text-purple-700 font-medium underline">Crear la primera</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y">
            {recientes.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-semibold text-[#1E1B4B] text-sm" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16 }}>
                    {c.etiqueta_fecha}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    Cuadrante Cantera · {moment(c.created_date).fromNow()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={c.estado === "Publicado" ? "default" : "secondary"} className="text-xs">
                    {c.estado}
                  </Badge>
                  <Link to={`/disenos?id=${c.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <Download className="w-3.5 h-3.5" /> Descargar
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}