import clsx from "clsx";
import { TILES } from "../lib/board";
import type { RoomState } from "../lib/types";

const COLOR_MAP: Record<string, string> = {
  brown: "#7a4a2b",
  lightblue: "#7fcde8",
  pink: "#d16da3",
  orange: "#f28b3c",
  red: "#df4b4b",
  yellow: "#f2cf5b",
  green: "#3a9d6d",
  blue: "#3555c9"
};

const ownsColorSet = (state: RoomState, playerId: string, color?: string) => {
  if (!color) return false;
  const group = TILES.filter((tile) => tile.type === "property" && tile.color === color).map(
    (tile) => tile.index
  );
  return group.every((idx) => state.properties[idx]?.ownerId === playerId);
};

const EstatePanel = ({
  state,
  playerId,
  onBuild,
  onSell
}: {
  state: RoomState;
  playerId: string;
  onBuild: (tileIndex: number) => void;
  onSell: (tileIndex: number) => void;
}) => {
  const me = state.players.find((player) => player.id === playerId);
  const isTurn = state.turn.currentPlayerId === playerId;
  const isLocked = Boolean(state.turn.pendingPurchase);
  const owned = me?.owned ?? [];
  const ownedTiles = owned.map((idx) => TILES[idx]).filter(Boolean);

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-ink">Aset</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-ink/40">Build</span>
      </div>
      <p className="mt-2 text-xs text-ink/50">Bangun rumah/hotel hanya saat giliranmu.</p>
      <div className="mt-4 space-y-3">
        {ownedTiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 p-4 text-xs text-ink/60">
            Belum ada aset.
          </div>
        ) : (
          ownedTiles.map((tile) => {
            const property = state.properties[tile.index];
            const houses = property?.houses ?? 0;
            const canBuild =
              isTurn &&
              !isLocked &&
              tile.type === "property" &&
              ownsColorSet(state, playerId, tile.color) &&
              !property?.mortgaged &&
              houses < 5;
            const canSell = isTurn && !isLocked && tile.type === "property" && houses > 0;

            return (
              <div
                key={tile.index}
                className={clsx(
                  "rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-ink",
                  tile.type === "property" && "flex flex-col gap-2"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tile.type === "property" ? (
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: COLOR_MAP[tile.color ?? ""] }}
                      />
                    ) : null}
                    <div>
                      <p className="text-sm font-semibold">{tile.name}</p>
                      <p className="text-xs text-ink/50">{tile.type}</p>
                    </div>
                  </div>
                  {tile.type === "property" ? (
                    <span className="rounded-full bg-emerald/15 px-2 py-1 text-[10px] font-semibold text-emerald">
                      {houses >= 5 ? "Hotel" : `Rumah ${houses}`}
                    </span>
                  ) : null}
                </div>
                {tile.type === "property" ? (
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-dark" onClick={() => onBuild(tile.index)} disabled={!canBuild}>
                      {houses >= 4 ? "Bangun Hotel" : "Bangun Rumah"}
                    </button>
                    <button className="btn-dark" onClick={() => onSell(tile.index)} disabled={!canSell}>
                      Jual
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EstatePanel;
