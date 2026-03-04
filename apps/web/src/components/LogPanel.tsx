import type { GameLog } from "../lib/types";

const LogPanel = ({ logs }: { logs: GameLog[] }) => (
  <div className="panel-dark h-full p-5">
    <h3 className="font-display text-xl text-white">Log Game</h3>
    <div className="mt-3 space-y-3 overflow-y-auto text-sm text-white/70">
      {logs.length === 0 ? (
        <p className="text-white/50">Belum ada aksi.</p>
      ) : (
        logs.slice().reverse().slice(0, 10).map((log) => (
          <div key={log.id} className="rounded-2xl bg-white/5 px-3 py-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              {new Date(log.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-sm text-white">{log.message}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

export default LogPanel;