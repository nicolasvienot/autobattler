interface StartScreenProps {
  onStartGame: () => void;
}

export default function StartScreen({ onStartGame }: StartScreenProps) {
  return (
    <div className="screen start-screen">
      <div className="start-content">
        <h1 className="game-title">AUTOBATTLER</h1>
        <p className="game-subtitle">Build your team, fight to victory!</p>
        <button className="play-button" onClick={onStartGame}>
          PLAY
        </button>
        <div className="game-rules">
          <h3>How to Play:</h3>
          <ul>
            <li>Choose units from the shop to build your team</li>
            <li>Battle against random opponents</li>
            <li>First to 4 wins takes the victory!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
