export type RoomStatus = "waiting" | "playing" | "finished";

export type TileType =
  | "go"
  | "property"
  | "railroad"
  | "utility"
  | "chance"
  | "community"
  | "tax"
  | "jail"
  | "free_parking"
  | "go_to_jail";

export type CardType = "chance" | "community";

export type CardEffect =
  | { type: "money"; amount: number; reason: string }
  | { type: "move"; index: number; reason: string }
  | { type: "move_relative"; steps: number; reason: string }
  | { type: "go_to_jail"; reason: string }
  | { type: "get_out_of_jail"; reason: string };

export interface Card {
  id: string;
  type: CardType;
  title: string;
  text: string;
  effect: CardEffect;
}

export interface TileBase {
  index: number;
  name: string;
  type: TileType;
}

export interface PropertyTile extends TileBase {
  type: "property";
  color: string;
  price: number;
  baseRent: number;
  houseCost: number;
}

export interface RailroadTile extends TileBase {
  type: "railroad";
  price: number;
}

export interface UtilityTile extends TileBase {
  type: "utility";
  price: number;
}

export interface TaxTile extends TileBase {
  type: "tax";
  tax: number;
}

export type Tile =
  | TileBase
  | PropertyTile
  | RailroadTile
  | UtilityTile
  | TaxTile;

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
  socketId?: string;
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

export interface DeckState {
  chance: Card[];
  community: Card[];
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
  decks: DeckState;
}

export interface RoomSummary {
  code: string;
  status: RoomStatus;
  playerCount: number;
}
