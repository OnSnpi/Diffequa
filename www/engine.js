window.Diffequa = window.Diffequa || {};

window.Diffequa.Engine = (function() {
  var state = {
    gameMode: 'classic', // 'classic' | 'junior' | 'puzzle'
    deck: [],
    board: [],
    historyStack: [],
    selectedIndices: [],
    hintIndices: [],
    flashOkIndices: [],
    hintCursor: -1,
    score: 0,
    isGameOver: false,
    puzzleAllSets: [],
    puzzleFoundSets: []
  };

  function getBoardSlotCount() {
    return state.gameMode === 'junior' ? 9 : 16;
  }

  function getMaxPossibleScore() {
    if (state.gameMode === 'junior') return 9;
    if (state.gameMode === 'puzzle') return state.puzzleAllSets.length || 6;
    return 27;
  }

  function cloneCardsArray(arr) {
    var copy = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === null) {
        copy.push(null);
      } else {
        copy.push({
          shape: arr[i].shape,
          count: arr[i].count,
          fill: arr[i].fill,
          color: arr[i].color
        });
      }
    }
    return copy;
  }

  function cloneSetsArray(arr) {
    var copy = [];
    for (var i = 0; i < arr.length; i++) {
      copy.push([arr[i][0], arr[i][1], arr[i][2]]);
    }
    return copy;
  }

  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  }

  function createDeckForCurrentMode() {
    var d = [];
    if (state.gameMode === 'junior') {
      for (var shape = 0; shape < 3; shape++) {
        for (var count = 1; count <= 3; count++) {
          for (var color = 0; color < 3; color++) {
            d.push({ shape: shape, count: count, fill: 2, color: color });
          }
        }
      }
    } else {
      for (var s = 0; s < 3; s++) {
        for (var c = 1; c <= 3; c++) {
          for (var f = 0; f < 3; f++) {
            for (var col = 0; col < 3; col++) {
              d.push({ shape: s, count: c, fill: f, color: col });
            }
          }
        }
      }
    }
    return shuffle(d);
  }

  function isSet(c1, c2, c3) {
    if (!c1 || !c2 || !c3) return false;
    return (
      (c1.shape + c2.shape + c3.shape) % 3 === 0 &&
      (c1.count + c2.count + c3.count) % 3 === 0 &&
      (c1.fill + c2.fill + c3.fill) % 3 === 0 &&
      (c1.color + c2.color + c3.color) % 3 === 0
    );
  }

  function findAllSetsOnBoard() {
    var sets = [];
    var len = state.board.length;
    for (var i = 0; i < len; i++) {
      if (!state.board[i]) continue;
      for (var j = i + 1; j < len; j++) {
        if (!state.board[j]) continue;
        for (var k = j + 1; k < len; k++) {
          if (!state.board[k]) continue;
          if (isSet(state.board[i], state.board[j], state.board[k])) {
            sets.push([i, j, k]);
          }
        }
      }
    }
    return sets;
  }

  function sortTriple(arr) {
    return arr.slice().sort(function(a, b) { return a - b; });
  }

  function isSameTriple(t1, t2) {
    return t1[0] === t2[0] && t1[1] === t2[1] && t1[2] === t2[2];
  }

  function isPuzzleTripleAlreadyFound(triple) {
    var s = sortTriple(triple);
    for (var i = 0; i < state.puzzleFoundSets.length; i++) {
      if (isSameTriple(state.puzzleFoundSets[i], s)) return true;
    }
    return false;
  }

  function getRemainingPuzzleSets() {
    var rem = [];
    for (var i = 0; i < state.puzzleAllSets.length; i++) {
      if (!isPuzzleTripleAlreadyFound(state.puzzleAllSets[i])) {
        rem.push(state.puzzleAllSets[i]);
      }
    }
    return rem;
  }

  function pushHistorySnapshot() {
    state.historyStack.push({
      deck: cloneCardsArray(state.deck),
      board: cloneCardsArray(state.board),
      score: state.score,
      puzzleFoundSets: cloneSetsArray(state.puzzleFoundSets)
    });
    if (state.historyStack.length > 30) {
      state.historyStack.shift();
    }
  }

  function undoLastMove() {
    if (state.isGameOver || state.historyStack.length === 0) return false;
    var prev = state.historyStack.pop();
    state.deck = prev.deck;
    state.board = prev.board;
    state.score = prev.score;
    state.puzzleFoundSets = prev.puzzleFoundSets || [];
    state.selectedIndices = [];
    state.hintIndices = [];
    state.flashOkIndices = [];
    state.hintCursor = -1;
    state.isGameOver = false;
    return true;
  }

  function ensureValidBoard() {
    if (state.gameMode === 'puzzle') return { ended: false, reshuffled: false };

    var slotCount = getBoardSlotCount();
    for (var i = 0; i < slotCount; i++) {
      if (state.board[i] === null && state.deck.length > 0) {
        state.board[i] = state.deck.pop();
      }
    }

    var remainingOnBoard = 0;
    for (var r0 = 0; r0 < slotCount; r0++) {
      if (state.board[r0] !== null) remainingOnBoard++;
    }

    if (state.deck.length === 0 && remainingOnBoard === 0) {
      state.isGameOver = true;
      state.historyStack = [];
      return { ended: true, isPerfect: true, remainingCount: 0, reshuffled: false };
    }

    var attempts = 0;
    var reshuffled = false;
    while (findAllSetsOnBoard().length === 0) {
      var activeCards = [];
      for (var a = 0; a < slotCount; a++) {
        if (state.board[a] !== null) activeCards.push(state.board[a]);
      }
      if (state.deck.length === 0 || attempts > 30) {
        state.isGameOver = true;
        state.historyStack = [];
        return { ended: true, isPerfect: false, remainingCount: activeCards.length, reshuffled: reshuffled };
      }
      for (var c = 0; c < activeCards.length; c++) state.deck.push(activeCards[c]);
      shuffle(state.deck);
      for (var r = 0; r < slotCount; r++) state.board[r] = null;
      for (var n = 0; n < slotCount && state.deck.length > 0; n++) {
        state.board[n] = state.deck.pop();
      }
      attempts++;
      reshuffled = true;
    }

    return { ended: false, reshuffled: reshuffled };
  }

  function generatePuzzleBoard() {
    var slotCount = 16;
    var bestBoard = null;
    var bestSets = [];

    for (var attempt = 0; attempt < 200; attempt++) {
      var fullDeck = createDeckForCurrentMode();
      state.board = fullDeck.slice(0, slotCount);
      var sets = findAllSetsOnBoard();
      if (sets.length >= 6 && sets.length <= 8) {
        bestBoard = state.board;
        bestSets = sets;
        break;
      }
      if (sets.length >= 4 && (!bestBoard || Math.abs(sets.length - 7) < Math.abs(bestSets.length - 7))) {
        bestBoard = state.board.slice();
        bestSets = sets;
      }
    }

    state.board = bestBoard || createDeckForCurrentMode().slice(0, slotCount);
    state.deck = [];
    state.puzzleAllSets = [];
    for (var i = 0; i < bestSets.length; i++) {
      state.puzzleAllSets.push(sortTriple(bestSets[i]));
    }
    state.puzzleFoundSets = [];
  }

  function startNewGame() {
    state.historyStack = [];
    state.selectedIndices = [];
    state.hintIndices = [];
    state.flashOkIndices = [];
    state.hintCursor = -1;
    state.score = 0;
    state.isGameOver = false;
    state.puzzleAllSets = [];
    state.puzzleFoundSets = [];

    if (state.gameMode === 'puzzle') {
      generatePuzzleBoard();
      return { ended: false, reshuffled: false };
    } else {
      state.deck = createDeckForCurrentMode();
      var slotCount = getBoardSlotCount();
      state.board = [];
      for (var i = 0; i < slotCount; i++) state.board.push(null);
      return ensureValidBoard();
    }
  }

  function serialize() {
    return JSON.stringify({
      mode: state.gameMode,
      deck: state.deck,
      board: state.board,
      score: state.score,
      history: state.historyStack,
      isGameOver: state.isGameOver,
      puzzleAllSets: state.puzzleAllSets,
      puzzleFoundSets: state.puzzleFoundSets
    });
  }

  function restoreFromJSON(raw) {
    if (!raw) return false;
    try {
      var data = JSON.parse(raw);
      if (data && data.mode === state.gameMode && Array.isArray(data.board) && data.board.length === getBoardSlotCount()) {
        state.deck = Array.isArray(data.deck) ? data.deck : [];
        state.board = data.board;
        state.score = data.score || 0;
        state.historyStack = Array.isArray(data.history) ? data.history : [];
        state.isGameOver = Boolean(data.isGameOver);
        state.puzzleAllSets = Array.isArray(data.puzzleAllSets) ? data.puzzleAllSets : [];
        state.puzzleFoundSets = Array.isArray(data.puzzleFoundSets) ? data.puzzleFoundSets : [];
        state.selectedIndices = [];
        state.hintIndices = [];
        state.flashOkIndices = [];
        state.hintCursor = -1;
        return true;
      }
    } catch (e) {}
    return false;
  }

  return {
    state: state,
    getBoardSlotCount: getBoardSlotCount,
    getMaxPossibleScore: getMaxPossibleScore,
    isSet: isSet,
    findAllSetsOnBoard: findAllSetsOnBoard,
    sortTriple: sortTriple,
    isPuzzleTripleAlreadyFound: isPuzzleTripleAlreadyFound,
    getRemainingPuzzleSets: getRemainingPuzzleSets,
    pushHistorySnapshot: pushHistorySnapshot,
    undoLastMove: undoLastMove,
    ensureValidBoard: ensureValidBoard,
    startNewGame: startNewGame,
    serialize: serialize,
    restoreFromJSON: restoreFromJSON
  };
})();
