"use client";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/storage";

export default function ChatLog({ messages }: { messages: ChatMessage[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);
  return (
    <div
      ref={ref}
      className="w-full max-w-2xl h-64 overflow-y-auto bg-white/5 rounded-lg p-4 backdrop-blur border border-white/10"
    >
      {messages.length === 0 && (
        <div className="text-white/50">Say "Hey Jarvis" or type below?</div>
      )}
      <div className="space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className="flex gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                m.role === "user" ? "bg-cyan-400/20 text-cyan-200" : "bg-violet-400/20 text-violet-200"
              }`}
            >
              {m.role}
            </span>
            <p className="whitespace-pre-wrap leading-relaxed text-white/90">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
