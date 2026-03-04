const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export const listRooms = async () => {
  const res = await fetch(`${API_BASE}/api/rooms`);
  if (!res.ok) throw new Error("Gagal mengambil room");
  return (await res.json()) as { rooms: { code: string; status: string; playerCount: number }[] };
};

export const createRoom = async (playerName: string) => {
  const res = await fetch(`${API_BASE}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName })
  });
  if (!res.ok) throw new Error("Gagal membuat room");
  return (await res.json()) as { roomCode: string; playerId: string; playerName: string };
};

export const joinRoom = async (roomCode: string, playerName: string) => {
  const res = await fetch(`${API_BASE}/api/rooms/${roomCode}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName })
  });
  if (!res.ok) throw new Error("Gagal join room");
  return (await res.json()) as { roomCode: string; playerId: string; playerName: string };
};
