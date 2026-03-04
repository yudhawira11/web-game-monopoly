import type { RoomState } from "../lib/types";

const ActionBar = ({
  state,
  playerId,
  onBuy,
  onSkip,
  onEnd
}: {
  state: RoomState;
  playerId: string;
  onBuy: () => void;
  onSkip: () => void;
  onEnd: () => void;
}) => {
  const isTurn = state.turn.currentPlayerId === playerId;
  const pending = state.turn.pendingPurchase;

  return (
    <div className="panel-dark flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Status Turn</span>
        <span className="text-sm text-white">
          {pending
            ? `Beli properti seharga $${pending.price}?`
            : isTurn
              ? "Giliranmu"
              : "Menunggu pemain lain"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {pending ? (
          <>
            <button className="btn-primary" onClick={onBuy}>
              Beli
            </button>
            <button className="btn-ghost" onClick={onSkip}>
              Lewati
            </button>
          </>
        ) : (
          <button className="btn-ghost" onClick={onEnd} disabled={!isTurn}>
            Akhiri Giliran
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionBar;