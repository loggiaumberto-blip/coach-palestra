/* Coach Palestra – disegni animati degli esercizi.
   Un omino visto di lato: ogni posa è fatta di angoli (gradi: 0 = avanti/destra, 90 = giù, -90 = su, 180 = indietro).
   L'animazione passa dalla posa A alla posa B e torna. «ancora» = il punto del corpo che resta fermo (piedi, mani, anca). */
'use strict';

const ANIM = (() => {
  const D = Math.PI / 180;
  const L = { busto: 50, testa: 15, braccio: 27, avambraccio: 25, coscia: 40, tibia: 38, piede: 13 };
  const PAV = 184; // pavimento

  /* ---------- le pose ---------- */
  const in_piedi = { busto: -90, braccio: 92, avambraccio: 90, coscia: 90, tibia: 90, piede: 0 };
  const P = (base, extra) => Object.assign({}, base, extra);

  const ES = {
    squat: { ancora: ['caviglia', 120, PAV - 4], lavora: ['coscia'], tempi: [1.8, .3, 1.1, .7],
      A: P(in_piedi, { busto: -88, braccio: 140, avambraccio: -30 }),
      B: { busto: -52, braccio: 176, avambraccio: 6, coscia: 5, tibia: 118, piede: 0 },
      attrezzi: [{ t: 'disco', su: 'spalla', dx: -12, dy: 4 }],
      fasi: ['Scendi (2")', 'Risali'] },
    panca30: { ancora: ['anca', 125, 140], lavora: ['busto', 'braccio'], tempi: [1.8, .3, 1.1, .6],
      A: { busto: -150, testa: -150, braccio: -90, avambraccio: -90, coscia: 12, tibia: 98, piede: 0 },
      B: { busto: -150, testa: -150, braccio: 105, avambraccio: -85, coscia: 12, tibia: 98, piede: 0 },
      attrezzi: [{ t: 'pad', da: 'anca', ang: -150, lung: 78, off: -9 }, { t: 'pad', da: 'anca', ang: 0, lung: 26, off: 9 }, { t: 'gamba', x: 125, y1: 152 }, { t: 'manubrio', su: 'mano' }],
      fasi: ['Scendi (2")', 'Spingi'] },
    dips: { ancora: ['mano', 135, 92], lavora: ['busto', 'braccio'], tempi: [1.6, .2, 1.1, .6],
      A: { busto: -82, braccio: 92, avambraccio: 90, coscia: 95, tibia: 200, piede: 200 },
      B: { busto: -64, braccio: 186, avambraccio: 85, coscia: 100, tibia: 205, piede: 205 },
      attrezzi: [{ t: 'parallela', x: 135, y: 96 }, { t: 'elastico', da: 'mano', a: 'ginocchio' }],
      fasi: ['Scendi', 'Spingi su'] },
    affondi: { ancora: ['caviglia', 150, PAV - 4], lavora: ['coscia'], tempi: [1.5, .2, 1.1, .6],
      A: P(in_piedi, { coscia: 50, tibia: 100, coscia2: 130, tibia2: 137, piede2: 60 }),
      B: P(in_piedi, { busto: -88, coscia: 10, tibia: 95, coscia2: 95, tibia2: 184, piede2: 35 }),
      attrezzi: [{ t: 'manubrio', su: 'mano' }],
      fasi: ['Scendi', 'Spingi col tallone'] },
    legext: { ancora: ['anca', 105, 132], lavora: ['coscia'], tempi: [1.1, 1, 2.2, .4],
      A: { busto: -100, testa: -95, braccio: 85, avambraccio: 15, coscia: 0, tibia: 90, piede: 0 },
      B: { busto: -100, testa: -95, braccio: 85, avambraccio: 15, coscia: 0, tibia: 6, piede: -80 },
      attrezzi: [{ t: 'pad', da: 'anca', ang: 0, lung: 40, off: 9 }, { t: 'pad', da: 'anca', ang: -100, lung: 52, off: 9 }, { t: 'gamba', x: 115, y1: 141 }, { t: 'rullo', su: 'caviglia', dx: 4, dy: 3 }],
      fasi: ['Distendi + tieni 1"', 'Torna giù lento'] },
    polpacci: { ancora: ['anca', 70, 150], lavora: ['tibia'], tempi: [.9, 1, 1.4, .4],
      A: { busto: -160, testa: -150, braccio: 70, avambraccio: 10, coscia: -35, tibia: -38, piede: -128 },
      B: { busto: -160, testa: -150, braccio: 70, avambraccio: 10, coscia: -35, tibia: -38, piede: -82 },
      attrezzi: [{ t: 'pad', da: 'anca', ang: -160, lung: 60, off: 9 }, { t: 'pad', da: 'anca', ang: 0, lung: 20, off: 9 }, { t: 'pedana', su: 'punta', ang: -128 }],
      fasi: ['Spingi sulle punte + 1"', 'Talloni giù, allunga'] },
    crunch: { ancora: ['anca', 135, 176], lavora: ['busto'], tempi: [1, .4, 1.2, .4],
      A: { busto: 180, testa: 180, braccio: -30, avambraccio: 160, coscia: -58, tibia: 62, piede: 0 },
      B: { busto: -152, testa: -145, braccio: -2, avambraccio: 188, coscia: -58, tibia: 62, piede: 0 },
      fasi: ['Arrotola su', 'Torna giù'] },
    plank: { ancora: ['mano', 165, PAV - 3], lavora: ['busto'], tempi: [1.5, 0, 1.5, 0],
      A: { busto: -3, testa: -3, braccio: 90, avambraccio: 0, coscia: 177, tibia: 178, piede: 95 },
      B: { busto: -4, testa: -4, braccio: 90, avambraccio: 0, coscia: 176.5, tibia: 178, piede: 95 },
      fasi: ['Tieni il corpo dritto', 'Tieni il corpo dritto'] },

    trapbar: { ancora: ['caviglia', 120, PAV - 4], lavora: ['coscia', 'busto'], tempi: [1.2, .4, 1.6, .5],
      A: { busto: -55, braccio: 90, avambraccio: 90, coscia: 25, tibia: 110, piede: 0 },
      B: P(in_piedi, { braccio: 90, avambraccio: 90 }),
      attrezzi: [{ t: 'disco', su: 'mano', dy: 2 }],
      fasi: ['Spingi il pavimento', 'Scendi controllato'], parteDa: 'A' },
    rematore: { ancora: ['caviglia', 125, PAV - 4], lavora: ['braccio', 'busto'], tempi: [1, .5, 1.5, .4],
      A: { busto: -38, braccio: 90, avambraccio: 90, coscia: 55, tibia: 112, piede: 0 },
      B: { busto: -38, braccio: 175, avambraccio: 95, coscia: 55, tibia: 112, piede: 0 },
      attrezzi: [{ t: 'disco', su: 'mano' }],
      fasi: ['Tira all\'ombelico', 'Scendi controllato'] },
    rumeni: { ancora: ['caviglia', 115, PAV - 4], lavora: ['coscia', 'busto'], tempi: [2, .3, 1.3, .5],
      A: P(in_piedi, { busto: -88, coscia: 92, tibia: 88, braccio: 92, avambraccio: 90 }),
      B: { busto: -18, braccio: 100, avambraccio: 100, coscia: 65, tibia: 98, piede: 0 },
      attrezzi: [{ t: 'disco', su: 'mano' }],
      fasi: ['Sedere indietro (2")', 'Anche avanti'] },
    trazioni: { ancora: ['mano', 120, 34], lavora: ['braccio', 'busto'], tempi: [1.2, .3, 1.8, .4],
      A: { busto: -90, testa: -90, braccio: -90, avambraccio: -90, coscia: 70, tibia: 120, piede: 150 },
      B: { busto: -95, testa: -90, braccio: 105, avambraccio: -75, coscia: 75, tibia: 125, piede: 150 },
      attrezzi: [{ t: 'sbarra', x: 120, y: 34 }, { t: 'elastico', da: 'mano', a: 'ginocchio' }],
      fasi: ['Tira su: mento oltre la sbarra', 'Scendi controllato'] },
    trx: { ancora: ['caviglia', 165, PAV - 4], lavora: ['braccio', 'busto'], tempi: [1.1, .4, 1.5, .4],
      A: { busto: -130, testa: -130, braccio: -30, avambraccio: -30, coscia: 50, tibia: 50, piede: -40 },
      B: { busto: -108, testa: -110, braccio: 140, avambraccio: -40, coscia: 72, tibia: 72, piede: -20 },
      attrezzi: [{ t: 'cavo', da: [182, 14], a: 'mano', giallo: true }, { t: 'aggancio', x: 182, y: 12 }],
      fasi: ['Tira il petto alle maniglie', 'Torna giù'] },
    legcurl: { ancora: ['anca', 110, 146], lavora: ['coscia'], tempi: [1.1, 1, 2.2, .4],
      A: { busto: -4, testa: -4, braccio: 90, avambraccio: 25, coscia: 180, tibia: 180, piede: 100 },
      B: { busto: -4, testa: -4, braccio: 90, avambraccio: 25, coscia: 180, tibia: -95, piede: 180 },
      attrezzi: [{ t: 'pad', da: 'anca', ang: 0, lung: 58, off: 9 }, { t: 'pad', da: 'anca', ang: 180, lung: 44, off: -9 }, { t: 'gamba', x: 110, y1: 156 }, { t: 'rullo', su: 'caviglia', dx: 0, dy: -6 }],
      fasi: ['Talloni al sedere + 1"', 'Torna lento'] },
    ginocchia: { ancora: ['mano', 120, 34], lavora: ['busto', 'coscia'], tempi: [1, .5, 1.6, .4],
      A: { busto: -90, testa: -90, braccio: -90, avambraccio: -90, coscia: 90, tibia: 90, piede: 30 },
      B: { busto: -92, testa: -90, braccio: -90, avambraccio: -90, coscia: -15, tibia: 85, piede: 30 },
      attrezzi: [{ t: 'sbarra', x: 120, y: 34 }],
      fasi: ['Ginocchia al petto', 'Giù lento, senza dondolare'] },

    military: { ancora: ['caviglia', 120, PAV - 4], lavora: ['braccio'], spalla: true, tempi: [1.1, .3, 1.6, .5],
      A: P(in_piedi, { busto: -88, testa: -88, braccio: 70, avambraccio: -85 }),
      B: P(in_piedi, { busto: -88, testa: -78, braccio: -92, avambraccio: -90 }),
      attrezzi: [{ t: 'disco', su: 'mano' }],
      fasi: ['Spingi in verticale', 'Scendi alle clavicole'] },
    shoulderpress: { ancora: ['anca', 110, 140], lavora: ['braccio'], spalla: true, tempi: [1.1, .3, 1.6, .5],
      A: { busto: -94, testa: -92, braccio: 100, avambraccio: -88, coscia: 0, tibia: 90, piede: 0 },
      B: { busto: -94, testa: -92, braccio: -92, avambraccio: -90, coscia: 0, tibia: 90, piede: 0 },
      attrezzi: [{ t: 'pad', da: 'anca', ang: 0, lung: 36, off: 9 }, { t: 'pad', da: 'anca', ang: -94, lung: 56, off: 9 }, { t: 'gamba', x: 118, y1: 149 }, { t: 'manubrio', su: 'mano' }],
      fasi: ['Spingi su', 'Scendi alle orecchie'] },
    alzate: { fronte: true, lavora: ['spalla'], tempi: [1, .3, 1.8, .4],
      A: { braccio: 97 }, B: { braccio: 8 },
      fasi: ['Alza fino alle spalle', 'Scendi lento (2–3")'] },
    pushdown: { ancora: ['caviglia', 115, PAV - 4], lavora: ['braccio'], tempi: [1, .6, 1.6, .3],
      A: P(in_piedi, { busto: -82, testa: -85, braccio: 96, avambraccio: -12 }),
      B: P(in_piedi, { busto: -82, testa: -85, braccio: 96, avambraccio: 92 }),
      attrezzi: [{ t: 'cavo', da: [158, 16], a: 'mano' }, { t: 'puleggia', x: 158, y: 16 }],
      fasi: ['Spingi giù + stringi', 'Risali lento'] },
    curl: { ancora: ['caviglia', 120, PAV - 4], lavora: ['braccio'], tempi: [1, .4, 1.6, .3],
      A: P(in_piedi, { braccio: 92, avambraccio: 92 }),
      B: P(in_piedi, { braccio: 92, avambraccio: -60 }),
      attrezzi: [{ t: 'manubrio', su: 'mano' }],
      fasi: ['Porta su, gomiti fermi', 'Scendi lento'] },
    french: { ancora: ['anca', 140, 140], lavora: ['braccio'], tempi: [1.6, .3, 1, .5],
      A: { busto: 180, testa: 180, braccio: -90, avambraccio: -90, coscia: 15, tibia: 95, piede: 0 },
      B: { busto: 180, testa: 180, braccio: -104, avambraccio: 152, coscia: 15, tibia: 95, piede: 0 },
      attrezzi: [{ t: 'pad', da: 'anca', ang: 180, lung: 70, off: -9 }, { t: 'pad', da: 'anca', ang: 0, lung: 15, off: 9 }, { t: 'gamba', x: 115, y1: 149 }, { t: 'manubrio', su: 'mano' }],
      fasi: ['Piega solo i gomiti', 'Distendi'] },

    pancapiana: { ancora: ['anca', 140, 140], lavora: ['busto', 'braccio'], tempi: [1.6, .3, 1, .5],
      A: { busto: 180, testa: 180, braccio: -90, avambraccio: -90, coscia: 15, tibia: 95, piede: 0 },
      B: { busto: 180, testa: 180, braccio: 60, avambraccio: -95, coscia: 15, tibia: 95, piede: 0 },
      attrezzi: [{ t: 'pad', da: 'anca', ang: 180, lung: 70, off: -9 }, { t: 'pad', da: 'anca', ang: 0, lung: 15, off: 9 }, { t: 'gamba', x: 115, y1: 149 }, { t: 'disco', su: 'mano' }],
      fasi: ['Scendi al petto', 'Spingi'] },
    latmachine: { ancora: ['anca', 105, 140], lavora: ['braccio', 'busto'], tempi: [1, .4, 1.6, .4],
      A: { busto: -100, testa: -95, braccio: -95, avambraccio: -95, coscia: 0, tibia: 90, piede: 0 },
      B: { busto: -104, testa: -95, braccio: 115, avambraccio: -70, coscia: 0, tibia: 90, piede: 0 },
      attrezzi: [{ t: 'pad', da: 'anca', ang: 0, lung: 36, off: 9 }, { t: 'gamba', x: 112, y1: 149 }, { t: 'cavo', da: [112, 8], a: 'mano' }, { t: 'puleggia', x: 112, y: 8 }],
      fasi: ['Tira al petto', 'Risali controllato'] },
    curlcavo: { ancora: ['caviglia', 110, PAV - 4], lavora: ['braccio'], tempi: [1, .4, 1.6, .3],
      A: P(in_piedi, { braccio: 92, avambraccio: 80 }),
      B: P(in_piedi, { braccio: 92, avambraccio: -60 }),
      attrezzi: [{ t: 'cavo', da: [165, 178], a: 'mano' }, { t: 'puleggia', x: 165, y: 178 }],
      fasi: ['Porta su', 'Scendi lento'] }
  };
  ES.chinup = ES.trazioni;

  /* ---------- geometria ---------- */
  const pt = (o, a, l) => [o[0] + l * Math.cos(a * D), o[1] + l * Math.sin(a * D)];
  function articolazioni(p) {
    const J = { anca: [0, 0] };
    J.spalla = pt(J.anca, p.busto, L.busto);
    J.testa = pt(J.spalla, p.testa ?? p.busto, L.testa);
    J.collo = pt(J.spalla, p.testa ?? p.busto, 4);
    J.gomito = pt(J.spalla, p.braccio, L.braccio);
    J.mano = pt(J.gomito, p.avambraccio, L.avambraccio);
    J.ginocchio = pt(J.anca, p.coscia, L.coscia);
    J.caviglia = pt(J.ginocchio, p.tibia, L.tibia);
    J.punta = pt(J.caviglia, p.piede ?? 0, L.piede);
    if (p.coscia2 != null) {
      J.ginocchio2 = pt(J.anca, p.coscia2, L.coscia);
      J.caviglia2 = pt(J.ginocchio2, p.tibia2, L.tibia);
      J.punta2 = pt(J.caviglia2, p.piede2 ?? 0, L.piede);
    }
    return J;
  }
  function interpola(A, B, t) {
    const o = {};
    for (const k of Object.keys(A)) o[k] = B[k] == null ? A[k] : A[k] + (B[k] - A[k]) * t;
    return o;
  }

  /* ---------- disegno ---------- */
  const COL = { corpo: '#dbe7e1', dietro: '#7d9188', lavora: '#4ade80', attrezzo: '#9db0a8', ferro: '#c8d3ce', elastico: '#facc15' };
  const seg = (a, b, w, c) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

  function disegnaLato(def, posa) {
    let J = articolazioni(posa);
    const [nome, ax, ay] = def.ancora;
    const dx = ax - J[nome][0], dy = ay - J[nome][1];
    for (const k in J) J[k] = [J[k][0] + dx, J[k][1] + dy];
    const lav = def.lavora || [];
    const c = n => lav.includes(n) ? COL.lavora : COL.corpo;
    let fondo = '', sopra = '';
    for (const a of def.attrezzi || []) {
      const s = attrezzo(a, J);
      if (a.t === 'pad' || a.t === 'gamba' || a.t === 'parallela' || a.t === 'sbarra' || a.t === 'aggancio' || a.t === 'puleggia') fondo += s; else sopra += s;
    }
    let f = '';
    // gamba e braccio «dietro» (più scuri)
    if (J.ginocchio2) f += seg(J.anca, J.ginocchio2, 11, COL.dietro) + seg(J.ginocchio2, J.caviglia2, 9, COL.dietro) + seg(J.caviglia2, J.punta2, 6, COL.dietro);
    f += seg(J.anca, J.ginocchio, 12, c('coscia')) + seg(J.ginocchio, J.caviglia, 9.5, c('tibia')) + seg(J.caviglia, J.punta, 6, COL.corpo);
    f += seg(J.anca, J.spalla, 15, c('busto'));
    f += `<circle cx="${J.testa[0].toFixed(1)}" cy="${J.testa[1].toFixed(1)}" r="9" fill="${COL.corpo}"/>`;
    if (def.spalla || lav.includes('spalla')) f += `<circle cx="${J.spalla[0].toFixed(1)}" cy="${J.spalla[1].toFixed(1)}" r="7.5" fill="${COL.lavora}"/>`;
    f += seg(J.spalla, J.gomito, 8.5, c('braccio')) + seg(J.gomito, J.mano, 7, COL.corpo);
    return fondo + f + sopra;
  }

  function attrezzo(a, J) {
    const su = n => J[n];
    switch (a.t) {
      case 'disco': { const p = su(a.su); const x = p[0] + (a.dx || 0), y = p[1] + (a.dy || 0);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="none" stroke="${COL.ferro}" stroke-width="5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${COL.ferro}"/>`; }
      case 'manubrio': { const p = su(a.su);
        return `<rect x="${(p[0] - 9).toFixed(1)}" y="${(p[1] - 4).toFixed(1)}" width="18" height="8" rx="3" fill="${COL.ferro}"/>`; }
      case 'pad': { const o = su(a.da), d = [Math.cos(a.ang * D), Math.sin(a.ang * D)], n = [-d[1] * a.off, d[0] * a.off];
        const p1 = [o[0] + n[0], o[1] + n[1]], p2 = [p1[0] + d[0] * a.lung, p1[1] + d[1] * a.lung];
        return seg(p1, p2, 7, COL.attrezzo); }
      case 'gamba': return seg([a.x, a.y1], [a.x, PAV], 4, COL.attrezzo);
      case 'parallela': return seg([a.x - 14, a.y], [a.x + 14, a.y], 5, COL.attrezzo) + seg([a.x, a.y], [a.x, PAV], 4, COL.attrezzo);
      case 'sbarra': return seg([a.x - 30, a.y - 1], [a.x + 30, a.y - 1], 3, COL.attrezzo) + `<circle cx="${a.x}" cy="${a.y}" r="4" fill="${COL.ferro}"/>`;
      case 'elastico': return seg(su(a.da), su(a.a), 2.5, COL.elastico);
      case 'rullo': { const p = su(a.su); return `<circle cx="${(p[0] + (a.dx || 0)).toFixed(1)}" cy="${(p[1] + (a.dy || 0)).toFixed(1)}" r="6" fill="${COL.attrezzo}"/>`; }
      case 'pedana': { const p = su(a.su), d = [Math.cos(a.ang * D), Math.sin(a.ang * D)];
        return seg([p[0] - d[0] * 8, p[1] - d[1] * 8], [p[0] + d[0] * 30, p[1] + d[1] * 30], 6, COL.attrezzo); }
      case 'cavo': return seg(a.da, su(a.a), 2, a.giallo ? COL.elastico : COL.attrezzo);
      case 'puleggia': return `<circle cx="${a.x}" cy="${a.y}" r="5" fill="none" stroke="${COL.attrezzo}" stroke-width="3"/>`;
      case 'aggancio': return seg([a.x - 18, a.y - 8], [a.x + 18, a.y - 8], 4, COL.attrezzo);
    }
    return '';
  }

  function disegnaFronte(def, posa) {
    const cx = 120, spY = 74, anY = 120, lav = def.lavora || [];
    const sp = [[cx - 17, spY], [cx + 17, spY]];
    let f = '';
    for (const lato of [-1, 1]) {
      const a = lato > 0 ? posa.braccio : 180 - posa.braccio;
      const s = lato > 0 ? sp[1] : sp[0];
      const g = pt(s, a, L.braccio), m = pt(g, lato > 0 ? a - 6 : a + 6, L.avambraccio);
      f += seg([cx + lato * 8, anY], [cx + lato * 10, anY + 40], 12, COL.corpo) + seg([cx + lato * 10, anY + 40], [cx + lato * 10, PAV - 4], 9.5, COL.corpo);
      f += seg(s, g, 8.5, COL.corpo) + seg(g, m, 7, COL.corpo);
      f += `<rect x="${(m[0] - 4).toFixed(1)}" y="${(m[1] - 9).toFixed(1)}" width="8" height="18" rx="3" fill="${COL.ferro}"/>`;
      if (lav.includes('spalla')) f += `<circle cx="${s[0]}" cy="${s[1]}" r="8" fill="${COL.lavora}"/>`;
    }
    f = `<path d="M${cx - 18} ${spY - 3} L${cx + 18} ${spY - 3} L${cx + 11} ${anY + 4} L${cx - 11} ${anY + 4} Z" fill="${COL.corpo}"/>` +
      `<circle cx="${cx}" cy="${spY - 18}" r="10" fill="${COL.corpo}"/>` + f;
    return f;
  }

  /* ---------- animazione ---------- */
  const attive = new Set();
  const liscia = t => t * t * (3 - 2 * t);
  function fotogramma(def, sec) {
    const [t1, p1, t2, p2] = def.tempi || [1.2, .3, 1.2, .3];
    const tot = t1 + p1 + t2 + p2, x = sec % tot;
    let k, fase;
    if (x < t1) { k = liscia(x / t1); fase = 0; }
    else if (x < t1 + p1) { k = 1; fase = 0; }
    else if (x < t1 + p1 + t2) { k = 1 - liscia((x - t1 - p1) / t2); fase = 1; }
    else { k = 0; fase = 1; }
    const posa = interpola(def.A, def.B, k);
    return { svg: def.fronte ? disegnaFronte(def, posa) : disegnaLato(def, posa), fase };
  }
  function giro(ora) {
    for (const el of attive) {
      if (!el.isConnected) { attive.delete(el); continue; }
      const def = ES[el.dataset.anim];
      const f = fotogramma(def, (ora - el._t0) / 1000);
      el.querySelector('g.omino').innerHTML = f.svg;
      const etich = el.querySelector('.fase');
      if (etich && def.fasi) etich.textContent = def.fasi[f.fase];
    }
    if (attive.size) requestAnimationFrame(giro); else inCorso = false;
  }
  let inCorso = false;

  return {
    ha: id => !!ES[id],
    /* html del riquadro; poi chiamare ANIM.avvia() dopo averlo messo nella pagina */
    html(id, classe = '') {
      if (!ES[id]) return '';
      const def = ES[id];
      const statico = fotogramma(def, 0).svg;
      return `<div class="anim ${classe}" data-anim="${id}"><svg viewBox="0 -22 240 222" aria-hidden="true">
        <line x1="0" y1="${PAV}" x2="240" y2="${PAV}" stroke="#2f3d37" stroke-width="2"/><g class="omino">${statico}</g></svg>
        ${def.fasi ? '<div class="fase"></div>' : ''}</div>`;
    },
    avvia() {
      document.querySelectorAll('.anim[data-anim]').forEach(el => {
        if (attive.has(el)) return;
        el._t0 = performance.now(); attive.add(el);
      });
      if (!inCorso && attive.size) { inCorso = true; requestAnimationFrame(giro); }
    },
    elenco: () => Object.keys(ES),
    prova(id, k) { const def = ES[id], posa = interpola(def.A, def.B, k); return `<svg viewBox="0 -22 240 222"><line x1="0" y1="${PAV}" x2="240" y2="${PAV}" stroke="#2f3d37" stroke-width="2"/>${def.fronte ? disegnaFronte(def, posa) : disegnaLato(def, posa)}</svg>`; }
  };
})();
