/* Coach Palestra – la scheda.
   Quando la scheda cambia si aggiorna solo questo file (e si alza VERSIONE in sw.js).
   recupero in secondi · partenza = «Riparti da» (null = «da provare») */

const SCHEDA = {
  nome: 'Scheda ipertrofia + definizione',
  rotazione: ['A', 'B', 'C'],
  regole: {
    primeSettimane: 14, // giorni con «2–3 ripetizioni in canna»
    progressione: 'Se completi tutte le serie con tecnica pulita, la volta dopo: +2,5–5 kg su squat e stacchi, +2,5 kg su rematore e military, +1–2 kg sui manubri.',
    dolore: 'Dips e chin-up caricano spalle e gomiti. Se senti dolore all\'articolazione (non la normale fatica del muscolo), scendi meno in profondità o per oggi torna all\'esercizio vecchio.'
  },

  giorni: {
    A: {
      nome: 'Gambe + petto',
      mobilita: [
        'Cyclette o tapis roulant 10 minuti, ritmo che ti scalda ma ti fa parlare',
        'Circonduzioni delle anche ×10 per lato',
        'Caviglia al muro: ginocchio in avanti oltre la punta ×10 per lato',
        'Squat a corpo libero lento ×10',
        'Affondi dinamici ×5 per gamba',
        'Rotazioni delle braccia avanti e indietro ×10'
      ],
      esercizi: ['squat', 'panca30', 'dips', 'affondi', 'legext', 'polpacci', 'addomeA']
    },
    B: {
      nome: 'Tirata + femorali',
      mobilita: [
        'Vogatore o cyclette 10 minuti',
        'Gatto-mucca a quattro zampe ×8',
        'Ponte glutei ×10, tieni 1" in alto',
        'Hip hinge con un bastone lungo la schiena ×10',
        'Apertura toracica a terra (libro che si apre) ×8 per lato',
        'Appeso alla sbarra 20", spalle attive'
      ],
      esercizi: ['trapbar', 'rematore', 'rumeni', 'trazioni', 'trx', 'legcurl', 'addomeB']
    },
    C: {
      nome: 'Spalle + braccia',
      mobilita: [
        'Ellittica o vogatore 10 minuti',
        'Circonduzioni delle braccia ×10 avanti e ×10 indietro',
        'Band pull-apart con elastico leggero ×15',
        'Rotazioni esterne della spalla con elastico ×12 per lato',
        'Wall slide: schiena al muro, braccia a W che salgono a Y ×10',
        'Piegamenti sulle braccia facili ×8'
      ],
      esercizi: ['military', 'shoulderpress', 'alzate', 'chinup', 'pushdown', 'superset']
    }
  },

  esercizi: {
    /* ---------------- GIORNO A ---------------- */
    squat: {
      nome: 'Back squat', tipo: 'kg', attrezzo: 'bilanciere', carico: 'bilanciere',
      serie: 4, ripMin: 6, ripMax: 6, recupero: 90,
      partenza: { min: 45, max: 50 }, prima: 'era 60 kg', incremento: 2.5, incFacile: 5, passo: 2.5, avvicinamento: true,
      tecnica: {
        muscoli: 'Quadricipiti, glutei, adduttori; schiena e addome tengono il busto.',
        prepara: [
          'Bilanciere sulla parte alta dei trapezi (non sul collo), mani poco più larghe delle spalle.',
          'Esci dal rack con 2 passi indietro. Piedi larghezza spalle o poco più, punte leggermente in fuori.',
          'Gonfia la pancia d\'aria e stringi l\'addome come se dovessi ricevere un pugno.'
        ],
        esegui: [
          'Scendi spingendo le anche indietro e le ginocchia in fuori, nella direzione delle punte.',
          'Arriva almeno con la coscia parallela al pavimento, schiena neutra (né curva né inarcata).',
          'Risali spingendo con tutto il piede, petto alto: anche e spalle salgono insieme.'
        ],
        errori: [
          'Ginocchia che cadono verso l\'interno.',
          'Talloni che si staccano: il peso va su tutto il piede.',
          'Sedere che sale prima del petto (diventa uno stacco).',
          'Schiena che si arrotonda in fondo alla discesa: scendi un po\' meno.'
        ],
        respiro: 'Aria dentro in alto, trattieni durante la discesa e la salita, butta fuori in cima.',
        consiglio: 'Usa sempre le sicure del rack all\'altezza giusta: se non sali, appoggi il bilanciere.'
      }
    },
    panca30: {
      nome: 'Panca 30° manubri', tipo: 'kg', attrezzo: 'manubri',
      serie: 4, ripMin: 8, ripMax: 8, recupero: 60,
      partenza: { min: 10, max: 10 }, prima: 'era 12,5 kg', incremento: 2, passo: 0.5, unita: 'kg per manubrio',
      tecnica: {
        muscoli: 'Petto (soprattutto la parte alta), spalla anteriore, tricipiti.',
        prepara: [
          'Schienale a circa 30° (2–3 tacche). Siediti con i manubri sulle cosce.',
          'Sdraiati portando su i manubri con una spinta delle ginocchia.',
          'Scapole strette e basse, piedi ben piantati a terra, leggero arco della schiena.'
        ],
        esegui: [
          'Parti a braccia tese sopra il petto, polsi dritti.',
          'Scendi in 2" con i gomiti a circa 45° dal busto (non a T) fino a sentire allungare il petto.',
          'Spingi su e un po\' verso l\'interno, senza sbattere i manubri tra loro.'
        ],
        errori: [
          'Gomiti larghi a 90°: carica male la spalla.',
          'Spalle che si alzano verso le orecchie a fine spinta.',
          'Sedere che si stacca dalla panca.'
        ],
        respiro: 'Inspira scendendo, espira spingendo.',
        consiglio: 'Finita la serie, porta i manubri sulle cosce e tirati su: non lasciarli cadere di lato.'
      }
    },
    dips: {
      nome: 'Dips alle parallele', tipo: 'elastico', attrezzo: 'parallele',
      serie: 4, ripMin: 6, ripMax: 8, recupero: 90, nuovo: 'al posto della panca piana',
      alternativa: { nome: 'Panca piana (bilanciere)', id: 'pancapiana' },
      dolore: true,
      tecnica: {
        muscoli: 'Petto (con il busto inclinato avanti), tricipiti, spalla anteriore.',
        prepara: [
          'Aggancia l\'elastico tra le due parallele (o usa la macchina assistita) e mettici dentro le ginocchia.',
          'Appoggiati con le mani sulle sbarre a braccia tese, spalle basse, lontane dalle orecchie.',
          'Piedi staccati da terra, busto un po\' inclinato in avanti.'
        ],
        esegui: [
          'Scendi piegando i gomiti, controllato, finché il braccio è circa parallelo al pavimento.',
          'I gomiti vanno indietro, non si aprono troppo di lato.',
          'Risali spingendo fino alle braccia tese, senza bloccare di colpo i gomiti.'
        ],
        errori: [
          'Scendere troppo in basso: la spalla va in sofferenza. Basta il braccio parallelo.',
          'Spalle che salgono verso le orecchie.',
          'Dondolare con le gambe per risalire.'
        ],
        respiro: 'Inspira scendendo, espira salendo.',
        consiglio: 'Se non ce la fai più, ti fermi e scendi: non serve lo spotter come in panca.'
      }
    },
    affondi: {
      nome: 'Affondi con manubri', tipo: 'kg', attrezzo: 'manubri',
      serie: 4, ripMin: 8, ripMax: 8, ripNota: 'per gamba', recupero: 60,
      partenza: { min: 10, max: 10 }, prima: 'era 12,5 kg', incremento: 2, passo: 0.5, unita: 'kg per manubrio',
      tecnica: {
        muscoli: 'Quadricipiti e glutei, poi adduttori e polpacci per l\'equilibrio.',
        prepara: [
          'In piedi, un manubrio per mano lungo i fianchi, spalle indietro.',
          'Sguardo avanti, addome stretto.'
        ],
        esegui: [
          'Fai un passo lungo in avanti e scendi in verticale: le due ginocchia arrivano a circa 90°.',
          'Il ginocchio dietro sfiora il pavimento senza sbatterlo.',
          'Spingi col tallone della gamba davanti e torna in piedi. 8 per gamba, alternate o una gamba alla volta.'
        ],
        errori: [
          'Passo troppo corto: il ginocchio davanti va molto oltre la punta e il tallone si stacca.',
          'Ginocchio davanti che cade verso l\'interno.',
          'Busto che crolla in avanti.'
        ],
        respiro: 'Inspira scendendo, espira risalendo.',
        consiglio: 'Se perdi l\'equilibrio, immagina di camminare su due binari, non su una corda.'
      }
    },
    legext: {
      nome: 'Leg extension', tipo: 'kg', attrezzo: 'macchina',
      serie: 3, ripMin: 10, ripMax: 10, recupero: 60,
      partenza: { min: 30, max: 35 }, prima: 'era 40 kg', incremento: 2.5, passo: 2.5,
      tecnica: {
        muscoli: 'Quadricipiti.',
        prepara: [
          'Regola lo schienale: il ginocchio deve stare in linea con il perno della macchina.',
          'Il rullo appoggia sopra la caviglia, non sui piedi.',
          'Tieni le maniglie e il sedere ben giù sul sedile.'
        ],
        esegui: [
          'Distendi le gambe fino quasi tese, tieni 1" stringendo le cosce.',
          'Torna giù lento, in 2–3", senza far sbattere i pesi.'
        ],
        errori: [
          'Calciare con lo slancio.',
          'Sedere che si alza dal sedile.',
          'Scendere di colpo.'
        ],
        respiro: 'Espira salendo, inspira scendendo.',
        consiglio: 'Il peso basso con il fermo di 1" in alto lavora più di un peso alto lanciato.'
      }
    },
    polpacci: {
      nome: 'Polpacci alla leg press', tipo: 'kg', attrezzo: 'macchina',
      serie: 4, ripMin: 12, ripMax: 15, recupero: 60, nuovo: 'aggiunto',
      partenza: null, incremento: 5, passo: 5, inizio: 40,
      tecnica: {
        muscoli: 'Polpacci.',
        prepara: [
          'Sulla leg press appoggia solo la punta dei piedi sul bordo basso della pedana.',
          'Gambe quasi tese, ginocchia mai bloccate.',
          'Togli le sicure solo quando i piedi sono stabili.'
        ],
        esegui: [
          'Spingi sulle punte il più in alto possibile e tieni 1".',
          'Lascia scendere i talloni finché senti allungare il polpaccio.',
          'Movimento lento, niente rimbalzi.'
        ],
        errori: [
          'Rimbalzare in basso.',
          'Piegare le ginocchia per aiutarsi.',
          'Peso troppo alto: se la punta scivola dalla pedana, il carico ti scende addosso.'
        ],
        respiro: 'Respira normale, espira spingendo.',
        consiglio: '«Da provare»: scegli un peso con cui fai le ripetizioni e ne avresti ancora 2.'
      }
    },
    addomeA: {
      nome: 'Addome: crunch + plank', tipo: 'circuito',
      serie: 3, serieMax: 4, recupero: 30,
      parti: [
        { id: 'crunch', nome: 'Crunch', rip: 10 },
        { id: 'plank', nome: 'Plank', secondi: 20 }
      ],
      tecnica: {
        muscoli: 'Addome (retto e muscoli profondi).',
        prepara: ['3–4 giri: 10 crunch, subito 20" di plank, poi un breve recupero.'],
        esegui: [
          'Crunch: sdraiato, ginocchia piegate, mani alle tempie. Stacca le spalle da terra arrotolando il busto, senza tirare la testa con le mani.',
          'Plank: avambracci a terra sotto le spalle, corpo dritto dalla testa ai talloni, sedere stretto, pancia in dentro.'
        ],
        errori: [
          'Crunch: tirare il collo con le mani.',
          'Plank: sedere troppo alto o pancia che cede verso il basso.'
        ],
        respiro: 'Crunch: espira salendo. Plank: respira corto, senza trattenere.',
        consiglio: 'Il plank fatto bene per 20" vale più di uno storto per un minuto.'
      }
    },

    /* ---------------- GIORNO B ---------------- */
    trapbar: {
      nome: 'Trap bar deadlift', tipo: 'kg', attrezzo: 'trap bar', carico: 'trapbar',
      serie: 4, ripMin: 6, ripMax: 6, recupero: 90,
      partenza: { min: 40, max: 40 }, prima: 'era 50 kg', incremento: 2.5, incFacile: 5, passo: 2.5, avvicinamento: true,
      tecnica: {
        muscoli: 'Glutei, quadricipiti, femorali, schiena (lombari e trapezi), presa.',
        prepara: [
          'Entra nella trap bar con i piedi a larghezza anche, al centro esatto.',
          'Scendi piegando anche e ginocchia e afferra le maniglie al centro.',
          'Petto alto, schiena neutra, spalle basse. Gonfia e stringi la pancia.'
        ],
        esegui: [
          'Spingi il pavimento con i piedi: anche e spalle salgono insieme.',
          'In alto: in piedi dritto, glutei stretti, senza inarcare la schiena all\'indietro.',
          'Scendi controllato con lo stesso movimento al contrario e appoggia i pesi.'
        ],
        errori: [
          'Schiena che si arrotonda all\'inizio della tirata.',
          'Strappare il peso da terra di colpo: prima metti in tensione, poi tira.',
          'Iperestendere la schiena in alto.'
        ],
        respiro: 'Aria dentro e trattieni prima di tirare, butta fuori in alto o dopo aver appoggiato.',
        consiglio: 'Ogni ripetizione riparte da ferma: reimposta la posizione se serve.'
      }
    },
    rematore: {
      nome: 'Rematore con bilanciere', tipo: 'kg', attrezzo: 'bilanciere', carico: 'bilanciere',
      serie: 4, ripMin: 6, ripMax: 6, recupero: 90,
      partenza: { min: 40, max: 40 }, prima: 'era 50 kg', incremento: 2.5, passo: 2.5,
      tecnica: {
        muscoli: 'Dorsali, parte alta della schiena, deltoide posteriore, bicipiti.',
        prepara: [
          'Presa prona poco più larga delle spalle.',
          'Ginocchia leggermente piegate, busto inclinato a circa 45°, schiena neutra.',
          'Il bilanciere pende a braccia tese sotto le spalle.'
        ],
        esegui: [
          'Tira il bilanciere verso l\'ombelico portando i gomiti indietro, vicino al corpo.',
          'In alto stringi le scapole 1".',
          'Scendi controllato fino alle braccia tese, il busto resta fermo.'
        ],
        errori: [
          'Usare lo slancio del busto per tirare su.',
          'Schiena curva.',
          'Tirare verso il petto con i gomiti larghi.'
        ],
        respiro: 'Espira tirando, inspira scendendo.',
        consiglio: 'Se la schiena bassa si stanca prima dei dorsali, il peso è troppo alto.'
      }
    },
    rumeni: {
      nome: 'Stacchi rumeni', tipo: 'kg', attrezzo: 'bilanciere', carico: 'bilanciere',
      serie: 4, ripMin: 8, ripMax: 8, recupero: 60,
      partenza: { min: 30, max: 35 }, prima: 'era 40 kg', incremento: 2.5, incFacile: 5, passo: 2.5,
      tecnica: {
        muscoli: 'Femorali e glutei, lombari.',
        prepara: [
          'In piedi con il bilanciere in mano, presa poco più larga delle gambe.',
          'Piedi a larghezza anche, ginocchia leggermente piegate e ferme così.'
        ],
        esegui: [
          'Spingi il sedere indietro come per chiudere una porta, il bilanciere scivola lungo le cosce.',
          'Scendi finché senti tirare i femorali (di solito poco sotto il ginocchio), schiena dritta.',
          'Torna su spingendo le anche in avanti e stringendo i glutei.'
        ],
        errori: [
          'Schiena che si arrotonda per scendere di più.',
          'Piegare troppo le ginocchia (diventa uno squat).',
          'Bilanciere lontano dalle gambe.'
        ],
        respiro: 'Inspira scendendo, espira salendo.',
        consiglio: 'La profondità la decide l\'elasticità dei femorali, non il pavimento.'
      }
    },
    trazioni: {
      nome: 'Trazioni con elastico (presa prona)', tipo: 'elastico', attrezzo: 'sbarra',
      serie: 4, ripMin: 6, ripMax: 8, recupero: 90, nuovo: 'al posto della lat machine',
      alternativa: { nome: 'Lat machine', id: 'latmachine' },
      tecnica: {
        muscoli: 'Dorsali, bicipiti, parte alta della schiena.',
        prepara: [
          'Aggancia un elastico grosso alla sbarra e mettici dentro un ginocchio o un piede.',
          'Palmi in avanti, mani un po\' più larghe delle spalle.',
          'Parti appeso a braccia distese, spalle attive (tirate giù, non «appese»).'
        ],
        esegui: [
          'Tira portando i gomiti verso i fianchi finché il mento supera la sbarra.',
          'Petto verso la sbarra, non il mento proteso.',
          'Scendi controllato fino alle braccia distese.'
        ],
        errori: [
          'Mezze ripetizioni senza distendere le braccia.',
          'Dondolare o scalciare.',
          'Spalle che salgono verso le orecchie.'
        ],
        respiro: 'Espira salendo, inspira scendendo.',
        consiglio: 'Va bene anche la macchina assistita, se la palestra ce l\'ha.'
      }
    },
    trx: {
      nome: 'Rematore al TRX', tipo: 'corpo', attrezzo: 'TRX',
      serie: 3, ripMin: 10, ripMax: 10, recupero: 60, nuovo: 'aggiunto',
      tecnica: {
        muscoli: 'Dorsali, parte alta della schiena, bicipiti.',
        prepara: [
          'Afferra le maniglie, inclinati all\'indietro a braccia tese.',
          'Corpo dritto come una tavola, talloni a terra.'
        ],
        esegui: [
          'Tira il petto verso le maniglie stringendo le scapole.',
          'Torna giù controllato fino alle braccia tese.'
        ],
        errori: [
          'Sedere che cade (il corpo si piega).',
          'Tirare solo con le braccia senza stringere le scapole.'
        ],
        respiro: 'Espira tirando, inspira scendendo.',
        consiglio: 'Più duro: avvicina i piedi al punto di aggancio (corpo più orizzontale). Più facile: allontanali.'
      }
    },
    legcurl: {
      nome: 'Leg curl', tipo: 'kg', attrezzo: 'macchina',
      serie: 3, ripMin: 10, ripMax: 10, recupero: 60,
      partenza: null, incremento: 2.5, passo: 2.5, inizio: 20,
      tecnica: {
        muscoli: 'Femorali.',
        prepara: [
          'Ginocchio in linea con il perno della macchina.',
          'Il rullo appoggia sopra il tallone (o sotto il polpaccio, vicino alla caviglia).',
          'Bacino ben appoggiato.'
        ],
        esegui: [
          'Piega le gambe portando i talloni verso il sedere, tieni 1".',
          'Torna lento in 2–3" fino a gamba quasi tesa.'
        ],
        errori: [
          'Bacino che si alza.',
          'Slancio e discesa a peso morto.'
        ],
        respiro: 'Espira piegando, inspira distendendo.',
        consiglio: '«Da provare»: scegli un peso con cui fai 10 ripetizioni e ne avresti ancora 2.'
      }
    },
    addomeB: {
      nome: 'Addome: ginocchia al petto + plank', tipo: 'circuito', nuovo: 'al posto del crunch',
      serie: 3, serieMax: 4, recupero: 30,
      parti: [
        { id: 'ginocchia', nome: 'Ginocchia al petto alla sbarra', rip: 10 },
        { id: 'plank', nome: 'Plank', secondi: 20 }
      ],
      tecnica: {
        muscoli: 'Addome (soprattutto la parte bassa), presa e spalle.',
        prepara: ['Appeso alla sbarra delle trazioni, spalle attive.'],
        esegui: [
          'Porta le ginocchia verso il petto arrotolando un po\' il bacino.',
          'Riabbassale lentamente, senza dondolare.',
          'Poi subito 20" di plank: avambracci sotto le spalle, corpo dritto.'
        ],
        errori: [
          'Dondolare per tirare su le gambe.',
          'Lasciarle cadere giù di colpo.'
        ],
        respiro: 'Espira portando su le ginocchia.',
        consiglio: 'Ti abitua anche a stare appeso: utile per le trazioni.'
      }
    },

    /* ---------------- GIORNO C ---------------- */
    military: {
      nome: 'Military press', tipo: 'kg', attrezzo: 'bilanciere', carico: 'bilanciere',
      serie: 4, ripMin: 6, ripMax: 6, recupero: 90,
      partenza: { min: 10, max: 10 }, partenzaNota: 'circa', prima: 'era 15–10 kg', incremento: 2.5, passo: 2.5, avvicinamento: true,
      tecnica: {
        muscoli: 'Spalle (soprattutto anteriori), tricipiti, parte alta del petto.',
        prepara: [
          'In piedi, bilanciere appoggiato davanti sulle spalle, mani poco più larghe delle spalle.',
          'Gomiti un po\' avanti rispetto al bilanciere.',
          'Glutei e addome stretti: il corpo è un blocco unico.'
        ],
        esegui: [
          'Spingi in verticale; quando il bilanciere passa la fronte, porta la testa un po\' avanti «sotto» la sbarra.',
          'In alto braccia tese e bilanciere sopra la nuca.',
          'Scendi controllato fino alle clavicole.'
        ],
        errori: [
          'Inarcare la schiena all\'indietro per spingere.',
          'Bilanciere che va avanti invece che dritto in su.',
          'Aiutarsi con le gambe (diventa una spinta).'
        ],
        respiro: 'Aria dentro e trattieni in basso, espira in alto.',
        consiglio: 'Se la schiena si inarca, il peso è troppo: scendi di 2,5 kg.'
      }
    },
    shoulderpress: {
      nome: 'Shoulder press manubri su panca', tipo: 'kg', attrezzo: 'manubri',
      serie: 3, ripMin: 10, ripMax: 10, recupero: 60, cambio: 'al posto delle scrollate',
      partenza: null, incremento: 2, passo: 0.5, inizio: 8, unita: 'kg per manubrio',
      tecnica: {
        muscoli: 'Spalle, tricipiti.',
        prepara: [
          'Panca con schienale verticale o quasi (80–90°).',
          'Manubri all\'altezza delle orecchie, palmi in avanti, gomiti sotto i polsi.',
          'Schiena appoggiata, piedi piantati.'
        ],
        esegui: [
          'Spingi su finché le braccia sono quasi tese, manubri vicini ma senza toccarsi.',
          'Scendi controllato fino all\'altezza delle orecchie.'
        ],
        errori: [
          'Staccare la schiena dallo schienale inarcandosi.',
          'Scendere troppo poco.',
          'Gomiti troppo indietro.'
        ],
        respiro: 'Espira spingendo, inspira scendendo.',
        consiglio: '«Da provare»: scegli un peso con cui fai 10 ripetizioni e ne avresti ancora 2.'
      }
    },
    alzate: {
      nome: 'Alzate laterali', tipo: 'kg', attrezzo: 'manubri',
      serie: 3, ripMin: 8, ripMax: 8, recupero: 60,
      partenza: { min: 6, max: 7 }, prima: 'era 7/8–7 kg', incremento: 1, passo: 0.5, unita: 'kg per manubrio',
      tecnica: {
        muscoli: 'Deltoide laterale (la spalla «larga»).',
        prepara: [
          'In piedi, manubri lungo i fianchi, gomiti leggermente piegati e fermi così.',
          'Busto appena inclinato in avanti.'
        ],
        esegui: [
          'Alza le braccia di lato fino all\'altezza delle spalle, come se versassi una brocca.',
          'Guida con i gomiti, non con le mani.',
          'Scendi lento in 2–3".'
        ],
        errori: [
          'Slancio con il busto.',
          'Alzare le spalle verso le orecchie (lavora il trapezio).',
          'Salire oltre le spalle.'
        ],
        respiro: 'Espira salendo, inspira scendendo.',
        consiglio: 'Qui conta il controllo: meglio 6 kg puliti che 8 kg lanciati.'
      }
    },
    chinup: {
      nome: 'Chin-up con elastico (presa supina)', tipo: 'elastico', attrezzo: 'sbarra',
      serie: 3, ripMin: 6, ripMax: 8, recupero: 90, nuovo: 'al posto del curl al cavo basso',
      alternativa: { nome: 'Curl al cavo basso', id: 'curlcavo' },
      dolore: true,
      tecnica: {
        muscoli: 'Dorsali e bicipiti (molto), parte alta della schiena.',
        prepara: [
          'Elastico grosso agganciato alla sbarra, ginocchio o piede dentro.',
          'Palmi verso di te, mani alla larghezza delle spalle.',
          'Parti appeso a braccia distese, spalle attive.'
        ],
        esegui: [
          'Tira finché il mento supera la sbarra, gomiti verso i fianchi.',
          'Scendi controllato fino alle braccia distese.'
        ],
        errori: [
          'Mezze ripetizioni.',
          'Dondolare.',
          'Distendere di colpo in basso (stressa il gomito).'
        ],
        respiro: 'Espira salendo, inspira scendendo.',
        consiglio: 'Lavora molto il bicipite: per questo sostituisce il curl al cavo.'
      }
    },
    pushdown: {
      nome: 'Push down', tipo: 'kg', attrezzo: 'cavo',
      serie: 3, ripMin: 8, ripMax: 8, recupero: 60,
      partenza: { min: 20, max: 25 }, prima: 'era 30–25 kg', incremento: 2.5, passo: 2.5,
      tecnica: {
        muscoli: 'Tricipiti.',
        prepara: [
          'Al cavo alto con barra o corda. In piedi vicino al cavo, busto appena inclinato.',
          'Gomiti attaccati ai fianchi.'
        ],
        esegui: [
          'Spingi giù fino alle braccia tese, stringi il tricipite 1".',
          'Risali lento fino a circa 90° di gomito: i gomiti restano fermi.'
        ],
        errori: [
          'Gomiti che si staccano e vanno avanti.',
          'Buttarsi addosso al cavo con il peso del corpo.'
        ],
        respiro: 'Espira spingendo, inspira risalendo.',
        consiglio: 'Se devi muovere le spalle per finire la ripetizione, il peso è troppo.'
      }
    },
    superset: {
      nome: 'Superset: curl manubri + French press', tipo: 'superset',
      serie: 3, recupero: 60,
      parti: [
        { id: 'curl', nome: 'Curl manubri', rip: 12, partenza: 2.5, incremento: 1, passo: 0.5, prima: 'era 2,5/3,75 kg' },
        { id: 'french', nome: 'French press', rip: 12, partenza: 2.5, incremento: 1, passo: 0.5, prima: 'era 2,5/3,75 kg' }
      ],
      tecnica: {
        muscoli: 'Bicipiti (curl) e tricipiti (French press).',
        prepara: ['Tieni i manubri a portata: 12 curl, subito 12 French press senza pausa, poi recupero. 3 giri.'],
        esegui: [
          'Curl: in piedi, gomiti fermi ai fianchi, palmi in avanti. Porta su i manubri senza muovere i gomiti, scendi lento.',
          'French press: sdraiato sulla panca, braccia tese sopra il petto. Piega solo i gomiti portando i manubri ai lati della testa, poi distendi.'
        ],
        errori: [
          'Curl: oscillare con la schiena.',
          'French press: gomiti che si aprono verso l\'esterno.'
        ],
        respiro: 'Espira nella fase di sforzo, inspira nel ritorno.',
        consiglio: 'Pesi leggeri, movimento controllato: con 12 ripetizioni conta sentire il muscolo.'
      }
    }
  },

  /* Esercizi «vecchi» da usare se qualcosa fa male */
  alternative: {
    pancapiana: { nome: 'Panca piana (bilanciere)', tipo: 'kg', attrezzo: 'bilanciere', carico: 'bilanciere', serie: 4, ripMin: 6, ripMax: 8, recupero: 90, partenza: null, incremento: 2.5, passo: 2.5, inizio: 30,
      tecnica: { muscoli: 'Petto, tricipiti, spalla anteriore.', prepara: ['Occhi sotto il bilanciere, scapole strette, piedi a terra.'], esegui: ['Scendi al petto controllato, gomiti a 45°.', 'Spingi su fino alle braccia tese.'], errori: ['Rimbalzare sul petto.', 'Sedere che si stacca.'], respiro: 'Inspira scendendo, espira spingendo.', consiglio: 'Con il bilanciere usa le sicure o chiedi uno spotter.' } },
    latmachine: { nome: 'Lat machine', tipo: 'kg', attrezzo: 'macchina', serie: 4, ripMin: 6, ripMax: 8, recupero: 90, partenza: null, incremento: 2.5, passo: 2.5, inizio: 35,
      tecnica: { muscoli: 'Dorsali, bicipiti.', prepara: ['Cosce bloccate sotto i rulli, presa larga prona.'], esegui: ['Tira la barra al petto alto portando i gomiti giù e indietro.', 'Risali controllato fino alle braccia tese.'], errori: ['Tirare dietro la nuca.', 'Buttarsi indietro con il busto.'], respiro: 'Espira tirando.', consiglio: 'Pensa di portare i gomiti nelle tasche dei pantaloni.' } },
    curlcavo: { nome: 'Curl al cavo basso', tipo: 'kg', attrezzo: 'cavo', serie: 3, ripMin: 6, ripMax: 8, recupero: 90, partenza: null, incremento: 2.5, passo: 2.5, inizio: 15,
      tecnica: { muscoli: 'Bicipiti.', prepara: ['Cavo basso con barra, gomiti ai fianchi.'], esegui: ['Porta su la barra senza muovere i gomiti, scendi lento.'], errori: ['Oscillare con la schiena.'], respiro: 'Espira salendo.', consiglio: 'Gomiti fermi: si muovono solo gli avambracci.' } }
  }
};
