import { useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "./socket";
import type { RoomState } from "./types";

export const useRoomState = (roomCode?: string, playerId?: string) => {
  const [state, setState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);

  const canConnect = useMemo(() => Boolean(roomCode && playerId), [roomCode, playerId]);

  useEffect(() => {
    if (!canConnect || !roomCode || !playerId) return;
    const s = createSocket(roomCode, playerId);
    s.on("room:state", (next) => setState(next));
    s.on("room:error", (message) => setError(message));
    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [canConnect, roomCode, playerId]);

  return { state, error, socket };
};