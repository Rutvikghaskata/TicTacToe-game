import React, { useEffect, useState } from "react";
import "./TicTacToe.css";
import ReactConfetti from "react-confetti";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Howl } from "howler";
import ClickSound from "./assets/click.wav";
import CelebrationSound from "./assets/celebration.mp3";
import GameSound from "./assets/game.mp3";
import { GiSoundOn, GiSoundOff } from "react-icons/gi";
import { TiRefreshOutline } from "react-icons/ti";

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [celebration, setCelebration] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stopedGameSound, setStopedGameSound] = useState(false);
  const gameSound = {
    sound: new Howl({
      src: [GameSound],
      loop: true,
    }),
  };
  const clickSound = {
    sound: new Howl({
      src: [ClickSound],
    }),
  };
  const celebrationSound = {
    sound: new Howl({
      src: [CelebrationSound],
    }),
  };

  useEffect(() => {
    gameSound.sound.play();
  }, []);

  useEffect(() => {
    if (!xIsNext && !winner && !finished) {
      const timeoutId = setTimeout(() => {
        const newBoard = [...board];
        let moveMade = false;
        while (!moveMade) {
          const randomIndex = Math.floor(Math.random() * 9);
          if (!newBoard[randomIndex]) {
            newBoard[randomIndex] = "O";
            moveMade = true;
          }
        }
        clickSound.sound.play();
        setBoard(newBoard);
        setXIsNext(true);
        checkForWinner(newBoard);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [xIsNext, winner, finished]);

  function handleClick(index) {
    if (winner || board[index]) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = "X";
    clickSound.sound.play();
    setBoard(newBoard);
    setXIsNext(false);
    checkForWinner(newBoard);
  }

  function checkForWinner(board) {
    const winningLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < winningLines.length; i++) {
      const [a, b, c] = winningLines[i];
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        setWinner(board[a]);
        setCelebration(true);
        celebrationSound.sound.play();
        toast.success(`🏆 ${board[a]} is winner`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }

    if (board.every((square) => square !== null)) {
      setWinner("Tie");
      toast.warning(`Match is Tie`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setTimeout(() => {
        winner && setFinished(true);
      }, 5000);
    }
  }

  function renderSquare(index) {
    return (
      <button className="square" onClick={() => handleClick(index)}>
        {board[index]}
      </button>
    );
  }

  function renderStatus() {
    if (winner) {
      return `Winner: ${winner}`;
    } else {
      return `Next player: ${xIsNext ? "X" : "O"}`;
    }
  }

  function resetGame() {
    clickSound.sound.play();
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setFinished(false);
  }

  const handleGameSound = () => {
    if (stopedGameSound) {
      gameSound.sound.play();
    } else {
      gameSound.sound.stop();
    }
    setStopedGameSound(!stopedGameSound);
  };

  return (
    <div>
      <ToastContainer />
      {celebration && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={1000}
          confettiSource={{
            x: window.innerWidth / 2 - 150,
            y: 10,
            w: 300,
            h: 0,
          }}
        />
      )}
      <div className="header">
        <div className="icon" onClick={resetGame}>
          <TiRefreshOutline color={"#ff00de"} size={20} />
        </div>
        <div className="icon" onClick={handleGameSound}>
          {stopedGameSound ? (
            <GiSoundOff color={"#ff00de"} size={20} />
          ) : (
            <GiSoundOn color={"#ff00de"} size={20} />
          )}
        </div>
      </div>
      <div className="tic-tac-toe">
        <div className={`board ${finished && "finished"}`}>
          <div className="row">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className="row">
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className="row">
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>
        <div className="status">{renderStatus()}</div>
        <button className="reset" onClick={resetGame}>
          Reset Game
        </button>
      </div>
    </div>
  );
}

export default TicTacToe;
