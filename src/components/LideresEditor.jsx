import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LIDERES_FONDO } from '../lib/lideresFondo';
import LideresTemplate from './LideresTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileImage, Save, Loader2 } from 'lucide-react';

const SCALES = ['50', '75', '100'];

export default function LideresEditor() {
  const [datos, setDatos] = useState({
    jugador1_nombre: 'ISAAC HANEY',
    jugador1_stat: '21',
    jugador2_nombre: 'IÑAKI ORDOÑEZ',
    jugador2_stat: '8',
    jugador3_nombre: 'PABLO MARIN',
    jugador3_stat: '8'
  });
  const [posiciones, setPosiciones] = useState({
    stat1_x: 12.1,
    stat2_x: 44.9,
    stat3_x: 70.4,
    nombre1_x: 12.8,
    nombre2_x: 45.0,
    nombre3_x: 70.8
  });
  const [exportando, setExportando] = useState(false);
  const [zoom, setZoom] = useState('50');
  const [registro, setRegistro] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.LideresEstadisticos.list('-created_date', 1).then(list => {
      if (list[0]) {
        setRegistro(list[0]);
        setDatos({
          jugador1_nombre: list[0].jugador1_nombre || 'ISAAC HANEY',
          jugador1_stat:   list[0].jugador1_stat   || '21',
          jugador2_nombre: list[0].jugador2_nombre || 'IÑAKI ORDOÑEZ',
          jugador2_stat:   list[0].jugador2_stat   || '8',
          jugador3_nombre: list[0].jugador3_nombre || 'PABLO MARIN',
          jugador3_stat:   list[0].jugador3_stat   || '8',
        });
      }
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setDatos(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    if (registro) {
      await base44.entities.LideresEstadisticos.update(registro.id, { ...datos, estado: 'Borrador' });
    } else {
      const c = await base44.entities.LideresEstadisticos.create({ ...datos, estado: 'Borrador' });
      setRegistro(c);
    }
    setSaving(false);
    toast({ title: 'Guardado' });
  };

  const exportar = async (fmt) => {
    setExportando(true);
    try {
      const W = 1080, H = 1000;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      await new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { ctx.drawImage(img, 0, 0, W, H); res(); };
        img.onerror = rej;
        img.src = LIDERES_FONDO + '?t=' + Date.now();
      });
      await document.fonts.load('800 160px "Barlow Condensed"');
      await document.fonts.load('800 52px "Barlow Condensed"');
      const ml = (txt, lp, tp, sz, w, col) => {
        if (!txt) return;
        ctx.font = w + ' ' + sz + 'px "Barlow Condensed"';
        ctx.fillStyle = col;
        ctx.textBaseline = 'top';
        txt.toUpperCase().split(' ').forEach((l, i) => ctx.fillText(l, W * lp, H * tp + i * sz * 1.15));
      };
      const tStroke = (txt, lp, tp, sz, w, fillCol, strokeCol, strokeW) => {
        if (!txt) return;
        ctx.font = w + ' ' + sz + 'px "Barlow Condensed"';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = strokeW;
        ctx.lineJoin = 'round';
        ctx.strokeText(String(txt).toUpperCase(), W * lp, H * tp);
        ctx.fillStyle = fillCol;
        ctx.fillText(String(txt).toUpperCase(), W * lp, H * tp);
      };
      ml(datos.jugador1_nombre, posiciones.nombre1_x / 100, 0.400, 52, '800', '#FFFFFF');
      ml(datos.jugador2_nombre, posiciones.nombre2_x / 100, 0.404, 52, '800', '#FFFFFF');
      ml(datos.jugador3_nombre, posiciones.nombre3_x / 100, 0.405, 52, '800', '#FFFFFF');
      tStroke(datos.jugador1_stat, posiciones.stat1_x / 100, 0.50, 160, '800', '#D086EE', '#FFFFFF', 5);
      tStroke(datos.jugador2_stat, posiciones.stat2_x / 100, 0.50, 160, '800', '#D086EE', '#FFFFFF', 5);
      tStroke(datos.jugador3_stat, posiciones.stat3_x / 100, 0.50, 160, '800', '#D086EE', '#FFFFFF', 5);
      canvas.toBlob(blob => {
        setExportando(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = 'CBC_Lideres.' + fmt;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, fmt === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
    } catch (e) {
      setExportando(false);
      alert('Error: ' + e.message);
    }
  };

  const scalePct = parseFloat(zoom) / 100;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-[40%] overflow-y-auto p-5 space-y-4 border-r border-gray-200">

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
          <h2 className="font-semibold text-[#1E1B4B] text-sm uppercase tracking-wide">Editar datos</h2>

          <div className="space-y-2">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Líder en Puntos</p>
            <div>
              <Label className="text-xs text-gray-600">Nombre jugador</Label>
              <Input className="mt-1" value={datos.jugador1_nombre} onChange={e => set('jugador1_nombre', e.target.value)} placeholder="ISAAC HANEY" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Posición horizontal del nombre</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="range" min="0" max="90" step="0.5" value={posiciones.nombre1_x}
                  onChange={e => setPosiciones({...posiciones, nombre1_x: parseFloat(e.target.value)})}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700" />
                <span className="text-xs text-gray-500 w-12 text-right">{posiciones.nombre1_x}%</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Puntos</Label>
              <Input className="mt-1" value={datos.jugador1_stat} onChange={e => set('jugador1_stat', e.target.value)} placeholder="21" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Posición horizontal del número</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="0.5"
                  value={posiciones.stat1_x}
                  onChange={e => setPosiciones({...posiciones, stat1_x: parseFloat(e.target.value)})}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                />
                <span className="text-xs text-gray-500 w-12 text-right">{posiciones.stat1_x}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Líder en Rebotes</p>
            <div>
              <Label className="text-xs text-gray-600">Nombre jugador</Label>
              <Input className="mt-1" value={datos.jugador2_nombre} onChange={e => set('jugador2_nombre', e.target.value)} placeholder="IÑAKI ORDOÑEZ" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Posición horizontal del nombre</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="range" min="0" max="90" step="0.5" value={posiciones.nombre2_x}
                  onChange={e => setPosiciones({...posiciones, nombre2_x: parseFloat(e.target.value)})}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700" />
                <span className="text-xs text-gray-500 w-12 text-right">{posiciones.nombre2_x}%</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Rebotes</Label>
              <Input className="mt-1" value={datos.jugador2_stat} onChange={e => set('jugador2_stat', e.target.value)} placeholder="8" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Posición horizontal del número</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="0.5"
                  value={posiciones.stat2_x}
                  onChange={e => setPosiciones({...posiciones, stat2_x: parseFloat(e.target.value)})}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                />
                <span className="text-xs text-gray-500 w-12 text-right">{posiciones.stat2_x}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Líder en Asistencias</p>
            <div>
              <Label className="text-xs text-gray-600">Nombre jugador</Label>
              <Input className="mt-1" value={datos.jugador3_nombre} onChange={e => set('jugador3_nombre', e.target.value)} placeholder="PABLO MARIN" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Posición horizontal del nombre</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="range" min="0" max="90" step="0.5" value={posiciones.nombre3_x}
                  onChange={e => setPosiciones({...posiciones, nombre3_x: parseFloat(e.target.value)})}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700" />
                <span className="text-xs text-gray-500 w-12 text-right">{posiciones.nombre3_x}%</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Asistencias</Label>
              <Input className="mt-1" value={datos.jugador3_stat} onChange={e => set('jugador3_stat', e.target.value)} placeholder="8" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Posición horizontal del número</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="0.5"
                  value={posiciones.stat3_x}
                  onChange={e => setPosiciones({...posiciones, stat3_x: parseFloat(e.target.value)})}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                />
                <span className="text-xs text-gray-500 w-12 text-right">{posiciones.stat3_x}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-[#1E1B4B] text-sm uppercase tracking-wide">Exportar</h2>
          <Button className="w-full gap-2 text-base font-bold h-11" style={{ backgroundColor: '#6B21A8' }} onClick={() => exportar('png')} disabled={exportando}>
            {exportando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Exportar PNG
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={() => exportar('jpg')} disabled={exportando}>
            <FileImage className="w-4 h-4" /> Exportar JPG
          </Button>
          <Button variant="ghost" className="w-full gap-2 text-gray-600" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          <p className="text-xs text-gray-400 text-center">Resolución: 1080×1000px</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden bg-gray-50">
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Preview en tiempo real</span>
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" /> En vivo
            </span>
          </div>
          <div className="flex items-center gap-1">
            {SCALES.map(s => (
              <button key={s} onClick={() => setZoom(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${zoom === s ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                {s}%
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 flex justify-start items-start">
          <div style={{ transformOrigin: 'top left', transform: `scale(${scalePct})`, width: 1080, height: 1000, flexShrink: 0, boxShadow: '0 8px 48px rgba(0,0,0,0.18)', borderRadius: 4, overflow: 'hidden' }}>
            <LideresTemplate {...datos} posiciones={posiciones} />
          </div>
        </div>
      </div>
    </div>
  );
}