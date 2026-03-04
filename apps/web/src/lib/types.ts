export type RoomStatus = "waiting" | "playing" | "finished";

export interface Player {
  id: string;
  name: string;
  money: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  bankrupt: boolean;
  owned: number[];
  color: string;
  getOutOfJail: number;
}

export interface RollResult {
  d1: number;
  d2: number;
  total: number;
  isDouble: boolean;
}

export interface TurnState {
  currentPlayerId: string | null;
  hasRolled: boolean;
  canRollAgain: boolean;
  doublesStreak: number;
  lastRoll?: RollResult;
  pendingPurchase?: { tileIndex: number; price: number };
}

export interface GameLog {
  id: string;
  time: string;
  message: string;
  type: "system" | "action";
}

export interface ChatMessage {
  id: string;
  time: string;
  playerId: string;
  name: string;
  message: string;
}

export interface PropertyState {
  ownerId: string | null;
  houses: number;
  mortgaged: boolean;
}

export interface TradeOffer {
  id: string;
  fromId: string;
  toId: string;
  offerMoney: number;
  requestMoney: number;
  offerProperties: number[];
  requestProperties: number[];
  createdAt: string;
}

export interface RoomState {
  code: string;
  status: RoomStatus;
  players: Player[];
  properties: Record<number, PropertyState>;
  turn: TurnState;
  log: GameLog[];
  chat: ChatMessage[];
  trade: TradeOffer | null;
}

export interface RoomSummary {
  code: string;
  status: RoomStatus;
  playerCount: number;
}
