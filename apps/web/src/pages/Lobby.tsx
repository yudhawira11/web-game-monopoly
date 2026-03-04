import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom, listRooms } from "../lib/api";
import { clearSession, loadSession, saveSession } from "../lib/session";
import { supabase } from "../lib/supabase";
import type { RoomSummary } from "../lib/types";

const LobbyPage = () => {
  const navigate = useNavigate();
  const session = loadSession();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshRooms = async () => {
    try {
      const data = await listRooms();
      setRooms(data.rooms as RoomSummary[]);
    } catch {
      setError("Gagal memuat daftar room.");
    }
  };

  useEffect(() => {
    refreshRooms();
    const interval = setInterval(refreshRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!session?.playerName) return;
    setLoading(true);
    setError("");
    try {
      const data = await createRoom(session.playerName);
      saveSession({ playerName: data.playerName, playerId: data.playerId, roomCode: data.roomCode });
      navigate(`/room/${data.roomCode}`);
    } catch {
      setError("Gagal membuat room baru.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearSession();
    navigate("/login");
  };

  const handleJoinWithCode = async (roomCode: string) => {
    if (!session?.playerName || !roomCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const normalized = roomCode.trim().toUpperCase();
      const data = await joinRoom(normalized, session.playerName);
      saveSession({ playerName: data.playerName, playerId: data.playerId, roomCode: data.roomCode });
      navigate(`/room/${data.roomCode}`);
    } catch {
      setError("Gagal masuk ke room. Pastikan kode benar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="chip text-white/70">Lobby</span>
            <h1 className="font-display text-4xl text-white">Pilih meja permainan</h1>
            <p className="mt-2 text-white/70">
              Halo, <span className="font-semibold text-white">{session?.playerName}</span>. Buat room baru
              atau masuk dengan kode.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
            <button className="btn-primary" onClick={handleCreate} disabled={loading}>
              Buat Room
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Room Aktif</h2>
              <button className="btn-dark" onClick={refreshRooms}>
                Refresh
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              {rooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 p-6 text-sm text-ink/60">
                  Belum ada room. Buat yang pertama.
                </div>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.code}
                    className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-5 py-4"
                  >
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-ink/40">{room.status}</p>
                      <p className="text-lg font-semibold text-ink">Room {room.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-ink/60">{room.playerCount} pemain</p>
                      <button
                        className="btn-dark mt-2"
                        onClick={() => {
                          void handleJoinWithCode(room.code);
                        }}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel-dark p-6">
            <h2 className="font-display text-2xl text-white">Masuk via kode</h2>
            <p className="mt-2 text-sm text-white/70">Gunakan kode 5 karakter dari host room.</p>
            <div className="mt-5 flex flex-col gap-4">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none"
                placeholder="Kode Room"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
              />
              <button className="btn-primary" onClick={() => handleJoinWithCode(code)} disabled={loading}>
                Masuk Room
              </button>
            </div>
            {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LobbyPage;
