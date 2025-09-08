import { useEffect, useState } from "react";
import StartScreen from "./components/StartScreen";
import ShopScreen from "./components/ShopScreen";
import BattleScreen from "./components/BattleScreen";
import ResultScreen from "./components/ResultScreen";
import Menu from "./components/Menu";
import {
  generateShopUnits,
  generateInitialOpponentTeam,
  addOpponentUnit,
} from "./utils/gameLogic";
import { audioManager, enableAudioOnUserInteraction } from "./utils/audio";
import type { GameState, PlayerUnit, MONEY_CONSTANTS } from "./types/game";
import { MONEY_CONSTANTS as MONEY } from "./types/game";
import type { UnitDef } from "@nico/autobattler-battle-core";

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    phase: "start",
    playerTeam: [],
    opponentTeam: [],
    playerWins: 0,
    opponentWins: 0,
    currentShopUnits: [],
    lastBattleWinner: null,
    gameWinner: null,
    money: MONEY.STARTING_MONEY,
    rerollCount: 0,
  });
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
    const round = 1; // Starting round
    const shopUnits = generateShopUnits(round);
    const initialOpponentTeam = generateInitialOpponentTeam();
    setGameState({
      phase: "shop",
      playerTeam: [],
      opponentTeam: initialOpponentTeam,
      playerWins: 0,
      opponentWins: 0,
      currentShopUnits: shopUnits,
      lastBattleWinner: null,
      gameWinner: null,
      money: MONEY.STARTING_MONEY,
      rerollCount: 0,
    });
  };

  const selectUnit = (unit: UnitDef) => {
    const unitCost =
      MONEY.UNIT_COST_BY_TIER[
        unit.tier as keyof typeof MONEY.UNIT_COST_BY_TIER
      ];

    // Don't allow purchase if not enough money
    if (gameState.money < unitCost) return;

    const newPlayerUnit: PlayerUnit = {
      id: `player_${gameState.playerTeam.length}_${Date.now()}`,
      def: unit,
      level: 1,
      preferredRow: 0, // Default to front row
    };

    setGameState((prev) => ({
      ...prev,
      playerTeam: [...prev.playerTeam, newPlayerUnit],
      money: prev.money - unitCost,
      // Remove the purchased unit from the shop
      currentShopUnits: prev.currentShopUnits.filter(
        (shopUnit: UnitDef) => shopUnit.id !== unit.id
      ),
    }));
  };

  const sellUnit = (unitId: string) => {
    setGameState((prev) => {
      const unitToSell = prev.playerTeam.find(
        (unit: PlayerUnit) => unit.id === unitId
      );
      const sellValue = unitToSell
        ? MONEY.SELL_VALUE_BY_TIER[
            unitToSell.def.tier as keyof typeof MONEY.SELL_VALUE_BY_TIER
          ]
        : MONEY.SELL_VALUE;

      return {
        ...prev,
        playerTeam: prev.playerTeam.filter(
          (unit: PlayerUnit) => unit.id !== unitId
        ),
        money: prev.money + sellValue,
      };
    });
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

  const rerollShop = () => {
    const rerollCost = gameState.rerollCount + 1;

    // Don't allow reroll if not enough money
    if (gameState.money < rerollCost) return;

    const currentRound = gameState.playerWins + gameState.opponentWins + 1;
    const newShopUnits = generateShopUnits(currentRound);
    setGameState((prev) => ({
      ...prev,
      currentShopUnits: newShopUnits,
      money: prev.money - rerollCost,
      rerollCount: prev.rerollCount + 1,
    }));
  };

  const readyForBattle = () => {
    console.log("🔍 Ready for battle clicked!");
    console.log(
      "🔍 Player team:",
      gameState.playerTeam.map((u) => `${u.def.name}: row=${u.preferredRow}`)
    );

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
    setGameState((prev) => {
      const nextRound = prev.playerWins + prev.opponentWins + 1;
      const shopUnits = generateShopUnits(nextRound);
      const updatedOpponentTeam = addOpponentUnit(prev.opponentTeam, nextRound);
      return {
        ...prev,
        phase: "shop",
        currentShopUnits: shopUnits,
        opponentTeam: updatedOpponentTeam,
        money: prev.money + MONEY.DAILY_INCOME, // Daily income
        rerollCount: 0, // Reset reroll count each round
      };
    });
  };

  const startNewGame = () => {
    const round = 1; // Starting round
    const shopUnits = generateShopUnits(round);
    const initialOpponentTeam = generateInitialOpponentTeam();
    setGameState({
      phase: "shop",
      playerTeam: [],
      opponentTeam: initialOpponentTeam,
      playerWins: 0,
      opponentWins: 0,
      currentShopUnits: shopUnits,
      lastBattleWinner: null,
      gameWinner: null,
      money: MONEY.STARTING_MONEY,
      rerollCount: 0,
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
      opponentTeam: [],
      playerWins: 0,
      opponentWins: 0,
      currentShopUnits: [],
      lastBattleWinner: null,
      gameWinner: null,
      money: MONEY.STARTING_MONEY,
      rerollCount: 0,
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
            rerollCount={gameState.rerollCount}
            onSelectUnit={selectUnit}
            onSellUnit={sellUnit}
            onReorderTeam={reorderTeam}
            onToggleUnitRow={toggleUnitRow}
            onRerollShop={rerollShop}
            onReady={readyForBattle}
          />
        );

      case "battle":
        return (
          <BattleScreen
            playerTeam={gameState.playerTeam}
            opponentTeam={gameState.opponentTeam}
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
