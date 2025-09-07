interface ResultScreenProps {
  lastBattleWinner: "player" | "opponent";
  playerWins: number;
  opponentWins: number;
  gameWinner: "player" | "opponent" | null;
  onContinue: () => void;
  onNewGame: () => void;
}

export default function ResultScreen({
  lastBattleWinner,
  playerWins,
  opponentWins,
  gameWinner,
  onContinue,
  onNewGame,
}: ResultScreenProps) {
  const round = playerWins + opponentWins;

  if (gameWinner) {
    return (
      <div className="screen result-screen game-over">
        <div className="result-content">
          <h1 className="game-over-title">
            {gameWinner === "player" ? "🎉 VICTORY! 🎉" : "💀 DEFEAT 💀"}
          </h1>
          <div className="final-score">
            <div className="score-display">
              <span className="player-score">You: {playerWins}</span>
              <span className="vs">vs</span>
              <span className="opponent-score">Opponent: {opponentWins}</span>
            </div>
          </div>
          <div className="game-over-message">
            {gameWinner === "player"
              ? "Congratulations! You've proven yourself as the ultimate autobattler!"
              : "Don't give up! Every defeat is a step towards victory!"}
          </div>
          <button className="new-game-button" onClick={onNewGame}>
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen result-screen">
      <div className="result-content">
        <h2>Round {round} Complete</h2>

        <div className="battle-result">
          <div
            className={`result-announcement ${
              lastBattleWinner === "player" ? "victory" : "defeat"
            }`}
          >
            {lastBattleWinner === "player"
              ? "🎉 YOU WON! 🎉"
              : "💀 YOU LOST 💀"}
          </div>
        </div>

        <div className="current-score">
          <div className="score-display">
            <span className="player-score">You: {playerWins}</span>
            <span className="vs">vs</span>
            <span className="opponent-score">Opponent: {opponentWins}</span>
          </div>
          <div className="score-progress">
            <div className="progress-bar">
              <div
                className="player-progress"
                style={{ width: `${(playerWins / 4) * 50}%` }}
              />
              <div
                className="opponent-progress"
                style={{ width: `${(opponentWins / 4) * 50}%` }}
              />
            </div>
            <div className="progress-labels">
              <span>First to 4 wins!</span>
            </div>
          </div>
        </div>

        <div className="result-message">
          {lastBattleWinner === "player"
            ? "Great job! Your team fought valiantly. Time to recruit more allies!"
            : "Don't worry! Your units will return stronger. Choose wisely in the next shop!"}
        </div>

        <button className="continue-button" onClick={onContinue}>
          CONTINUE TO SHOP
        </button>
      </div>
    </div>
  );
}
