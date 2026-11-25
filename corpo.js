/* Coach Palestra – corpo umano con i muscoli (davanti e dietro).
   Serve per i muscoli che lavorano, le zone a rischio e per segnare i dolori:
   prima si sceglie la parte del corpo (macro), poi si zooma e si tocca il punto preciso.
   Disegno originale: metà sinistra del foglio, l'altra metà è lo specchio. viewBox 200 × 460. */
'use strict';

const CORPO = (() => {
  /* Zone «generali» (usate da dettagli.js, dai vecchi dolori e dalle statistiche) */
  const NOMI = {
    testa: 'Testa', collo: 'Collo', trapezio: 'Collo / trapezio', spalla: 'Spalla', petto: 'Petto',
    braccio: 'Bicipite', tricipite: 'Tricipite', gomito: 'Gomito', avambraccio: 'Avambraccio', mano: 'Polso / mano',
    addome: 'Addome', anca: 'Anca / inguine', coscia: 'Coscia (davanti)', femorale: 'Coscia (dietro)',
    ginocchio: 'Ginocchio', stinco: 'Stinco', polpaccio: 'Polpaccio', caviglia: 'Caviglia', achille: 'Tendine d\'Achille',
    piede: 'Piede', dorsale: 'Schiena alta / scapola', lombare: 'Schiena bassa (lombare)', gluteo: 'Gluteo'
  };

  /* Parti del corpo da scegliere per prime */
  const MACRO = {
    testa: { n: 'Testa e collo', corto: 'Testa e collo', viste: ['f', 'r'], tinta: '#677d71' },
    busto: { n: 'Petto e addome', corto: 'Petto e addome', viste: ['f'], tinta: '#46594f' },
    schiena: { n: 'Schiena', corto: 'Schiena', viste: ['r'], tinta: '#46594f' },
    braccio: { n: 'Spalla e braccio', corto: 'Braccio', doppia: true, viste: ['f', 'r'], tinta: '#6c8377' },
    coscia: { n: 'Anca, gluteo e coscia', corto: 'Coscia', doppia: true, viste: ['f', 'r'], tinta: '#4b5f55' },
    gamba: { n: 'Ginocchio, gamba e piede', corto: 'Gamba', doppia: true, viste: ['f', 'r'], tinta: '#677d71' }
  };
  const MACRO_LISTA = ['testa', 'busto', 'schiena', 'braccio_dx', 'braccio_sx', 'coscia_dx', 'coscia_sx', 'gamba_dx', 'gamba_sx'];

  /* Zone precise: id → [nome, zona generale, parte del corpo, centrale (senza lato)] */
  const Z = {
    testa: ['Testa', 'testa', 'testa', 1],
    collo_ant: ['Collo (davanti)', 'collo', 'testa', 1],
    collo_lat: ['Lato del collo', 'collo', 'testa'],
    cervicale: ['Collo dietro (cervicale)', 'collo', 'testa', 1],

    pettorale: ['Pettorale', 'petto', 'busto'],
    costato: ['Costole (sotto l\'ascella)', 'petto', 'busto'],
    addome_alto: ['Addome sopra l\'ombelico', 'addome', 'busto', 1],
    addome_basso: ['Addome sotto l\'ombelico', 'addome', 'busto', 1],
    obliquo: ['Fianco (obliquo)', 'addome', 'busto'],

    trap_sup: ['Trapezio (tra collo e spalla)', 'trapezio', 'schiena'],
    trap_inf: ['Tra le scapole', 'dorsale', 'schiena'],
    scapola: ['Scapola', 'dorsale', 'schiena'],
    dorsale: ['Dorsale (lato della schiena)', 'dorsale', 'schiena'],
    lombare: ['Schiena bassa (lombare)', 'lombare', 'schiena'],
    fianco: ['Fianco, sopra l\'anca', 'lombare', 'schiena'],
    sacro: ['Osso sacro / coccige', 'lombare', 'schiena', 1],

    delt_ant: ['Spalla davanti', 'spalla', 'braccio'],
    delt_lat: ['Spalla, lato esterno', 'spalla', 'braccio'],
    delt_post: ['Spalla dietro', 'spalla', 'braccio'],
    bicipite: ['Bicipite', 'braccio', 'braccio'],
    tricipite: ['Tricipite', 'tricipite', 'braccio'],
    piega_gomito: ['Piega del gomito', 'gomito', 'braccio'],
    epicondilo: ['Gomito, lato esterno', 'gomito', 'braccio'],
    epitroclea: ['Gomito, lato interno', 'gomito', 'braccio'],
    olecrano: ['Punta del gomito', 'gomito', 'braccio'],
    flessori: ['Avambraccio (interno)', 'avambraccio', 'braccio'],
    brachiorad: ['Avambraccio (lato del pollice)', 'avambraccio', 'braccio'],
    estensori: ['Avambraccio (dorso)', 'avambraccio', 'braccio'],
    polso: ['Polso', 'mano', 'braccio'],
    mano: ['Mano', 'mano', 'braccio'],

    anca: ['Anca / inguine', 'anca', 'coscia'],
    adduttori: ['Interno coscia (adduttori)', 'anca', 'coscia'],
    vasto_lat: ['Coscia, lato esterno', 'coscia', 'coscia'],
    retto_fem: ['Coscia davanti (centro)', 'coscia', 'coscia'],
    vasto_med: ['Coscia sopra il ginocchio (interno)', 'coscia', 'coscia'],
    gluteo_med: ['Gluteo, parte alta esterna', 'gluteo', 'coscia'],
    gluteo: ['Gluteo', 'gluteo', 'coscia'],
    bic_fem: ['Coscia dietro, lato esterno', 'femorale', 'coscia'],
    semiten: ['Coscia dietro, lato interno', 'femorale', 'coscia'],

    sopra_rotula: ['Sopra la rotula (tendine)', 'ginocchio', 'gamba'],
    rotula: ['Rotula', 'ginocchio', 'gamba'],
    sotto_rotula: ['Sotto la rotula (tendine)', 'ginocchio', 'gamba'],
    ginocchio_int: ['Ginocchio, lato interno', 'ginocchio', 'gamba'],
    ginocchio_est: ['Ginocchio, lato esterno', 'ginocchio', 'gamba'],
    poplite: ['Dietro il ginocchio', 'ginocchio', 'gamba'],
    tibiale: ['Stinco (muscolo, lato esterno)', 'stinco', 'gamba'],
    tibia: ['Stinco (osso)', 'stinco', 'gamba'],
    gemello_est: ['Polpaccio, lato esterno', 'polpaccio', 'gamba'],
    gemello_int: ['Polpaccio, lato interno', 'polpaccio', 'gamba'],
    soleo: ['Polpaccio basso', 'polpaccio', 'gamba'],
    achille: ['Tendine d\'Achille', 'achille', 'gamba'],
    malleolo_est: ['Caviglia, lato esterno', 'caviglia', 'gamba'],
    malleolo_int: ['Caviglia, lato interno', 'caviglia', 'gamba'],
    caviglia_ant: ['Caviglia davanti', 'caviglia', 'gamba'],
    piede: ['Piede (dorso)', 'piede', 'gamba'],
    tallone: ['Tallone', 'piede', 'gamba']
  };

  /* Forme: p = punti della metà sinistra (x,y,x,y…), c = centrale (metà sinistra dall'alto in basso, sull'asse x=100),
     e = ellisse [cx, cy, rx, ry]. L'ordine è quello di disegno (sotto → sopra). */
  const BRACCIO_LAT = { p: [46, 89, 37, 96, 33, 112, 37, 128, 44, 124, 43, 106] };
  const POLSO = { p: [25, 250, 38, 250, 38.5, 262, 25, 263] };
  const MANO = { p: [25, 263, 38.5, 262, 41, 278, 37, 297, 29, 300, 22, 290, 20, 274] };
  const DIS = {
    f: [
      ['collo_ant', { c: [100, 62, 92, 62, 90, 74, 89, 85, 100, 87] }],
      ['collo_lat', { p: [92, 60, 86, 63, 82, 78, 78, 88, 89, 86, 90, 74] }],
      ['testa', { e: [100, 36, 20, 27] }],
      ['addome_alto', { c: [100, 141, 88, 142, 85, 160, 85, 190, 100, 192] }],
      ['addome_basso', { c: [100, 192, 85, 192, 86, 216, 91, 234, 100, 240] }],
      ['obliquo', { p: [84, 144, 72, 142, 66, 166, 66, 190, 68, 208, 76, 220, 86, 218, 85, 192, 84, 166] }],
      ['costato', { p: [64, 134, 56, 124, 54, 140, 58, 160, 66, 166, 70, 150, 70, 138] }],
      ['pettorale', { p: [99, 92, 86, 88, 70, 88, 58, 93, 53, 104, 56, 120, 66, 134, 82, 140, 99, 138] }],
      ['anca', { p: [91, 234, 86, 218, 76, 220, 68, 208, 62, 216, 60, 232, 72, 240, 88, 248, 96, 246] }],
      ['adduttori', { p: [96, 246, 88, 248, 84, 250, 86, 262, 84, 296, 88, 292, 96, 312, 97, 280, 98, 254] }],
      ['vasto_lat', { p: [60, 232, 55, 252, 54, 290, 58, 316, 66, 332, 70, 324, 66, 292, 66, 256, 72, 240] }],
      ['retto_fem', { p: [72, 240, 66, 256, 66, 292, 70, 324, 76, 328, 84, 300, 86, 262, 84, 249] }],
      ['vasto_med', { p: [88, 292, 84, 300, 78, 328, 86, 334, 94, 330, 96, 312] }],
      ['tibiale', { p: [73, 363, 66, 366, 64, 384, 68, 404, 74, 420, 78, 420, 77, 392, 76, 366] }],
      ['tibia', { p: [77, 364, 84, 364, 86, 390, 83, 420, 78, 420, 78, 392] }],
      ['gemello_int', { p: [85, 362, 93, 362, 96, 380, 92, 400, 86, 406, 86, 388] }],
      ['ginocchio_est', { p: [72, 334, 66, 334, 64, 348, 67, 362, 73, 360, 72, 348] }],
      ['ginocchio_int', { p: [88, 334, 95, 334, 96, 348, 92, 362, 86, 360, 88, 348] }],
      ['sopra_rotula', { e: [80, 330, 7, 4] }],
      ['rotula', { e: [80, 343, 7.5, 8.5] }],
      ['sotto_rotula', { e: [80, 358, 4.5, 5] }],
      ['piede', { p: [74, 433, 70, 442, 70, 450, 78, 454, 94, 454, 93, 444, 88, 434] }],
      ['malleolo_est', { e: [73, 428, 3.5, 4.5] }],
      ['caviglia_ant', { e: [81, 429, 4.5, 4] }],
      ['malleolo_int', { e: [89, 427, 3.5, 4.5] }],
      ['tricipite', { p: [37, 128, 32, 142, 30, 164, 33, 180, 38, 172, 36, 150, 40, 128] }],
      ['bicipite', { p: [48, 122, 40, 128, 36, 150, 38, 172, 44, 180, 50, 164, 52, 140] }],
      ['delt_ant', { p: [60, 90, 50, 88, 44, 94, 43, 108, 48, 122, 54, 118, 56, 104] }],
      ['delt_lat', BRACCIO_LAT],
      ['flessori', { p: [48, 194, 38, 192, 31, 200, 29, 226, 31, 250, 37, 251, 43, 228, 47, 206] }],
      ['brachiorad', { p: [32, 192, 26, 198, 23, 220, 26, 244, 30, 250, 29, 226, 31, 200] }],
      ['piega_gomito', { e: [42, 186, 6, 5] }],
      ['epicondilo', { e: [32, 187, 4, 5] }],
      ['epitroclea', { e: [49, 188, 4, 5] }],
      ['polso', POLSO],
      ['mano', MANO]
    ],
    r: [
      ['cervicale', { c: [100, 62, 90, 62, 88, 76, 88, 86, 100, 88] }],
      ['testa', { e: [100, 36, 20, 27] }],
      ['trap_inf', { p: [100, 106, 84, 102, 76, 112, 80, 138, 90, 162, 100, 178] }],
      ['scapola', { p: [84, 102, 62, 99, 57, 112, 62, 134, 74, 144, 80, 138, 76, 112] }],
      ['dorsale', { p: [62, 134, 56, 128, 55, 148, 62, 174, 72, 196, 86, 202, 92, 182, 90, 162, 80, 138, 74, 144] }],
      ['lombare', { p: [100, 178, 92, 170, 91, 186, 86, 204, 86, 224, 100, 228] }],
      ['fianco', { p: [72, 196, 65, 190, 63, 210, 70, 218, 86, 222, 86, 204] }],
      ['trap_sup', { p: [100, 88, 89, 84, 87, 72, 83, 81, 66, 86, 50, 92, 62, 99, 84, 102, 100, 106] }],
      ['gluteo_med', { p: [86, 220, 72, 216, 62, 224, 61, 238, 74, 234, 88, 234] }],
      ['gluteo', { p: [88, 234, 74, 234, 61, 238, 59, 256, 66, 270, 80, 274, 94, 270, 98, 258, 96, 240] }],
      ['sacro', { c: [100, 228, 93, 229, 94, 246, 100, 258] }],
      ['bic_fem', { p: [62, 262, 56, 280, 57, 312, 64, 332, 76, 334, 77, 300, 74, 274, 66, 270] }],
      ['semiten', { p: [74, 274, 77, 300, 76, 334, 88, 332, 94, 310, 97, 280, 96, 268, 80, 274] }],
      ['gemello_est', { p: [70, 352, 63, 362, 62, 380, 66, 394, 74, 398, 80, 386, 80, 356] }],
      ['gemello_int', { p: [80, 356, 80, 386, 86, 396, 94, 388, 97, 370, 94, 356, 88, 350] }],
      ['soleo', { p: [66, 394, 70, 410, 76, 420, 84, 420, 90, 408, 94, 388, 86, 396, 80, 390, 74, 398] }],
      ['achille', { p: [77, 418, 84, 418, 85, 432, 76, 432] }],
      ['ginocchio_est', { p: [68, 334, 62, 336, 62, 350, 66, 358, 71, 352, 70, 342] }],
      ['ginocchio_int', { p: [91, 334, 97, 336, 97, 350, 93, 358, 89, 352, 90, 342] }],
      ['poplite', { e: [80, 343, 10, 8] }],
      ['tallone', { e: [80, 444, 8, 8] }],
      ['malleolo_est', { e: [72, 430, 3.5, 4.5] }],
      ['malleolo_int', { e: [89, 430, 3.5, 4.5] }],
      ['tricipite', { p: [48, 122, 40, 128, 33, 140, 30, 164, 34, 182, 46, 182, 51, 160, 52, 136] }],
      ['delt_post', { p: [62, 99, 50, 92, 44, 96, 43, 110, 48, 122, 56, 116, 60, 106] }],
      ['delt_lat', BRACCIO_LAT],
      ['estensori', { p: [46, 195, 32, 194, 26, 204, 24, 230, 27, 250, 37, 251, 42, 228, 46, 208] }],
      ['olecrano', { e: [39, 188, 6, 6] }],
      ['epicondilo', { e: [31, 189, 4, 5] }],
      ['epitroclea', { e: [48, 189, 4, 5] }],
      ['polso', POLSO],
      ['mano', MANO]
    ]
  };
  /* Sagoma sotto i muscoli (riempie le fessure) */
  const PELLE = [
    { c: [100, 60, 90, 60, 88, 84, 62, 86, 46, 90, 50, 120, 54, 140, 58, 166, 64, 190, 62, 212, 58, 232, 70, 240, 96, 248, 100, 250] },
    { p: [46, 88, 36, 95, 32, 112, 29, 140, 29, 165, 31, 186, 25, 198, 22, 222, 24, 250, 20, 274, 22, 290, 29, 300, 37, 297, 41, 278, 38.5, 262, 39, 250, 44, 228, 48, 206, 50, 188, 51, 164, 53, 138, 52, 118, 50, 96] },
    { p: [60, 226, 55, 252, 54, 292, 58, 318, 64, 336, 62, 356, 62, 378, 66, 398, 73, 420, 71, 434, 69, 446, 76, 455, 94, 455, 93, 442, 90, 432, 90, 420, 94, 398, 97, 372, 96, 350, 97, 330, 96, 310, 97, 282, 98, 254, 100, 250] }
  ];
  /* Linee di dettaglio (non si toccano) */
  const DECOR = {
    f: 'M100 143 L100 236 M86 160 Q100 163 114 160 M86 176 Q100 179 114 176 M98.5 194 a1.5 1.5 0 1 0 3 0 a1.5 1.5 0 1 0 -3 0',
    r: 'M100 108 L100 226'
  };

  /* ---------- geometria ---------- */
  const W = 200, H = 460;
  const coppie = a => { const r = []; for (let i = 0; i < a.length; i += 2) r.push([a[i], a[i + 1]]); return r; };
  const fx = p => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  function liscia(pts) { // curva chiusa morbida (Catmull-Rom → Bézier)
    const n = pts.length; let d = 'M' + fx(pts[0]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += 'C' + fx([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + fx([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + fx(p2);
    }
    return d + 'Z';
  }
  function geo(forma, specchio) {
    if (forma.e) { const [cx, cy, rx, ry] = forma.e; return { e: [specchio ? W - cx : cx, cy, rx, ry] }; }
    let pts = coppie(forma.p || forma.c);
    if (forma.c) pts = pts.concat(pts.slice(1, -1).reverse().map(([x, y]) => [W - x, y]));
    else if (specchio) pts = pts.map(([x, y]) => [W - x, y]);
    return { pts, d: liscia(pts) };
  }
  const tag = g => g.e ? `<ellipse cx="${g.e[0]}" cy="${g.e[1]}" rx="${g.e[2]}" ry="${g.e[3]}"` : `<path d="${g.d}"`;

  // davanti: la metà sinistra del disegno è il tuo lato destro (come allo specchio); dietro è il tuo sinistro
  const latoSinistraFoglio = v => v === 'f' ? 'dx' : 'sx';
  const altro = l => l === 'dx' ? 'sx' : 'dx';
  const INST = {};
  for (const v of ['f', 'r']) {
    INST[v] = [];
    for (const [base, forma] of DIS[v]) {
      const [nomeZ, gruppo, macro, centrale] = Z[base];
      const varianti = centrale ? [[base, false, null]] : [[base + '_' + latoSinistraFoglio(v), false, latoSinistraFoglio(v)], [base + '_' + altro(latoSinistraFoglio(v)), true, altro(latoSinistraFoglio(v))]];
      for (const [id, specchio, lato] of varianti)
        INST[v].push({ id, base, gruppo, lato, macro: MACRO[macro].doppia ? macro + '_' + lato : macro, g: geo(forma, specchio) });
    }
  }
  const PELLE_HTML = PELLE.flatMap(f => f.c ? [geo(f, false)] : [geo(f, false), geo(f, true)]).map(g => `<path d="${g.d}"/>`).join('');

  function bbox(macro, v) {
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (const i of INST[v]) {
      if (i.macro !== macro) continue;
      const pts = i.g.e ? [[i.g.e[0] - i.g.e[2], i.g.e[1] - i.g.e[3]], [i.g.e[0] + i.g.e[2], i.g.e[1] + i.g.e[3]]] : i.g.pts;
      for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
    const m = 7;
    return [x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m].map(n => +n.toFixed(1));
  }

  /* ---------- nomi ---------- */
  const dividi = id => { const m = /^(.*)_(dx|sx)$/.exec(id); return m ? [m[1], m[2]] : [id, null]; };
  const latoTxt = l => l === 'dx' ? ' (destra)' : l === 'sx' ? ' (sinistra)' : '';
  function nome(id) { const [b, l] = dividi(id); return (Z[b] ? Z[b][0] : NOMI[b] || b) + latoTxt(l); }
  function gruppo(id) { const b = dividi(id)[0]; return Z[b] ? Z[b][1] : b; }
  function macroNome(m) { const [b, l] = dividi(m); return MACRO[b].n + (l === 'dx' ? ' – destra' : l === 'sx' ? ' – sinistra' : ''); }
  function macroCorto(m) { const [b, l] = dividi(m); return MACRO[b].corto + (l ? ' ' + l : ''); }
  function zoneDi(macro) {
    const visti = new Set(), out = [], doppia = !!dividi(macro)[1];
    for (const v of ['f', 'r']) for (const i of INST[v]) {
      if (i.macro !== macro || visti.has(i.id)) continue;
      visti.add(i.id); out.push({ id: i.id, nome: doppia ? Z[i.base][0] : nome(i.id) });
    }
    return out;
  }

  /* ---------- disegno ---------- */
  function coloreScelta(scelte, i) {
    if (!scelte) return null;
    return scelte[i.id] || (i.lato && scelte[i.gruppo + '_' + i.lato]) || scelte[i.gruppo] || null;
  }
  /* opz: { modo: 'macro' | 'zona', macro, sel, verde: [zone generali], rosso: [...], scelte: {id: colore}, vb: [x,y,w,h], anima } */
  function vista(v, opz = {}) {
    let s = `<g class="pelle">${PELLE_HTML}</g>`;
    for (const i of INST[v]) {
      let fill = '#3b4d45', cls = 'z', att = '';
      if (opz.modo === 'macro') { fill = MACRO[dividi(i.macro)[0]].tinta; att = ` data-a="macro" data-macro="${i.macro}"`; cls += ' attiva'; }
      else if (opz.modo === 'zona') {
        if (i.macro === opz.macro) { fill = '#587266'; att = ` data-a="zona-tmp" data-zona="${i.id}"`; cls += ' attiva'; }
        else fill = '#26322d';
      }
      if ((opz.verde || []).includes(i.gruppo)) fill = '#22c55e';
      if ((opz.rosso || []).includes(i.gruppo)) fill = '#ef4444';
      const giaSegnato = coloreScelta(opz.scelte, i);
      if (giaSegnato) fill = opz.modo === 'zona' ? '#8a4f22' : giaSegnato; // da vicino: più scuro, per distinguerlo dalla scelta
      if (opz.sel && opz.sel === i.id) cls += ' sel';
      s += tag(i.g) + ` class="${cls}" fill="${fill}"${att}/>`;
    }
    s += `<path class="decor" d="${DECOR[v]}"/>`;
    if (!opz.vb) {
      const [a, b] = v === 'f' ? ['destra', 'sinistra'] : ['sinistra', 'destra'];
      s += `<text x="3" y="12" class="lato">${a}</text><text x="197" y="12" class="lato" text-anchor="end">${b}</text>`;
    }
    const vb = (opz.vb || [0, 0, W, H]).join(' ');
    const anima = opz.vb && opz.anima ? ` data-anima="${vb}"` : '';
    return `<svg viewBox="${anima ? `0 0 ${W} ${H}` : vb}" class="corpo-svg"${anima}>${s}</svg>`;
  }

  /* Davanti + dietro, corpo intero */
  function doppia(opz = {}) {
    return `<div class="corpo"><div><div class="etichetta">Davanti</div>${vista('f', opz)}</div><div><div class="etichetta">Dietro</div>${vista('r', opz)}</div></div>`;
  }

  /* Una parte del corpo da vicino: le zone si toccano */
  function zoom(macro, opz = {}) {
    const viste = MACRO[dividi(macro)[0]].viste;
    return `<div class="corpo-zoom" style="grid-template-columns:repeat(${viste.length},1fr)">${viste.map(v =>
      `<div><div class="etichetta">${v === 'f' ? 'Davanti' : 'Dietro'}</div>${vista(v, Object.assign({}, opz, { modo: 'zona', macro, vb: bbox(macro, v) }))}</div>`).join('')}</div>`;
  }

  /* Zoom animato dal corpo intero alla parte scelta */
  function anima(radice) {
    const svgs = [...(radice || document).querySelectorAll('svg[data-anima]')];
    if (!svgs.length) return;
    const da = [0, 0, W, H], t0 = performance.now(), dur = 420;
    const passo = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      for (const el of svgs) {
        const a = el.dataset.anima.split(' ').map(Number);
        el.setAttribute('viewBox', da.map((x, j) => (x + (a[j] - x) * e).toFixed(2)).join(' '));
      }
      if (k < 1) requestAnimationFrame(passo); else svgs.forEach(el => el.removeAttribute('data-anima'));
    };
    requestAnimationFrame(passo);
  }

  /* Cambia la zona evidenziata senza ridisegnare */
  function evidenzia(radice, id) {
    radice.querySelectorAll('.corpo-svg .z').forEach(el => el.classList.toggle('sel', el.dataset.zona === id));
  }

  return { nome, gruppo, vista, doppia, zoom, anima, evidenzia, zoneDi, macroNome, macroCorto, MACRO_LISTA, NOMI };
})();
