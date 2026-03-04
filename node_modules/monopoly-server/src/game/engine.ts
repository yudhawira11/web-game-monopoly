import { nanoid } from "nanoid";
import { COMMUNITY_CARDS, CHANCE_CARDS } from "./cards";
import { TILES, TILE_COUNT } from "./board";
import {
  Card,
  DeckState,
  GameLog,
  Player,
  PropertyState,
  RoomState,
  RollResult,
  Tile,
  TurnState
} from "./types";

const START_MONEY = 1500;
const GO_REWARD = 200;
const JAIL_INDEX = 10;
const GO_TO_JAIL_INDEX = 30;
const MAX_LOG = 60;
const RENT_MULTIPLIER = [1, 5, 15, 45, 80, 125];

const PLAYER_COLORS = [
  "#F94144",
  "#F3722C",
  "#F9C74F",
  "#90BE6D",
  "#43AA8B",
  "#577590"
];

export const createPlayer = (name: string, index: number): Player => ({
  id: nanoid(),
  name,
  money: START_MONEY,
  position: 0,
  inJail: false,
  jailTurns: 0,
  bankrupt: false,
  owned: [],
  color: PLAYER_COLORS[index % PLAYER_COLORS.length],
  getOutOfJail: 0
});

export const createRoomState = (code: string, hostName: string): RoomState => {
  const host = createPlayer(hostName, 0);
  return {
    code,
    status: "waiting",
    players: [host],
    properties: createPropertyState(),
    turn: createTurnState(host.id),
    log: [createLog(`Room ${code} dibuat.`, "system")],
    chat: [],
    trade: null,
    decks: createDeckState()
  };
};

export const addPlayerToRoom = (state: RoomState, playerName: string): Player => {
  const player = createPlayer(playerName, state.players.length);
  state.players.push(player);
  pushLog(state, `${player.name} bergabung ke room.`, "system");
  return player;
};

export const startGame = (state: RoomState): void => {
  state.status = "playing";
  state.turn = createTurnState(state.players[0]?.id ?? null);
  pushLog(state, "Game dimulai!", "system");
};

export const rollDice = (): RollResult => {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { d1, d2, total: d1 + d2, isDouble: d1 === d2 };
};

export const handleRoll = (state: RoomState, playerId: string): void => {
  const player = getPlayer(state, playerId);
  if (!player || state.turn.currentPlayerId !== playerId || player.bankrupt) {
    return;
  }

  const turn = state.turn;
  if (turn.pendingPurchase) {
    return;
  }

  if (turn.hasRolled && !turn.canRollAgain) {
    return;
  }

  const roll = rollDice();
  turn.lastRoll = roll;
  turn.hasRolled = true;

  if (player.inJail) {
    handleJailRoll(state, player, roll);
    return;
  }

  if (roll.isDouble) {
    turn.doublesStreak += 1;
  } else {
    turn.doublesStreak = 0;
  }

  if (turn.doublesStreak >= 3) {
    sendToJail(state, player, "Tiga double berturut-turut.");
    endTurn(state);
    return;
  }

  movePlayer(state, player, roll.total);
  resolveTile(state, player, roll, 0);

  if (player.bankrupt) {
    endTurn(state);
    return;
  }

  if (player.inJail) {
    endTurn(state);
    return;
  }

  turn.canRollAgain = roll.isDouble && !player.bankrupt;
  if (!turn.canRollAgain && !turn.pendingPurchase) {
    endTurn(state);
  }
};

export const handleBuyProperty = (state: RoomState, playerId: string): void => {
  const turn = state.turn;
  if (turn.currentPlayerId !== playerId || !turn.pendingPurchase) {
    return;
  }

  const player = getPlayer(state, playerId);
  if (!player || player.bankrupt) {
    return;
  }

  const { tileIndex, price } = turn.pendingPurchase;
  if (player.money < price) {
    pushLog(state, `${player.name} tidak cukup uang untuk membeli.`, "action");
    turn.pendingPurchase = undefined;
    endTurn(state);
    return;
  }

  player.money -= price;
  state.properties[tileIndex].ownerId = player.id;
  player.owned.push(tileIndex);
  pushLog(state, `${player.name} membeli ${TILES[tileIndex].name}.`, "action");

  turn.pendingPurchase = undefined;
  if (turn.canRollAgain) {
    turn.hasRolled = false;
    return;
  }

  endTurn(state);
};

