import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ChevronUp, ChevronDown } from "lucide-react";

const MAX_FILAS = 22;

const BLOQUES = ["CANTERA", "ESCUELA"];
const DIAS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function FilaRow({ partido, idx, total, onChange, onMoveUp, onMoveDown }) {
  return (
    <div className={`border rounded-lg p-3 space-y-2 ${partido.visible === false ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={idx === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={onMoveDown} disabled={idx === total - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-xs text-gray-400 w-4 text-center">{idx + 1}</span>

        <Select value={partido.bloque || "CANTERA"} onValueChange={(v) => onChange({ ...partido, bloque: v })}>
          <SelectTrigger className="w-20 h-6 text-xs px-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOQUES.map((b) => (
              <SelectItem key={b} value={b}>
                <Badge variant="outline" className="text-[10px] py-0 px-1" style={{ color: b === "CANTERA" ? "#6B21A8" : "#0369A1" }}>
                  {b[0]}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] text-gray-400">Desc.</span>
          <Switch
            checked={!!partido.descansa}
            onCheckedChange={(v) => onChange({ ...partido, descansa: v })}
            className="scale-75"
          />
          <span className="text-[10px] text-gray-400 ml-1">
            <svg className="w-3.5 h-3.5 text-gray-400 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              onClick={() => onChange({ ...partido, visible: partido.visible === false ? true : false })}>
              {partido.visible === false
                ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
              }
            </svg>
          </span>
        </div>
      </div>

      {!partido.descansa && (
        <>
          <Input
            placeholder="EQUIPO"
            className="h-7 text-xs font-semibold uppercase"
            value={partido.equipo || ""}
            onChange={(e) => onChange({ ...partido, equipo: e.target.value })}
          />
          <Input
            placeholder="Rival"
            className="h-7 text-xs"
            value={partido.rival || ""}
            onChange={(e) => onChange({ ...partido, rival: e.target.value })}
          />
          <div className="flex gap-2">
            <Select value={partido.dia || "__none__"} onValueChange={(v) => onChange({ ...partido, dia: v === "__none__" ? "" : v })}>
              <SelectTrigger className="h-7 text-xs flex-1">
                <SelectValue placeholder="Día" />
              </SelectTrigger>
              <SelectContent>
                {DIAS.map((d) => (
                  <SelectItem key={d || "__none__"} value={d || "__none__"}>{d || "—"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Hora"
              className="h-7 text-xs w-20"
              value={partido.hora || ""}
              onChange={(e) => onChange({ ...partido, hora: e.target.value })}
            />
          </div>
          <Input
            placeholder="Pabellón"
            className="h-7 text-xs"
            value={partido.pabellon || ""}
            onChange={(e) => onChange({ ...partido, pabellon: e.target.value })}
          />
        </>
      )}
      {partido.descansa && (
        <div className="text-xs text-gray-400 italic px-1">— descansa esta jornada —</div>
      )}
    </div>
  );
}

export default function EditorFilas22({ partidos, onChange }) {
  const update = (idx, updated) => {
    const next = [...partidos];
    next[idx] = updated;
    onChange(next);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...partidos];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    next[idx - 1] = { ...next[idx - 1], orden: idx - 1 };
    next[idx] = { ...next[idx], orden: idx };
    onChange(next);
  };

  const moveDown = (idx) => {
    if (idx === partidos.length - 1) return;
    const next = [...partidos];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    next[idx] = { ...next[idx], orden: idx };
    next[idx + 1] = { ...next[idx + 1], orden: idx + 1 };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {partidos.length > MAX_FILAS && (
        <p className="text-xs text-amber-600 font-medium">
          ⚠ Solo se mostrarán las primeras {MAX_FILAS} filas en el gráfico.
        </p>
      )}
      {partidos.map((p, i) => (
        <FilaRow
          key={p.id || p._key || i}
          partido={p}
          idx={i}
          total={partidos.length}
          onChange={(updated) => update(i, updated)}
          onMoveUp={() => moveUp(i)}
          onMoveDown={() => moveDown(i)}
        />
      ))}
      {partidos.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">
          Importa un Excel o añade filas manualmente.
        </p>
      )}
    </div>
  );
}