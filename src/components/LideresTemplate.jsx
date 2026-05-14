import { LIDERES_FONDO } from '../lib/lideresFondo';

export default function LideresTemplate({ jugador1_nombre, jugador1_stat, jugador2_nombre, jugador2_stat, jugador3_nombre, jugador3_stat, posiciones }) {
  const pos = posiciones || { stat1_x: 12.1, stat2_x: 44.9, stat3_x: 70.4, nombre1_x: 12.8, nombre2_x: 45.0, nombre3_x: 70.8 };

  return (
    <div id="lideres-grafico" style={{ position:'relative', width:'1080px', height:'1000px', overflow:'hidden', fontFamily:'"Barlow Condensed", sans-serif' }}>
      <img src={LIDERES_FONDO} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }} alt="" />
      <div style={{ position:'absolute', left:`${pos.nombre1_x}%`, top:'40.0%', color:'white', fontSize:'52px', fontWeight:800, textTransform:'uppercase', lineHeight:1.1, whiteSpace:'pre-line' }}>
        {(jugador1_nombre||'').split(' ').join('\n')}
      </div>
      <div style={{ position:'absolute', left:`${pos.stat1_x}%`, top:'50%', color:'#D086EE', fontSize:'160px', fontWeight:800, lineHeight:1, WebkitTextStroke:'3px #FFFFFF', paintOrder:'stroke fill' }}>
        {jugador1_stat||''}
      </div>
      <div style={{ position:'absolute', left:`${pos.nombre2_x}%`, top:'40.4%', color:'white', fontSize:'52px', fontWeight:800, textTransform:'uppercase', lineHeight:1.1, whiteSpace:'pre-line' }}>
        {(jugador2_nombre||'').split(' ').join('\n')}
      </div>
      <div style={{ position:'absolute', left:`${pos.stat2_x}%`, top:'50%', color:'#D086EE', fontSize:'160px', fontWeight:800, lineHeight:1, WebkitTextStroke:'3px #FFFFFF', paintOrder:'stroke fill' }}>
        {jugador2_stat||''}
      </div>
      <div style={{ position:'absolute', left:`${pos.nombre3_x}%`, top:'40.5%', color:'white', fontSize:'52px', fontWeight:800, textTransform:'uppercase', lineHeight:1.1, whiteSpace:'pre-line' }}>
        {(jugador3_nombre||'').split(' ').join('\n')}
      </div>
      <div style={{ position:'absolute', left:`${pos.stat3_x}%`, top:'50%', color:'#D086EE', fontSize:'160px', fontWeight:800, lineHeight:1, WebkitTextStroke:'3px #FFFFFF', paintOrder:'stroke fill' }}>
        {jugador3_stat||''}
      </div>
    </div>
  );
}