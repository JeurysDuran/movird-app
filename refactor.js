const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Auth/AuthScreen.js');

let text = fs.readFileSync(file, 'utf8');

// 1. Iconos y estilos en SelectScreen
text = text.replace(/icon: '👤'/g, 'icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>');
text = text.replace(/icon: '🏢'/g, 'icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>');
text = text.replace(/icon: '🚌'/g, 'icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg>');

text = text.replace(/> { t.icon } </g, '> {t.icon} <'); 

// 2. Logo icon
text = text.replace(/div style = \{\s*\{\s*width: small \? 38 : 46.*?\} \} > 🚌 < \/div>/s, `div style={{ width: small ? 38 : 46, height: small ? 38 : 46, background: 'linear-gradient(135deg,var(--blue),var(--accent))', borderRadius: small ? 11 : 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}> <svg viewBox="0 0 24 24" width={small ? 20 : 26} height={small ? 20 : 26} fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8A1 1 0 0 1 8 10zM6 18h.01M18 18h.01" strokeLinecap="round"/></svg> </div>`);

// 3. Emojis sueltos
text = text.replace(/> 🚌 < \/span>/g, `><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="var(--blue)" strokeWidth="2"><path d="M4 14h16M4 14v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1a2 2 0 0 0 2-2v-4M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8M8 10h8M6 18h.01M18 18h.01" strokeLinecap="round"/></svg></span>`);
text = text.replace(/> 🔍 < \/span>/g, `><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text2)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>`);

// Logo color letters
text = text.replace(/< \/\n\s*div > <\n\s*div style = \{\s*\{\s*fontFamily: "'Syne',sans-serif",.*?color: '#eaf0ff' \} \}/s, `</div><div style={{ fontFamily: "'Syne',sans-serif", fontSize: small ? 20 : 25, fontWeight: 800, letterSpacing: -.5, color: 'var(--text)' }}`);
text = text.replace(/Movi < span style = \{\s*\{\s*color: '#00d4a0' \} \}/s, `Movi <span style={{ color: 'var(--accent)' }}`);

// Colors fixes inside components
text = text.replace(/'#eaf0ff'/g, "'var(--text)'");
text = text.replace(/'\#8899bb'/g, "'var(--text2)'");
text = text.replace(/'#ff3b5c'/g, "'var(--danger)'");
text = text.replace(/'#00d4a0'/g, "'var(--accent)'");
text = text.replace(/'rgba\(28,42,71,\.7\)'/g, "'var(--surface)'");
text = text.replace(/'rgba\(28,42,71,\.8\)'/g, "'var(--surface2)'");
text = text.replace(/'rgba\(255,255,255,\.1\)'/g, "'var(--border)'");
text = text.replace(/'rgba\(255,255,255,\.08\)'/g, "'var(--border)'");
text = text.replace(/'#060d1a'/g, "'#ffffff'");


// styles fixes
text = text.replace(/linear-gradient\(160deg,#060d1a 0%,#0a1628 60%,#060d1a 100%\)/g, "var(--bg)");
text = text.replace(/rgba\(14,26,46,\.97\)/g, "var(--surface)");
text = text.replace(/rgba\(28,42,71,\.9\)/g, "var(--surface3)");
text = text.replace(/0 24px 80px rgba\(0,0,0,\.6\)/g, "0 32px 64px rgba(0,0,0,.08)");

// input bg fixes
text = text.replace(/input:-webkit-autofill \{\s*-webkit-box-shadow: 0 0 0 100px #1c2a47 inset !important;\s*-webkit-text-fill-color: #eaf0ff !important;\s*\}/, `input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px var(--surface3) inset !important; -webkit-text-fill-color: var(--text) !important; }`);

fs.writeFileSync(file, text);
