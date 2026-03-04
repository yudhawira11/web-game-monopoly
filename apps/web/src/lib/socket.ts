import { io, Socket } from "socket.io-client";
import type { RoomState } from "./types";

export type ServerToClientEvents = {
  "room:state": (state: RoomState) => void;
  "room:error": (message: string) => void;
};

export type ClientToServerEvents = {
  "room:start": () => void;
  "turn:roll": () => void;
  "turn:end": () => void;
  "property:buy": () => void;
  "property:skip": () => void;
  "property:build": (tileIndex: number) => void;
  "property:sell": (tileIndex: number) => void;
  "trade:propose": (payload: {
    toId: string;
    offerMoney: number;
    requestMoney: number;
    offerProperties: number[];
    requestProperties: number[];
  }) => void;
  "trade:respond": (payload: { accept: boolean }) => void;
  "trade:cancel": () => void;
  "chat:send": (message: string) => void;
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

export const createSocket = (roomCode: string, playerId: string): Socket<ServerToClientEvents, ClientToServerEvents> =>
  io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      roomCode,
      playerId
    }
  });
