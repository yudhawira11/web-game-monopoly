import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadSession } from "../lib/session";
import { useRoomState } from "../lib/useRoomState";

const RoomPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const roomCode = params.code?.toUpperCase();
  const session = loadSession();
  const { state, error, socket } = useRoomState(roomCode, session?.playerId);

  useEffect(() => {
    if (state?.status === "playing" && roomCode) {
      navigate(`/game/${roomCode}`);
    }
  }, [state?.status, roomCode, navigate]);

  if (!roomCode || !session?.playerId) {
    return (
      <div className="min-h-screen px-6 py-12 text-white">
        <p>Session tidak valid. Kembali ke lobby.</p>
      </div>
    );
  }

  const isHost = state?.players?.[0]?.id === session.playerId;

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="chip text-white/70">Waiting Room</span>
            <h1 className="font-display text-3xl text-white">Room {roomCode}</h1>
            <p className="mt-2 text-white/70">Bagikan kode ini ke teman untuk bergabung.</p>
          </div>
          <div className="panel-dark px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Kode</p>
            <p className="font-display text-2xl text-white">{roomCode}</p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="panel p-6">
            <h2 className="font-display text-2xl text-ink">Pemain</h2>
            <div className="mt-4 grid gap-3">
              {state?.players?.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: player.color }} />
                    <div>
                      <p className="text-sm font-semibold text-ink">{player.name}</p>
                      <p className="text-xs text-ink/50">$ {player.money}</p>
                    </div>
                  </div>
                  {player.id === session.playerId ? (
                    <span className="rounded-full bg-emerald/20 px-3 py-1 text-xs font-semibold text-emerald">
                      You
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="panel-dark p-6">
            <h2 className="font-display text-2xl text-white">Kontrol Room</h2>
            <p className="mt-2 text-sm text-white/70">
              Minimal 2 pemain untuk mulai. Host dapat menekan tombol Start.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                className="btn-primary"
                onClick={() => socket?.emit("room:start")}
                disabled={!isHost}
              >
                Mulai Game
              </button>
              <button className="btn-ghost" onClick={() => navigate("/lobby")}>Kembali ke Lobby</button>
            </div>
            {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RoomPage;