export const handleSkipPurchase = (state: RoomState, playerId: string): void => {
  const turn = state.turn;
  if (turn.currentPlayerId !== playerId || !turn.pendingPurchase) {
    return;
  }

  const player = getPlayer(state, playerId);
  if (player) {
    pushLog(state, `${player.name} melewati pembelian.`, "action");
  }

  turn.pendingPurchase = undefined;
  if (turn.canRollAgain) {
    turn.hasRolled = false;
    return;
  }

  endTurn(state);
};

export const handleBuildHouse = (state: RoomState, playerId: string, tileIndex: number): void => {
  if (state.status !== "playing") {
    return;
  }
  if (state.turn.pendingPurchase) {
    return;
  }
  if (state.turn.currentPlayerId !== playerId) {
    return;
  }

  const player = getPlayer(state, playerId);
  if (!player || player.bankrupt) {
    return;
  }

  const tile = TILES[tileIndex];
  if (!tile || tile.type !== "property") {
    return;
  }

  const property = state.properties[tileIndex];
  if (!property || property.ownerId !== playerId || property.mortgaged) {
    return;
  }

  if (!ownsColorSet(state, playerId, tile.color)) {
    return;
  }

  if (property.houses >= 5) {
    return;
  }

  if (player.money < tile.houseCost) {
    pushLog(state, `${player.name} tidak cukup uang untuk membangun.`, "action");
    return;
  }

  player.money -= tile.houseCost;
  property.houses += 1;
  if (property.houses === 5) {
    pushLog(state, `${player.name} membangun hotel di ${tile.name}.`, "action");
  } else {
    pushLog(state, `${player.name} membangun rumah di ${tile.name}.`, "action");
  }
};

export const handleSellHouse = (state: RoomState, playerId: string, tileIndex: number): void => {
  if (state.status !== "playing") {
    return;
  }
  if (state.turn.pendingPurchase) {
    return;
  }
  if (state.turn.currentPlayerId !== playerId) {
    return;
  }

  const player = getPlayer(state, playerId);
  if (!player || player.bankrupt) {
    return;
  }

  const tile = TILES[tileIndex];
  if (!tile || tile.type !== "property") {
    return;
  }

  const property = state.properties[tileIndex];
  if (!property || property.ownerId !== playerId) {
    return;
  }

  if (property.houses <= 0) {
    return;
  }

  const refund = Math.floor(tile.houseCost / 2);
  property.houses -= 1;
  player.money += refund;

  if (property.houses >= 4) {
    pushLog(state, `${player.name} menjual hotel di ${tile.name}.`, "action");
  } else {
    pushLog(state, `${player.name} menjual rumah di ${tile.name}.`, "action");
  }
};

