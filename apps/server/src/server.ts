import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  addPlayerToRoom,
  createRoomState,
  handleBuyProperty,
  handleBuildHouse,
  handleEndTurn,
  handleRoll,
  handleSellHouse,
  handleSkipPurchase,
  handleTradeCancel,
  handleTradePropose,
  handleTradeRespond,
  sendChat,
  startGame
} from "./game/engine.js";
import type { RoomState, RoomSummary } from "./game/types.js";
import { isSupabaseEnabled, loadRoomStates, upsertRoomState } from "./lib/supabase.js";

const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, credentials: true }
});

const rooms = new Map<string, RoomState>();

const playerSchema = z.object({
  playerName: z.string().min(2).max(24)
});

const persistRoom = async (room: RoomState): Promise<void> => {
  if (!isSupabaseEnabled()) return;
  await upsertRoomState(stripSocket(room));
};

const stripSocket = (room: RoomState): RoomState => ({
  ...room,
  players: room.players.map((player) => ({
    ...player,
    socketId: undefined
  }))
});

const toClientState = (room: RoomState): RoomState => stripSocket(room);

const generateRoomCode = (): string => {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
};

const listRooms = (): RoomSummary[] =>
  [...rooms.values()].map((room) => ({
    code: room.code,
    status: room.status,
    playerCount: room.players.length
  }));

const ensureRoom = (code: string): RoomState | null => rooms.get(code) ?? null;

const addRoom = (room: RoomState): void => {
  rooms.set(room.code, room);
  void persistRoom(room);
};

const notifyRoom = (room: RoomState): void => {
  io.to(room.code).emit("room:state", toClientState(room));
  void persistRoom(room);
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/rooms", (_req, res) => {
  res.json({ rooms: listRooms() });
});

app.post("/api/rooms", (req, res) => {
  const parse = playerSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Nama pemain tidak valid." });
    return;
  }

  const code = generateRoomCode();
  const room = createRoomState(code, parse.data.playerName);
  addRoom(room);
  res.json({
    roomCode: room.code,
    playerId: room.players[0].id,
    playerName: room.players[0].name
  });
});

app.post("/api/rooms/:code/join", (req, res) => {
  const parse = playerSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Nama pemain tidak valid." });
    return;
  }

  const room = ensureRoom(req.params.code.toUpperCase());
  if (!room) {
    res.status(404).json({ error: "Room tidak ditemukan." });
    return;
  }

  if (room.status !== "waiting") {
    res.status(400).json({ error: "Game sudah dimulai." });
    return;
  }

  if (room.players.length >= 6) {
    res.status(400).json({ error: "Room penuh." });
    return;
  }

  const player = addPlayerToRoom(room, parse.data.playerName);
  notifyRoom(room);
  res.json({ roomCode: room.code, playerId: player.id, playerName: player.name });
});

io.use((socket, next) => {
  const { roomCode, playerId } = socket.handshake.auth as {
    roomCode?: string;
    playerId?: string;
  };

  if (!roomCode || !playerId) {
    next(new Error("Missing auth"));
    return;
  }

  const normalizedCode = roomCode.toUpperCase();
  const room = ensureRoom(normalizedCode);
  if (!room) {
    next(new Error("Room not found"));
    return;
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    next(new Error("Player not found"));
    return;
  }

  socket.data.roomCode = normalizedCode;
  socket.data.playerId = playerId;
  next();
});

io.on("connection", (socket) => {
  const roomCode = socket.data.roomCode as string;
  const playerId = socket.data.playerId as string;
  const room = ensureRoom(roomCode);
  if (!room) {
    socket.disconnect();
    return;
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    socket.disconnect();
    return;
  }

  player.socketId = socket.id;
  socket.join(roomCode);
  socket.emit("room:state", toClientState(room));

  socket.on("room:start", () => {
    if (room.status !== "waiting") return;
    if (room.players.length < 2) {
      socket.emit("room:error", "Minimal 2 pemain untuk mulai.");
      return;
    }
    startGame(room);
    notifyRoom(room);
  });

  socket.on("turn:roll", () => {
    handleRoll(room, playerId);
    notifyRoom(room);
  });

  socket.on("property:buy", () => {
    handleBuyProperty(room, playerId);
    notifyRoom(room);
  });

  socket.on("property:build", (tileIndex: number) => {
    if (typeof tileIndex !== "number") return;
    handleBuildHouse(room, playerId, tileIndex);
    notifyRoom(room);
  });

  socket.on("property:sell", (tileIndex: number) => {
    if (typeof tileIndex !== "number") return;
    handleSellHouse(room, playerId, tileIndex);
    notifyRoom(room);
  });

  socket.on("property:skip", () => {
    handleSkipPurchase(room, playerId);
    notifyRoom(room);
  });

  socket.on("trade:propose", (payload: any) => {
    if (!payload || typeof payload !== "object") return;
    handleTradePropose(room, playerId, payload);
    notifyRoom(room);
  });

  socket.on("trade:respond", (payload: { accept: boolean }) => {
    handleTradeRespond(room, playerId, Boolean(payload?.accept));
    notifyRoom(room);
  });

  socket.on("trade:cancel", () => {
    handleTradeCancel(room, playerId);
    notifyRoom(room);
  });

  socket.on("turn:end", () => {
    handleEndTurn(room, playerId);
    notifyRoom(room);
  });

  socket.on("chat:send", (message: string) => {
    if (!message || typeof message !== "string") return;
    const trimmed = message.trim();
    if (!trimmed) return;
    sendChat(room, playerId, trimmed.slice(0, 160));
    notifyRoom(room);
  });

  socket.on("disconnect", () => {
    player.socketId = undefined;
  });
});

const bootstrap = async (): Promise<void> => {
  if (isSupabaseEnabled()) {
    const storedRooms = await loadRoomStates();
    storedRooms.forEach((room) => rooms.set(room.code, room));
  }

  httpServer.listen(PORT, () => {
    console.log(`Monopoly server running on port ${PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
});
