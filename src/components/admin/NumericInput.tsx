import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export function parseNumericDraft(raw: string): number {
  const value = raw.trim().replace(",", ".");
  return value && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ? Number(value) : NaN;
}
/** Keep the editing buffer separate from the number used by pricing and saving. */
export function NumericInput({ value, onValueChange, ...props }: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & { value: number; onValueChange: (value: number) => void }) {
  const [draft, setDraft] = useState(() => Number.isFinite(value) ? String(value) : "");
  useEffect(() => {
    setDraft(previous => Object.is(parseNumericDraft(previous), value) ? previous : Number.isFinite(value) ? String(value) : "");
  }, [value]);
  return <Input {...props} type="text" inputMode="decimal" value={draft} aria-invalid={draft !== "" && !Number.isFinite(parseNumericDraft(draft)) || undefined} onChange={event => {
    setDraft(event.target.value);
    onValueChange(parseNumericDraft(event.target.value));
  }} />;
}