export const handleTradePropose = (
  state: RoomState,
  playerId: string,
  payload: {
    toId: string;
    offerMoney: number;
    requestMoney: number;
    offerProperties: number[];
    requestProperties: number[];
  }
): void => {
  if (state.status !== "playing") {
    return;
  }
  if (state.trade) {
    return;
  }

  const from = getPlayer(state, playerId);
  if (!payload.toId || typeof payload.toId !== "string") {
    return;
  }
  const to = getPlayer(state, payload.toId);
  if (!from || !to || from.bankrupt || to.bankrupt || from.id === to.id) {
    return;
  }

  const offerMoney = Math.max(0, Math.floor(payload.offerMoney || 0));
  const requestMoney = Math.max(0, Math.floor(payload.requestMoney || 0));
  const offerProperties = uniqueOwnedProperties(
    state,
    from.id,
    Array.isArray(payload.offerProperties) ? payload.offerProperties : []
  );
  const requestProperties = uniqueOwnedProperties(
    state,
    to.id,
    Array.isArray(payload.requestProperties) ? payload.requestProperties : []
  );

  if (
    offerMoney === 0 &&
    requestMoney === 0 &&
    offerProperties.length === 0 &&
    requestProperties.length === 0
  ) {
    return;
  }

  if (from.money < offerMoney) {
    pushLog(state, `${from.name} tidak cukup uang untuk menawarkan trade.`, "action");
    return;
  }

  state.trade = {
    id: nanoid(),
    fromId: from.id,
    toId: to.id,
    offerMoney,
    requestMoney,
    offerProperties,
    requestProperties,
    createdAt: new Date().toISOString()
  };

  pushLog(state, `${from.name} mengirim trade ke ${to.name}.`, "action");
};

export const handleTradeRespond = (
  state: RoomState,
  playerId: string,
  accept: boolean
): void => {
  if (state.status !== "playing") {
    return;
  }
  const trade = state.trade;
  if (!trade || trade.toId !== playerId) {
    return;
  }

  const from = getPlayer(state, trade.fromId);
  const to = getPlayer(state, trade.toId);
  if (!from || !to) {
    state.trade = null;
    return;
  }

  if (!accept) {
    state.trade = null;
    pushLog(state, `${to.name} menolak trade dari ${from.name}.`, "action");
    return;
  }

  const offerOwned = uniqueOwnedProperties(state, from.id, trade.offerProperties);
  const requestOwned = uniqueOwnedProperties(state, to.id, trade.requestProperties);

  if (
    offerOwned.length !== trade.offerProperties.length ||
    requestOwned.length !== trade.requestProperties.length
  ) {
    state.trade = null;
    pushLog(state, `Trade gagal: kepemilikan properti berubah.`, "system");
    return;
  }

  if (from.money < trade.offerMoney || to.money < trade.requestMoney) {
    state.trade = null;
    pushLog(state, `Trade gagal: dana tidak mencukupi.`, "system");
    return;
  }

  from.money -= trade.offerMoney;
  to.money += trade.offerMoney;
  to.money -= trade.requestMoney;
  from.money += trade.requestMoney;

  transferProperties(state, from, to, trade.offerProperties);
  transferProperties(state, to, from, trade.requestProperties);

  state.trade = null;
  pushLog(state, `Trade antara ${from.name} dan ${to.name} berhasil.`, "system");
};

export const handleTradeCancel = (state: RoomState, playerId: string): void => {
  if (state.status !== "playing") {
    return;
  }
  if (!state.trade || state.trade.fromId !== playerId) {
    return;
  }

  const from = getPlayer(state, playerId);
  if (from) {
    pushLog(state, `${from.name} membatalkan trade.`, "action");
  }

  state.trade = null;
};

export const handleEndTurn = (state: RoomState, playerId: string): void => {
  if (state.turn.currentPlayerId !== playerId) {
    return;
  }
  if (state.turn.pendingPurchase) {
    return;
  }

  endTurn(state);
};

export const sendChat = (state: RoomState, playerId: string, message: string): void => {
  const player = getPlayer(state, playerId);
  if (!player) {
    return;
  }

  state.chat.push({
    id: nanoid(),
    time: new Date().toISOString(),
    playerId,
    name: player.name,
    message
  });
  if (state.chat.length > MAX_LOG) {
    state.chat.shift();
  }
};

