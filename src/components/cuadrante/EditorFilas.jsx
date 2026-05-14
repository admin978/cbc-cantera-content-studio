import { useState } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const TOTAL_ROWS = 18;

function BloqueLabel({ bloque }) {
  const isCantera = bloque === "CANTERA";
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black text-white flex-shrink-0"
      style={{ backgroundColor: isCantera ? "#6B21A8" : "#6B7280" }}
    >
      {isCantera ? "C" : "E"}
    </span>
  );
}

function MoveButtons({ onUp, onDown, disabledUp, disabledDown }) {
  const btnClass = (disabled) =>
    `flex items-center justify-center rounded transition-colors`
    + (disabled ? " opacity-30 cursor-default" : " hover:bg-[#F3E8FF] cursor-pointer");

  return (
    <div className="flex flex-col gap-0.5 flex-shrink-0">
      <button
        type="button"
        onClick={disabledUp ? undefined : onUp}
        disabled={disabledUp}
        className={btnClass(disabledUp)}
        style={{ width: 24, height: 24 }}
        title="Subir fila"
      >
        <ChevronUp className="w-3.5 h-3.5" style={{ color: "#6B21A8" }} />
      </button>
      <button
        type="button"
        onClick={disabledDown ? undefined : onDown}
        disabled={disabledDown}
        className={btnClass(disabledDown)}
        style={{ width: 24, height: 24 }}
        title="Bajar fila"
      >
        <ChevronDown className="w-3.5 h-3.5" style={{ color: "#6B21A8" }} />
      </button>
    </div>
  );
}

function FilaRow({ rowNum, p, slotIdx, totalFilled, onUpdate, onMoveUp, onMoveDown }) {
  const isEmpty = !p;
  const set = (key, val) => onUpdate({ ...p, [key]: val });

  if (isEmpty) {
    return (
      <div className="border border-dashed border-gray-100 rounded-lg px-3 py-2 opacity-40 text-xs text-gray-300 italic text-center">
        {rowNum}. vacío
      </div>
    );
  }

  return (
    <div
      className={`border rounded-lg p-3 transition-all ${
        p.visible === false ? "bg-gray-50 border-gray-100 opacity-50" : "bg-white border-gray-200"
      }`}
      style={{ marginBottom: 8 }}
    >
      {/* Línea superior: número + badge + controles */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MoveButtons
            onUp={onMoveUp}
            onDown={onMoveDown}
            disabledUp={slotIdx === 0}
            disabledDown={slotIdx >= totalFilled - 1}
          />
          <span className="text-[11px] text-gray-400 font-mono">{rowNum}</span>
          <BloqueLabel bloque={p.bloque} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Switch
              checked={!!p.descansa}
              onCheckedChange={(v) => set("descansa", v)}
              className="scale-75"
            />
            <span className="text-[10px] text-gray-500">Desc.</span>
          </div>
          <button
            type="button"
            onClick={() => set("visible", p.visible === false ? true : false)}
            className={`p-1 rounded transition-colors ${
              p.visible !== false ? "text-purple-500 hover:text-purple-700" : "text-gray-300 hover:text-gray-500"
            }`}
            title={p.visible !== false ? "Ocultar en gráfico" : "Mostrar en gráfico"}
          >
            {p.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Campos */}
      <div className="space-y-2">
        <div>
          <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Equipo</label>
          <Input
            className="mt-0.5 h-8 text-sm font-semibold w-full"
            placeholder="Equipo"
            value={p.equipo || ""}
            onChange={(e) => set("equipo", e.target.value)}
          />
        </div>

        {p.descansa ? (
          <div className="h-8 flex items-center px-3 text-xs text-gray-400 italic bg-gray-50 rounded border border-gray-200">
            descansa
          </div>
        ) : (
          <div>
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Rival</label>
            <Input
              className="mt-0.5 h-8 text-sm w-full"
              placeholder="Rival"
              value={p.rival || ""}
              onChange={(e) => set("rival", e.target.value)}
            />
          </div>
        )}

        {!p.descansa && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Día</label>
              <Select value={p.dia || ""} onValueChange={(v) => set("dia", v)}>
                <SelectTrigger className="mt-0.5 h-8 text-sm w-full">
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>--</SelectItem>
                  <SelectItem value="Lunes">Lunes</SelectItem>
                  <SelectItem value="Martes">Martes</SelectItem>
                  <SelectItem value="Miércoles">Miércoles</SelectItem>
                  <SelectItem value="Jueves">Jueves</SelectItem>
                  <SelectItem value="Viernes">Viernes</SelectItem>
                  <SelectItem value="Sábado">Sábado</SelectItem>
                  <SelectItem value="Domingo">Domingo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div style={{ width: 100 }}>
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Hora</label>
              <Input
                className="mt-0.5 h-8 text-sm w-full"
                placeholder="13.30"
                value={p.hora || ""}
                onChange={(e) => set("hora", e.target.value)}
              />
            </div>
          </div>
        )}

        {!p.descansa && (
          <div>
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Pabellón</label>
            <Input
              className="mt-0.5 h-8 text-sm w-full"
              placeholder="Pabellón"
              value={p.pabellon || ""}
              onChange={(e) => set("pabellon", e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditorFilas({ partidos, onChange }) {
  // Un único array plano ordenado por campo orden
  const sorted = [...partidos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  const slots = Array.from({ length: TOTAL_ROWS }, (_, i) => sorted[i] || null);

  const handleUpdate = (slotIdx, updated) => {
    const orig = slots[slotIdx];
    onChange(partidos.map((p) => {
      if (orig && p.id && orig.id && p.id === orig.id) return updated;
      if (orig && !p.id && p === orig) return updated;
      return p;
    }));
  };

  const moverFila = (slotIdx, direccion) => {
    const ordenados = [...partidos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    const destino = slotIdx + direccion;
    if (destino < 0 || destino >= ordenados.length) return;

    const a = ordenados[slotIdx];
    const b = ordenados[destino];
    if (!a || !b) return;

    const ordenA = a.orden ?? slotIdx;
    const ordenB = b.orden ?? destino;

    onChange(partidos.map((p) => {
      if (p.id && a.id && p.id === a.id) return { ...p, orden: ordenB };
      if (p.id && b.id && p.id === b.id) return { ...p, orden: ordenA };
      return p;
    }));
  };

  const exceso = partidos.length > TOTAL_ROWS ? partidos.length - TOTAL_ROWS : 0;
  const filledCount = sorted.length;

  return (
    <div className="space-y-1">
      {exceso > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700 mb-2">
          ⚠️ Hay {partidos.length} partidos. Solo se muestran los primeros {TOTAL_ROWS} en el gráfico.
        </div>
      )}

      <div className="space-y-0">
        {slots.map((p, i) => (
          <FilaRow
            key={p ? (p.id || `slot-${p.equipo || ''}-${i}`) : `empty-${i}`}
            rowNum={i + 1}
            p={p}
            slotIdx={i}
            totalFilled={filledCount}
            onUpdate={(updated) => handleUpdate(i, updated)}
            onMoveUp={() => moverFila(i, -1)}
            onMoveDown={() => moverFila(i, 1)}
          />
        ))}
      </div>
    </div>
  );
}