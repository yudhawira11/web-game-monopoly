import { createClient } from "@supabase/supabase-js";
import type { RoomState } from "../game/types";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export const isSupabaseEnabled = (): boolean => Boolean(supabase);

export const upsertRoomState = async (state: RoomState): Promise<void> => {
  if (!supabase) return;
  await supabase.from("rooms").upsert({
    code: state.code,
    status: state.status,
    state
  });
};

export const loadRoomStates = async (): Promise<RoomState[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("rooms").select("state");
  if (error) {
    return [];
  }
  return (data ?? []).map((row) => {
    const state = row.state as RoomState;
    return {
      ...state,
      trade: state.trade ?? null
    };
  });
};
