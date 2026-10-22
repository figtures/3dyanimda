export type PrintState = { layer: number; total: number; phase: "printing" | "complete" | "reset" };
export type PrinterSceneProps = {
  paused: boolean;
  restart: number;
  onReady: () => void;
  onFailure: () => void;
  onState: (state: PrintState) => void;
};
