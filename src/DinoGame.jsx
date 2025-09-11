import React, { useState, useEffect, useRef } from "react";

const DinoGame = ({ onClose }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("countdown"); // countdown, playing, gameOver
  const [countdown, setCountdown] = useState(3);
  const [displayScore, setDisplayScore] = useState(0);

  // Game constants
  const dinoWidth = 40;
  const dinoHeight = 60;
  const groundHeight = 100;
  const gravity = 0.6;

  // Game state using refs to be mutable within game loop
  const dinoY = useRef(0);
  const dinoVelocityY = useRef(0);
  const isJumping = useRef(false);
  const obstacles = useRef([]);
  const frameCount = useRef(0);
  const score = useRef(0);
  const gameSpeed = useRef(5);

  const nextObstacleFrame = useRef(100);

  useEffect(() => {
    if (gameState === "countdown") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setGameState("playing");
            startGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const startGame = () => {
    dinoY.current = canvasRef.current.height - groundHeight - dinoHeight;
    dinoVelocityY.current = 0;
    isJumping.current = false;
    obstacles.current = [];
    frameCount.current = 0;
    score.current = 0;
    setDisplayScore(0);
    gameSpeed.current = 2;
    nextObstacleFrame.current = 100;
    gameLoop();
  };

  const gameLoop = () => {
    if (gameState === "gameOver") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw dino
    dinoVelocityY.current += gravity;
    dinoY.current += dinoVelocityY.current;

    if (dinoY.current > canvas.height - groundHeight - dinoHeight) {
      dinoY.current = canvas.height - groundHeight - dinoHeight;
      dinoVelocityY.current = 0;
      isJumping.current = false;
    }

    drawDino(ctx);

    // Update and draw obstacles
    updateObstacles(canvas);
    drawObstacles(ctx);

    // Collision detection
    if (checkCollision()) {
      setGameState("gameOver");
      return;
    }

    // Update score and speed
    score.current++;
    setDisplayScore(Math.floor(score.current / 5));
    if (score.current > 0 && score.current % 50 === 0) {
      gameSpeed.current += 0.1;
    }

    frameCount.current++;
    requestAnimationFrame(gameLoop);
  };

  const drawDino = (ctx) => {
    ctx.fillStyle = "grey";
    ctx.fillRect(50, dinoY.current, dinoWidth, dinoHeight);
  };

  const updateObstacles = (canvas) => {
    if (frameCount.current > nextObstacleFrame.current) {
      const obstacleHeight = Math.random() * 40 + 20;
      const obstacleWidth = 20;
      const newObstacle = {
        x: canvas.width,
        y: canvas.height - groundHeight - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight,
      };
      obstacles.current.push(newObstacle);

      // Decide if we spawn a pair
      if (Math.random() > 0.5) {
        const nextObstacleHeight = Math.random() * 40 + 20;
        const nextObstacleWidth = 20;
        const nextObstacle = {
          x: canvas.width + obstacleWidth + (Math.random() * 100 + 250), // 250-350px away
          y: canvas.height - groundHeight - nextObstacleHeight,
          width: nextObstacleWidth,
          height: nextObstacleHeight,
        };
        obstacles.current.push(nextObstacle);
      }

      const minGap = canvas.width / 2; // Minimum distance between groups
      const maxGap = canvas.width; // Maximum distance
      const distance = Math.random() * (maxGap - minGap) + minGap;
      const gapInFrames = distance / gameSpeed.current;

      nextObstacleFrame.current = frameCount.current + gapInFrames;
    }

    obstacles.current.forEach((obstacle) => {
      obstacle.x -= gameSpeed.current;
    });

    obstacles.current = obstacles.current.filter(
      (obstacle) => obstacle.x + obstacle.width > 0
    );
  };

  const drawObstacles = (ctx) => {
    ctx.fillStyle = "red";
    obstacles.current.forEach((obstacle) => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
  };

  const checkCollision = () => {
    const dino = {
      x: 50,
      y: dinoY.current,
      width: dinoWidth,
      height: dinoHeight,
    };
    for (const obstacle of obstacles.current) {
      if (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
      ) {
        return true;
      }
    }
    return false;
  };

  const jump = () => {
    if (!isJumping.current) {
      dinoVelocityY.current = -15;
      isJumping.current = true;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && gameState === "playing") {
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  const handleRestart = () => {
    setCountdown(3);
    setGameState("countdown");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "300px" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          fontSize: "24px",
          zIndex: 10,
        }}
      >
        Score: {displayScore}
      </div>
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
      >
        Close
      </button>
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        style={{ background: "transparent" }}
      />
      {gameState === "countdown" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "48px",
            color: "white",
          }}
        >
          {countdown}
        </div>
      )}
      {gameState === "gameOver" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontSize: "48px", color: "white" }}>Game Over</div>
          <div style={{ fontSize: "24px", color: "white", marginTop: "10px" }}>
            Score: {displayScore}
          </div>
          <button
            onClick={handleRestart}
            style={{ marginTop: "20px", fontSize: "24px", cursor: "pointer" }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default DinoGame;
