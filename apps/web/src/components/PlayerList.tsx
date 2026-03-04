import type { Player } from "../lib/types";
import clsx from "clsx";

const PlayerList = ({ players, currentPlayerId }: { players: Player[]; currentPlayerId?: string | null }) => (
  <div className="panel p-5">
    <div className="flex items-center justify-between">
      <h3 className="font-display text-xl text-ink">Players</h3>
      <span className="text-xs uppercase tracking-[0.3em] text-ink/40">{players.length}/6</span>
    </div>
    <div className="mt-4 space-y-3">
      {players.map((player) => (
        <div
          key={player.id}
          className={clsx(
            "flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3",
            currentPlayerId === player.id && "border-emerald/40 bg-emerald/10"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ background: player.color }} />
            <div>
              <p className="text-sm font-semibold text-ink">{player.name}</p>
              <p className="text-xs text-ink/60">$ {player.money}</p>
            </div>
          </div>
          <div className="text-right">
            {player.bankrupt ? (
              <span className="rounded-full bg-danger/20 px-3 py-1 text-[10px] font-semibold text-danger">
                Bangkrut
              </span>
            ) : player.inJail ? (
              <span className="rounded-full bg-black/10 px-3 py-1 text-[10px] font-semibold text-ink/60">
                Jail
              </span>
            ) : currentPlayerId === player.id ? (
              <span className="rounded-full bg-emerald/20 px-3 py-1 text-[10px] font-semibold text-emerald">
                Giliran
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PlayerList;