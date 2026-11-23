/* Coach Palestra – statistiche e note del coach (usa le funzioni di app.js). */
'use strict';

function inizioSett(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }
function ultimeSettimane(n) { const out = [], s0 = inizioSett(Date.now()); for (let i = n - 1; i >= 0; i--) out.push(s0 - i * 7 * 86400000); return out; }
function forzaStimata(serie) { return Math.max(...serie.map(x => x.kg * (1 + x.rip / 30))); }

function barre(vals, etich, fmt = v => v, colore = 'var(--verde)') {
  const W = 320, H = 130, pb = 18, pt = 16, n = vals.length, mx = Math.max(1, ...vals), bw = (W - 8) / n;
  return `<svg viewBox="0 0 ${W} ${H}">${vals.map((v, i) => {
    const h = (H - pb - pt) * v / mx, x = 4 + i * bw, y = H - pb - h;
    return `<rect x="${(x + 3).toFixed(1)}" y="${y.toFixed(1)}" width="${(bw - 6).toFixed(1)}" height="${Math.max(h, v ? 2 : 0).toFixed(1)}" rx="4" fill="${i === n - 1 ? colore : '#2f6b48'}"/>
      ${v ? `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle">${fmt(v)}</text>` : ''}
      <text x="${(x + bw / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle">${etich[i]}</text>`;
  }).join('')}</svg>`;
}
function linea(vals, etichSx, etichDx, fmt) {
  if (vals.length < 2) return '';
  const W = 320, H = 110, p = 10, mn = Math.min(...vals), mx = Math.max(...vals), sp = mx - mn || 1;
  const X = i => p + i * (W - 2 * p) / (vals.length - 1), Y = v => 16 + (1 - (v - mn) / sp) * (H - 40);
  return `<svg viewBox="0 0 ${W} ${H}"><polyline points="${vals.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ')}" fill="none" stroke="var(--verde)" stroke-width="2.5"/>
    ${vals.map((v, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3" fill="var(--verde)"/>`).join('')}
    <text x="${p}" y="${H - 4}">${etichSx}</text><text x="${W - p}" y="${H - 4}" text-anchor="end">${etichDx}</text>
    <text x="${X(vals.length - 1).toFixed(1)}" y="${(Y(vals[vals.length - 1]) - 7).toFixed(1)}" text-anchor="end">${fmt(vals[vals.length - 1])}</text></svg>`;
}

function htmlAnalisi(a) {
  let h = `<div class="etichetta">${esc(a.data || '')}</div><h2 style="margin:2px 0 6px">${esc(a.titolo || 'Analisi')}</h2>`;
  if (a.riassunto) h += `<div>${esc(a.riassunto)}</div>`;
  for (const sz of a.sezioni || []) {
    h += `<h3>${esc(sz.titolo || '')}</h3>`;
    if (sz.testo) h += `<div>${esc(sz.testo).replace(/\n/g, '<br>')}</div>`;
    if (sz.punti && sz.punti.length) h += `<ul>${sz.punti.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  }
  const pesi = Object.entries(a.pesi || {});
  if (pesi.length) h += `<h3>🎯 Pesi consigliati per la prossima volta</h3>${pesi.map(([id, v]) => `<div class="voce"><span>${esc(spec(id)?.nome || id)}</span><b>${v.kg != null ? fk(v.kg) + ' kg' : esc(imp().elastici[v.banda] || '')}</b></div>`).join('')}`;
  return h;
}

function vStats() {
  const st = dati.storico, pr = dati.profilo;
  let h = `<div class="testata"><h1>Statistiche</h1></div>`;

  // note del coach
  if (dati.analisi.length) {
    const a = dati.analisi[0];
    if (!a.letta) { a.letta = true; salva(); }
    h += `<div class="carta tecnica" style="border:1px solid #2563eb"><div class="riga"><span style="font-size:26px">🧑‍🏫</span><b>Note del coach</b></div>${htmlAnalisi(a)}</div>`;
    if (dati.analisi.length > 1) h += `<details class="carta"><summary><b>Note precedenti (${dati.analisi.length - 1})</b></summary>${dati.analisi.slice(1).map(x => `<div class="tecnica" style="border-top:1px solid var(--linea);margin-top:10px;padding-top:10px">${htmlAnalisi(x)}</div>`).join('')}</details>`;
  } else {
    h += `<div class="carta tenue piccolo">🧑‍🏫 Qui compariranno le <b>note del coach</b>: esporta i dati ogni settimana, salvali su Drive e chiedi a Claude l'analisi. Poi importa il file che ti manda.</div>`;
  }

  if (!st.length) return h + `<div class="carta tenue">Le statistiche partono dal primo allenamento salvato. 💪</div>`;

  // totali
  const ore = st.reduce((a, r) => a + (r.fine - r.inizio), 0) / 3600000;
  const kg = st.reduce((a, r) => a + analisi(r).volume, 0);
  const sett = ultimeSettimane(52).map(s0 => st.filter(r => r.inizio >= s0 && r.inizio < s0 + 7 * 86400000).length);
  let filotto = 0; for (let i = sett.length - (sett[sett.length - 1] >= 2 ? 1 : 2); i >= 0 && sett[i] >= 2; i--) filotto++;
  h += `<div class="stat-riga"><div class="stat"><b class="num">${st.length}</b><small>allenamenti</small></div>
    <div class="stat"><b class="num">${ore.toFixed(1).replace('.', ',')}</b><small>ore in palestra</small></div>
    <div class="stat"><b class="num">${kg >= 10000 ? (kg / 1000).toFixed(1).replace('.', ',') + ' t' : Math.round(kg)}</b><small>kg sollevati</small></div></div>
    <div class="stat-riga" style="margin-top:10px"><div class="stat"><b class="num">${filotto}</b><small>settimane di fila<br>con 2+ allenamenti</small></div>
    <div class="stat"><b class="num">${durataTxt(st.reduce((a, r) => a + (r.fine - r.inizio), 0) / st.length)}</b><small>durata media</small></div></div>`;

  // frequenza e volume per settimana
  const s8 = ultimeSettimane(8), et8 = s8.map(t => { const d = new Date(t); return d.getDate() + '/' + (d.getMonth() + 1); });
  const nPer = s8.map(s0 => st.filter(r => r.inizio >= s0 && r.inizio < s0 + 7 * 86400000));
  h += `<div class="carta grafico"><h2>Allenamenti a settimana</h2><div class="tenue piccolo">Obiettivo 2–3. Settimane che iniziano il lunedì.</div>${barre(nPer.map(x => x.length), et8)}</div>`;
  h += `<div class="carta grafico"><h2>Kg sollevati a settimana</h2>${barre(nPer.map(x => Math.round(x.reduce((a, r) => a + analisi(r).volume, 0))), et8, v => v >= 1000 ? (v / 1000).toFixed(1) + 't' : v)}</div>`;

  // serie per gruppo muscolare
  const gruppi = {};
  const conta = (lista, peso) => { for (const r of lista) for (const [id, e] of Object.entries(r.esercizi)) { const g = (SCHEDA.dettagli[id] || {}).gruppo || 'Altro'; gruppi[g] = gruppi[g] || [0, 0]; gruppi[g][peso] += e.serie.length; } };
  conta(st.filter(r => r.inizio >= Date.now() - 7 * 86400000), 0);
  conta(st.filter(r => r.inizio >= Date.now() - 28 * 86400000), 1);
  const mxG = Math.max(1, ...Object.values(gruppi).map(v => Math.max(v[0], v[1] / 4)));
  h += `<div class="carta"><h2>Serie per muscolo</h2><div class="tenue piccolo">Barra piena = ultimi 7 giorni · tacca = media a settimana dell'ultimo mese</div>
    ${Object.entries(gruppi).sort((a, b) => b[1][1] - a[1][1]).map(([g, [s7, s28]]) => `<div class="barra-g"><span>${esc(g)}</span><div class="pista"><i style="width:${100 * s7 / mxG}%"></i><b style="left:${100 * (s28 / 4) / mxG}%"></b></div><span class="num">${s7}</span></div>`).join('')}</div>`;

  // forza stimata
  const righe = [];
  for (const id of Object.keys(SCHEDA.esercizi)) {
    if (spec(id).tipo !== 'kg') continue;
    const sto = storiaDi(id).slice().reverse();
    if (!sto.length) continue;
    const v = sto.map(p => forzaStimata(p.serie));
    const d = v[v.length - 1] - v[0];
    righe.push(`<details class="riga-forza"><summary><span class="cresci">${esc(spec(id).nome)}</span><b class="num">${Math.round(v[v.length - 1])} kg</b><span class="num ${d > 0 ? 'su' : d < 0 ? 'giu' : ''}">${d > 0 ? '+' : ''}${Math.round(d)}</span></summary>
      <div class="grafico">${linea(v, dataTxt(sto[0].data), dataTxt(sto[sto.length - 1].data), x => Math.round(x) + ' kg') || '<div class="tenue piccolo">Serve almeno un altro allenamento per il grafico.</div>'}</div></details>`);
  }
  if (righe.length) h += `<div class="carta"><h2>Forza stimata (massimale)</h2><div class="tenue piccolo">Quanto sollevi per 1 ripetizione, stimato dalle tue serie. Il numero a destra è quanto è cambiato dal primo allenamento. Tocca per il grafico.</div>${righe.join('')}</div>`;

  // peso corporeo
  const pes = dati.pesate.slice().reverse();
  if (pes.length || pr.peso) {
    const bmi = pr.peso && pr.altezza ? pr.peso / Math.pow(pr.altezza / 100, 2) : null;
    h += `<div class="carta grafico"><h2>Peso corporeo</h2><div class="riga"><b style="font-size:26px">${pr.peso ? fk(pr.peso) + ' kg' : '–'}</b>${bmi ? `<span class="tenue">BMI ${bmi.toFixed(1).replace('.', ',')}</span>` : ''}</div>
      ${linea(pes.map(p => p.kg), pes.length ? dataTxt(pes[0].t) : '', pes.length ? dataTxt(pes[pes.length - 1].t) : '', x => fk(x) + ' kg')}
      <div class="tenue piccolo">Pesati ogni tanto (stessa ora, a stomaco vuoto) da «Altro» → Profilo.</div></div>`;
  } else h += `<div class="carta tenue piccolo">⚖️ Inserisci età, altezza e peso in «Altro» → Profilo: servono per l'analisi.</div>`;

  // dolori ultimi 30 giorni
  const recenti = st.filter(r => r.inizio >= Date.now() - 30 * 86400000);
  const zone = {};
  for (const r of recenti) {
    const tutti = [...Object.entries(r.esercizi).flatMap(([id, e]) => (e.dolori || []).map(d => [e.nome, d])), ...(r.dolori || []).map(d => ['In generale', d])];
    for (const [n, d] of tutti) { const z = zone[d.zona] = zone[d.zona] || { n: 0, somma: 0, es: new Set() }; z.n++; z.somma += d.intensita; z.es.add(n); }
  }
  const ordinate = Object.entries(zone).sort((a, b) => b[1].n - a[1].n);
  if (ordinate.length) {
    const scelte = {}; for (const [z, v] of ordinate) scelte[z] = v.somma / v.n >= 6 ? '#ef4444' : '#fb923c';
    h += `<div class="carta"><h2>🤕 Dolori – ultimi 30 giorni</h2>${CORPO.doppia({ scelte })}
      ${ordinate.map(([z, v]) => `<div class="voce"><span><b>${esc(CORPO.nome(z))}</b><br><span class="tenue piccolo">${[...v.es].map(esc).join(', ')}</span></span><span class="num" style="text-align:right">${v.n} ${v.n === 1 ? 'volta' : 'volte'}<br><span class="tenue piccolo">media ${(v.somma / v.n).toFixed(1).replace('.', ',')}/10</span></span></div>`).join('')}</div>`;
  } else h += `<div class="carta"><h2>🤕 Dolori – ultimi 30 giorni</h2><div class="tenue">Nessun dolore segnato. 👍</div></div>`;

  return h;
}
