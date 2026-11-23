/* Coach Palestra – ti segue durante l'allenamento.
   Tutto resta sul telefono (localStorage), funziona offline. */
'use strict';

const VERSIONE_APP = '1.0';
const CHIAVE = 'cp-dati';
const IMP_DEFAULT = {
  elastici: ['Molto spesso', 'Spesso', 'Medio', 'Sottile', 'Senza elastico'],
  bilanciere: 20, trapbar: 25,
  suono: true, vibrazione: true, voce: false
};

/* ================= DATI ================= */
let dati = carica();
function carica() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CHIAVE)); } catch (e) { /* vuoto */ }
  d = d || {};
  d.storico = d.storico || [];
  d.impostazioni = Object.assign({}, IMP_DEFAULT, d.impostazioni || {});
  d.sessione = d.sessione || null;
  return d;
}
function salva() {
  try { localStorage.setItem(CHIAVE, JSON.stringify(dati)); }
  catch (e) { avviso('Memoria piena: esporta un backup dalle Impostazioni'); }
}
const imp = () => dati.impostazioni;
const S = () => dati.sessione;

/* ================= UTILITÀ ================= */
const $ = s => document.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fk = n => (Math.round(n * 100) / 100).toString().replace('.', ',');
const arrot = (n, p) => Math.round(n / p) * p;
function mmss(sec) {
  const neg = sec < 0; sec = Math.abs(Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return (neg ? '+' : '') + m + ':' + String(s).padStart(2, '0');
}
function durataTxt(ms) {
  const min = Math.round(ms / 60000);
  return min < 60 ? min + ' min' : Math.floor(min / 60) + ' h ' + String(min % 60).padStart(2, '0');
}
const GIORNI_SETT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
function dataTxt(ts) {
  const d = new Date(ts);
  return GIORNI_SETT[d.getDay()] + ' ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
}
function giorniFa(ts) {
  const a = new Date(); a.setHours(0, 0, 0, 0);
  const b = new Date(ts); b.setHours(0, 0, 0, 0);
  const g = Math.round((a - b) / 86400000);
  return g === 0 ? 'oggi' : g === 1 ? 'ieri' : g + ' giorni fa';
}
function inizioSettimana() {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}
function spec(id) { return SCHEDA.esercizi[id] || SCHEDA.alternative[id]; }
function ripTxt(s) { return (s.ripMin === s.ripMax ? s.ripMin : s.ripMin + '–' + s.ripMax) + (s.ripNota ? ' ' + s.ripNota : ''); }
function recTxt(sec) { return sec >= 60 ? (Math.floor(sec / 60) + "'" + (sec % 60 ? (sec % 60) + '"' : '')) : sec + '"'; }
function pesoBarra(s) { return s.carico === 'trapbar' ? +imp().trapbar : s.carico === 'bilanciere' ? +imp().bilanciere : 0; }

/* ================= STORICO E PROGRESSIONE ================= */
function storiaDi(id, storico = dati.storico) {
  return storico.filter(r => r.esercizi[id] && r.esercizi[id].serie.length)
    .map(r => ({ data: r.inizio, serie: r.esercizi[id].serie }));
}
function primeSettimane() {
  const tutti = dati.storico.map(r => r.inizio);
  if (S()) tutti.push(S().inizio);
  if (!tutti.length) return true;
  return Date.now() - Math.min(...tutti) < SCHEDA.regole.primeSettimane * 86400000;
}
function serieTxt(serie, s) {
  if (s.tipo === 'kg') return serie.map(x => fk(x.kg) + '×' + x.rip).join(' · ');
  if (s.tipo === 'elastico') return serie.map(x => x.rip).join(' · ') + ' rip';
  if (s.tipo === 'corpo') return serie.map(x => x.rip).join(' · ') + ' rip';
  return serie.length + ' giri';
}

/* Cosa fare oggi in base all'ultima volta */
function suggerisci(id, storico = dati.storico) {
  const s = spec(id), st = storiaDi(id, storico), last = st[0];
  const quando = last ? giorniFa(last.data) : '';
  if (s.tipo === 'kg') {
    if (!last) {
      if (s.partenza) {
        const r = s.partenza.min === s.partenza.max ? fk(s.partenza.min) : fk(s.partenza.min) + '–' + fk(s.partenza.max);
        return { kg: s.partenza.min, msg: `Riparti da ${r} kg${s.partenza.min !== s.partenza.max ? ': inizia con ' + fk(s.partenza.min) : ''} (${s.prima}).`, cl: '' };
      }
      return { kg: s.inizio || 10, msg: `Da provare: scegli un peso con cui fai ${ripTxt(s)} ripetizioni e ne avresti ancora 2.`, cl: '' };
    }
    const kgMax = Math.max(...last.serie.map(x => x.kg));
    const alTop = last.serie.filter(x => x.kg === kgMax);
    const completo = alTop.length >= s.serie && alTop.every(x => x.rip >= s.ripMax);
    const duro = last.serie.some(x => x.sens === 'duro');
    const facili = last.serie.every(x => x.sens === 'facile');
    const mancate = alTop.some(x => x.rip < s.ripMin);
    const base = `Ultima volta (${quando}): ${serieTxt(last.serie, s)}.`;
    if (completo && !duro) {
      let inc = s.incremento;
      if (s.attrezzo === 'manubri') inc = kgMax >= 10 ? 2 : 1;
      if (facili && s.incFacile) inc = s.incFacile;
      return { kg: kgMax + inc, msg: `${base} Tutte complete → sali di ${fk(inc)} kg.`, cl: 'su' };
    }
    if (completo && duro) return { kg: kgMax, msg: `${base} Complete ma al limite: resta a ${fk(kgMax)} kg finché non le chiudi con margine.`, cl: '' };
    if (mancate && duro && primeSettimane()) {
      const meno = s.attrezzo === 'manubri' ? (kgMax > 10 ? 2 : 1) : s.passo;
      const k = Math.max(0, kgMax - meno);
      return { kg: k, msg: `${base} Nelle prime 2 settimane resta lontano dal limite: scendi a ${fk(k)} kg.`, cl: 'giu' };
    }
    if (mancate) return { kg: kgMax, msg: `${base} Non tutte complete: resta a ${fk(kgMax)} kg.`, cl: '' };
    return { kg: kgMax, msg: `${base} Resta a ${fk(kgMax)} kg e prova ad arrivare a ${s.ripMax} in tutte le serie.`, cl: '' };
  }
  if (s.tipo === 'elastico') {
    const b = imp().elastici;
    if (!last) return { banda: 0, rip: s.ripMin, msg: 'Parti con l\'elastico più spesso che ti fa fare tutte le ripetizioni con tecnica pulita (va bene anche la macchina assistita).', cl: '' };
    const bi = Math.max(...last.serie.map(x => x.banda ?? 0));
    const completo = last.serie.length >= s.serie && last.serie.every(x => x.rip >= s.ripMax && (x.banda ?? 0) === bi);
    const base = `Ultima volta (${quando}): ${serieTxt(last.serie, s)} con «${b[bi] || '?'}».`;
    if (completo) {
      if (bi >= b.length - 1) return { banda: bi, rip: s.ripMax, msg: `${base} Tutto senza elastico! Ora aggiungi ripetizioni o fai la discesa lenta (3–5").`, cl: 'su' };
      if (bi === b.length - 2) return { banda: bi, rip: s.ripMin, msg: `${base} Con il più sottile fai già ${s.serie}×${s.ripMax}: ora fai le prime ripetizioni senza elastico e finisci la serie con l'elastico, oppure solo la discesa lenta (3–5").`, cl: 'su' };
      return { banda: bi + 1, rip: s.ripMin, msg: `${base} Hai fatto ${s.serie}×${s.ripMax} → passa a «${b[bi + 1]}».`, cl: 'su' };
    }
    return { banda: bi, rip: s.ripMin, msg: `${base} Resta con questo elastico finché non arrivi a ${s.serie}×${s.ripMax}.`, cl: '' };
  }
  if (s.tipo === 'corpo') {
    if (!last) return { rip: s.ripMax, msg: s.tecnica.consiglio, cl: '' };
    const completo = last.serie.length >= s.serie && last.serie.every(x => x.rip >= s.ripMax);
    const base = `Ultima volta (${quando}): ${serieTxt(last.serie, s)}.`;
    return completo
      ? { rip: s.ripMax, msg: `${base} Tutte complete → avvicina un po' i piedi all'aggancio per renderlo più duro.`, cl: 'su' }
      : { rip: s.ripMax, msg: `${base} Stessa inclinazione finché non chiudi ${s.serie}×${s.ripMax}.`, cl: '' };
  }
  if (s.tipo === 'superset') {
    const parti = s.parti.map((p, i) => {
      if (!last) return { kg: p.partenza, rip: p.rip };
      const kgs = last.serie.map(g => g.parti[i].kg);
      const km = Math.max(...kgs);
      const completo = last.serie.length >= s.serie && last.serie.every(g => g.parti[i].rip >= p.rip) && !last.serie.some(g => g.sens === 'duro');
      return { kg: completo ? km + p.incremento : km, rip: p.rip, su: completo };
    });
    let msg = last ? `Ultima volta (${quando}): ` + s.parti.map((p, i) => p.nome + ' ' + fk(Math.max(...last.serie.map(g => g.parti[i].kg))) + ' kg').join(', ') + '.' : `Riparti da ${fk(s.parti[0].partenza)} kg (${s.parti[0].prima}).`;
    if (parti.some(p => p.su)) msg += ' Complete → +1 kg (o il manubrio successivo) dove indicato.';
    return { parti, msg, cl: parti.some(p => p.su) ? 'su' : '' };
  }
  if (s.tipo === 'circuito') {
    return { msg: `${s.serie}–${s.serieMax} giri: ` + s.parti.map(p => p.nome + (p.rip ? ' ×' + p.rip : ' ' + p.secondi + '"')).join(' + ') + `, recupero ${recTxt(s.recupero)}.`, cl: '' };
  }
  return { msg: '', cl: '' };
}
function obiettivoTxt(id, sg) {
  const s = spec(id);
  if (s.tipo === 'kg') return `${s.serie}×${ripTxt(s)} · ${fk(sg.kg)} kg`;
  if (s.tipo === 'elastico') return `${s.serie}×${ripTxt(s)} · ${imp().elastici[sg.banda] || ''}`;
  if (s.tipo === 'corpo') return `${s.serie}×${ripTxt(s)}`;
  if (s.tipo === 'superset') return `${s.serie} giri · ${fk(sg.parti[0].kg)}/${fk(sg.parti[1].kg)} kg`;
  if (s.tipo === 'circuito') return `${s.serie}–${s.serieMax} giri`;
  return '';
}
function dischi(kg, s) {
  if (!s.carico) return '';
  const barra = pesoBarra(s);
  let lato = (kg - barra) / 2;
  if (lato <= 0) return '';
  const pezzi = [], dischiDisp = [20, 15, 10, 5, 2.5, 1.25];
  for (const d of dischiDisp) while (lato >= d - 0.001) { pezzi.push(d); lato -= d; }
  const resto = lato > 0.01 ? ' (circa)' : '';
  return `per lato: ${pezzi.map(fk).join(' + ')}${resto} · ${s.carico === 'trapbar' ? 'trap bar' : 'bilanciere'} ${fk(barra)} kg`;
}
function avvicinamento(kg, s) {
  const barra = pesoBarra(s);
  if (kg - barra < 10) return `1 serie leggera ×8 prima di partire.`;
  const passi = [[barra, 8], [arrot(kg * 0.5, 2.5), 5], [arrot(kg * 0.75, 2.5), 3]]
    .filter(([k], i, a) => k >= barra && k < kg && (i === 0 || k > a[i - 1][0]));
  return passi.map(([k, r]) => `${fk(k)} kg ×${r}`).join(' · ');
}

/* ================= SUONI, VOCE, SCHERMO ACCESO ================= */
let audio = null;
function sblocca() {
  if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* niente audio */ } }
  if (audio && audio.state === 'suspended') audio.resume();
}
function bip(freq = 880, dur = 0.12, vol = 0.25) {
  if (!imp().suono || !audio) return;
  const o = audio.createOscillator(), g = audio.createGain();
  o.frequency.value = freq; o.type = 'sine';
  g.gain.setValueAtTime(vol, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
  o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + dur);
}
function vibra(p) { if (imp().vibrazione && navigator.vibrate) navigator.vibrate(p); }
function parla(t) {
  if (!imp().voce || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(t); u.lang = 'it-IT'; speechSynthesis.cancel(); speechSynthesis.speak(u);
}
let wakeLock = null;
async function schermoAcceso(on) {
  try {
    if (on && !wakeLock && 'wakeLock' in navigator && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { /* non supportato */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { schermoAcceso(!!S()); tick(true); } });

/* ================= NAVIGAZIONE ================= */
let vista = { nome: S() ? 'allenamento' : 'home' };
function vai(nome, extra = {}) {
  vista = Object.assign({ nome }, extra);
  history.pushState({ v: 1 }, '');
  render(); window.scrollTo(0, 0);
}
history.replaceState({ v: 0 }, '');
history.pushState({ v: 1 }, '');
window.addEventListener('popstate', () => {
  const foglioAperto = !$('#foglio').classList.contains('nascosto');
  if (vista.nome === 'home' && !foglioAperto) { history.back(); return; } // esce dall'app
  history.pushState({ v: 1 }, '');
  if (foglioAperto) return chiudiFoglio();
  if (vista.nome === 'allenamento') return menuAllenamento();
  const padre = { guidaEs: 'guida', dettaglio: 'storico', anteprima: 'home' }[vista.nome] || 'home';
  vista = { nome: padre, giorno: vista.giorno }; render();
});

function apriFoglio(html) {
  const f = $('#foglio');
  f.innerHTML = `<div class="dentro"><div class="maniglia"></div>${html}</div>`;
  f.classList.remove('nascosto');
}
function chiudiFoglio() { $('#foglio').classList.add('nascosto'); $('#foglio').innerHTML = ''; }
$('#foglio').addEventListener('click', e => { if (e.target.id === 'foglio') chiudiFoglio(); });
let timerAvviso;
function avviso(testo, azione) {
  const a = $('#avviso');
  a.innerHTML = esc(testo) + (azione ? `<button data-a="${azione.a}">${esc(azione.testo)}</button>` : '');
  a.classList.remove('nascosto');
  clearTimeout(timerAvviso);
  timerAvviso = setTimeout(() => a.classList.add('nascosto'), azione ? 12000 : 2600);
}

/* ================= RENDER ================= */
function render() {
  const app = $('#app');
  const v = vista.nome;
  let html = '';
  if (v === 'home') html = vHome();
  else if (v === 'anteprima') html = vAnteprima(vista.giorno);
  else if (v === 'allenamento') html = vAllenamento();
  else if (v === 'storico') html = vStorico();
  else if (v === 'dettaglio') html = vDettaglio(vista.id);
  else if (v === 'guida') html = vGuida();
  else if (v === 'guidaEs') html = vGuidaEs(vista.id);
  else if (v === 'impostazioni') html = vImpostazioni();
  const conNav = ['home', 'storico', 'guida', 'impostazioni'].includes(v);
  app.innerHTML = html + (conNav ? navbar(v) : '');
  tick(true);
}
function navbar(attivo) {
  const b = (n, ic, t) => `<button data-a="nav" data-v="${n}" class="${attivo === n ? 'attivo' : ''}"><span>${ic}</span>${t}</button>`;
  return `<nav class="navbar">${b('home', '🏋️', 'Oggi')}${b('storico', '📅', 'Storico')}${b('guida', '📖', 'Esercizi')}${b('impostazioni', '⚙️', 'Impostazioni')}</nav>`;
}

/* ---------- HOME ---------- */
function prossimoGiorno() {
  const rot = SCHEDA.rotazione;
  const ultimo = dati.storico[0];
  if (!ultimo) return rot[0];
  return rot[(rot.indexOf(ultimo.giorno) + 1) % rot.length];
}
function vHome() {
  const g = prossimoGiorno(), G = SCHEDA.giorni[g];
  const sett = dati.storico.filter(r => r.inizio >= inizioSettimana()).length;
  const ultimo = dati.storico[0];
  let h = `<div class="testata"><h1>Coach Palestra</h1></div>`;
  if (S()) {
    const s = S();
    h += `<div class="carta prossimo"><div class="etichetta">Allenamento in corso</div>
      <div class="titolo">Giorno ${s.giorno} – ${esc(SCHEDA.giorni[s.giorno].nome)}</div>
      <div class="tenue">iniziato alle ${new Date(s.inizio).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
      <div style="margin-top:14px"><button class="btn primario enorme" data-a="riprendi">▶ Riprendi</button></div></div>`;
  } else {
    h += `<div class="carta prossimo"><div class="etichetta">Oggi tocca a</div>
      <div class="riga" style="margin-top:6px"><span class="lettera grande">${g}</span>
      <div class="cresci"><div class="titolo">${esc(G.nome)}</div><div class="tenue">${G.esercizi.length} esercizi · circa 60–70 min</div></div></div>
      <div style="margin-top:16px"><button class="btn primario enorme" data-a="anteprima" data-g="${g}">Inizia giorno ${g}</button></div></div>`;
  }
  h += `<div class="stat-riga">
    <div class="stat"><b class="num">${sett}</b><small>questa settimana<br>(obiettivo 2–3)</small></div>
    <div class="stat"><b class="num">${dati.storico.length}</b><small>allenamenti<br>in totale</small></div>
    <div class="stat"><b>${ultimo ? giorniFa(ultimo.inizio) : '–'}</b><small>ultimo<br>allenamento</small></div></div>`;
  if (primeSettimane()) h += `<div class="banner">🔰 <b>Prime 2 settimane:</b> chiudi ogni serie con 2–3 ripetizioni ancora in canna.</div>`;
  h += `<h3 class="etichetta" style="margin:20px 0 4px">Oppure scegli il giorno</h3><div class="giorni-lista">`;
  for (const k of SCHEDA.rotazione) {
    const ul = dati.storico.find(r => r.giorno === k);
    h += `<button class="carta riga" data-a="anteprima" data-g="${k}"><span class="lettera">${k}</span>
      <span class="cresci"><b>${esc(SCHEDA.giorni[k].nome)}</b><br><span class="tenue piccolo">${ul ? 'ultima volta ' + giorniFa(ul.inizio) : 'mai fatto'}</span></span><span class="tenue">›</span></button>`;
  }
  return h + '</div>';
}

/* ---------- ANTEPRIMA ---------- */
function vAnteprima(g) {
  const G = SCHEDA.giorni[g];
  let h = `<div class="testata"><button class="indietro" data-a="nav" data-v="home">‹</button><h1>Giorno ${g} – ${esc(G.nome)}</h1></div>
    <div class="carta"><ul class="es-lista">
    <li><span class="n">🔥</span><span class="cresci">Riscaldamento + mobilità</span><span class="obiettivo tenue">10' + 5'</span></li>`;
  G.esercizi.forEach((id, i) => {
    const s = spec(id), sg = suggerisci(id);
    h += `<li><span class="n">${i + 1}</span><span class="cresci">${esc(s.nome)}${s.nuovo ? '<span class="nuovo">NUOVO</span>' : ''}<br>
      <span class="tenue piccolo">recupero ${recTxt(s.recupero)}</span></span><span class="obiettivo">${obiettivoTxt(id, sg)}</span></li>`;
  });
  h += `</ul></div>`;
  if (S()) h += `<div class="banner">C'è già un allenamento in corso (giorno ${S().giorno}). Iniziandone uno nuovo, quello viene chiuso e salvato.</div>`;
  h += `<button class="btn primario enorme" data-a="inizia" data-g="${g}">Inizia allenamento</button>`;
  return h;
}

/* ---------- ALLENAMENTO ---------- */
function nuovaSessione(g) {
  const es = {};
  for (const id of SCHEDA.giorni[g].esercizi) es[id] = { serie: [], stato: 'da fare', alt: null, dolore: false, input: null, parte: 0, extra: 0 };
  dati.sessione = { giorno: g, inizio: Date.now(), fase: 'riscaldamento', idx: 0, ordine: [...SCHEDA.giorni[g].esercizi], es, riposo: null, risc: { fine: null, spunte: [] }, timer: null };
  salva();
}
function idAttuale() { const s = S(); return s.ordine[s.idx]; }
function idEff(id) { return S().es[id].alt || id; }
function serieTot(id) { const s = spec(idEff(id)); return s.serie + (S().es[id].extra || 0); }
function inputDi(id) {
  const e = S().es[id];
  if (!e.input) {
    const sg = suggerisci(idEff(id)), s = spec(idEff(id));
    if (s.tipo === 'kg') e.input = { kg: sg.kg, rip: s.ripMax };
    else if (s.tipo === 'elastico') e.input = { banda: sg.banda, rip: s.ripMax };
    else if (s.tipo === 'corpo') e.input = { rip: s.ripMax };
    else if (s.tipo === 'superset') e.input = { parti: sg.parti.map(p => ({ kg: p.kg, rip: p.rip })) };
    else e.input = {};
  }
  return e.input;
}

function barraAll() {
  const s = S();
  const pun = s.ordine.map((id, i) => {
    const st = s.es[id].stato;
    return `<i class="${st === 'fatto' ? 'fatto' : (s.fase !== 'riscaldamento' && i === s.idx) ? 'ora' : ''}"></i>`;
  }).join('');
  return `<div class="barra-all"><button class="icona-btn" data-a="menu">☰</button>
    <div class="cresci"><b>Giorno ${s.giorno}</b> <span class="cronometro num">· <span data-crono></span></span></div>
    <button class="icona-btn" data-a="elenco">📋</button></div><div class="puntini">${pun}</div>`;
}

function vAllenamento() {
  const s = S();
  if (!s) { vista = { nome: 'home' }; return vHome(); }
  if (s.fase === 'riscaldamento') return barraAll() + vRiscaldamento();
  if (s.fase === 'riposo') return barraAll() + vRiposo();
  if (s.fase === 'fine') return vFine();
  return barraAll() + vEsercizio();
}

function vRiscaldamento() {
  const s = S(), G = SCHEDA.giorni[s.giorno];
  const lista = G.mobilita.map((t, i) => `<button class="riga" data-a="spunta" data-i="${i}" style="width:100%;text-align:left;padding:10px 0;border-bottom:1px solid var(--linea)">
    <span class="lettera" style="width:30px;height:30px;font-size:16px;${s.risc.spunte.includes(i) ? '' : 'background:var(--carta2);color:var(--tenue)'}">${s.risc.spunte.includes(i) ? '✓' : i + 1}</span>
    <span class="cresci">${esc(t)}</span></button>`).join('');
  return `<div class="es-nome">🔥 Riscaldamento</div><div class="tenue">10' di cardio + 5' di mobilità</div>
    <div class="carta" style="text-align:center">
      <div class="etichetta">Timer cardio</div>
      <div class="num" style="font-size:56px;font-weight:800" data-risc>${s.risc.fine ? '' : '10:00'}</div>
      <div class="btn-riga">${s.risc.fine
        ? `<button class="btn" data-a="risc-stop">⏹ Ferma</button>`
        : `<button class="btn primario" data-a="risc-via" data-min="10">▶ 10' cardio</button><button class="btn" data-a="risc-via" data-min="5">▶ 5' mobilità</button>`}</div>
    </div>
    <div class="carta"><h2>Mobilità</h2>${lista}</div>
    <button class="btn primario enorme" data-a="risc-fine">Fatto → primo esercizio</button>
    <div class="azioni-sec"><button data-a="risc-fine">⏭ Salta riscaldamento</button></div>`;
}

function stepper(campo, val, unita, extraHtml = '') {
  return `<div class="stepper"><button data-a="passo" data-c="${campo}" data-d="-1">−</button>
    <div class="val"><b class="num">${val}</b><small>${unita}</small>${extraHtml}</div>
    <button data-a="passo" data-c="${campo}" data-d="1">+</button></div>`;
}

function vEsercizio() {
  const se = S(), id = idAttuale(), e = se.es[id], eid = idEff(id), s = spec(eid);
  const tot = serieTot(id), fatte = e.serie.length, finito = fatte >= tot;
  const sg = suggerisci(eid);
  const inp = inputDi(id);
  let h = `<div class="es-nome">${esc(s.nome)}${s.nuovo ? '<span class="nuovo">NUOVO</span>' : ''}</div>`;
  if (e.alt) h += `<div class="tenue piccolo">al posto di ${esc(spec(id).nome)} (per oggi)</div>`;
  const unitaG = s.tipo === 'circuito' || s.tipo === 'superset' ? 'Giro' : 'Serie';
  h += `<div class="serie-di">${finito ? '✓ Esercizio completato' : `${unitaG} ${fatte + 1} di ${tot}`}</div>`;

  // riquadro obiettivo
  const pesoBox = s.tipo === 'kg' ? `<div><b class="num">${fk(sg.kg)}</b><small>kg consigliati</small></div>`
    : s.tipo === 'elastico' ? `<div><b style="font-size:20px">${esc(imp().elastici[sg.banda] || '')}</b><small>elastico</small></div>` : '';
  const ripBox = s.tipo === 'circuito' ? `${s.serie}–${s.serieMax}` : s.tipo === 'superset' ? s.serie + '×12' : `${s.serie}×${s.ripMin === s.ripMax ? s.ripMin : s.ripMin + '–' + s.ripMax}`;
  h += `<div class="target"><div><b class="num">${ripBox}</b><small>${s.tipo === 'circuito' || s.tipo === 'superset' ? 'giri' : 'serie × rip'}${s.ripNota ? ' ' + s.ripNota : ''}</small></div>
    <div><b class="num">${recTxt(s.recupero)}</b><small>recupero</small></div>${pesoBox}</div>`;
  if (sg.msg) h += `<div class="suggerimento ${sg.cl}">${esc(sg.msg)}</div>`;
  if (fatte === 0 && primeSettimane() && s.tipo !== 'circuito') h += `<div class="tenue piccolo" style="margin:4px 2px">🔰 Chiudi ogni serie con 2–3 ripetizioni ancora in canna.</div>`;
  if (s.avvicinamento && fatte === 0 && s.tipo === 'kg') h += `<div class="avvicinamento">🪜 <b>Avvicinamento</b> (non conta): ${avvicinamento(inp.kg, s)}</div>`;

  if (!finito) {
    if (s.tipo === 'kg') {
      h += stepper('kg', fk(inp.kg), s.unita || 'kg', dischi(inp.kg, s) ? `<div class="dischi">${dischi(inp.kg, s)}</div>` : '');
      h += stepper('rip', inp.rip, 'ripetizioni fatte' + (s.ripNota ? ' ' + s.ripNota : ''));
      h += `<button class="btn primario enorme" data-a="serie-fatta">✓ Serie ${fatte + 1} fatta</button>`;
    } else if (s.tipo === 'elastico') {
      h += `<div class="etichetta" style="margin-top:12px">Elastico</div><div class="chip-riga">${imp().elastici.map((b, i) => `<button class="chip ${inp.banda === i ? 'scelto' : ''}" data-a="banda" data-i="${i}">${esc(b)}</button>`).join('')}</div>`;
      h += stepper('rip', inp.rip, 'ripetizioni fatte');
      h += `<button class="btn primario enorme" data-a="serie-fatta">✓ Serie ${fatte + 1} fatta</button>`;
    } else if (s.tipo === 'corpo') {
      h += stepper('rip', inp.rip, 'ripetizioni fatte');
      h += `<button class="btn primario enorme" data-a="serie-fatta">✓ Serie ${fatte + 1} fatta</button>`;
    } else if (s.tipo === 'superset') {
      s.parti.forEach((p, i) => {
        h += `<div class="parte"><h3>${i + 1}. ${esc(p.nome)} ×${p.rip}</h3>
          ${stepper('pkg' + i, fk(inp.parti[i].kg), 'kg per manubrio')}${stepper('prip' + i, inp.parti[i].rip, 'ripetizioni')}</div>`;
      });
      h += `<button class="btn primario enorme" data-a="serie-fatta">✓ Giro ${fatte + 1} fatto</button>`;
    } else if (s.tipo === 'circuito') {
      h += vCircuito(id, s, e);
    }
  } else {
    h += `<button class="btn primario enorme" data-a="prossimo">Prossimo esercizio →</button>`;
    const max = s.serieMax ? s.serieMax : 99;
    if (fatte < max) h += `<button class="btn" data-a="aggiungi-serie">+ Aggiungi ${s.tipo === 'circuito' || s.tipo === 'superset' ? 'un giro' : 'una serie'}</button>`;
  }

  if (e.serie.length) {
    h += `<div class="serie-fatte"><div class="etichetta">Fatte</div>` + e.serie.map((x, i) => {
      let t;
      if (s.tipo === 'kg') t = `<b class="num">${fk(x.kg)} kg × ${x.rip}</b>`;
      else if (s.tipo === 'elastico') t = `<b class="num">${x.rip} rip</b> <span class="tenue piccolo">${esc(imp().elastici[x.banda] || '')}</span>`;
      else if (s.tipo === 'corpo') t = `<b class="num">${x.rip} rip</b>`;
      else if (s.tipo === 'superset') t = `<b class="num">${x.parti.map(p => fk(p.kg) + '×' + p.rip).join(' + ')}</b>`;
      else t = `<b>Giro completo</b>`;
      const sens = x.sens ? `<span class="sens ${x.sens}">${{ facile: 'facile', giusto: 'giusta', duro: 'al limite' }[x.sens]}</span>` : '';
      return `<button data-a="modifica-serie" data-i="${i}"><span class="spunta">✓</span><span class="tenue">${i + 1}</span><span class="cresci">${t}</span>${sens}<span class="tenue">✎</span></button>`;
    }).join('') + '</div>';
  }

  h += `<div class="azioni-sec"><button data-a="tecnica">📖 Come si fa</button>`;
  if (spec(id).alternativa || s.dolore) h += `<button data-a="dolore">🤕 Fa male?</button>`;
  if (!finito) h += `<button data-a="salta">⏭ Salta</button>`;
  h += `<button data-a="elenco">🔀 Altro esercizio</button></div>`;
  return h;
}

function vCircuito(id, s, e) {
  const t = S().timer;
  let h = '';
  s.parti.forEach((p, i) => {
    const cl = i < e.parte ? 'fatta' : i === e.parte ? 'attiva' : '';
    h += `<div class="parte ${cl}"><h3>${i < e.parte ? '✓ ' : ''}${esc(p.nome)} ${p.rip ? '×' + p.rip : p.secondi + '"'}</h3>`;
    if (i === e.parte) {
      if (p.rip) h += `<button class="btn primario" data-a="parte-fatta">✓ Fatti ${p.rip}</button>`;
      else if (t && t.id === id) h += `<div class="num" style="text-align:center;font-size:64px;font-weight:800" data-plank></div><button class="btn" data-a="parte-fatta">Fatto</button>`;
      else h += `<button class="btn primario" data-a="plank-via" data-sec="${p.secondi}">▶ Avvia ${p.secondi}"</button>`;
    }
    h += `</div>`;
  });
  return h;
}

/* ---------- RECUPERO ---------- */
function vRiposo() {
  const se = S(), r = se.riposo, id = r.id, e = se.es[id], eid = idEff(id), s = spec(eid);
  const ultima = e.serie[e.serie.length - 1];
  const finito = e.serie.length >= serieTot(id);
  let h = `<div class="recupero" id="recupero"><div class="etichetta">Recupero</div>
    <div class="anello"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="var(--carta2)" stroke-width="7"/>
      <circle id="arco" cx="50" cy="50" r="45" fill="none" stroke="var(--verde)" stroke-width="7" stroke-linecap="round" stroke-dasharray="282.7" stroke-dashoffset="0"/></svg>
      <div class="tempo"><b class="num" data-riposo>–</b><small data-riposo-sub>su ${recTxt(r.durata)}</small></div></div>
    <div class="btn-riga" style="max-width:340px;margin:0 auto"><button class="btn" data-a="riposo-agg" data-d="-15">−15"</button><button class="btn" data-a="riposo-agg" data-d="15">+15"</button></div></div>`;

  if (ultima && s.tipo !== 'circuito') {
    h += `<div class="domanda">Com'era la serie?</div><div class="sens-btn">
      ${[['facile', 'Facile', '3+ in canna'], ['giusto', 'Giusta', '2 in canna'], ['duro', 'Al limite', '0–1 in canna']].map(([k, t, d]) =>
        `<button class="${k} ${ultima.sens === k ? 'scelto' : ''}" data-a="sens" data-s="${k}"><b>${t}</b>${d}</button>`).join('')}</div>`;
  }

  // cosa viene dopo
  h += `<div class="prossima">`;
  if (!finito) {
    const inp = inputDi(id);
    const dett = s.tipo === 'kg' ? ` · ${inp.rip} × ${fk(inp.kg)} kg` : s.tipo === 'elastico' ? ` · ${inp.rip} rip · ${esc(imp().elastici[inp.banda])}` : '';
    h += `<div class="etichetta">Dopo</div><b>${s.tipo === 'circuito' || s.tipo === 'superset' ? 'Giro' : 'Serie'} ${e.serie.length + 1} di ${serieTot(id)}</b>${dett}`;
    h += `</div><button class="btn primario enorme" data-a="riposo-fine">${s.tipo === 'circuito' || s.tipo === 'superset' ? 'Inizia il giro' : 'Inizia la serie'} ${e.serie.length + 1}</button>`;
  } else {
    const nx = prossimoIdx();
    if (nx < 0) {
      h += `<div class="etichetta">Dopo</div><b>🏁 Hai finito tutti gli esercizi!</b></div>
        <button class="btn primario enorme" data-a="termina">Chiudi allenamento</button>`;
    } else {
      const nid = se.ordine[nx], ns = spec(idEff(nid));
      h += `<div class="etichetta">Prossimo esercizio</div><b style="font-size:19px">${esc(ns.nome)}</b>
        <div class="tenue">${obiettivoTxt(idEff(nid), suggerisci(idEff(nid)))}</div>
        <div class="piccolo" style="margin-top:6px">🛠 ${esc(ns.tecnica.prepara[0])}</div></div>
        <button class="btn primario enorme" data-a="riposo-fine">Vai: ${esc(ns.nome)}</button>`;
    }
    if (s.serieMax && e.serie.length < s.serieMax) h += `<button class="btn" data-a="aggiungi-serie">+ Fai il ${e.serie.length + 1}° giro</button>`;
  }
  return h;
}
function prossimoIdx() {
  const se = S(), n = se.ordine.length;
  for (let k = 1; k <= n; k++) {
    const i = (se.idx + k) % n;
    if (se.es[se.ordine[i]].stato === 'da fare') return i;
  }
  return -1;
}

/* ---------- FINE ---------- */
function recordSessione(note) {
  const se = S();
  const esercizi = {};
  for (const id of se.ordine) {
    const e = se.es[id], eid = idEff(id), s = spec(eid);
    esercizi[eid] = { nome: s.nome, tipo: s.tipo, serie: e.serie.map(x => Object.assign({}, x)), saltato: e.stato === 'saltato' };
    if (e.alt) esercizi[eid].alPostoDi = id;
    if (e.dolore) esercizi[eid].dolore = true;
  }
  return { id: 'w' + se.inizio, giorno: se.giorno, inizio: se.inizio, fine: Date.now(), esercizi, note: note || '' };
}
function analisi(rec) {
  let serie = 0, volume = 0;
  const record = [];
  for (const [id, e] of Object.entries(rec.esercizi)) {
    serie += e.serie.length;
    const s = spec(id);
    if (!e.serie.length) continue;
    if (s.tipo === 'kg') {
      volume += e.serie.reduce((a, x) => a + x.kg * x.rip * (s.ripNota ? 2 : 1), 0);
      const maxOra = Math.max(...e.serie.map(x => x.kg));
      const prima = storiaDi(id);
      if (prima.length) {
        const maxPrima = Math.max(...prima.flatMap(p => p.serie.map(x => x.kg)));
        if (maxOra > maxPrima) record.push(`${s.nome}: ${fk(maxOra)} kg (prima ${fk(maxPrima)})`);
      }
    } else if (s.tipo === 'elastico') {
      const bOra = Math.max(...e.serie.map(x => x.banda ?? 0));
      const prima = storiaDi(id);
      if (prima.length && bOra > Math.max(...prima.flatMap(p => p.serie.map(x => x.banda ?? 0))))
        record.push(`${s.nome}: elastico «${imp().elastici[bOra]}»`);
    } else if (s.tipo === 'superset') {
      volume += e.serie.reduce((a, g) => a + g.parti.reduce((b, p) => b + p.kg * p.rip, 0), 0);
    }
  }
  return { serie, volume, record };
}
function vFine() {
  const se = S(), rec = recordSessione();
  const a = analisi(rec);
  const storicoFinto = [rec, ...dati.storico];
  let h = `<div class="testata"><button class="indietro" data-a="torna-all">‹</button><h1>Fine allenamento</h1></div>
    <div class="trofeo">${a.record.length ? '🏆' : '💪'}</div>
    <div class="stat-riga" style="margin-top:10px">
      <div class="stat"><b class="num">${durataTxt(Date.now() - se.inizio)}</b><small>durata</small></div>
      <div class="stat"><b class="num">${a.serie}</b><small>serie fatte</small></div>
      <div class="stat"><b class="num">${Math.round(a.volume).toLocaleString('it-IT')}</b><small>kg sollevati</small></div></div>`;
  if (a.record.length) h += `<div class="carta"><h2>🏆 Record di oggi</h2>${a.record.map(r => `<div class="voce"><span>${esc(r)}</span></div>`).join('')}</div>`;
  h += `<div class="carta"><h2>La prossima volta</h2>`;
  for (const id of se.ordine) {
    const eid = idEff(id), s = spec(eid), e = se.es[id];
    if (!e.serie.length) { h += `<div class="voce"><span>${esc(s.nome)}</span><span class="tenue">saltato</span></div>`; continue; }
    const sg = suggerisci(eid, storicoFinto);
    h += `<div class="voce"><span>${esc(s.nome)}${e.dolore ? ' 🤕' : ''}</span><b style="text-align:right">${obiettivoTxt(eid, sg)}${sg.cl === 'su' ? ' ⬆' : sg.cl === 'giu' ? ' ⬇' : ''}</b></div>`;
  }
  h += `</div><div class="carta"><h2>Note</h2><textarea id="note" placeholder="Come ti sei sentito? Macchine occupate, dolori, cose da ricordare…">${esc(se.note || '')}</textarea></div>
    <button class="btn primario enorme" data-a="salva-allenamento">💾 Salva allenamento</button>
    <button class="btn" data-a="torna-all">‹ Torna all'allenamento</button>`;
  return h;
}

/* ---------- STORICO ---------- */
function vStorico() {
  let h = `<div class="testata"><h1>Storico</h1></div>`;
  if (!dati.storico.length) return h + `<div class="carta tenue">Ancora nessun allenamento salvato. Il primo è il più importante! 💪</div>`;
  let mese = '';
  for (const r of dati.storico) {
    const m = new Date(r.inizio).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    if (m !== mese) { h += `<h3 class="etichetta" style="margin:18px 0 4px">${m}</h3>`; mese = m; }
    const a = analisi(Object.assign({}, r));
    h += `<button class="carta riga" style="width:100%;text-align:left;margin:8px 0" data-a="dettaglio" data-id="${r.id}">
      <span class="lettera">${r.giorno}</span><span class="cresci"><b>${dataTxt(r.inizio)}</b> · ${esc(SCHEDA.giorni[r.giorno]?.nome || '')}<br>
      <span class="tenue piccolo">${durataTxt(r.fine - r.inizio)} · ${a.serie} serie · ${Math.round(a.volume).toLocaleString('it-IT')} kg</span></span><span class="tenue">›</span></button>`;
  }
  return h;
}
function vDettaglio(id) {
  const r = dati.storico.find(x => x.id === id);
  if (!r) return vStorico();
  let h = `<div class="testata"><button class="indietro" data-a="nav" data-v="storico">‹</button><h1>${dataTxt(r.inizio)} · Giorno ${r.giorno}</h1></div>
    <div class="tenue">${new Date(r.inizio).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}–${new Date(r.fine).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} · ${durataTxt(r.fine - r.inizio)}</div><div class="carta">`;
  for (const [eid, e] of Object.entries(r.esercizi)) {
    const s = spec(eid) || { tipo: e.tipo };
    h += `<div class="voce"><span>${esc(e.nome)}${e.dolore ? ' 🤕' : ''}${e.alPostoDi ? '<br><span class="tenue piccolo">al posto di ' + esc(spec(e.alPostoDi)?.nome || '') + '</span>' : ''}</span>
      <span class="num" style="text-align:right">${e.serie.length ? esc(serieTxt(e.serie, s)) + (s.tipo === 'elastico' ? '<br><span class="tenue piccolo">' + esc(imp().elastici[e.serie[0].banda] || '') + '</span>' : '') : '<span class="tenue">saltato</span>'}</span></div>`;
  }
  h += `</div>`;
  if (r.note) h += `<div class="carta"><h2>Note</h2>${esc(r.note).replace(/\n/g, '<br>')}</div>`;
  h += `<button class="btn pericolo" data-a="elimina-allenamento" data-id="${r.id}">🗑 Elimina questo allenamento</button>`;
  return h;
}

/* ---------- GUIDA ESERCIZI ---------- */
function vGuida() {
  let h = `<div class="testata"><h1>Esercizi</h1></div><div class="tenue piccolo">Come si fanno, i tuoi progressi e i record.</div>`;
  for (const g of SCHEDA.rotazione) {
    h += `<h3 class="etichetta" style="margin:18px 0 4px">Giorno ${g} – ${esc(SCHEDA.giorni[g].nome)}</h3><div class="carta" style="padding:4px 16px"><ul class="es-lista">`;
    for (const id of SCHEDA.giorni[g].esercizi) {
      const s = spec(id), st = storiaDi(id);
      h += `<li><button data-a="guida-es" data-id="${id}"><span class="cresci">${esc(s.nome)}${s.nuovo ? '<span class="nuovo">NUOVO</span>' : ''}<br>
        <span class="tenue piccolo">${st.length ? 'fatto ' + st.length + (st.length === 1 ? ' volta' : ' volte') : 'mai fatto'}</span></span><span class="tenue">›</span></button></li>`;
    }
    h += `</ul></div>`;
  }
  return h;
}
function htmlTecnica(s) {
  const t = s.tecnica;
  return `<div class="tecnica"><div class="tenue">💪 ${esc(t.muscoli)}</div>
    <h3>Preparazione</h3><ol>${t.prepara.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <h3>Esecuzione</h3><ol>${t.esegui.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <h3>Errori da evitare</h3><ul class="errori">${t.errori.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <h3>Respirazione</h3><div>${esc(t.respiro)}</div>
    <div class="consiglio">💡 ${esc(t.consiglio)}</div>
    <a class="link" style="display:inline-block;margin-top:10px" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(s.nome + ' tecnica esecuzione')}">▶ Cerca un video (serve internet)</a></div>`;
}
function grafico(id) {
  const s = spec(id), st = storiaDi(id).slice(0, 20).reverse();
  if (st.length < 2) return '';
  let vals, etich;
  if (s.tipo === 'kg') { vals = st.map(p => Math.max(...p.serie.map(x => x.kg))); etich = v => fk(v) + ' kg'; }
  else if (s.tipo === 'elastico') { vals = st.map(p => p.serie.reduce((a, x) => a + x.rip, 0) + 100 * Math.max(...p.serie.map(x => x.banda ?? 0))); etich = v => imp().elastici[Math.floor(v / 100)] || ''; }
  else if (s.tipo === 'superset') { vals = st.map(p => Math.max(...p.serie.map(g => g.parti[0].kg))); etich = v => fk(v) + ' kg'; }
  else { vals = st.map(p => p.serie.reduce((a, x) => a + (x.rip || 0), 0)); etich = v => v + ' rip'; }
  const W = 320, H = 140, pl = 8, pr = 8, pt = 18, pb = 22;
  const mn = Math.min(...vals), mx = Math.max(...vals), sp = mx - mn || 1;
  const X = i => pl + i * (W - pl - pr) / (vals.length - 1);
  const Y = v => pt + (1 - (v - mn) / sp) * (H - pt - pb);
  const pts = vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  return `<div class="carta grafico"><h2>Progressi</h2><svg viewBox="0 0 ${W} ${H}">
    <polyline points="${pts}" fill="none" stroke="var(--verde)" stroke-width="2.5" stroke-linejoin="round"/>
    ${vals.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="var(--verde)"/>`).join('')}
    <text x="${X(0)}" y="${H - 6}">${dataTxt(st[0].data)}</text>
    <text x="${X(vals.length - 1)}" y="${H - 6}" text-anchor="end">${dataTxt(st[st.length - 1].data)}</text>
    <text x="${X(vals.length - 1)}" y="${Y(vals[vals.length - 1]) - 8}" text-anchor="end">${esc(etich(vals[vals.length - 1]))}</text>
  </svg></div>`;
}
function vGuidaEs(id) {
  const s = spec(id), st = storiaDi(id);
  let h = `<div class="testata"><button class="indietro" data-a="nav" data-v="guida">‹</button><h1>${esc(s.nome)}</h1></div>`;
  if (s.tipo !== 'circuito') h += `<div class="target" style="margin-top:4px"><div><b class="num">${s.tipo === 'superset' ? s.serie + ' giri' : s.serie + '×' + (s.ripMin === s.ripMax ? s.ripMin : s.ripMin + '–' + s.ripMax)}</b><small>${s.ripNota || 'serie × rip'}</small></div><div><b class="num">${recTxt(s.recupero)}</b><small>recupero</small></div></div>`;
  if (s.nuovo || s.cambio) h += `<div class="banner blu">${s.nuovo ? 'NUOVO – ' + esc(s.nuovo) : esc(s.cambio)}</div>`;
  h += `<div class="suggerimento ${suggerisci(id).cl}">Prossima volta: <b>${obiettivoTxt(id, suggerisci(id))}</b><br>${esc(suggerisci(id).msg)}</div>`;
  h += grafico(id);
  h += `<div class="carta">${htmlTecnica(s)}</div>`;
  if (st.length) {
    h += `<div class="carta"><h2>Ultime volte</h2>${st.slice(0, 6).map(p => `<div class="voce"><span>${dataTxt(p.data)}</span><span class="num">${esc(serieTxt(p.serie, s))}</span></div>`).join('')}</div>`;
  }
  return h;
}

/* ---------- IMPOSTAZIONI ---------- */
function vImpostazioni() {
  const i = imp();
  const sw = (k, t, d) => `<div class="campo"><span>${t}${d ? `<br><span class="tenue piccolo">${d}</span>` : ''}</span><button class="interruttore ${i[k] ? 'on' : ''}" data-a="interruttore" data-k="${k}"></button></div>`;
  return `<div class="testata"><h1>Impostazioni</h1></div>
    <div class="carta"><h2>Suoni durante il recupero</h2>
      ${sw('suono', 'Bip', 'a 3-2-1 secondi dalla fine e allo scadere')}
      ${sw('vibrazione', 'Vibrazione', 'allo scadere del recupero')}
      ${sw('voce', 'Voce', 'dice «Via!» e la serie che viene dopo')}
      <button class="btn" style="margin-top:10px" data-a="prova-suono">🔊 Prova</button></div>
    <div class="carta"><h2>Elastici della tua palestra</h2><div class="tenue piccolo">Dal più spesso (aiuta di più) al più sottile. L'ultimo è «senza elastico». Puoi scrivere i colori.</div>
      ${i.elastici.map((b, k) => `<div class="campo"><span class="tenue">${k + 1}</span><input type="text" class="largo" data-imp-elastico="${k}" value="${esc(b)}"></div>`).join('')}</div>
    <div class="carta"><h2>Bilancieri</h2><div class="tenue piccolo">Servono per dirti quanti dischi mettere per lato. Metti 0 se il peso che segni è solo quello dei dischi.</div>
      <div class="campo"><span>Bilanciere olimpico (kg)</span><input type="number" inputmode="decimal" data-imp="bilanciere" value="${i.bilanciere}"></div>
      <div class="campo"><span>Trap bar (kg)</span><input type="number" inputmode="decimal" data-imp="trapbar" value="${i.trapbar}"></div></div>
    <div class="carta"><h2>Backup</h2><div class="tenue piccolo">I dati stanno solo su questo telefono. Ogni tanto esporta un backup (e mandalo a Claude se vuoi un'analisi dei progressi).</div>
      <button class="btn" style="margin-top:10px" data-a="esporta">📤 Esporta backup</button>
      <button class="btn" data-a="importa">📥 Importa backup</button>
      <input type="file" id="file-importa" accept=".json,application/json,text/plain" class="nascosto"></div>
    <div class="carta"><h2>Regole della scheda</h2><div class="piccolo">${esc(SCHEDA.regole.progressione)}</div><div class="piccolo" style="margin-top:8px">${esc(SCHEDA.regole.dolore)}</div></div>
    <button class="btn pericolo" data-a="cancella-tutto">Cancella tutti i dati</button>
    <div class="tenue piccolo" style="text-align:center;margin:16px 0">Coach Palestra ${VERSIONE_APP}</div>`;
}

/* ================= TIMER (aggiornati senza ridisegnare) ================= */
let ultimoSecondo = null, riposoFinitoMostrato = false;
function tick(forza) {
  const se = S();
  if (!se) return;
  const ora = Date.now();
  document.querySelectorAll('[data-crono]').forEach(el => { el.textContent = mmss((ora - se.inizio) / 1000).replace('+', ''); });

  // riscaldamento
  const er = document.querySelector('[data-risc]');
  if (er && se.risc.fine) {
    const rest = (se.risc.fine - ora) / 1000;
    er.textContent = rest > 0 ? mmss(Math.ceil(rest)) : '✓';
    if (rest <= 0 && !se.risc.suonato) { se.risc.suonato = true; bip(660, .4); vibra([300, 100, 300]); salva(); }
  }

  // plank
  const t = se.timer;
  if (t) {
    const ep = document.querySelector('[data-plank]');
    if (ora < t.via) {
      const c = Math.ceil((t.via - ora) / 1000);
      if (ep) ep.textContent = 'pronto… ' + c;
      if (!forza && c !== t.ultimo) { t.ultimo = c; bip(660, .08); }
    } else {
      const rest = Math.ceil((t.fine - ora) / 1000);
      if (ep) ep.textContent = Math.max(0, rest) + '"';
      if (!t.partito) { t.partito = true; if (ora - t.via < 1500) { bip(990, .25); parla('Via'); } }
      if (!forza && rest > 0 && rest <= 3 && rest !== t.ultimo) { t.ultimo = rest; bip(880, .08); }
      if (rest <= 0) { bip(990, .5); vibra([300, 100, 300]); parteFatta(); return; }
    }
  }

  // recupero
  if (se.fase === 'riposo' && se.riposo) {
    const r = se.riposo;
    const rest = (r.fine - ora) / 1000;
    const el = document.querySelector('[data-riposo]');
    const sec = Math.ceil(rest);
    if (el) {
      el.textContent = rest > 0 ? mmss(sec) : mmss(rest);
      const sub = document.querySelector('[data-riposo-sub]');
      if (sub) sub.textContent = rest > 0 ? 'su ' + recTxt(r.durata) : 'VAI! 💪 (oltre il recupero)';
      const arco = document.getElementById('arco');
      if (arco) arco.setAttribute('stroke-dashoffset', (282.7 * Math.min(1, Math.max(0, 1 - rest / r.durata))).toFixed(1));
      const box = document.getElementById('recupero');
      if (box) { box.classList.toggle('finito', rest <= 0); box.classList.toggle('ultimi', rest > 0 && rest <= 10); }
    }
    if (!forza && rest > 0 && sec <= 3 && sec !== ultimoSecondo) { ultimoSecondo = sec; bip(880, .1); vibra(80); }
    if (rest <= 0 && !r.suonato) {
      r.suonato = true; salva();
      if (ora - r.fine < 5000) {
        bip(1175, .5, .35); vibra([400, 120, 400]);
        const e = se.es[r.id];
        parla(e.serie.length < serieTot(r.id) ? 'Via! Serie ' + (e.serie.length + 1) : 'Via! Prossimo esercizio');
        document.body.classList.add('lampo'); setTimeout(() => document.body.classList.remove('lampo'), 2000);
      }
    }
  }
}
setInterval(() => tick(false), 250);

/* ================= AZIONI ================= */
function avviaRiposo(id) {
  const se = S(), s = spec(idEff(id));
  se.riposo = { id, durata: s.recupero, fine: Date.now() + s.recupero * 1000, suonato: false };
  se.fase = 'riposo'; ultimoSecondo = null;
  salva(); render(); window.scrollTo(0, 0);
}
function serieCompletata(id) {
  const se = S(), e = se.es[id];
  if (e.serie.length >= serieTot(id)) e.stato = 'fatto';
  avviaRiposo(id);
}
function parteFatta() {
  const se = S(), id = idAttuale(), e = se.es[id], s = spec(idEff(id));
  se.timer = null;
  e.parte++;
  if (e.parte >= s.parti.length) {
    e.parte = 0;
    e.serie.push({ giro: true, t: Date.now() });
    return serieCompletata(id);
  }
  salva(); render();
}
function vaiAProssimo() {
  const se = S();
  const nx = prossimoIdx();
  se.riposo = null;
  if (nx < 0) { se.fase = 'fine'; }
  else { se.idx = nx; se.fase = 'esercizio'; }
  salva(); render(); window.scrollTo(0, 0);
}
function menuAllenamento() {
  apriFoglio(`<h2 style="margin:4px 0 12px">Allenamento</h2>
    <button class="btn" data-a="elenco">📋 Elenco esercizi</button>
    <button class="btn" data-a="riscaldamento">🔥 Riscaldamento</button>
    <button class="btn primario" data-a="termina">🏁 Termina e salva</button>
    <button class="btn" data-a="nav" data-v="home">🏠 Esci (l'allenamento resta in corso)</button>
    <button class="btn pericolo" data-a="annulla-allenamento">✕ Annulla allenamento (non salvare)</button>`);
}

const AZ = {
  nav(d) { chiudiFoglio(); vai(d.v); },
  anteprima(d) { vai('anteprima', { giorno: d.g }); },
  riprendi() { vai('allenamento'); schermoAcceso(true); },
  inizia(d) {
    if (S()) { const r = recordSessione(); if (Object.values(r.esercizi).some(e => e.serie.length)) dati.storico.unshift(r); }
    nuovaSessione(d.g); schermoAcceso(true); vai('allenamento');
  },
  menu() { menuAllenamento(); },
  riscaldamento() { chiudiFoglio(); S().fase = 'riscaldamento'; S().riposo = null; salva(); render(); },
  elenco() {
    const se = S();
    apriFoglio(`<h2 style="margin:4px 0 4px">Esercizi di oggi</h2><div class="tenue piccolo">Macchina occupata? Tocca un altro esercizio e torni dopo.</div>
      <ul class="es-lista">${se.ordine.map((id, i) => {
        const e = se.es[id], s = spec(idEff(id));
        const st = e.stato === 'fatto' ? 'fatto' : e.stato === 'saltato' ? 'saltato' : '';
        return `<li><button data-a="vai-es" data-i="${i}"><span class="n ${st}">${e.stato === 'fatto' ? '✓' : i + 1}</span>
          <span class="cresci">${esc(s.nome)}<br><span class="tenue piccolo">${e.serie.length}/${serieTot(id)} ${s.tipo === 'circuito' || s.tipo === 'superset' ? 'giri' : 'serie'}${e.stato === 'saltato' ? ' · saltato' : ''}${i === se.idx && se.fase !== 'riscaldamento' ? ' · adesso' : ''}</span></span></button></li>`;
      }).join('')}</ul>`);
  },
  'vai-es'(d) {
    const se = S(); chiudiFoglio();
    se.idx = +d.i; se.fase = 'esercizio'; se.riposo = null; se.timer = null;
    const e = se.es[se.ordine[se.idx]]; if (e.stato === 'saltato') e.stato = 'da fare';
    salva(); render(); window.scrollTo(0, 0);
  },
  spunta(d) { const sp = S().risc.spunte, i = +d.i; const k = sp.indexOf(i); k < 0 ? sp.push(i) : sp.splice(k, 1); salva(); render(); },
  'risc-via'(d) { sblocca(); S().risc.fine = Date.now() + d.min * 60000; S().risc.suonato = false; salva(); render(); },
  'risc-stop'() { S().risc.fine = null; salva(); render(); },
  'risc-fine'() { const se = S(); se.fase = 'esercizio'; se.idx = se.ordine.findIndex(id => se.es[id].stato === 'da fare'); if (se.idx < 0) se.idx = 0; salva(); render(); window.scrollTo(0, 0); },
  passo(d) {
    const se = S(), id = idAttuale(), s = spec(idEff(id)), inp = inputDi(id), dir = +d.d;
    if (d.c === 'kg') inp.kg = Math.max(0, Math.round((inp.kg + dir * s.passo) * 100) / 100);
    else if (d.c === 'rip') inp.rip = Math.max(0, inp.rip + dir);
    else if (d.c.startsWith('pkg')) { const i = +d.c.slice(3); inp.parti[i].kg = Math.max(0, Math.round((inp.parti[i].kg + dir * s.parti[i].passo) * 100) / 100); }
    else if (d.c.startsWith('prip')) { const i = +d.c.slice(4); inp.parti[i].rip = Math.max(0, inp.parti[i].rip + dir); }
    else if (d.c === 'mkg' || d.c === 'mrip') { // modifica serie
      const x = se.es[id].serie[modifica.i];
      if (d.c === 'mkg') x.kg = Math.max(0, Math.round((x.kg + dir * s.passo) * 100) / 100); else x.rip = Math.max(0, x.rip + dir);
      salva(); AZ['modifica-serie']({ i: modifica.i }); render(); return;
    }
    salva(); render();
  },
  banda(d) { inputDi(idAttuale()).banda = +d.i; salva(); render(); },
  'serie-fatta'() {
    sblocca();
    const se = S(), id = idAttuale(), s = spec(idEff(id)), inp = inputDi(id), e = se.es[id];
    const x = { t: Date.now() };
    if (s.tipo === 'kg') Object.assign(x, { kg: inp.kg, rip: inp.rip });
    else if (s.tipo === 'elastico') Object.assign(x, { banda: inp.banda, rip: inp.rip });
    else if (s.tipo === 'corpo') x.rip = inp.rip;
    else if (s.tipo === 'superset') x.parti = inp.parti.map(p => ({ kg: p.kg, rip: p.rip }));
    e.serie.push(x);
    vibra(40);
    serieCompletata(id);
  },
  'parte-fatta'() { sblocca(); parteFatta(); },
  'plank-via'(d) { sblocca(); ultimoSecondo = null; S().timer = { id: idAttuale(), via: Date.now() + 3000, fine: Date.now() + 3000 + d.sec * 1000 }; salva(); render(); },
  sens(d) {
    const se = S(), e = se.es[se.riposo.id], x = e.serie[e.serie.length - 1];
    x.sens = x.sens === d.s ? undefined : d.s; salva(); render();
  },
  'riposo-agg'(d) { const r = S().riposo; r.fine += d.d * 1000; r.durata = Math.max(5, r.durata + +d.d); if (r.fine > Date.now()) r.suonato = false; salva(); tick(true); },
  'riposo-fine'() {
    const se = S(), id = se.riposo.id;
    if (se.es[id].serie.length < serieTot(id)) { se.fase = 'esercizio'; se.idx = se.ordine.indexOf(id); se.riposo = null; salva(); render(); window.scrollTo(0, 0); }
    else vaiAProssimo();
  },
  prossimo() { vaiAProssimo(); },
  'aggiungi-serie'() {
    const se = S(), id = se.fase === 'riposo' ? se.riposo.id : idAttuale(), e = se.es[id];
    e.extra = (e.extra || 0) + 1; e.stato = 'da fare';
    se.idx = se.ordine.indexOf(id); se.fase = 'esercizio'; se.riposo = null;
    salva(); render();
  },
  salta() {
    const se = S(), e = se.es[idAttuale()];
    e.stato = e.serie.length ? 'fatto' : 'saltato';
    avviso('Esercizio saltato', { a: 'annulla-salta', testo: 'Annulla' });
    ultimoSaltato = se.idx;
    vaiAProssimo();
  },
  'annulla-salta'() {
    const se = S(); if (ultimoSaltato == null || !se) return;
    se.es[se.ordine[ultimoSaltato]].stato = 'da fare'; se.idx = ultimoSaltato; se.fase = 'esercizio'; se.riposo = null;
    $('#avviso').classList.add('nascosto'); salva(); render();
  },
  'modifica-serie'(d) {
    const se = S(), id = se.fase === 'riposo' ? se.riposo.id : idAttuale(), s = spec(idEff(id)), x = se.es[id].serie[+d.i];
    modifica = { i: +d.i };
    let corpo = '';
    if (s.tipo === 'kg') corpo = stepper('mkg', fk(x.kg), 'kg') + stepper('mrip', x.rip, 'ripetizioni');
    else if (s.tipo === 'elastico' || s.tipo === 'corpo') corpo = stepper('mrip', x.rip, 'ripetizioni');
    apriFoglio(`<h2 style="margin:4px 0 8px">Serie ${+d.i + 1}</h2>${corpo}
      <button class="btn primario" data-a="chiudi">Fatto</button>
      <button class="btn pericolo" data-a="elimina-serie" data-i="${d.i}">🗑 Elimina questa serie</button>`);
  },
  chiudi() { chiudiFoglio(); render(); },
  'elimina-serie'(d) {
    const se = S(), id = idAttuale(), e = se.es[id];
    e.serie.splice(+d.i, 1);
    if (e.serie.length < serieTot(id)) e.stato = 'da fare';
    chiudiFoglio(); salva(); render();
  },
  tecnica() {
    const s = spec(idEff(idAttuale()));
    apriFoglio(`<h2 style="margin:4px 0 8px">${esc(s.nome)}</h2>${htmlTecnica(s)}<button class="btn" style="margin-top:14px" data-a="chiudi">Chiudi</button>`);
  },
  dolore() {
    const id = idAttuale(), e = S().es[id], orig = spec(id);
    let h = `<h2 style="margin:4px 0 8px">🤕 Fa male?</h2><div>${esc(SCHEDA.regole.dolore)}</div>
      <div class="banner">Dolore = all'articolazione (spalla, gomito, ginocchio), pungente o che peggiora. La normale fatica del muscolo va bene.</div>
      <button class="btn" data-a="dolore-meno">Continuo scendendo meno in profondità</button>`;
    if (orig.alternativa && !e.alt) h += `<button class="btn primario" data-a="dolore-alt">Per oggi faccio: ${esc(orig.alternativa.nome)}</button>`;
    if (e.alt) h += `<button class="btn" data-a="dolore-torna">Torna a ${esc(orig.nome)}</button>`;
    h += `<button class="btn" data-a="chiudi">Chiudi</button>`;
    apriFoglio(h);
  },
  'dolore-meno'() { S().es[idAttuale()].dolore = true; salva(); chiudiFoglio(); avviso('Segnato 🤕 – scendi meno e ascolta il corpo'); render(); },
  'dolore-alt'() {
    const id = idAttuale(), e = S().es[id];
    e.dolore = true; e.alt = spec(id).alternativa.id; e.input = null;
    if (e.serie.length) { e.serieOrig = e.serie; e.serie = []; }
    e.stato = 'da fare'; salva(); chiudiFoglio(); render();
  },
  'dolore-torna'() {
    const e = S().es[idAttuale()];
    e.alt = null; e.input = null; e.serie = e.serieOrig || []; delete e.serieOrig; salva(); chiudiFoglio(); render();
  },
  termina() { chiudiFoglio(); const se = S(); se.faseprima = se.fase === 'fine' ? se.faseprima : se.fase; se.fase = 'fine'; se.riposo = null; salva(); vista = { nome: 'allenamento' }; render(); window.scrollTo(0, 0); },
  'torna-all'() {
    const se = S(); se.note = $('#note')?.value || se.note;
    se.fase = se.faseprima && se.faseprima !== 'riposo' ? se.faseprima : 'esercizio';
    if (se.fase === 'esercizio' && se.es[idAttuale()].stato !== 'da fare') { const nx = prossimoIdx(); if (nx >= 0) se.idx = nx; }
    salva(); render();
  },
  'salva-allenamento'() {
    const note = $('#note').value.trim();
    const rec = recordSessione(note);
    if (!Object.values(rec.esercizi).some(e => e.serie.length)) {
      if (!confirm('Non hai segnato nessuna serie. Chiudere senza salvare?')) return;
    } else dati.storico.unshift(rec);
    dati.sessione = null; salva(); schermoAcceso(false);
    vai('home'); avviso('Allenamento salvato 💪');
  },
  'annulla-allenamento'() {
    if (!confirm('Annullare l\'allenamento? Le serie di oggi non verranno salvate.')) return;
    dati.sessione = null; salva(); chiudiFoglio(); schermoAcceso(false); vai('home');
  },
  dettaglio(d) { vai('dettaglio', { id: d.id }); },
  'elimina-allenamento'(d) {
    if (!confirm('Eliminare questo allenamento dallo storico?')) return;
    dati.storico = dati.storico.filter(r => r.id !== d.id); salva(); vai('storico');
  },
  'guida-es'(d) { vai('guidaEs', { id: d.id }); },
  interruttore(d) { imp()[d.k] = !imp()[d.k]; salva(); render(); },
  'prova-suono'() { sblocca(); bip(880, .1); setTimeout(() => bip(880, .1), 1000); setTimeout(() => bip(880, .1), 2000); setTimeout(() => { bip(1175, .5, .35); vibra([400, 120, 400]); parla('Via! Serie 2'); }, 3000); },
  esporta() { esporta(); },
  importa() { $('#file-importa').click(); },
  'cancella-tutto'() {
    if (!confirm('Cancellare TUTTI i dati (storico e impostazioni)? Non si può annullare.')) return;
    if (!confirm('Sicuro? Consiglio: prima esporta un backup.')) return;
    localStorage.removeItem(CHIAVE); dati = carica(); vai('home');
  },
  aggiorna() { if (nuovoSW) nuovoSW.postMessage('AGGIORNA'); }
};
let modifica = { i: 0 }, ultimoSaltato = null;

document.addEventListener('click', e => {
  sblocca();
  const b = e.target.closest('[data-a]');
  if (!b) return;
  const f = AZ[b.dataset.a];
  if (f) { e.preventDefault(); f(b.dataset, b); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.imp) { const v = parseFloat(String(t.value).replace(',', '.')); if (!isNaN(v) && v >= 0) { imp()[t.dataset.imp] = v; salva(); } }
  if (t.dataset.impElastico) { imp().elastici[+t.dataset.impElastico] = t.value.trim() || IMP_DEFAULT.elastici[+t.dataset.impElastico]; salva(); }
  if (t.id === 'file-importa' && t.files[0]) importa(t.files[0]);
});

/* ================= BACKUP ================= */
async function esporta() {
  const oggi = new Date().toISOString().slice(0, 10);
  const contenuto = JSON.stringify({ app: 'coach-palestra', versione: 1, esportato: new Date().toISOString(), storico: dati.storico, impostazioni: dati.impostazioni }, null, 1);
  const nome = `palestra_${oggi}`;
  const tenta = async (file) => { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Backup palestra' }); return true; } return false; };
  try {
    if (await tenta(new File([contenuto], nome + '.json', { type: 'application/json' }))) return;
    if (await tenta(new File([contenuto], nome + '.txt', { type: 'text/plain' }))) return;
  } catch (e) { if (e.name === 'AbortError') return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([contenuto], { type: 'application/json' }));
  a.download = nome + '.json'; a.click();
  avviso('Backup salvato nei Download');
}
async function importa(file) {
  try {
    const d = JSON.parse(await file.text());
    if (d.app !== 'coach-palestra' || !Array.isArray(d.storico)) throw new Error('formato');
    if (!confirm(`Il backup contiene ${d.storico.length} allenamenti. Sostituire i dati attuali (${dati.storico.length} allenamenti)?`)) return;
    dati.storico = d.storico; dati.impostazioni = Object.assign({}, IMP_DEFAULT, d.impostazioni || {});
    salva(); avviso('Backup importato'); vai('home');
  } catch (e) { avviso('Questo file non è un backup di Coach Palestra'); }
}

/* ================= SERVICE WORKER (offline + aggiornamenti) ================= */
let nuovoSW = null;
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').then(reg => {
    const controlla = w => w.addEventListener('statechange', () => {
      if (w.state === 'installed' && navigator.serviceWorker.controller) { nuovoSW = w; avviso('Nuova versione disponibile', { a: 'aggiorna', testo: 'Aggiorna' }); }
    });
    if (reg.waiting && navigator.serviceWorker.controller) { nuovoSW = reg.waiting; avviso('Nuova versione disponibile', { a: 'aggiorna', testo: 'Aggiorna' }); }
    reg.addEventListener('updatefound', () => controlla(reg.installing));
  }).catch(() => { /* offline al primo avvio */ });
  let ricaricato = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!ricaricato) { ricaricato = true; location.reload(); } });
}

if (S()) schermoAcceso(true);
render();