const handleJailRoll = (state: RoomState, player: Player, roll: RollResult): void => {
  if (roll.isDouble) {
    player.inJail = false;
    player.jailTurns = 0;
    pushLog(state, `${player.name} keluar dari jail karena double.`, "action");
    movePlayer(state, player, roll.total);
    resolveTile(state, player, roll, 0);
    state.turn.canRollAgain = false;
    endTurn(state);
    return;
  }

  player.jailTurns += 1;
  pushLog(state, `${player.name} gagal keluar dari jail.`, "action");
  if (player.jailTurns >= 3) {
    player.money -= 50;
    player.inJail = false;
    player.jailTurns = 0;
    pushLog(state, `${player.name} membayar $50 untuk keluar dari jail.`, "action");
    if (player.money < 0) {
      handleBankrupt(state, player);
      endTurn(state);
      return;
    }
    movePlayer(state, player, roll.total);
    resolveTile(state, player, roll, 0);
  }

  endTurn(state);
};

const resolveTile = (state: RoomState, player: Player, roll: RollResult, depth: number): void => {
  const tile = TILES[player.position];
  switch (tile.type) {
    case "go":
      pushLog(state, `${player.name} berada di GO.`, "action");
      break;
    case "property":
      handlePropertyTile(state, player, tile);
      break;
    case "railroad":
      handleRailroadTile(state, player, tile);
      break;
    case "utility":
      handleUtilityTile(state, player, tile, roll.total);
      break;
    case "tax":
      handleTaxTile(state, player, tile);
      break;
    case "chance":
      handleCardTile(state, player, "chance", roll, depth);
      break;
    case "community":
      handleCardTile(state, player, "community", roll, depth);
      break;
    case "jail":
      pushLog(state, `${player.name} hanya berkunjung ke jail.`, "action");
      break;
    case "free_parking":
      pushLog(state, `${player.name} berhenti di Free Parking.`, "action");
      break;
    case "go_to_jail":
      sendToJail(state, player, "Go To Jail");
      break;
    default:
      break;
  }
};

const handleCardTile = (
  state: RoomState,
  player: Player,
  type: "chance" | "community",
  roll: RollResult,
  depth: number
): void => {
  if (depth > 1) {
    return;
  }

  const card = drawCard(state.decks, type);
  pushLog(state, `${player.name} mengambil kartu ${type}.`, "action");

  if (!card) {
    return;
  }

  applyCardEffect(state, player, card, roll, depth + 1);
};

const applyCardEffect = (
  state: RoomState,
  player: Player,
  card: Card,
  roll: RollResult,
  depth: number
): void => {
  switch (card.effect.type) {
    case "money":
      player.money += card.effect.amount;
      pushLog(state, `${player.name} ${card.text}`, "action");
      if (player.money < 0) {
        handleBankrupt(state, player);
      }
      break;
    case "move":
      movePlayerTo(state, player, card.effect.index, true);
      resolveTile(state, player, roll, depth);
      break;
    case "move_relative":
      movePlayer(state, player, card.effect.steps);
      resolveTile(state, player, roll, depth);
      break;
    case "go_to_jail":
      sendToJail(state, player, card.effect.reason);
      break;
    case "get_out_of_jail":
      player.getOutOfJail += 1;
      pushLog(state, `${player.name} mendapatkan kartu keluar jail.`, "action");
      break;
    default:
      break;
  }
};

const handlePropertyTile = (state: RoomState, player: Player, tile: Tile): void => {
  if (tile.type !== "property") return;
  const property = state.properties[tile.index];
  if (!property.ownerId) {
    state.turn.pendingPurchase = { tileIndex: tile.index, price: tile.price };
    pushLog(state, `${player.name} bisa membeli ${tile.name} seharga $${tile.price}.`, "action");
    return;
  }

  if (property.ownerId === player.id || property.mortgaged) {
    pushLog(state, `${player.name} mendarat di properti sendiri.`, "action");
    return;
  }

  const rent = calculatePropertyRent(state, tile, property.houses, property.ownerId);
  payRent(state, player, property.ownerId, rent, tile.name);
};

