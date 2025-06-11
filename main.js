
import React from 'react';
import ReactDOM from 'react-dom/client';

const { useState, useEffect, useCallback } = React;

// Constants (from constants.ts)
const BOARD_SIZE = 5;
const MAX_LEVELS = 5;
const HANDICAP_STONES_PER_LEVEL = [1, 2, 3, 4, 5]; // Index 0 for Level 1

// Types (from types.ts)
const CellState = {
  Empty: 0,
  Black: 1,
  White: 2,
};

// Component: Cell (from components/Cell.tsx)
const Cell = ({ state, onClick, isPlayerTurn }) => {
  let cellStyle = 'border border-yellow-600';
  let ariaLabel = '';
  let disabled = true;
  let interactiveClasses = '';

  switch (state) {
    case CellState.White:
      cellStyle += ' bg-slate-50';
      ariaLabel = '白子';
      break;
    case CellState.Black:
      cellStyle += ' bg-slate-950';
      ariaLabel = '黑子';
      break;
    case CellState.Empty:
      cellStyle += ' bg-yellow-400';
      ariaLabel = '空点，可落子';
      disabled = false;
      interactiveClasses = 'hover:bg-yellow-300 cursor-pointer focus:ring-sky-500';
      break;
    default:
      cellStyle += ' bg-red-500';
      ariaLabel = '未定义状态';
      break;
  }

  return (
    React.createElement('button', {
      onClick: !disabled ? onClick : undefined,
      className: `aspect-square w-full transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75 ${cellStyle} ${interactiveClasses}`,
      "aria-label": ariaLabel,
      disabled: disabled
    })
  );
};

