import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeData } from "@/types";

const QUIET_MS = 700;
const MAX_HISTORY = 60;

/**
 * Snapshot-style undo/redo for the resume data. Every quiet period of edits
 * produces one undoable snapshot, so a burst of keystrokes collapses into a
 * single step.
 */
export function useResumeHistory(initial: ResumeData) {
  const [data, setData] = useState<ResumeData>(initial);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  const past = useRef<ResumeData[]>([]);
  const future = useRef<ResumeData[]>([]);
  const baseline = useRef<ResumeData>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (baseline.current !== data) {
        past.current.push(baseline.current);
        if (past.current.length > MAX_HISTORY) past.current.shift();
        future.current = [];
        baseline.current = data;
        setUndoCount(past.current.length);
        setRedoCount(0);
      }
    }, QUIET_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [data]);

  const set = useCallback((updater: (prev: ResumeData) => ResumeData) => {
    setData((prev) => updater(prev));
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    if (timer.current) clearTimeout(timer.current);
    const prev = past.current.pop()!;
    future.current.push(data);
    baseline.current = prev;
    skip.current = true;
    setData(prev);
    setUndoCount(past.current.length);
    setRedoCount(future.current.length);
    requestAnimationFrame(() => {
      skip.current = false;
    });
  }, [data]);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    if (timer.current) clearTimeout(timer.current);
    const next = future.current.pop()!;
    past.current.push(data);
    baseline.current = next;
    skip.current = true;
    setData(next);
    setUndoCount(past.current.length);
    setRedoCount(future.current.length);
    requestAnimationFrame(() => {
      skip.current = false;
    });
  }, [data]);

  const reset = useCallback((next: ResumeData) => {
    past.current = [];
    future.current = [];
    baseline.current = next;
    setUndoCount(0);
    setRedoCount(0);
    setData(next);
  }, []);

  return {
    data,
    set,
    undo,
    redo,
    reset,
    canUndo: undoCount > 0,
    canRedo: redoCount > 0,
  };
}
