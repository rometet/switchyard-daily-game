import { StrictMode } from 'react';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { requestExpandedMode } from '@devvit/web/client';

const bg: CSSProperties = { minHeight: '100vh', boxSizing: 'border-box', padding: '22px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(ellipse at top, #2b4163, #0e192b 75%)', color: '#eaf4ff', textAlign: 'center', fontFamily: 'system-ui, sans-serif' };

export function Splash() {
  return (
    <div style={bg}>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: '#66f1cf', display: 'grid', placeItems: 'center', fontSize: 48, color: '#0b3b35', boxShadow: '0 0 50px #66f1cf40', fontWeight: 900 }} aria-hidden="true">ϟ</div>
      <div style={{ fontSize: 12, color: '#a1b9d5', letterSpacing: 3, fontWeight: 900, marginTop: 24 }}>DAILY CIRCUIT PUZZLE</div>
      <h1 style={{ fontSize: 'clamp(36px, 8vw, 58px)', letterSpacing: -2, lineHeight: 1, fontWeight: 900, margin: '12px 0' }}>SWITCHYARD</h1>
      <p style={{ fontSize: 16, lineHeight: 1.5, color: '#c1d3e8', maxWidth: 390 }}>25 tiles. One current. Rotate the wires and light up the exit before your community does.</p>
      <div style={{ display: 'flex', gap: 8, margin: '15px 0 27px', fontWeight: 800, fontSize: 12, color: '#99c7c2' }}>
        <span>↻ ROTATE</span><span>•</span><span>⚡ CONNECT</span><span>•</span><span>▦ SHARE</span>
      </div>
      <button onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')} style={{ background: '#66f1cf', color: '#08332c', border: 0, borderRadius: 16, padding: '17px 32px', fontSize: 17, fontWeight: 900, cursor: 'pointer', minWidth: 230 }}>PLAY TODAY'S CIRCUIT →</button>
      <p style={{ fontSize: 12, color: '#7793b1', marginTop: 20 }}>A new puzzle every day at 00:00 UTC · Free to play</p>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<StrictMode><Splash /></StrictMode>);
