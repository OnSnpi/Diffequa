window.Diffequa = window.Diffequa || {};

window.Diffequa.Config = {
  STORAGE_PREFS: 'diffequa_prefs_v11',
  STORAGE_GAME: 'diffequa_saved_game_v4',
  DEFAULT_COLORS: ['#eb8672', '#8cc64d', '#e6c24f'],
  ROYAL_COLORS: ['#f59e0b', '#f472b6', '#cbd5e1'],
  DEFAULT_SHAPES: ['square', 'circle', 'triangle'],
  PRESET_PALETTES: [
    ['#eb8672', '#8cc64d', '#e6c24f'],
    ['#dc2626', '#16a34a', '#2563eb'],
    ['#ea580c', '#7c3aed', '#0d9488']
  ],

  ALL_SHAPES: [
    {
      id: 'square',
      unlockLevel: 0,
      gen: function(stroke, fill) {
        return '<rect x="6" y="6" width="38" height="38" rx="3" stroke="' + stroke + '" stroke-width="4.5" fill="' + fill + '" />';
      }
    },
    {
      id: 'circle',
      unlockLevel: 0,
      gen: function(stroke, fill) {
        return '<circle cx="25" cy="25" r="19" stroke="' + stroke + '" stroke-width="4.5" fill="' + fill + '" />';
      }
    },
    {
      id: 'triangle',
      unlockLevel: 0,
      gen: function(stroke, fill) {
        return '<polygon points="25,6 45,42 5,42" stroke-linejoin="round" stroke-width="4.5" stroke="' + stroke + '" fill="' + fill + '" />';
      }
    },
    {
      id: 'diamond',
      unlockLevel: 0,
      gen: function(stroke, fill) {
        return '<polygon points="25,4 45,25 25,46 5,25" stroke-linejoin="round" stroke-width="4.5" stroke="' + stroke + '" fill="' + fill + '" />';
      }
    },
    {
      id: 'hexagon',
      unlockLevel: 0,
      gen: function(stroke, fill) {
        return '<polygon points="25,5 43,15 43,35 25,45 7,35 7,15" stroke-linejoin="round" stroke-width="4.5" stroke="' + stroke + '" fill="' + fill + '" />';
      }
    },
    {
      id: 'star',
      unlockLevel: 0,
      gen: function(stroke, fill) {
        return '<polygon points="25,4 31,17 45,19 35,29 37,44 25,37 13,44 15,29 5,19 19,17" stroke-linejoin="round" stroke-width="4" stroke="' + stroke + '" fill="' + fill + '" />';
      }
    },
    {
      id: 'heart',
      unlockLevel: 0,
      gen: function(stroke, fill) {
        return '<path d="M25,43 C25,43 6,30 6,17 C6,10 11,6 17,6 C21,6 24,8 25,11 C26,8 29,6 33,6 C39,6 44,10 44,17 C44,30 25,43 25,43 Z" stroke-linejoin="round" stroke-width="4.2" stroke="' + stroke + '" fill="' + fill + '" />';
      }
    },
    {
      id: 'cross',
      unlockLevel: 0,
      gen: function(stroke, fill) {
        return '<polygon points="18,6 32,6 32,18 44,18 44,32 32,32 32,44 18,44 18,32 6,32 6,18 18,18" stroke-linejoin="round" stroke-width="4" stroke="' + stroke + '" fill="' + fill + '" />';
      }
    },
    {
      id: 'drop',
      unlockLevel: 0,
      gen: function(stroke, fill) {
        return '<path d="M25,5 C25,5 41,23 41,32 C41,40.8 33.8,46 25,46 C16.2,46 9,40.8 9,32 C9,23 25,5 25,5 Z" stroke-linejoin="round" stroke-width="4.5" stroke="' + stroke + '" fill="' + fill + '" />';
      }
    },
    {
      id: 'xcross',
      unlockLevel: 1,
      gen: function(stroke, fill) {
        return '<polygon points="14,7 25,18 36,7 43,14 32,25 43,36 36,43 25,32 14,43 7,36 18,25 7,14" stroke-linejoin="round" stroke-width="4" stroke="' + stroke + '" fill="' + fill + '" />';
      }
    },
    {
      id: 'donut',
      unlockLevel: 2,
      gen: function(stroke, fill) {
        return '<path d="M25,6 A19,19 0 1,0 25,44 A19,19 0 1,0 25,6 Z M25,17.5 A7.5,7.5 0 1,1 25,32.5 A7.5,7.5 0 1,1 25,17.5 Z" fill-rule="evenodd" stroke="' + stroke + '" stroke-width="3.8" fill="' + fill + '" />';
      }
    },
    {
      id: 'crown',
      unlockLevel: 3,
      gen: function(stroke, fill) {
        return '<polygon points="6,40 8,15 19,26 25,11 31,26 42,15 44,40" stroke-linejoin="round" stroke-width="4" stroke="' + stroke + '" fill="' + fill + '" />';
      }
    }
  ],

  I18N: {
    cs: {
      pageTitle: 'Diffequa \u2013 Logick\u00E1 hra',
      found: 'Nalezeno',
      deck: 'Bal\u00ED\u010Dek',
      puzzleCards: 'Karet',
      puzzleFoundTitle: 'Odhalen\u00E9 trojice v rozlo\u017Een\u00ED',
      settingsTooltip: 'Nastaven\u00ED',
      defaultStatusClassic: 'Najdi 3 karty: ka\u017Ed\u00E1 vlastnost v\u0161ude stejn\u00E1, nebo v\u0161ude jin\u00E1',
      defaultStatusJunior: 'Tr\u00E9nink (3 vlastnosti): tvar, po\u010Det a barva stejn\u00E9 nebo jin\u00E9',
      defaultStatusPuzzle: 'Najdi v\u0161ech {tot} skryt\u00FDch trojic v m\u0159\u00ED\u017Ece 4\u00D74!',
      btnUndo: '\u21A9 Zp\u011Bt',
      btnUndoTitle: 'Vr\u00E1tit posledn\u00ED tah',
      btnHelp: 'N\u00E1vod',
      btnHint: 'N\u00E1pov\u011Bda',
      btnNew: 'Nov\u00E1 hra',
      confirmNewTitle: 'Ukon\u010Dit rozehranou hru?',
      confirmNewText: 'M\u00E1\u0161 rozehranou partii (nalezeno {score} / {max} trojic). Opravdu ji chce\u0161 ukon\u010Dit a za\u010D\u00EDt novou?',
      btnConfirmCancel: 'Pokra\u010Dovat ve h\u0159e',
      btnConfirmYes: 'Ano, nov\u00E1 hra',
      settingsTitle: 'Nastaven\u00ED hry',
      trophiesLabel: '\uD83D\uDC51 Vy\u010Di\u0161t\u011Bn\u00E9 stoly (27/27):',
      modeTitle: 'Hern\u00ED re\u017Eim',
      modeClassicName: 'Klasika',
      modeClassicSub: '81 karet (4\u00D74)',
      modeJuniorName: 'Tr\u00E9nink',
      modeJuniorSub: '27 karet (3\u00D73)',
      modePuzzleName: 'Puzzle',
      modePuzzleSub: 'Najdi v\u0161echny',
      modeDescClassic: '<strong>Pln\u00E1 hra (81 karet, 4 vlastnosti):</strong> Klasick\u00E1 m\u0159\u00ED\u017Eka 4\u00D74. Vy\u010Di\u0161t\u011Bn\u00ED cel\u00E9ho stolu (27/27) odemyk\u00E1 bonusov\u00E9 tvary a Zlatou edici.',
      modeDescJunior: '<strong>Za\u010D\u00E1te\u010Dnick\u00FD bal\u00ED\u010Dek (27 karet, 3 vlastnosti):</strong> V\u00FDpl\u0148 je v\u017Edy pln\u00E1, sleduje\u0161 jen tvar, po\u010Det a barvu v m\u0159\u00ED\u017Ece 3\u00D73 (celkem 9 trojic).',
      modeDescPuzzle: '<strong>Najdi v\u0161echny (16 karet, 4\u00D74):</strong> Karty ze stolu nemiz\u00ED. Tv\u00FDm \u00FAkolem je postupn\u011B odhalit v\u0161ech 6 a\u017E 8 skryt\u00FDch trojic v jednom rozlo\u017Een\u00ED.',
      langTitle: 'Jazyk / Language',
      feedbackTitle: 'Zvuk a vibrace',
      soundOn: '\uD83D\uDD0A Zvuky: Zap',
      soundOff: '\uD83D\uDD07 Zvuky: Vyp',
      hapticsOn: '\uD83D\uDCF3 Vibrace: Zap',
      hapticsOff: '\uD83D\uDCF4 Vibrace: Vyp',
      shapesTitle: 'V\u00FDb\u011Br 3 tvar\u016F',
      selectedCounter: 'Vybr\u00E1no: {n}/3',
      winSuffix: '. v\u00FDhra',
      unlockHintDefault: '\uD83D\uDD12 <strong>Jak odemknout bonusy:</strong> V re\u017Eimu <strong>Klasika</strong> vy\u010Disti cel\u00FD hern\u00ED st\u016Fl (27/27 trojic). Za 1., 2. a 3. \u010Dist\u00FD st\u016Fl se postupn\u011B odemkne <strong>K\u0159\u00ED\u017E X</strong>, <strong>Prstenec</strong> a <strong>Koruna + Kr\u00E1lovsk\u00E1 zlat\u00E1 edice</strong>.',
      unlockHintLockedShape: '\uD83D\uDD12 <strong>Tvar {name}</strong> se odemkne po dosa\u017Een\u00ED <strong>{level}. vy\u010Di\u0161t\u011Bn\u00E9ho stolu (27/27)</strong> v re\u017Eimu Klasika{extra}!',
      unlockHintCrownExtra: ' (spole\u010Dn\u011B se Zlatou edic\u00ED barev)',
      colorsTitle: 'V\u00FDb\u011Br 3 barev',
      royalInfo: '\uD83D\uDC51 <strong>Kr\u00E1lovsk\u00E1 edice aktivn\u00ED:</strong> \u017Dlut\u00E9 zlato, R\u016F\u017Eov\u00E9 zlato a Platina s kovov\u00FDm leskem na sametov\u011B tmav\u00FDch kart\u00E1ch.',
      col0: '1. barva symbol\u016F',
      col1: '2. barva symbol\u016F',
      col2: '3. barva symbol\u016F',
      preset0: 'Standardn\u00ED',
      preset1: 'Z\u00E1kladn\u00ED',
      preset2: 'Kontrastn\u00ED',
      presetGold: '\uD83D\uDC51 Zlat\u00E1 edice',
      btnSaveClose: 'Ulo\u017Eit a zav\u0159\u00EDt',
      warnBoth: 'Pozor: Barvy jsou si velmi podobn\u00E9 a n\u011Bkter\u00E1 je na b\u00EDl\u00E9 kart\u011B m\u00E1lo vid\u011Bt.',
      warnClose: 'Pozor: Zvolen\u00E9 barvy jsou si velmi podobn\u00E9, ve h\u0159e se mohou pl\u00E9st.',
      warnLight: 'Pozor: N\u011Bkter\u00E1 z barev je velmi sv\u011Btl\u00E1 a bude na kart\u011B h\u016F\u0159e vid\u011Bt.',
      helpTitle: 'Jak hr\u00E1t Diffequa',
      helpClose: 'Rozum\u00EDm, hr\u00E1t',
      helpOr: 'nebo',
      endPerfectBadge: '\uD83D\uDC51 DOKONAL\u00C1 HRA \u2013 \u010CIST\u00DD ST\u016EL',
      endPerfectTitle: 'Mistrovsk\u00FD v\u00FDkon!',
      endPerfectSub: 'Sebral jsi v\u0161ech 81 karet do posledn\u00EDho kusu (0 zb\u00FDvaj\u00EDc\u00EDch).',
      endJuniorPerfectBadge: '\u2B50 TR\u00C9NINK DOKON\u010CEN \u2013 9/9',
      endJuniorPerfectTitle: 'Skv\u011Bl\u00E1 pr\u00E1ce!',
      endJuniorPerfectSub: 'Vy\u010Distil jsi cel\u00FD tr\u00E9ninkov\u00FD bal\u00ED\u010Dek 27 karet do posledn\u00EDho kusu.',
      endJuniorNote: 'Tip: Chce\u0161-li odemykat bonusov\u00E9 tvary a Zlatou edici, p\u0159epni v Nastaven\u00ED (\u2699) na re\u017Eim <strong>Klasika (81 karet)</strong>.',
      endPuzzleBadge: '\uD83E\uDDE9 PUZZLE VY\u0158E\u0160ENO',
      endPuzzleTitle: 'V\u0161echny trojice odhaleny!',
      endPuzzleSub: 'Na\u0161el jsi v\u0161ech {tot} skryt\u00FDch kombinac\u00ED v tomto rozlo\u017Een\u00ED.',
      endNormalTitle: 'Konec kola',
      endNormalSub: 'Na stole zbylo {n} karet, ze kter\u00FDch u\u017E nelze slo\u017Eit dal\u0161\u00ED trojici.',
      endScoreLine: 'Nalezeno: {score} / {max} trojic',
      reward1: '\uD83C\uDF89 Odem\u010Dena 1. odm\u011Bna v Nastaven\u00ED (\u2699):<br>Nov\u00FD bonusov\u00FD tvar <strong>K\u0159\u00ED\u017E X</strong>!',
      reward2: '\uD83C\uDF89 Odem\u010Dena 2. odm\u011Bna v Nastaven\u00ED (\u2699):<br>Nov\u00FD bonusov\u00FD tvar <strong>Prstenec</strong>!',
      reward3: '\uD83C\uDF89 Odem\u010Dena nejvy\u0161\u0161\u00ED odm\u011Bna v Nastaven\u00ED (\u2699):<br><strong>Tvar Koruna</strong> a <strong>Kr\u00E1lovsk\u00E1 zlat\u00E1 edice</strong>!',
      rewardMore: '\uD83D\uDC51 Celkem vy\u010Di\u0161t\u011Bn\u00FDch stol\u016F: <strong>{n}</strong>',
      btnEndUndo: '\u21A9 Vr\u00E1tit posledn\u00ED tah a zkusit jinak',
      btnPlayAgain: 'Hr\u00E1t znovu',
      btnEndClose: 'Zobrazit plochu',
      msgSetOk: 'V\u00FDb\u011Brn\u011B! Spr\u00E1vn\u00E1 trojice Diffequa.',
      msgPuzzleFoundOk: 'Skv\u011Bl\u00E9! Odhalena {cur}. z {tot} trojic.',
      msgPuzzleAlready: 'Tuto trojici u\u017E m\u00E1\u0161 odhalenou! Zkus naj\u00EDt jinou.',
      msgSetErr: 'Tato trojice nespl\u0148uje pravidlo \u2013 zkus jinou.',
      msgReshuffle: '\u017D\u00E1dn\u00E1 platn\u00E1 trojice na stole \u2013 karty byly prom\u00EDch\u00E1ny!',
      msgUndo: 'Posledn\u00ED tah byl vr\u00E1cen zp\u011Bt.',
      msgHint: 'N\u00E1pov\u011Bda ({cur}/{tot}) \u2013 najdi t\u0159et\u00ED kartu!',
      msgResume: 'Pokra\u010Duje\u0161 v rozehran\u00E9 h\u0159e.',
      msgGameFinished: 'Partie je dohran\u00E1 \u2013 stiskni Nov\u00E1 hra.',
      shapes: {
        square: '\u010Ctverec',
        circle: 'Kru\u017Enice',
        triangle: 'Troj\u00FAheln\u00EDk',
        diamond: 'Koso\u010Dtverec',
        hexagon: '\u0160esti\u00FAheln\u00EDk',
        star: 'Hv\u011Bzda',
        heart: 'Srdce',
        cross: 'K\u0159\u00ED\u017E',
        drop: 'Kapka',
        xcross: 'K\u0159\u00ED\u017E X',
        donut: 'Prstenec',
        crown: 'Koruna'
      },
      buildHelpHtml: function(shapesListStr) {
        return (
          '<p>C\u00EDlem hry je naj\u00EDt <strong>trojici karet</strong>, kter\u00E1 tvo\u0159\u00ED spr\u00E1vnou kombinaci.</p>' +
          '<p>Ka\u017Ed\u00E1 karta m\u00E1 <strong>4 vlastnosti</strong>:</p>' +
          '<div class="help-box"><ul>' +
            '<li><strong>Tvar:</strong> ' + shapesListStr + ' (lze zm\u011Bnit v \u2699)</li>' +
            '<li><strong>Po\u010Det:</strong> 1, 2 nebo 3 symboly</li>' +
            '<li><strong>V\u00FDpl\u0148:</strong> pr\u00E1zdn\u00E1, \u0161rafovan\u00E1 nebo pln\u00E1</li>' +
            '<li><strong>Barva:</strong> t\u0159i r\u016Fzn\u00E9 barvy (lze upravit v \u2699)</li>' +
          '</ul></div>' +
          '<p><strong>Zlat\u00E9 pravidlo:</strong> U vybran\u00E9 trojice mus\u00ED b\u00FDt ka\u017Ed\u00E1 z t\u011Bchto 4 vlastnost\u00ED u v\u0161ech t\u0159\u00ED karet bu\u010F <strong>zcela stejn\u00E1</strong> (<em>equal</em>), nebo u ka\u017Ed\u00E9 karty <strong>jin\u00E1</strong> (<em>different</em>).</p>' +
          '<div class="help-box help-example-box">' +
            '<strong>Hern\u00ED re\u017Eimy v Nastaven\u00ED (\u2699):</strong><br>' +
            '&bull; <strong>Klasika (81 karet):</strong> Pln\u00E1 hra 4\u00D74 (odemyk\u00E1 odm\u011Bny).<br>' +
            '&bull; <strong>Tr\u00E9nink (27 karet):</strong> M\u0159\u00ED\u017Eka 3\u00D73 jen se 3 vlastnostmi (bez v\u00FDpln\u011B).<br>' +
            '&bull; <strong>Puzzle (Najdi v\u0161echny):</strong> M\u0159\u00ED\u017Eka 4\u00D74, karty nemiz\u00ED, hled\u00E1\u0161 v\u0161ech 6\u20138 skryt\u00FDch trojic v jednom rozlo\u017Een\u00ED.' +
          '</div>' +
          '<p style="color: #f87171;"><strong>Pozor:</strong> Pokud maj\u00ED nap\u0159. 2 karty stejnou barvu a 3. karta jinou, trojice neplat\u00ED!</p>'
        );
      }
    },
    en: {
      pageTitle: 'Diffequa \u2013 Logic Game',
      found: 'Found',
      deck: 'Deck',
      puzzleCards: 'Cards',
      puzzleFoundTitle: 'Discovered Triples on This Board',
      settingsTooltip: 'Settings',
      defaultStatusClassic: 'Find 3 cards: each feature all the same, or all different',
      defaultStatusJunior: 'Training (3 features): shape, count & color all same or all different',
      defaultStatusPuzzle: 'Find all {tot} hidden triples in the 4\u00D74 grid!',
      btnUndo: '\u21A9 Undo',
      btnUndoTitle: 'Undo last move',
      btnHelp: 'Rules',
      btnHint: 'Hint',
      btnNew: 'New Game',
      confirmNewTitle: 'End current game?',
      confirmNewText: 'You have a game in progress ({score} / {max} triples found). Do you really want to end it and start a new one?',
      btnConfirmCancel: 'Continue playing',
      btnConfirmYes: 'Yes, new game',
      settingsTitle: 'Game Settings',
      trophiesLabel: '\uD83D\uDC51 Cleared Boards (27/27):',
      modeTitle: 'Game Mode',
      modeClassicName: 'Classic',
      modeClassicSub: '81 cards (4\u00D74)',
      modeJuniorName: 'Training',
      modeJuniorSub: '27 cards (3\u00D73)',
      modePuzzleName: 'Puzzle',
      modePuzzleSub: 'Find All',
      modeDescClassic: '<strong>Full Game (81 cards, 4 features):</strong> Classic 4\u00D74 grid. Clearing the entire board (27/27) unlocks bonus shapes and the Royal Gold Edition.',
      modeDescJunior: '<strong>Starter Deck (27 cards, 3 features):</strong> Fill is always solid; focus only on shape, count, and color in a 3\u00D73 grid (9 triples total).',
      modeDescPuzzle: '<strong>Find All (16 cards, 4\u00D74):</strong> Cards stay on the table. Your goal is to uncover all 6 to 8 hidden triples in a single layout.',
      langTitle: 'Jazyk / Language',
      feedbackTitle: 'Sound & Haptics',
      soundOn: '\uD83D\uDD0A Sound: On',
      soundOff: '\uD83D\uDD07 Sound: Off',
      hapticsOn: '\uD83D\uDCF3 Haptics: On',
      hapticsOff: '\uD83D\uDCF4 Haptics: Off',
      shapesTitle: 'Choose 3 Shapes',
      selectedCounter: 'Selected: {n}/3',
      winSuffix: ' win(s)',
      unlockHintDefault: '\uD83D\uDD12 <strong>How to unlock rewards:</strong> Clear the entire board (27/27 triples) in <strong>Classic</strong> mode. Your 1st, 2nd, and 3rd cleared board unlock <strong>Cross X</strong>, <strong>Ring</strong>, and <strong>Crown + Royal Gold Edition</strong>.',
      unlockHintLockedShape: '\uD83D\uDD12 <strong>{name}</strong> unlocks after reaching <strong>{level} cleared board(s) (27/27)</strong> in Classic mode{extra}!',
      unlockHintCrownExtra: ' (together with the Royal Gold Edition)',
      colorsTitle: 'Choose 3 Colors',
      royalInfo: '\uD83D\uDC51 <strong>Royal Edition active:</strong> Yellow Gold, Rose Gold, and Platinum with metallic sheen on velvet dark cards.',
      col0: '1st symbol color',
      col1: '2nd symbol color',
      col2: '3rd symbol color',
      preset0: 'Standard',
      preset1: 'Primary',
      preset2: 'Contrast',
      presetGold: '\uD83D\uDC51 Gold Edition',
      btnSaveClose: 'Save & Close',
      warnBoth: 'Warning: Selected colors are very similar and one is too light on a white card.',
      warnClose: 'Warning: Selected colors are very similar and may be hard to tell apart.',
      warnLight: 'Warning: One of the colors is very light and may be hard to see on the card.',
      helpTitle: 'How to Play Diffequa',
      helpClose: 'Got it, play',
      helpOr: 'or',
      endPerfectBadge: '\uD83D\uDC51 PERFECT GAME \u2013 CLEAN BOARD',
      endPerfectTitle: 'Masterful Performance!',
      endPerfectSub: 'You collected all 81 cards down to the very last one (0 remaining).',
      endJuniorPerfectBadge: '\u2B50 TRAINING COMPLETE \u2013 9/9',
      endJuniorPerfectTitle: 'Great Job!',
      endJuniorPerfectSub: 'You cleared the entire 27-card starter deck down to the last card.',
      endJuniorNote: 'Tip: To unlock bonus shapes and the Royal Gold Edition, switch to <strong>Classic (81 cards)</strong> in Settings (\u2699).',
      endPuzzleBadge: '\uD83E\uDDE9 PUZZLE SOLVED',
      endPuzzleTitle: 'All Triples Discovered!',
      endPuzzleSub: 'You found all {tot} hidden combinations in this layout.',
      endNormalTitle: 'Round Over',
      endNormalSub: '{n} cards remain on the table with no valid triples left.',
      endScoreLine: 'Found: {score} / {max} triples',
      reward1: '\uD83C\uDF89 1st Reward unlocked in Settings (\u2699):<br>New bonus shape <strong>Cross X</strong>!',
      reward2: '\uD83C\uDF89 2nd Reward unlocked in Settings (\u2699):<br>New bonus shape <strong>Ring</strong>!',
      reward3: '\uD83C\uDF89 Top Reward unlocked in Settings (\u2699):<br><strong>Crown Shape</strong> & <strong>Royal Gold Edition</strong>!',
      rewardMore: '\uD83D\uDC51 Total cleared boards: <strong>{n}</strong>',
      btnEndUndo: '\u21A9 Undo last move & try another way',
      btnPlayAgain: 'Play Again',
      btnEndClose: 'View Board',
      msgSetOk: 'Great! Valid Diffequa triple.',
      msgPuzzleFoundOk: 'Nice! Found triple {cur} of {tot}.',
      msgPuzzleAlready: 'You already found this triple! Look for another one.',
      msgSetErr: 'Not a valid triple \u2013 try another combination.',
      msgReshuffle: 'No valid triple on the board \u2013 cards reshuffled!',
      msgUndo: 'Last move undone.',
      msgHint: 'Hint ({cur}/{tot}) \u2013 find the 3rd card!',
      msgResume: 'Resuming your saved game.',
      msgGameFinished: 'Game finished \u2013 tap New Game to play again.',
      shapes: {
        square: 'Square',
        circle: 'Circle',
        triangle: 'Triangle',
        diamond: 'Diamond',
        hexagon: 'Hexagon',
        star: 'Star',
        heart: 'Heart',
        cross: 'Cross',
        drop: 'Drop',
        xcross: 'Cross X',
        donut: 'Ring',
        crown: 'Crown'
      },
      buildHelpHtml: function(shapesListStr) {
        return (
          '<p>The goal is to find a <strong>triple of cards</strong> that forms a valid match.</p>' +
          '<p>Every card has <strong>4 features</strong>:</p>' +
          '<div class="help-box"><ul>' +
            '<li><strong>Shape:</strong> ' + shapesListStr + ' (customizable in \u2699)</li>' +
            '<li><strong>Count:</strong> 1, 2, or 3 symbols</li>' +
            '<li><strong>Fill:</strong> empty, striped, or solid</li>' +
            '<li><strong>Color:</strong> three distinct colors (customizable in \u2699)</li>' +
          '</ul></div>' +
          '<p><strong>The Golden Rule:</strong> For a chosen triple, each of the 4 features must be either <strong>all the same</strong> (<em>equal</em>) across all three cards, or <strong>all different</strong> (<em>different</em>) on each card.</p>' +
          '<div class="help-box help-example-box">' +
            '<strong>Game Modes in Settings (\u2699):</strong><br>' +
            '&bull; <strong>Classic (81 cards):</strong> Full 4\u00D74 game (unlocks rewards).<br>' +
            '&bull; <strong>Training (27 cards):</strong> 3\u00D73 grid with only 3 features (solid fill).<br>' +
            '&bull; <strong>Puzzle (Find All):</strong> 4\u00D74 grid; cards stay put, uncover all 6\u20138 hidden triples in one layout.' +
          '</div>' +
          '<p style="color: #f87171;"><strong>Watch out:</strong> If 2 cards share the same color and the 3rd card has a different color, it is NOT valid!</p>'
        );
      }
    }
  }
};
