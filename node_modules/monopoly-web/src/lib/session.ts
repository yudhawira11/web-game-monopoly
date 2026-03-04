export type Session = {
  playerName?: string;
  roomCode?: string;
  playerId?: string;
  userId?: string;
  email?: string;
};

const KEY = "monopoly.session";

export const loadSession = (): Session | null => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
};

export const saveSession = (session: Partial<Session>): void => {
  const current = loadSession() ?? ({} as Session);
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...session }));
};

export const clearRoomSession = (): void => {
  const current = loadSession() ?? ({} as Session);
  const next = { ...current };
  delete next.roomCode;
  delete next.playerId;
  localStorage.setItem(KEY, JSON.stringify(next));
};

export const clearSession = (): void => {
  localStorage.removeItem(KEY);
};
