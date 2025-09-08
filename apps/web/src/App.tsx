import { useEffect, useState } from "react";
import StartScreen from "./components/StartScreen";
import ShopScreen from "./components/ShopScreen";
import BattleScreen from "./components/BattleScreen";
import ResultScreen from "./components/ResultScreen";
import Menu from "./components/Menu";
import { generateShopUnits, generateOpponentTeam } from "./utils/gameLogic";
import { audioManager, enableAudioOnUserInteraction } from "./utils/audio";
import type { GameState, PlayerUnit, MONEY_CONSTANTS } from "./types/game";
import { MONEY_CONSTANTS as MONEY } from "./types/game";
import type { UnitDef } from "@nico/autobattler-battle-core";

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    phase: "start",
    playerTeam: [],
    playerWins: 0,
    opponentWins: 0,
    currentShopUnits: [],
    lastBattleWinner: null,
    gameWinner: null,
    money: MONEY.STARTING_MONEY,
  });

  const [currentOpponentTeam, setCurrentOpponentTeam] = useState<PlayerUnit[]>(
    []
  );
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize audio on component mount
  useEffect(() => {
    enableAudioOnUserInteraction();
    // Don't auto-start music - let user control it via menu
    audioManager.stop(); // Ensure music is stopped
    audioManager.setVolume(musicVolume);
    setIsMusicMuted(audioManager.getIsMuted());
    setIsMusicPlaying(false); // Start with music stopped

    return () => {
      audioManager.stop(); // Use stop instead of pause for complete shutdown
    };
  }, []);

  // ESC key handler for menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Game state handlers
  const startGame = () => {
    const shopUnits = generateShopUnits();
    setGameState({
      phase: "shop",
      playerTeam: [],
      playerWins: 0,
      opponentWins: 0,
      currentShopUnits: shopUnits,
      lastBattleWinner: null,
      gameWinner: null,
      money: MONEY.STARTING_MONEY,
    });
  };

  const selectUnit = (unit: UnitDef) => {
    // Don't allow purchase if not enough money
    if (gameState.money < MONEY.UNIT_COST) return;

    const newPlayerUnit: PlayerUnit = {
      id: `player_${gameState.playerTeam.length}_${Date.now()}`,
      def: unit,
      level: 1,
      preferredRow: 0, // Default to front row
    };

    setGameState((prev) => ({
      ...prev,
      playerTeam: [...prev.playerTeam, newPlayerUnit],
      money: prev.money - MONEY.UNIT_COST,
      // Remove the purchased unit from the shop
      currentShopUnits: prev.currentShopUnits.filter(
        (shopUnit: UnitDef) => shopUnit.id !== unit.id
      ),
    }));
  };

  const sellUnit = (unitId: string) => {
    setGameState((prev) => ({
      ...prev,
      playerTeam: prev.playerTeam.filter(
        (unit: PlayerUnit) => unit.id !== unitId
      ),
      money: prev.money + MONEY.SELL_VALUE,
    }));
  };

  const reorderTeam = (fromIndex: number, toIndex: number) => {
    setGameState((prev) => {
      const newTeam = [...prev.playerTeam];
      const [movedUnit] = newTeam.splice(fromIndex, 1);
      newTeam.splice(toIndex, 0, movedUnit);
      return { ...prev, playerTeam: newTeam };
    });
  };

  const toggleUnitRow = (unitId: string) => {
    setGameState((prev) => ({
      ...prev,
      playerTeam: prev.playerTeam.map((unit) =>
        unit.id === unitId
          ? { ...unit, preferredRow: unit.preferredRow === 0 ? 1 : 0 }
          : unit
      ),
    }));
  };

  const readyForBattle = () => {
    console.log("🔍 Ready for battle clicked!");
    console.log(
      "🔍 Player team:",
      gameState.playerTeam.map((u) => `${u.def.name}: row=${u.preferredRow}`)
    );

    const round = gameState.playerWins + gameState.opponentWins + 1;
    const opponentTeam = generateOpponentTeam(round);
    setCurrentOpponentTeam(opponentTeam);

    setGameState((prev) => ({
      ...prev,
      phase: "battle",
    }));
  };

  const completeBattle = (winner: "player" | "opponent") => {
    const newPlayerWins =
      winner === "player" ? gameState.playerWins + 1 : gameState.playerWins;
    const newOpponentWins =
      winner === "opponent"
        ? gameState.opponentWins + 1
        : gameState.opponentWins;

    const gameWinner =
      newPlayerWins >= 4 ? "player" : newOpponentWins >= 4 ? "opponent" : null;

    setGameState((prev) => ({
      ...prev,
      phase: "result",
      playerWins: newPlayerWins,
      opponentWins: newOpponentWins,
      lastBattleWinner: winner,
      gameWinner,
    }));
  };

  const continueToShop = () => {
    const shopUnits = generateShopUnits();
    setGameState((prev) => ({
      ...prev,
      phase: "shop",
      currentShopUnits: shopUnits,
      money: prev.money + MONEY.DAILY_INCOME, // Daily income
    }));
  };

  const startNewGame = () => {
    const shopUnits = generateShopUnits();
    setGameState({
      phase: "shop",
      playerTeam: [],
      playerWins: 0,
      opponentWins: 0,
      currentShopUnits: shopUnits,
      lastBattleWinner: null,
      gameWinner: null,
      money: MONEY.STARTING_MONEY,
    });
  };

  const restartGame = () => {
    setIsMenuOpen(false);
    startNewGame();
  };

  const backToHome = () => {
    setIsMenuOpen(false);
    setGameState({
      phase: "start",
      playerTeam: [],
      playerWins: 0,
      opponentWins: 0,
      currentShopUnits: [],
      lastBattleWinner: null,
      gameWinner: null,
      money: MONEY.STARTING_MONEY,
    });
  };

  // Render current game phase
  const renderCurrentPhase = () => {
    switch (gameState.phase) {
      case "start":
        return <StartScreen onStartGame={startGame} />;

      case "shop":
        return (
          <ShopScreen
            shopUnits={gameState.currentShopUnits}
            playerTeam={gameState.playerTeam}
            playerWins={gameState.playerWins}
            opponentWins={gameState.opponentWins}
            money={gameState.money}
            onSelectUnit={selectUnit}
            onSellUnit={sellUnit}
            onReorderTeam={reorderTeam}
            onToggleUnitRow={toggleUnitRow}
            onReady={readyForBattle}
          />
        );

      case "battle":
        return (
          <BattleScreen
            playerTeam={gameState.playerTeam}
            opponentTeam={currentOpponentTeam}
            playerWins={gameState.playerWins}
            opponentWins={gameState.opponentWins}
            onBattleComplete={completeBattle}
          />
        );

      case "result":
        return (
          <ResultScreen
            lastBattleWinner={gameState.lastBattleWinner!}
            playerWins={gameState.playerWins}
            opponentWins={gameState.opponentWins}
            gameWinner={gameState.gameWinner}
            onContinue={continueToShop}
            onNewGame={startNewGame}
          />
        );

      default:
        return <StartScreen onStartGame={startGame} />;
    }
  };

  return (
    <div className="game-app">
      {renderCurrentPhase()}

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isMusicPlaying={isMusicPlaying}
        setIsMusicPlaying={setIsMusicPlaying}
        isMusicMuted={isMusicMuted}
        setIsMusicMuted={setIsMusicMuted}
        musicVolume={musicVolume}
        setMusicVolume={setMusicVolume}
        onRestart={gameState.phase !== "start" ? restartGame : undefined}
        onBackToHome={gameState.phase !== "start" ? backToHome : undefined}
      />
    </div>
  );
}
