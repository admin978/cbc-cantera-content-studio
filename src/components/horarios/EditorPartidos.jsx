import { useState } from "react";
import { Eye, EyeOff, Trash2, Plus, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

function PartidoRow({ p, onChange, onDelete, dragHandleProps }) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-card border border-border rounded-lg group hover:border-primary/30 transition-colors">
      <div {...dragHandleProps} className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground">
        <GripVertical className="w-4 h-4" />
      </div>

      <Input
        className="flex-1 min-w-0 h-8 text-xs font-semibold"
        value={p.equipo || ""}
        placeholder="Equipo"
        onChange={(e) => onChange({ ...p, equipo: e.target.value })}
      />

      <Input
        className="flex-1 min-w-0 h-8 text-xs"
        value={p.rival || ""}
        placeholder={p.descansa ? "· Descansa ·" : "Rival"}
        disabled={p.descansa}
        onChange={(e) => onChange({ ...p, rival: e.target.value })}
      />

      <Select value={p.dia || "Sábado"} onValueChange={(v) => onChange({ ...p, dia: v })}>
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Sábado">Sáb.</SelectItem>
          <SelectItem value="Domingo">Dom.</SelectItem>
        </SelectContent>
      </Select>

      <Input
        className="w-20 h-8 text-xs"
        value={p.hora || ""}
        placeholder="18:00"
        onChange={(e) => onChange({ ...p, hora: e.target.value })}
      />

      <Input
        className="flex-1 min-w-0 h-8 text-xs"
        value={p.pabellon || ""}
        placeholder="Pabellón"
        onChange={(e) => onChange({ ...p, pabellon: e.target.value })}
      />

      {/* Descansa toggle */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
        <Switch
          checked={!!p.descansa}
          onCheckedChange={(v) => onChange({ ...p, descansa: v, visible_en_grafico: v ? false : p.visible_en_grafico })}
          className="scale-75"
        />
        <span className="hidden sm:inline">Desc.</span>
      </div>

      {/* Visible */}
      <button
        type="button"
        onClick={() => onChange({ ...p, visible_en_grafico: !p.visible_en_grafico })}
        className={`p-1 rounded transition-colors ${
          p.visible_en_grafico ? "text-primary" : "text-muted-foreground/30"
        }`}
        title="Visible en gráfico"
      >
        {p.visible_en_grafico ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded text-destructive/40 hover:text-destructive transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function Section({ title, bloque, partidos, onChange, onDelete, onAdd }) {
  const handleDragStart = (e, idx) => {
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    const srcIdx = parseInt(e.dataTransfer.getData("text/plain"));
    if (srcIdx === targetIdx) return;
    const updated = [...partidos];
    const [moved] = updated.splice(srcIdx, 1);
    updated.splice(targetIdx, 0, moved);
    updated.forEach((p, i) => onChange(p._localIdx, { ...p, orden: i }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded text-white"
          style={{ backgroundColor: "#6B21A8", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 4 }}
        >
          {title}
        </h3>
      </div>
      {/* Column headers */}
      <div className="hidden sm:flex items-center gap-2 px-3 mb-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
        <div className="w-4" />
        <div className="flex-1">Equipo</div>
        <div className="flex-1">Rival</div>
        <div className="w-24">Día</div>
        <div className="w-20">Hora</div>
        <div className="flex-1">Pabellón</div>
        <div className="w-16">Desc.</div>
        <div className="w-8">Vis.</div>
        <div className="w-6" />
      </div>
      <div className="space-y-1">
        {partidos.map((p, i) => (
          <div
            key={p._localIdx}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, i)}
          >
            <PartidoRow
              p={p}
              onChange={(updated) => onChange(p._localIdx, updated)}
              onDelete={() => onDelete(p._localIdx)}
              dragHandleProps={{}}
            />
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-2 gap-2 text-xs border-dashed"
        onClick={() => onAdd(bloque)}
      >
        <Plus className="w-3 h-3" /> Añadir fila {title}
      </Button>
    </div>
  );
}

export default function EditorPartidos({ partidos, onChange }) {
  const cantera = partidos
    .map((p, i) => ({ ...p, _localIdx: i }))
    .filter((p) => p.bloque === "CANTERA")
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const escuela = partidos
    .map((p, i) => ({ ...p, _localIdx: i }))
    .filter((p) => p.bloque === "ESCUELA")
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const handleChange = (localIdx, updated) => {
    const next = [...partidos];
    next[localIdx] = updated;
    onChange(next);
  };

  const handleDelete = (localIdx) => {
    onChange(partidos.filter((_, i) => i !== localIdx));
  };

  const handleAdd = (bloque) => {
    const bloquePartidos = partidos.filter((p) => p.bloque === bloque);
    onChange([
      ...partidos,
      {
        bloque,
        equipo: "",
        rival: "",
        descansa: false,
        dia: "Sábado",
        hora: "",
        pabellon: "",
        orden: bloquePartidos.length,
        visible_en_grafico: true,
        _isNew: true,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <Section
        title="CANTERA"
        bloque="CANTERA"
        partidos={cantera}
        onChange={handleChange}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <Section
        title="ESCUELA"
        bloque="ESCUELA"
        partidos={escuela}
        onChange={handleChange}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  );
}