const handleRailroadTile = (state: RoomState, player: Player, tile: Tile): void => {
  if (tile.type !== "railroad") return;
  const property = state.properties[tile.index];
  if (!property.ownerId) {
    state.turn.pendingPurchase = { tileIndex: tile.index, price: tile.price };
    pushLog(state, `${player.name} bisa membeli ${tile.name} seharga $${tile.price}.`, "action");
    return;
  }

  if (property.ownerId === player.id || property.mortgaged) {
    pushLog(state, `${player.name} mendarat di railroad sendiri.`, "action");
    return;
  }

  const ownerRailroads = countOwnedByType(state, property.ownerId, "railroad");
  const rent = 25 * Math.pow(2, Math.max(ownerRailroads - 1, 0));
  payRent(state, player, property.ownerId, rent, tile.name);
};

const handleUtilityTile = (state: RoomState, player: Player, tile: Tile, rollTotal: number): void => {
  if (tile.type !== "utility") return;
  const property = state.properties[tile.index];
  if (!property.ownerId) {
    state.turn.pendingPurchase = { tileIndex: tile.index, price: tile.price };
    pushLog(state, `${player.name} bisa membeli ${tile.name} seharga $${tile.price}.`, "action");
    return;
  }

  if (property.ownerId === player.id || property.mortgaged) {
    pushLog(state, `${player.name} mendarat di utility sendiri.`, "action");
    return;
  }

  const ownedUtilities = countOwnedByType(state, property.ownerId, "utility");
  const multiplier = ownedUtilities >= 2 ? 10 : 4;
  const rent = rollTotal * multiplier;
  payRent(state, player, property.ownerId, rent, tile.name);
};

const handleTaxTile = (state: RoomState, player: Player, tile: Tile): void => {
  if (tile.type !== "tax") return;
  player.money -= tile.tax;
  pushLog(state, `${player.name} membayar pajak $${tile.tax}.`, "action");
  if (player.money < 0) {
    handleBankrupt(state, player);
  }
};

const countOwnedByType = (state: RoomState, ownerId: string, type: Tile["type"]): number =>
  state.players
    .find((p) => p.id === ownerId)
    ?.owned.filter((idx) => TILES[idx].type === type).length ?? 0;

const payRent = (
  state: RoomState,
  player: Player,
  ownerId: string,
  rent: number,
  location: string
): void => {
  const owner = getPlayer(state, ownerId);
  if (!owner) return;

  player.money -= rent;
  owner.money += rent;
  pushLog(
    state,
    `${player.name} membayar sewa $${rent} ke ${owner.name} (${location}).`,
    "action"
  );

  if (player.money < 0) {
    handleBankrupt(state, player);
  }
};

const movePlayer = (state: RoomState, player: Player, steps: number): void => {
  const next = (player.position + steps + TILE_COUNT) % TILE_COUNT;
  if (player.position + steps >= TILE_COUNT) {
    player.money += GO_REWARD;
    pushLog(state, `${player.name} melewati GO dan menerima $${GO_REWARD}.`, "action");
  }
  player.position = next;
  pushLog(state, `${player.name} bergerak ke ${TILES[next].name}.`, "action");
};

const movePlayerTo = (state: RoomState, player: Player, index: number, collectGo: boolean): void => {
  if (collectGo && player.position > index) {
    player.money += GO_REWARD;
    pushLog(state, `${player.name} melewati GO dan menerima $${GO_REWARD}.`, "action");
  }
  player.position = index;
  pushLog(state, `${player.name} bergerak ke ${TILES[index].name}.`, "action");
};

const sendToJail = (state: RoomState, player: Player, reason: string): void => {
  player.inJail = true;
  player.jailTurns = 0;
  player.position = JAIL_INDEX;
  state.turn.canRollAgain = false;
  state.turn.pendingPurchase = undefined;
  pushLog(state, `${player.name} masuk jail. (${reason})`, "action");
};

const createPropertyState = (): Record<number, PropertyState> => {
  const state: Record<number, PropertyState> = {};
  TILES.forEach((tile) => {
    if (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") {
      state[tile.index] = { ownerId: null, houses: 0, mortgaged: false };
    }
  });
  return state;
};

const createDeckState = (): DeckState => ({
  chance: shuffle([...CHANCE_CARDS]),
  community: shuffle([...COMMUNITY_CARDS])
});

