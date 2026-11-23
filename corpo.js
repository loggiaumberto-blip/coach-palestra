/* Coach Palestra – corpo umano interattivo (davanti e dietro) per i muscoli e i dolori. */
'use strict';

const CORPO = (() => {
  const NOMI = {
    testa: 'Testa', collo: 'Collo', trapezio: 'Collo / trapezio', spalla: 'Spalla', petto: 'Petto',
    braccio: 'Bicipite', tricipite: 'Tricipite', gomito: 'Gomito', avambraccio: 'Avambraccio', mano: 'Polso / mano',
    addome: 'Addome', anca: 'Anca / inguine', coscia: 'Coscia (davanti)', femorale: 'Coscia (dietro)',
    ginocchio: 'Ginocchio', stinco: 'Stinco', polpaccio: 'Polpaccio', caviglia: 'Caviglia', achille: 'Tendine d\'Achille',
    piede: 'Piede', dorsale: 'Schiena alta / scapola', lombare: 'Schiena bassa (lombare)', gluteo: 'Gluteo'
  };
  // forme per il lato SINISTRO del disegno: e = ellisse [cx,cy,rx,ry], r = rettangolo [x,y,w,h,raggio]
  const FRONTE = [
    ['testa', 'e', [60, 18, 12, 14], 0], ['collo', 'r', [53, 31, 14, 9, 3], 0],
    ['spalla', 'e', [37, 47, 10, 9], 1], ['petto', 'r', [45, 40, 15, 25, 6], 1],
    ['braccio', 'r', [24, 55, 11, 31, 5], 1], ['gomito', 'e', [29, 91, 6, 5], 1],
    ['avambraccio', 'r', [20, 97, 10, 28, 5], 1], ['mano', 'e', [24, 132, 6, 7], 1],
    ['addome', 'r', [46, 66, 28, 36, 6], 0], ['anca', 'r', [44, 103, 15, 15, 5], 1],
    ['coscia', 'r', [43, 119, 15, 50, 7], 1], ['ginocchio', 'e', [50, 175, 8, 7], 1],
    ['stinco', 'r', [44, 183, 12, 40, 6], 1], ['caviglia', 'e', [50, 229, 6, 5], 1], ['piede', 'e', [48, 241, 8, 5], 1]
  ];
  const RETRO = [
    ['testa', 'e', [60, 18, 12, 14], 0], ['trapezio', 'r', [47, 31, 26, 12, 5], 0],
    ['spalla', 'e', [37, 47, 10, 9], 1], ['dorsale', 'r', [45, 44, 15, 30, 6], 1],
    ['tricipite', 'r', [24, 55, 11, 31, 5], 1], ['gomito', 'e', [29, 91, 6, 5], 1],
    ['avambraccio', 'r', [20, 97, 10, 28, 5], 1], ['mano', 'e', [24, 132, 6, 7], 1],
    ['lombare', 'r', [46, 75, 28, 26, 6], 0], ['gluteo', 'r', [44, 102, 15, 20, 7], 1],
    ['femorale', 'r', [43, 123, 15, 46, 7], 1], ['ginocchio', 'e', [50, 175, 8, 7], 1],
    ['polpaccio', 'r', [44, 183, 12, 40, 6], 1], ['achille', 'e', [50, 229, 6, 5], 1], ['piede', 'e', [48, 241, 8, 5], 1]
  ];

  function nome(id) {
    const [base, lato] = id.split('_');
    return (NOMI[base] || base) + (lato === 'dx' ? ' – lato destro' : lato === 'sx' ? ' – lato sinistro' : '');
  }

  function forma(tipo, g, mirror) {
    if (tipo === 'e') { const [cx, cy, rx, ry] = g; return `<ellipse cx="${mirror ? 120 - cx : cx}" cy="${cy}" rx="${rx}" ry="${ry}"`; }
    const [x, y, w, h, r] = g; return `<rect x="${mirror ? 120 - x - w : x}" y="${y}" width="${w}" height="${h}" rx="${r}"`;
  }

  /* opz: { verde: [basi], rosso: [basi], scelte: {id: colore}, cliccabile: bool } */
  function vista(quale, opz = {}) {
    const zone = quale === 'fronte' ? FRONTE : RETRO;
    // davanti: la parte sinistra del disegno è il tuo lato destro; dietro è il contrario
    const latoSx = quale === 'fronte' ? 'dx' : 'sx', latoDx = quale === 'fronte' ? 'sx' : 'dx';
    let s = '';
    for (const [base, tipo, g, doppia] of zone) {
      const istanze = doppia ? [[base + '_' + latoSx, false], [base + '_' + latoDx, true]] : [[base, false]];
      for (const [id, mirror] of istanze) {
        let fill = '#3b4d45';
        if ((opz.verde || []).includes(base)) fill = '#22c55e';
        if ((opz.rosso || []).includes(base)) fill = '#ef4444';
        if (opz.scelte && opz.scelte[id]) fill = opz.scelte[id];
        s += forma(tipo, g, mirror) + ` fill="${fill}" stroke="#101614" stroke-width="1.5"${opz.cliccabile ? ` data-a="zona" data-zona="${id}" style="cursor:pointer"` : ''}/>`;
      }
    }
    return `<svg viewBox="0 0 120 250" class="corpo-svg">${s}</svg>`;
  }

  function doppia(opz = {}) {
    return `<div class="corpo"><div><div class="etichetta">Davanti</div>${vista('fronte', opz)}</div><div><div class="etichetta">Dietro</div>${vista('retro', opz)}</div></div>`;
  }

  return { nome, vista, doppia, NOMI };
})();
