import { describe, expect, it } from "vitest";
import { BED_HEIGHT, PRINT_CYCLE, PRINT_HEIGHT, PRINT_LAYERS, PRINT_SECONDS, printFrame, printPoint } from "./print-path";

describe("printer deposition path", () => {
  it("keeps the nozzle on the same rising perimeter as the deposited part", () => {
    for (let i=0;i<200;i++) {
      const frame=printFrame(i/200*PRINT_SECONDS);
      const point=printPoint(frame.progress,frame.progress*PRINT_LAYERS*Math.PI*2);
      expect(frame.head).toEqual(point);
      expect(frame.head.y).toBeCloseTo(BED_HEIGHT+frame.progress*PRINT_HEIGHT);
      expect(frame.layer).toBeLessThanOrEqual(PRINT_LAYERS);
    }
  });
  it("closes every layer and remains inside the print bed", () => {
    for(let layer=0;layer<=PRINT_LAYERS;layer++) {
      const start=printPoint(layer/PRINT_LAYERS,0),end=printPoint(layer/PRINT_LAYERS,Math.PI*2);
      expect(start.x).toBeCloseTo(end.x);expect(start.z).toBeCloseTo(end.z);
      for(let col=0;col<96;col++) {
        const point=printPoint(layer/PRINT_LAYERS,col/96*Math.PI*2);
        expect(Math.hypot(point.x,point.z)).toBeLessThan(.8);
        expect(point.y).toBeGreaterThanOrEqual(BED_HEIGHT);
        expect(point.y).toBeLessThanOrEqual(BED_HEIGHT+PRINT_HEIGHT);
      }
    }
  });
  it("parks above the finished rim and clears the part before returning to the bed", () => {
    const complete=printFrame(45);
    expect(complete.progress).toBe(1);expect(complete.phase).toBe("complete");expect(complete.lift).toBeGreaterThan(.17);
    for(let t=48;t<PRINT_CYCLE;t+=.03) {
      const frame=printFrame(t);
      if(frame.head.y<BED_HEIGHT+PRINT_HEIGHT-.001) expect(frame.opacity).toBe(0);
    }
    expect(printFrame(PRINT_CYCLE)).toEqual(printFrame(0));
    expect(printFrame(0).progress).toBe(0);
  });
});
