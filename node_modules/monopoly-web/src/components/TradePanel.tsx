import { useEffect, useMemo, useState } from "react";
import { TILES } from "../lib/board";
import type { RoomState, TradeOffer } from "../lib/types";

const getOwnedTiles = (state: RoomState, playerId: string) =>
  state.players.find((player) => player.id === playerId)?.owned ?? [];

const resolveTileName = (index: number) => TILES[index]?.name ?? `Tile ${index}`;

const TradePanel = ({
  state,
  playerId,
  onPropose,
  onRespond,
  onCancel
}: {
  state: RoomState;
  playerId: string;
  onPropose: (payload: {
    toId: string;
    offerMoney: number;
    requestMoney: number;
    offerProperties: number[];
    requestProperties: number[];
  }) => void;
  onRespond: (accept: boolean) => void;
  onCancel: () => void;
}) => {
  const me = state.players.find((player) => player.id === playerId);
  const otherPlayers = state.players.filter((player) => player.id !== playerId && !player.bankrupt);
  const [targetId, setTargetId] = useState(otherPlayers[0]?.id ?? "");
  const [offerMoney, setOfferMoney] = useState(0);
  const [requestMoney, setRequestMoney] = useState(0);
  const [offerProps, setOfferProps] = useState<number[]>([]);
  const [requestProps, setRequestProps] = useState<number[]>([]);

  useEffect(() => {
    if (!targetId && otherPlayers[0]) {
      setTargetId(otherPlayers[0].id);
    }
  }, [otherPlayers, targetId]);

  useEffect(() => {
    setRequestProps([]);
  }, [targetId]);

  const myProperties = useMemo(() => getOwnedTiles(state, playerId), [state, playerId]);
  const targetProperties = useMemo(() => getOwnedTiles(state, targetId), [state, targetId]);

  const trade = state.trade;
  const canPropose =
    Boolean(targetId) &&
    (offerMoney > 0 || requestMoney > 0 || offerProps.length > 0 || requestProps.length > 0);

  const renderTradeSummary = (current: TradeOffer) => {
    const from = state.players.find((player) => player.id === current.fromId);
    const to = state.players.find((player) => player.id === current.toId);
    return (
      <div className="space-y-2 text-sm text-white/80">
        <p>
          <span className="font-semibold text-white">{from?.name ?? "?"}</span> →{" "}
          <span className="font-semibold text-white">{to?.name ?? "?"}</span>
        </p>
        <p>
          Offer: ${current.offerMoney} +{" "}
          {current.offerProperties.length > 0
            ? current.offerProperties.map(resolveTileName).join(", ")
            : "Tidak ada properti"}
        </p>
        <p>
          Request: ${current.requestMoney} +{" "}
          {current.requestProperties.length > 0
            ? current.requestProperties.map(resolveTileName).join(", ")
            : "Tidak ada properti"}
        </p>
      </div>
    );
  };

  return (
    <div className="panel-dark p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-white">Trading</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Deal</span>
      </div>
      {trade ? (
        <div className="mt-4 space-y-4">
          {renderTradeSummary(trade)}
          <div className="flex flex-wrap gap-2">
            {trade.toId === playerId ? (
              <>
                <button className="btn-primary" onClick={() => onRespond(true)}>
                  Terima
                </button>
                <button className="btn-ghost" onClick={() => onRespond(false)}>
                  Tolak
                </button>
              </>
            ) : null}
            {trade.fromId === playerId ? (
              <button className="btn-ghost" onClick={onCancel}>
                Batalkan
              </button>
            ) : null}
            {trade.fromId !== playerId && trade.toId !== playerId ? (
              <span className="text-xs text-white/50">Trade sedang berlangsung.</span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4 text-sm text-white/70">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/40">Target</label>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
            >
              {otherPlayers.length === 0 ? <option value="">Tidak ada pemain</option> : null}
              {otherPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/40">Uang Kamu</label>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
                value={offerMoney}
                onChange={(event) => setOfferMoney(Number(event.target.value))}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/40">Uang Diminta</label>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
                value={requestMoney}
                onChange={(event) => setRequestMoney(Number(event.target.value))}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Properti Kamu</p>
              <div className="mt-2 space-y-2">
                {myProperties.length === 0 ? (
                  <p className="text-xs text-white/40">Tidak ada properti.</p>
                ) : (
                  myProperties.map((idx) => (
                    <label key={idx} className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={offerProps.includes(idx)}
                        onChange={(event) => {
                          setOfferProps((prev) =>
                            event.target.checked ? [...prev, idx] : prev.filter((id) => id !== idx)
                          );
                        }}
                      />
                      {resolveTileName(idx)}
                    </label>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Properti Target</p>
              <div className="mt-2 space-y-2">
                {targetProperties.length === 0 ? (
                  <p className="text-xs text-white/40">Tidak ada properti.</p>
                ) : (
                  targetProperties.map((idx) => (
                    <label key={idx} className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={requestProps.includes(idx)}
                        onChange={(event) => {
                          setRequestProps((prev) =>
                            event.target.checked ? [...prev, idx] : prev.filter((id) => id !== idx)
                          );
                        }}
                      />
                      {resolveTileName(idx)}
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
          <button
            className="btn-primary w-full"
            onClick={() =>
              onPropose({
                toId: targetId,
                offerMoney,
                requestMoney,
                offerProperties: offerProps,
                requestProperties: requestProps
              })
            }
            disabled={!me || !canPropose}
          >
            Kirim Trade
          </button>
        </div>
      )}
    </div>
  );
};

export default TradePanel;
