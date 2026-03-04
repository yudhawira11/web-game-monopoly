import type { Player, PropertyState } from "../lib/types";
import { TILES } from "../lib/board";
import clsx from "clsx";

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

const getPosition = (index: number) => {
  if (index <= 10) {
    return { row: 11, col: 11 - index };
  }
  if (index <= 20) {
    return { row: 11 - (index - 10), col: 1 };
  }
  if (index <= 30) {
    return { row: 1, col: 1 + (index - 20) };
  }
  return { row: 1 + (index - 30), col: 11 };
};

const TOKEN_OFFSETS = [
  [0, 0],
  [12, 0],
  [-12, 0],
  [0, 12],
  [0, -12],
  [12, 12]
];

const Board = ({ players, properties }: { players: Player[]; properties: Record<number, PropertyState> }) => {
  const playersByTile = players.reduce<Record<number, Player[]>>((acc, player) => {
    const list = acc[player.position] ?? [];
    list.push(player);
    acc[player.position] = list;
    return acc;
  }, {});

  return (
    <div className="relative grid aspect-square w-full grid-cols-11 grid-rows-11 gap-1 rounded-[32px] border border-white/10 bg-[#0e1f1a] p-2 shadow-glow">
      <div className="pointer-events-none absolute inset-0">
        {players.map((player) => {
          const pos = getPosition(player.position);
          const x = ((pos.col - 0.5) / 11) * 100;
          const y = ((pos.row - 0.5) / 11) * 100;
          const tileGroup = playersByTile[player.position] ?? [];
          const idx = tileGroup.findIndex((item) => item.id === player.id);
          const offset = TOKEN_OFFSETS[idx % TOKEN_OFFSETS.length] ?? [0, 0];
          return (
            <div
              key={player.id}
              className="token"
              style={{
                left: `calc(${x}% + ${offset[0]}px)`,
                top: `calc(${y}% + ${offset[1]}px)`
              }}
              title={player.name}
            >
              <div className="token-inner" style={{ background: player.color }}>
                {player.name.slice(0, 1).toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="col-start-2 col-end-11 row-start-2 row-end-11 flex flex-col items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#142b22] via-[#11241d] to-[#0f1e19] text-center">
        <span className="chip text-white/60">Monopoly Royale</span>
        <h2 className="font-display text-3xl text-white">Beli. Bangun. Bertahan.</h2>
        <p className="max-w-xs text-sm text-white/60">
          Area pusat untuk perdagangan, kartu, dan momen negosiasi.
        </p>
      </div>

      {TILES.map((tile) => {
        const pos = getPosition(tile.index);
        const propertyState = properties?.[tile.index];
        const ownerId = propertyState?.ownerId;
        const houses = propertyState?.houses ?? 0;
        const isHotel = houses >= 5;

        return (
          <div
            key={tile.index}
            className={clsx(
              "relative flex h-full w-full flex-col justify-between rounded-2xl border border-white/10 bg-white/90 p-1 text-[10px] font-semibold text-ink",
              tile.type === "go" && "bg-[#f6f0e3]",
              tile.type === "go_to_jail" && "bg-[#f6e7e3]",
              tile.type === "chance" && "bg-[#fff2d9]",
              tile.type === "community" && "bg-[#e7f2ff]",
              tile.type === "tax" && "bg-[#fbe2e2]"
            )}
            style={{ gridRow: pos.row, gridColumn: pos.col }}
          >
            <div>
              {tile.type === "property" ? (
                <div className="h-2 w-full rounded-full" style={{ background: COLOR_MAP[tile.color ?? ""] }} />
              ) : null}
              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-ink/60">
                {tile.name}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {ownerId ? (
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-[8px] uppercase">Owned</span>
              ) : null}
              {tile.type === "property" && houses > 0 ? (
                <span className="rounded-full bg-emerald/20 px-2 py-0.5 text-[8px] uppercase text-emerald">
                  {isHotel ? "Hotel" : `H ${houses}`}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Board;
