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
import io from "socket.io-client";

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [celebration, setCelebration] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stopedGameSound, setStopedGameSound] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentStake, setCurrentStake] = useState();
  const [user, setUser] = useState();
  const [selected, setSelected] = useState();
  const [myTurn, setMyturn] = useState(false);

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
    // gameSound.sound.play();
    const player = localStorage.getItem("player");
    if (player) {
      setCurrentStake(player);
      setUser(player);
      setMyturn(player === "X" ? true : false);
    }
  }, []);

  useEffect(() => {
    const newSocket = io("https://tic-tac-teo-socket.onrender.com/");
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // useEffect(() => {
  //   if (!xIsNext && !winner && !finished) {
  //     const timeoutId = setTimeout(() => {
  //       const newBoard = [...board];
  //       let moveMade = false;
  //       while (!moveMade) {
  //         const randomIndex = Math.floor(Math.random() * 9);
  //         if (!newBoard[randomIndex]) {
  //           newBoard[randomIndex] = "O";
  //           moveMade = true;
  //         }
  //       }
  //       clickSound.sound.play();
  //       setBoard(newBoard);
  //       setXIsNext(true);
  //       checkForWinner(newBoard);
  //     }, 500);
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [xIsNext, winner, finished]);

  function handleClick(index, socketCall, newB, newStake) {
    if (winner || board[index]) {
      return;
    }

    const newBoard = [...newB];
    const stake = newStake;
    newBoard[index] = stake;
    const data = { index, stake, newBoard, newStake };
    socketCall && socket.emit("on-stake", data);
    clickSound.sound.play();
    setCurrentStake(newStake === "O" ? "X" : "O");
    setBoard(newBoard);
    setXIsNext(!xIsNext);
    checkForWinner(newBoard, socketCall);
  }

  useEffect(() => {
    if (socket) {
      socket.on("on-stake", ({ index, newBoard, newStake }) => {
        handleClick(index, false, newBoard, newStake);
        console.log(newStake);
        newStake !== user && setMyturn(true);
      });
      socket.on("on-reset", () => {
        resetGame();
      });
    }
  }, [socket]);

  function checkForWinner(board, socketCall) {
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
        celebrationSound.sound.play();
        if (!socketCall) {
          if (user === board[a]) {
            toast.success(`🏆 you is winne`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
            setCelebration(true);
          } else {
            toast.error(`you is lose`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          }
        }
        setTimeout(() => {
          setCelebration(false);
        }, 20000);
        setTimeout(() => {
          setFinished(true);
        }, 1000);
        return;
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
      <button
        className="square"
        onClick={() => {
          if (myTurn) {
            handleClick(index, true, board, currentStake);
            setMyturn(false);
          }
        }}
      >
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

  return user ? (
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
        <div
          className="icon"
          onClick={() => {
            resetGame();
            socket.emit("on-reset");
          }}
        >
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
      <div className="user-wrapper">
        <div
          className={
            myTurn && !winner ? "user-container active" : "user-container"
          }
        >
          {myTurn && !winner && <span className="loader" />}
          <h2>{user}</h2>
        </div>
        <div
          className={
            !myTurn && !winner ? "user-container active" : "user-container"
          }
        >
          {!myTurn && !winner && <span className="loader" />}
          <h2>{user === "X" ? "O" : "X"}</h2>
        </div>
      </div>
      <div className="user-wrapper names">
        <h3>YOU</h3>
        <h3>JOHN</h3>
      </div>
      <div className="tic-tac-toe">
        {/* <h2>Your Are : {user}</h2> */}
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
        <button
          className="btn"
          onClick={() => {
            resetGame();
            socket.emit("on-reset");
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  ) : (
    <div className="choose-player-container">
      <h4>Please choose your player</h4>
      <div className="option">
        <button
          className={`square choose ${selected === "X" && "selected"}`}
          onClick={() => {
            setSelected("X");
          }}
        >
          X
        </button>
        <button
          className={`square choose ${selected === "O" && "selected"}`}
          onClick={() => {
            setSelected("O");
          }}
        >
          O
        </button>
      </div>
      <button
        className={`btn continue ${!selected && "disabled"}`}
        disabled={!selected}
        onClick={() => {
          localStorage.setItem("player", selected);
          setCurrentStake(selected);
          setUser(selected);
        }}
      >
        continue
      </button>
    </div>
  );
}

export default TicTacToe;
