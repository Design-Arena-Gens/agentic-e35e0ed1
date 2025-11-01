"use client";
import { useEffect, useRef, useState } from "react";

export function useWakeWord({
  enabled,
  target = "hey jarvis",
  onWake,
}: {
  enabled: boolean;
  target?: string;
  onWake: () => void;
}) {
  const [active, setActive] = useState(false);
  const bufferRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;
    setActive(true);
    const handler = (e: MessageEvent) => {
      // No-op placeholder for potential worker-based partials
    };
    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
      setActive(false);
    };
  }, [enabled]);

  const pushText = (text: string) => {
    if (!enabled) return;
    bufferRef.current = (bufferRef.current + " " + text).trim().slice(-200);
    const norm = bufferRef.current.toLowerCase();
    if (norm.includes(target.toLowerCase()) || norm.includes("jarvis")) {
      bufferRef.current = "";
      onWake();
    }
  };

  return { active, pushText };
}