// Component: Board (from components/Board.tsx)
const Board = ({ board, onCellClick }) => {
  if (!board || board.length === 0) {
    return React.createElement('div', { className: "text-center text-slate-400" }, "Loading board...");
  }
  const gridSize = board.length;

  return (
    React.createElement('div', {
      className: "grid gap-px p-0.5 bg-yellow-500 rounded-md",
      style: { gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` },
      role: "grid",
      "aria-label": "Game board"
    },
      board.map((row, rowIndex) =>
        row.map((cellState, colIndex) =>
          React.createElement(Cell, {
            key: `${rowIndex}-${colIndex}`,
            state: cellState,
            onClick: () => onCellClick(rowIndex, colIndex),
            isPlayerTurn: true, // This prop might need dynamic value based on game state
          })
        )
      )
    )
  );
};

// Component: GameTitle (from components/GameTitle.tsx)
const GameTitle = ({ title = "方块大作战", subtitle = "进入关卡，挑战AI！" }) => {
  return (
    React.createElement('div', { className: "my-6 sm:my-8 text-center" },
      React.createElement('h1', { className: "text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400" },
        title
      ),
      React.createElement('p', { className: "text-yellow-400 mt-1.5 sm:mt-2 text-xs sm:text-sm" }, subtitle)
    )
  );
};

// Component: Controls (from components/Controls.tsx)
const Controls = ({ currentPlayer, scores, onReset, onEndGameEarly, gameStatus, currentLevel, maxLevels }) => {
  const turnText = gameStatus === 'playing'
    ? (currentPlayer === CellState.White ? "玩家回合 (白棋)" : "AI 回合 (黑棋)")
    : "游戏结束";

  const isPlaying = gameStatus === 'playing';

  const baseButtonClasses = "font-semibold shadow-md transition-all duration-200 ease-in-out focus:outline-none transform hover:scale-105 active:scale-95 focus:ring-2 focus:ring-opacity-75";
  const buttonUnifiedStyle = `${baseButtonClasses} bg-transparent border border-slate-300 text-slate-100 hover:bg-slate-700 focus:ring-sky-500`;
  const disabledButtonUnifiedStyle = `${baseButtonClasses} bg-transparent border border-slate-500 text-slate-500 cursor-not-allowed`;

  return (
    React.createElement('div', { className: "mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-center text-slate-300" },
      React.createElement('div', { className: "mb-3 sm:mb-0 text-center sm:text-left" },
        React.createElement('h2', { className: "text-lg sm:text-xl font-semibold text-slate-100" }, turnText),
        React.createElement('p', { className: "text-sm text-slate-400" },
          `关卡: ${currentLevel} / ${maxLevels} | 得分: 白棋: ${scores.white} - 黑棋: ${scores.black}`
        )
      ),
      React.createElement('div', { className: "flex space-x-2" },
        React.createElement('button', {
          onClick: onReset,
          className: `px-4 py-2 rounded-md ${!isPlaying && gameStatus === 'gameOver' ? disabledButtonUnifiedStyle : buttonUnifiedStyle }`,
          "aria-label": "重试本关",
          disabled: !isPlaying && gameStatus === 'gameOver'
        }, "重试本关"),
        isPlaying && React.createElement('button', {
          onClick: onEndGameEarly,
          className: `px-4 py-2 rounded-md ${buttonUnifiedStyle}`,
          "aria-label": "提前结束"
        }, "提前结束")
      )
    )
  );
};

// Component: Modal (from components/Modal.tsx)
const Modal = ({
  title,
  message,
  primaryAction,
  primaryActionText,
  secondaryAction,
  secondaryActionText,
  tertiaryAction,
  tertiaryActionText
}) => {
  const baseButtonClasses = "w-full font-semibold shadow-md transition-all duration-200 ease-in-out focus:outline-none transform hover:scale-105 active:scale-95 focus:ring-2 focus:ring-opacity-75 px-6 py-3 rounded-xl";
  const unifiedButtonLook = "bg-transparent border border-slate-300 text-slate-100 hover:bg-slate-700 focus:ring-sky-500";

  return (
    React.createElement('div', {
      className: "fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "modal-title"
    },
      React.createElement('div', { className: "bg-slate-800/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl text-center w-full max-w-md transform transition-all duration-300 ease-in-out scale-100 opacity-100 border border-slate-600/70 shadow-[0_0_20px_5px_theme(colors.sky.800/50)]" },
        React.createElement('h2', { id: "modal-title", className: "text-2xl sm:text-3xl font-bold text-yellow-400 mb-4" }, title),
        React.createElement('p', { className: "text-slate-200 mb-6 sm:mb-8" }, message),
        React.createElement('div', { className: "flex flex-col space-y-3" },
          React.createElement('button', {
            onClick: primaryAction,
            className: `${baseButtonClasses} ${unifiedButtonLook}`
          }, primaryActionText),
          secondaryAction && secondaryActionText && React.createElement('button', {
            onClick: secondaryAction,
            className: `${baseButtonClasses} ${unifiedButtonLook}`
          }, secondaryActionText),
          tertiaryAction && tertiaryActionText && React.createElement('button', {
            onClick: tertiaryAction,
            className: `${baseButtonClasses} ${unifiedButtonLook}`
          }, tertiaryActionText)
        )
      )
    )
  );
};

// Component: LevelSelection (from components/LevelSelection.tsx)
const LevelSelection = ({ onSelectLevel, maxLevels, onRandomStart, onEndGame }) => {
  const baseButtonClasses = "font-semibold shadow-md transition-all duration-200 ease-in-out focus:outline-none transform hover:scale-105 active:scale-95 focus:ring-2 focus:ring-opacity-75";
  const actionButtonUnifiedStyle = `${baseButtonClasses} bg-transparent border border-slate-300 text-slate-100 hover:bg-slate-800 focus:ring-sky-500`;

  const levelStopData = [
    { id: 1, cx: '15%', cy: '80%' },
    { id: 2, cx: '40%', cy: '80%' },
    { id: 3, cx: '65%', cy: '80%' },
    { id: 4, cx: '50%', cy: '30%' },
    { id: 5, cx: '75%', cy: '30%' },
  ];

  const pathSegments = [
    { top: 'calc(80% - 5px)', left: '15%', width: '25%', height: '10px' },
    { top: 'calc(80% - 5px)', left: '40%', width: '25%', height: '10px' },
    {
      top: '30%',
      left: '50%',
      width: '32.27%',
      height: '10px',
      transform: 'rotate(62.34deg)',
      transformOrigin: '0% 50%'
    },
    { top: 'calc(30% - 5px)', left: '50%', width: '25%', height: '10px' },
  ];

  const pathBaseStyle = "absolute bg-sky-400 shadow-[0_0_10px_3px_theme(colors.sky.300)] rounded-full z-0";
  const levelStopBaseStyle = `absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center 
                              bg-slate-800 border-2 border-slate-300 text-slate-100 
                              font-bold text-lg shadow-md 
                              hover:border-sky-300 hover:text-sky-200
                              focus:border-sky-400
                              transition-all duration-200 ease-in-out z-10 
                              transform -translate-x-1/2 -translate-y-1/2 
                              hover:scale-110 active:scale-100 
                              focus:outline-none focus:ring-2 focus:ring-sky-500/70`;

  const availableLevels = levelStopData.filter(level => level.id <= maxLevels);

  return (
    React.createElement('div', { className: "h-screen w-screen bg-slate-950 text-slate-100 selection:bg-yellow-500 selection:text-black overflow-hidden flex flex-col p-1 sm:p-2" },
      React.createElement('main', { className: "flex-grow bg-slate-900 p-4 sm:p-6 md:p-8 border-2 border-slate-700 rounded-lg shadow-xl flex flex-col items-center overflow-y-auto" },
        React.createElement('div', { className: "flex flex-col items-center space-y-6 sm:space-y-8 w-full max-w-md flex-grow" },
          React.createElement('div', { className: "text-center" },
            React.createElement('h1', { className: "font-sans text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400" }, "方块大作战"),
            React.createElement('p', { className: "text-yellow-400 mt-2 text-sm sm:text-base" }, "黑白交锋，智定乾坤！")
          ),
          React.createElement('div', { className: "relative w-full h-48 sm:h-56 md:h-64" },
            pathSegments.map((segment, index) =>
              React.createElement('div', {
                key: `path-${index}`,
                className: pathBaseStyle,
                style: {
                  top: segment.top,
                  left: segment.left,
                  width: segment.width,
                  height: segment.height,
                  transform: segment.transform,
                  transformOrigin: segment.transformOrigin,
                },
                role: "presentation"
              })
            ),
            availableLevels.map((level) =>
              React.createElement('button', {
                key: level.id,
                onClick: () => onSelectLevel(level.id),
                className: levelStopBaseStyle,
                style: { left: level.cx, top: level.cy },
                "aria-label": `开始第 ${level.id} 关`
              }, level.id)
            )
          ),
          React.createElement('div', { className: "w-full flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0" },
            React.createElement('button', {
              onClick: onRandomStart,
              className: `w-full sm:flex-1 px-6 py-3 rounded-full ${actionButtonUnifiedStyle}`,
              "aria-label": "随机开始游戏"
            }, "随机开始"),
            React.createElement('button', {
              onClick: onEndGame,
              className: `w-full sm:flex-1 px-6 py-3 rounded-full ${actionButtonUnifiedStyle}`,
              "aria-label": "结束游戏"
            }, "结束游戏")
          ),
          React.createElement('footer', { className: "text-center text-slate-500 text-xs pt-4 border-t border-slate-700 w-full mt-auto" },
            React.createElement('p', null, `© ${new Date().getFullYear()} 方块大作战1.0 by zeen.`)
          )
        )
      )
    )
  );
};


// Main App Component (from App.tsx)
const App = () => {
  const [appPhase, setAppPhase] = useState('levelSelection'); // 'levelSelection' | 'gameActive'
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(CellState.Black); // CellState.White | CellState.Black
  const [scores, setScores] = useState({ white: 0, black: 0 });
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'gameOver'
  const [winner, setWinner] = useState(null); // CellState.White | CellState.Black | 'draw' | null
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  const calculateScores = useCallback((currentBoard) => {
    let whiteStones = 0;
    let blackStones = 0;
    currentBoard.forEach(row => {
      row.forEach(cell => {
        if (cell === CellState.White) whiteStones++;
        else if (cell === CellState.Black) blackStones++;
      });
    });
    return { white: whiteStones, black: blackStones };
  }, []);

  const initializeBoard = useCallback((level) => {
    let newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CellState.Empty));
    const numHandicapStones = HANDICAP_STONES_PER_LEVEL[level - 1] || 0;

    if (numHandicapStones > 0) {
      const emptyCells = [];
      newBoard.forEach((row, r_idx) => {
        row.forEach((_, c_idx) => {
          emptyCells.push({ r: r_idx, c: c_idx });
        });
      });

      for (let i = 0; i < numHandicapStones && emptyCells.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { r, c } = emptyCells.splice(randomIndex, 1)[0];
        newBoard[r][c] = CellState.Black;
      }
      setCurrentPlayer(CellState.White);
    } else {
      setCurrentPlayer(CellState.Black);
    }

    setBoard(newBoard);
    const initialScores = calculateScores(newBoard);
    setScores(initialScores);
    setGameStatus('playing');
    setWinner(null);
    setShowGameOverModal(false);
  }, [calculateScores]);

  useEffect(() => {
    if (appPhase === 'gameActive') {
      initializeBoard(currentLevel);
    }
  }, [appPhase, currentLevel, initializeBoard]);

  const handleSelectLevel = (level) => {
    setCurrentLevel(level);
    setAppPhase('gameActive');
  };

  const handleReturnToLevelSelection = () => {
    setAppPhase('levelSelection');
    setShowGameOverModal(false);
  };

  const handleRandomStart = () => {
    const randomLevel = Math.floor(Math.random() * MAX_LEVELS) + 1;
    handleSelectLevel(randomLevel);
  };

  const handleEndGameApp = () => {
    alert("游戏结束。\n请手动关闭浏览器标签页或窗口以退出游戏。");
    console.log("User initiated app exit.");
  };

  const checkGameOver = useCallback((currentBoard) => {
    return currentBoard.every(row => row.every(cell => cell !== CellState.Empty));
  }, []);

  const getNeighbors = (r, c, size) => {
    const neighbors = [];
    if (r > 0) neighbors.push([r - 1, c]);
    if (r < size - 1) neighbors.push([r + 1, c]);
    if (c > 0) neighbors.push([r, c - 1]);
    if (c < size - 1) neighbors.push([r, c + 1]);
    return neighbors;
  };

  const findGroupWithLiberties = useCallback((
    currentBoard,
    startR,
    startC,
    color,
    visitedInPass
  ) => {
    const q = [];
    const groupStones = [];
    const liberties = new Set();

    if (startR < 0 || startR >= BOARD_SIZE || startC < 0 || startC >= BOARD_SIZE || currentBoard[startR][startC] !== color) {
        return { groupStones, liberties };
    }

    q.push([startR, startC]);
    visitedInPass.add(`${startR},${startC}`);

    let head = 0;
    while (head < q.length) {
      const [r_val, c_val] = q[head++]; // Renamed to avoid conflict with outer r, c
      groupStones.push([r_val, c_val]);

      getNeighbors(r_val, c_val, BOARD_SIZE).forEach(([nr, nc]) => {
        if (currentBoard[nr][nc] === CellState.Empty) {
          liberties.add(`${nr},${nc}`);
        } else if (currentBoard[nr][nc] === color && !visitedInPass.has(`${nr},${nc}`)) {
          visitedInPass.add(`${nr},${nc}`);
          q.push([nr, nc]);
        }
      });
    }
    return { groupStones, liberties };
  }, []);

  const checkAndFlipGroups = useCallback((
    currentBoard,
    targetColor,
    flipToColor
  ) => {
    const newBoard = currentBoard.map(row => [...row]);
    const visitedForThisFlipPass = new Set();
    let totalFlippedThisPass = 0;

    for (let r_idx = 0; r_idx < BOARD_SIZE; r_idx++) {
      for (let c_idx = 0; c_idx < BOARD_SIZE; c_idx++) {
        if (newBoard[r_idx][c_idx] === targetColor && !visitedForThisFlipPass.has(`${r_idx},${c_idx}`)) {
          const groupFindingVisited = new Set();
          const { groupStones: groupB_stones, liberties } = findGroupWithLiberties(newBoard, r_idx, c_idx, targetColor, groupFindingVisited);

          groupB_stones.forEach(([gr, gc]) => visitedForThisFlipPass.add(`${gr},${gc}`));

          if (liberties.size === 0 && groupB_stones.length > 0) {
            const groupA_stones_coords = new Set();
            groupB_stones.forEach(([br, bc]) => {
              getNeighbors(br, bc, BOARD_SIZE).forEach(([nr, nc]) => {
                if (newBoard[nr][nc] === flipToColor) {
                  groupA_stones_coords.add(`${nr},${nc}`);
                }
              });
            });

            const countA = groupA_stones_coords.size;
            const countB = groupB_stones.length;

            if (countA >= countB) {
              groupB_stones.forEach(([gr, gc]) => {
                newBoard[gr][gc] = flipToColor;
                totalFlippedThisPass++;
              });
            }
          }
        }
      }
    }
    return { board: newBoard, flippedCount: totalFlippedThisPass };
  }, [findGroupWithLiberties]);

  const processStandardCaptures = useCallback((
    boardState,
    actingPlayerColor
  ) => {
    let newBoard = boardState.map(row => [...row]);
    const opponentColor = actingPlayerColor === CellState.White ? CellState.Black : CellState.White;

    const resultOpponentCapture = checkAndFlipGroups(newBoard, opponentColor, actingPlayerColor);
    newBoard = resultOpponentCapture.board;
    const opponentStonesCapturedThisTurn = resultOpponentCapture.flippedCount;

    const resultSelfCapture = checkAndFlipGroups(newBoard, actingPlayerColor, opponentColor);
    newBoard = resultSelfCapture.board;

    return { board: newBoard, opponentStonesCapturedThisTurn };
  }, [checkAndFlipGroups]);

  const processFullTurnEffects = useCallback((
    boardAfterPlacement,
    actingPlayerColor
  ) => {
    const { board: finalBoard, opponentStonesCapturedThisTurn: opponentStonesCapturedInitial } = processStandardCaptures(boardAfterPlacement, actingPlayerColor);
    return { finalBoard, opponentStonesCapturedInitial };
  }, [processStandardCaptures]);

  const determineWinner = useCallback((currentScores) => {
    if (currentScores.white > currentScores.black) setWinner(CellState.White);
    else if (currentScores.black > currentScores.white) setWinner(CellState.Black);
    else setWinner('draw');
  }, []);

  const makeAiMove = useCallback((currentBoard) => {
    const emptyCells = [];
    currentBoard.forEach((row, r_idx) => {
      row.forEach((cell, c_idx) => {
        if (cell === CellState.Empty) {
          emptyCells.push({ r: r_idx, c: c_idx });
        }
      });
    });

    if (emptyCells.length === 0) return currentBoard;

    let bestMoves = [];
    let highestScore = -Infinity;

    const initialScoresOnCurrentBoard = calculateScores(currentBoard);

    const CAPTURE_SCORE_WEIGHT = 1000;
    const ATARI_BONUS = 50;
    const PRESSURE_BONUS = 20;
    const CENTER_MOVE_BONUS = 10;

    for (const cell of emptyCells) {
      const { r, c } = cell; // Current move coordinates
      let moveScore = 0;

      let boardAfterAIPlacement = currentBoard.map(row => [...row]);
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || boardAfterAIPlacement[r][c] !== CellState.Empty) {
          continue;
      }
      boardAfterAIPlacement[r][c] = CellState.Black;

      const { finalBoard: simulatedFinalBoard } = processFullTurnEffects(boardAfterAIPlacement, CellState.Black);
      const scoresAfterAllChanges = calculateScores(simulatedFinalBoard);

      const netChangeForAI = (scoresAfterAllChanges.black - scoresAfterAllChanges.white) - (initialScoresOnCurrentBoard.black - initialScoresOnCurrentBoard.white);
      moveScore += netChangeForAI * CAPTURE_SCORE_WEIGHT;

      const isCenter = (r === Math.floor(BOARD_SIZE / 2) && c === Math.floor(BOARD_SIZE / 2));
      const isNearCenter = Math.abs(r - Math.floor(BOARD_SIZE / 2)) <=1 && Math.abs(c - Math.floor(BOARD_SIZE / 2)) <=1 && !isCenter;

      if (isCenter) {
        moveScore += CENTER_MOVE_BONUS * 1.5;
      } else if (isNearCenter) {
         moveScore += CENTER_MOVE_BONUS * 0.5;
      }

      let pressurePoints = 0;
      getNeighbors(r, c, BOARD_SIZE).forEach(([nr, nc]) => {
        if (currentBoard[nr][nc] === CellState.White) {
          const preMoveVisited = new Set();
          const { groupStones: whiteGroupBefore, liberties: libertiesBefore } = findGroupWithLiberties(currentBoard, nr, nc, CellState.White, preMoveVisited);

          if (whiteGroupBefore.length > 0 && simulatedFinalBoard[nr][nc] === CellState.White) {
            const postMoveVisited = new Set();
            const { liberties: libertiesAfter } = findGroupWithLiberties(simulatedFinalBoard, nr, nc, CellState.White, postMoveVisited);

            if (libertiesAfter.size < libertiesBefore.size) {
              pressurePoints += PRESSURE_BONUS;
              if (libertiesAfter.size === 1 && libertiesBefore.size > 1) {
                pressurePoints += ATARI_BONUS;
              }
            }
          }
        }
      });
      moveScore += pressurePoints;

      if (moveScore > highestScore) {
        highestScore = moveScore;
        bestMoves = [{ r, c, score: moveScore }];
      } else if (moveScore === highestScore) {
        bestMoves.push({ r, c, score: moveScore });
      }
    }

    let chosenMove;
    if (bestMoves.length > 0) {
      chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    } else if (emptyCells.length > 0) {
      chosenMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else {
        return currentBoard;
    }

    let boardAfterAIPlacement = currentBoard.map(row => [...row]);
    boardAfterAIPlacement[chosenMove.r][chosenMove.c] = CellState.Black;
    const { finalBoard: finalBoardAfterAIMove } = processFullTurnEffects(boardAfterAIPlacement, CellState.Black);
    return finalBoardAfterAIMove;

  }, [calculateScores, findGroupWithLiberties, processFullTurnEffects]);

  useEffect(() => {
    if (appPhase === 'gameActive' && currentPlayer === CellState.Black && gameStatus === 'playing') {
      const timeoutId = setTimeout(() => {
        const boardAfterAiFullTurn = makeAiMove(board);

        const newScores = calculateScores(boardAfterAiFullTurn);
        setBoard(boardAfterAiFullTurn);
        setScores(newScores);

        if (checkGameOver(boardAfterAiFullTurn)) {
          setGameStatus('gameOver');
          determineWinner(newScores);
          setShowGameOverModal(true);
        } else {
          setCurrentPlayer(CellState.White);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [appPhase, currentPlayer, board, gameStatus, makeAiMove, calculateScores, checkGameOver, determineWinner]);


  const handleCellClick = (row, col) => {
    if (gameStatus === 'gameOver' || board[row][col] !== CellState.Empty || currentPlayer !== CellState.White) {
      return;
    }

    let boardAfterPlayerPlacement = board.map(bRow => [...bRow]);
    boardAfterPlayerPlacement[row][col] = CellState.White;

    const { finalBoard: finalBoardState } = processFullTurnEffects(boardAfterPlayerPlacement, CellState.White);

    const newScores = calculateScores(finalBoardState);
    setBoard(finalBoardState);
    setScores(newScores);

    if (checkGameOver(finalBoardState)) {
      setGameStatus('gameOver');
      determineWinner(newScores);
      setShowGameOverModal(true);
    } else {
      setCurrentPlayer(CellState.Black);
    }
  };

  const handleResetGame = () => {
    setShowGameOverModal(false);
    initializeBoard(currentLevel);
  };

  const handleEndGameEarly = () => {
    if (gameStatus === 'playing') {
      setGameStatus('gameOver');
      determineWinner(scores);
      setShowGameOverModal(true);
    }
  };

  const handleAdvanceToNextLevel = () => {
    setShowGameOverModal(false);
    if (currentLevel < MAX_LEVELS) {
      setCurrentLevel(prevLevel => prevLevel + 1);
    } else {
      initializeBoard(MAX_LEVELS);
    }
  };

  const getModalInfo = () => {
    let modalTitle = "";
    const modalMessage = `最终得分: 白棋 ${scores.white} - 黑棋 ${scores.black}。`;

    const primaryActionText = "重玩此关";
    const primaryAction = handleResetGame;

    const tertiaryActionText = "返回首页";
    const tertiaryAction = handleReturnToLevelSelection;

    let secondaryActionText = undefined;
    let secondaryAction = undefined;

    if (winner === CellState.White) {
      modalTitle = currentLevel < MAX_LEVELS ? `第 ${currentLevel} 关获胜!` : "恭喜通关所有关卡!";
    } else if (winner === CellState.Black) {
      modalTitle = `第 ${currentLevel} 关失败`;
    } else {
      modalTitle = "平局!";
    }

    if (currentLevel < MAX_LEVELS && winner === CellState.White) { // Only show "Next Level" if won
        secondaryActionText = "下一关";
        secondaryAction = handleAdvanceToNextLevel;
    } else if (currentLevel === MAX_LEVELS && winner === CellState.White) {
        // Option for "Play Max Level Again" or similar if they beat the last level
        // For now, no specific secondary action if all levels are won.
    }


    return {
      modalTitle,
      modalMessage,
      primaryAction,
      primaryActionText,
      secondaryAction,
      secondaryActionText,
      tertiaryAction,
      tertiaryActionText
    };
  };

  const modalInfo = getModalInfo();


  if (appPhase === 'levelSelection') {
    return React.createElement(LevelSelection, {
            onSelectLevel: handleSelectLevel,
            maxLevels: MAX_LEVELS,
            onRandomStart: handleRandomStart,
            onEndGame: handleEndGameApp
           });
  }

  const handicapValue = HANDICAP_STONES_PER_LEVEL[currentLevel-1] || 0;
  const handicapText = handicapValue > 0 ? ` (${handicapValue}子让先)` : '';
  const gameSubtitle = `第 ${currentLevel} / ${MAX_LEVELS} 关。AI执黑${handicapText}。棋多者胜！`;

  const baseButtonClasses = "font-semibold shadow-md transition-all duration-200 ease-in-out focus:outline-none transform hover:scale-105 active:scale-95 focus:ring-2 focus:ring-opacity-75";
  const actionButtonUnifiedStyle = `${baseButtonClasses} bg-transparent border border-slate-300 text-slate-100 hover:bg-slate-700 focus:ring-sky-500`;


  return (
    React.createElement('div', { className: "h-screen w-screen bg-slate-950 text-slate-100 selection:bg-yellow-500 selection:text-black overflow-hidden flex flex-col p-1 sm:p-2" },
      React.createElement('main', { className: "flex-grow bg-slate-900 p-3 sm:p-4 md:p-6 border-2 border-slate-700 rounded-lg shadow-xl flex flex-col items-center overflow-y-auto" },
        React.createElement('div', { className: "w-full max-w-xl flex flex-col flex-grow" },
          React.createElement(GameTitle, {
            title: "方块大作战",
            subtitle: gameSubtitle
          }),
          React.createElement(Controls, {
            currentPlayer: currentPlayer,
            scores: scores,
            onReset: handleResetGame,
            onEndGameEarly: handleEndGameEarly,
            gameStatus: gameStatus,
            currentLevel: currentLevel,
            maxLevels: MAX_LEVELS
          }),
          board.length > 0 && React.createElement(Board, { board: board, onCellClick: handleCellClick }),
          React.createElement('p', { className: "text-center text-xs text-slate-400 mt-4 px-1 leading-normal" },
            `玩家执白 (${BOARD_SIZE}x${BOARD_SIZE} 棋盘)。`,
            React.createElement('br'),
            `AI 在第 ${currentLevel} 关有 ${handicapValue} 子让先。玩家 (白棋) 在AI让子后先行。`,
            React.createElement('br'),
            React.createElement('strong', { className: "text-yellow-300" }, "提子规则："), "包围对方棋子 (B组) 时，只有当你的直接参与包围的棋子 (A组) 数量大于或等于 B组棋子数量时，B组棋子才会被提掉！己方无气棋子同理。",
            React.createElement('br'),
            React.createElement('strong', { className: "text-yellow-300" }, "胜负："), "结束时棋盘上棋子多的一方获胜！"
          ),
          React.createElement('button', {
              onClick: handleReturnToLevelSelection,
              className: `mt-6 w-full px-4 py-3 rounded-lg ${actionButtonUnifiedStyle}`,
              "aria-label": "返回选关界面"
            }, "返回选关界面"
          ),
          React.createElement('footer', { className: "text-center text-slate-500 text-xs pt-4 mt-auto border-t border-slate-700" },
            React.createElement('p', null, `© ${new Date().getFullYear()} 方块大作战1.0 by zeen.`)
          )
        )
      ),
      showGameOverModal && winner !== null && React.createElement(Modal, {
        title: modalInfo.modalTitle,
        message: modalInfo.modalMessage,
        primaryAction: modalInfo.primaryAction,
        primaryActionText: modalInfo.primaryActionText,
        secondaryAction: modalInfo.secondaryAction,
        secondaryActionText: modalInfo.secondaryActionText,
        tertiaryAction: modalInfo.tertiaryAction,
        tertiaryActionText: modalInfo.tertiaryActionText
      })
    )
  );
};

// ReactDOM Rendering (from index.tsx)
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(App, null)
  )
);