const createTurnState = (playerId: string | null): TurnState => ({
  currentPlayerId: playerId,
  hasRolled: false,
  canRollAgain: false,
  doublesStreak: 0
});

const createLog = (message: string, type: "system" | "action"): GameLog => ({
  id: nanoid(),
  time: new Date().toISOString(),
  message,
  type
});

const pushLog = (state: RoomState, message: string, type: "system" | "action"): void => {
  state.log.push(createLog(message, type));
  if (state.log.length > MAX_LOG) {
    state.log.shift();
  }
};

const getPlayer = (state: RoomState, playerId: string): Player | undefined =>
  state.players.find((p) => p.id === playerId);

const endTurn = (state: RoomState): void => {
  const currentIndex = state.players.findIndex((p) => p.id === state.turn.currentPlayerId);
  const activePlayers = state.players.filter((p) => !p.bankrupt);

  if (activePlayers.length <= 1) {
    state.status = "finished";
    const winner = activePlayers[0];
    if (winner) {
      pushLog(state, `${winner.name} memenangkan game!`, "system");
    }
    return;
  }

  let nextIndex = currentIndex;
  for (let i = 0; i < state.players.length; i += 1) {
    nextIndex = (nextIndex + 1) % state.players.length;
    if (!state.players[nextIndex].bankrupt) {
      break;
    }
  }

  const nextPlayer = state.players[nextIndex];
  state.turn = createTurnState(nextPlayer.id);
  pushLog(state, `Giliran ${nextPlayer.name}.`, "system");
};

const calculatePropertyRent = (
  state: RoomState,
  tile: Tile,
  houses: number,
  ownerId: string | null
): number => {
  if (tile.type !== "property") return 0;
  const multiplier = RENT_MULTIPLIER[Math.min(houses, RENT_MULTIPLIER.length - 1)];
  const base = tile.baseRent * multiplier;
  if (houses === 0 && ownerId && ownsColorSet(state, ownerId, tile.color)) {
    return base * 2;
  }
  return base;
};

const handleBankrupt = (state: RoomState, player: Player): void => {
  player.bankrupt = true;
  player.money = 0;
  player.owned.forEach((idx) => {
    state.properties[idx].ownerId = null;
    state.properties[idx].houses = 0;
    state.properties[idx].mortgaged = false;
  });
  player.owned = [];
  pushLog(state, `${player.name} bangkrut.`, "system");
  if (state.trade && (state.trade.fromId === player.id || state.trade.toId === player.id)) {
    state.trade = null;
  }
};

const shuffle = <T>(items: T[]): T[] => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const drawCard = (decks: DeckState, type: "chance" | "community"): Card | null => {
  const deck = decks[type];
  const card = deck.shift();
  if (!card) return null;

  if (card.effect.type !== "get_out_of_jail") {
    deck.push(card);
  }

  return card;
};

const ownsColorSet = (state: RoomState, playerId: string, color: string): boolean => {
  const group = TILES.filter((tile) => tile.type === "property" && tile.color === color).map(
    (tile) => tile.index
  );
  return group.every((idx) => state.properties[idx]?.ownerId === playerId);
};

const uniqueOwnedProperties = (
  state: RoomState,
  ownerId: string,
  properties: number[]
): number[] => {
  const set = new Set<number>();
  properties.forEach((idx) => {
    const property = state.properties[idx];
    if (property && property.ownerId === ownerId) {
      set.add(idx);
    }
  });
  return [...set.values()];
};

const transferProperties = (
  state: RoomState,
  from: Player,
  to: Player,
  properties: number[]
): void => {
  properties.forEach((idx) => {
    const property = state.properties[idx];
    if (!property || property.ownerId !== from.id) {
      return;
    }
    property.ownerId = to.id;
    from.owned = from.owned.filter((ownedIdx) => ownedIdx !== idx);
    if (!to.owned.includes(idx)) {
      to.owned.push(idx);
    }
  });
};
