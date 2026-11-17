import { power, type Board } from "../../../game/model";
import styles from "./circuit-board.module.css";

const ports = [
  { bit: 1, side: "north", point: "16 0" },
  { bit: 2, side: "east", point: "32 16" },
  { bit: 4, side: "south", point: "16 32" },
  { bit: 8, side: "west", point: "0 16" },
];
const keySteps: Record<string, number> = {
  ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4,
};

export function LampArt({ lit = false, className }: { lit?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 24" width="28" height="24" aria-hidden="true" shapeRendering="crispEdges">
      <path fill="#32463f" d="M2 20h3v-2h4v-2H7v-2H5v-2H3V9h2V7h3V5h3V3h5V2h4v2h2v2h2v3h2v3H12V9h2V7h1V5h-2v1h-2v2H8v2H6v1h2v2h2v2h2v3h2v2h3v3H2z" />
      <path fill="#9eb8a5" d="M5 9h2v2H5zm3 4h2v2H8zm3-8h2v1h-2zm5-1h3v2h2v2h2v1H15V7h2zM5 20h9v1H5z" />
      <path fill={lit ? "#f8ca66" : "#b9aa82"} d="M13 10h12v2H13zm4 2h5v2h-5z" />
      {lit && <path fill="#ae7927" d="M16 15h2v2h-2zm7-1h2v2h-2z" />}
    </svg>
  );
}

function Terminal({ source, bit, connected }: { source: boolean; bit: number; connected: boolean }) {
  return (
    <span className={styles.terminal} data-side={bit} data-connected={connected} aria-hidden="true">
      {source ? (
        <svg viewBox="0 0 28 24" width="28" height="24" shapeRendering="crispEdges">
          <path fill="#32463f" d="M2 5h20v2h2v2h3v6h-3v2h-2v2H2v-2H0V7h2z" />
          <path fill="#9eb8a5" d="M3 7h16v10H3z" />
          <path fill="#d9ab59" d="M19 7h3v10h-3zm5 4h2v2h-2z" />
          <path fill="#32463f" d="M5 11h4v2H5zm8-2h2v2h2v2h-2v2h-2v-2h-2v-2h2z" />
        </svg>
      ) : <LampArt lit={connected} />}
      <strong>{source ? "START" : "END"}</strong>
    </span>
  );
}

export default function CircuitBoard({ board, tiles, locked, won, onTurn }: {
  board: Board;
  tiles: number[];
  locked: boolean;
  won: boolean;
  onTurn: (index: number, timestamp: number) => void;
}) {
  const { powered } = power(board, tiles);
  return (
    <div className={styles.chassis}>
      <div className={styles.board} role="group" aria-label="Circuit tiles"
        onKeyDown={(event) => {
          const step = keySteps[event.key];
          if (!step || !(event.target instanceof HTMLButtonElement)) return;
          event.preventDefault();
          const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
          const next = (buttons.indexOf(event.target) + step + buttons.length) % buttons.length;
          buttons[next].focus();
        }}
      >
        {tiles.map((mask, index) => {
          const source = index === board.source;
          const terminalBit = source ? board.sourceBit : index === board.sink ? board.sinkBit : 0;
          const ends = ports.filter(({ bit }) => mask & bit);
          const cable = `M${ends.map(({ point }) => point).join(" L16 16 L")}`;
          const edge = terminalBit ? `${source ? "Battery" : "Lamp"} on ${ports[Math.log2(terminalBit)].side} edge. ` : "";
          const connected = powered.has(index);
          return (
            <div key={index} className={styles.socket}>
              <button
                type="button"
                className={styles.tile}
                disabled={locked}
                data-powered={connected}
                data-terminal={Boolean(terminalBit)}
                aria-label={`${edge}Row ${Math.floor(index / 4) + 1}, column ${index % 4 + 1}. Cable connects ${ends.map(({ side }) => side).join(" and ")}.${connected ? " Powered." : ""}`}
                onClick={(event) => onTurn(index, event.timeStamp)}
              >
                <svg viewBox="0 0 32 32" aria-hidden="true" shapeRendering="crispEdges">
                  <path className={styles.sheath} d={cable} />
                  <path className={styles.wire} d={cable} />
                  {connected && <path className={styles.stripe} d={cable} />}
                  <path fill="var(--cable-edge)" d="M14 13h4v1h1v4h-1v1h-4v-1h-1v-4h1z" />
                  <path fill="var(--cable-core)" d="M15 15h2v2h-2z" />
                </svg>
              </button>
              {terminalBit !== 0 && (
                <Terminal source={source} bit={terminalBit} connected={source ? connected : won} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
