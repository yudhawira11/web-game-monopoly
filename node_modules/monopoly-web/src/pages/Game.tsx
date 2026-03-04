import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ActionBar from "../components/ActionBar";
import Board from "../components/Board";
import ChatPanel from "../components/ChatPanel";
import DicePanel from "../components/DicePanel";
import EstatePanel from "../components/EstatePanel";
import LogPanel from "../components/LogPanel";
import PlayerList from "../components/PlayerList";
import TradePanel from "../components/TradePanel";
import { clearRoomSession, clearSession, loadSession } from "../lib/session";
import { useRoomState } from "../lib/useRoomState";
import { supabase } from "../lib/supabase";

const GamePage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const roomCode = params.code?.toUpperCase();
  const session = loadSession();
  const { state, socket } = useRoomState(roomCode, session?.playerId);

  useEffect(() => {
    if (state?.status === "waiting" && roomCode) {
      navigate(`/room/${roomCode}`);
    }
  }, [state?.status, roomCode, navigate]);

  if (!roomCode || !session?.playerId || !state) {
    return (
      <div className="min-h-screen px-6 py-12 text-white">
        <p>Memuat game...</p>
      </div>
    );
  }

  const isTurn = state.turn.currentPlayerId === session.playerId;
  const canRoll =
    isTurn &&
    state.status === "playing" &&
    !state.turn.pendingPurchase &&
    (!state.turn.hasRolled || state.turn.canRollAgain);

  const handleLeave = () => {
    clearRoomSession();
    navigate("/lobby");
  };

  const handleBack = () => {
    navigate("/lobby");
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearSession();
    navigate("/login");
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="chip text-white/70">Room {roomCode}</span>
            <h1 className="font-display text-3xl text-white">Monopoly Royale</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="panel-dark px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Giliran</p>
              <p className="font-display text-lg text-white">
                {state.players.find((p) => p.id === state.turn.currentPlayerId)?.name ?? "-"}
              </p>
            </div>
            <button className="btn-ghost" onClick={handleBack}>
              Kembali
            </button>
            <button className="btn-ghost" onClick={handleLeave}>
              Keluar Room
            </button>
            <button className="btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <PlayerList players={state.players} currentPlayerId={state.turn.currentPlayerId} />
            <EstatePanel
              state={state}
              playerId={session.playerId}
              onBuild={(idx) => socket?.emit("property:build", idx)}
              onSell={(idx) => socket?.emit("property:sell", idx)}
            />
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[760px]">
              <Board players={state.players} properties={state.properties} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <DicePanel roll={state.turn.lastRoll} canRoll={canRoll} onRoll={() => socket?.emit("turn:roll")} />
            <LogPanel logs={state.log} />
            <TradePanel
              state={state}
              playerId={session.playerId}
              onPropose={(payload) => socket?.emit("trade:propose", payload)}
              onRespond={(accept) => socket?.emit("trade:respond", { accept })}
              onCancel={() => socket?.emit("trade:cancel")}
            />
            <ChatPanel messages={state.chat} onSend={(msg) => socket?.emit("chat:send", msg)} />
          </div>
        </div>

        <ActionBar
          state={state}
          playerId={session.playerId}
          onBuy={() => socket?.emit("property:buy")}
          onSkip={() => socket?.emit("property:skip")}
          onEnd={() => socket?.emit("turn:end")}
        />
      </div>
    </div>
  );
};

export default GamePage;
