import { useState } from "react";
import type { ChatMessage } from "../lib/types";

const ChatPanel = ({ messages, onSend }: { messages: ChatMessage[]; onSend: (message: string) => void }) => {
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  };

  return (
    <div className="panel-dark flex h-full flex-col p-5">
      <h3 className="font-display text-xl text-white">Chat</h3>
      <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-2 text-sm text-white/70">
        {messages.length === 0 ? (
          <p className="text-white/50">Belum ada chat.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-2xl bg-white/5 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">{msg.name}</p>
              <p className="text-sm text-white">{msg.message}</p>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40"
          placeholder="Tulis pesan..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSend();
            }
          }}
        />
        <button className="btn-dark" onClick={handleSend}>
          Kirim
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;