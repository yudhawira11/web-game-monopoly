import { useEffect, useState } from "react";
import type { RollResult } from "../lib/types";

const PIP_MAP: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

const DiceFace = ({ value, rolling }: { value?: number; rolling: boolean }) => {
  const pips = value ? PIP_MAP[value] ?? [] : [];
  return (
    <div className={`dice ${rolling ? "dice-rolling" : ""}`}>
      {Array.from({ length: 9 }).map((_, idx) => (
        <span key={idx} className={`pip ${pips.includes(idx) ? "pip-on" : ""}`} />
      ))}
    </div>
  );
};

const DicePanel = ({
  roll,
  canRoll,
  onRoll
}: {
  roll?: RollResult;
  canRoll: boolean;
  onRoll: () => void;
}) => {
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (!roll) return;
    setRolling(true);
  }, [roll?.d1, roll?.d2]);

  useEffect(() => {
    if (!rolling) return;
    const timer = window.setTimeout(() => setRolling(false), 700);
    return () => window.clearTimeout(timer);
  }, [rolling]);

  const handleRoll = () => {
    setRolling(true);
    onRoll();
  };

  return (
    <div className="panel-dark p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-white">Dadu</h3>
        {roll ? (
          <span className="text-xs uppercase tracking-[0.3em] text-white/60">
            {roll.isDouble ? "Double" : ""}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <DiceFace value={roll?.d1} rolling={rolling} />
        <DiceFace value={roll?.d2} rolling={rolling} />
        <div className="flex-1 text-right text-sm text-white/70">
          Total: <span className="text-xl font-semibold text-white">{roll?.total ?? 0}</span>
        </div>
      </div>
      <button className="btn-primary mt-4 w-full" onClick={handleRoll} disabled={!canRoll}>
        Roll Dice
      </button>
    </div>
  );
};

export default DicePanel;
