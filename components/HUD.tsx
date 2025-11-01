"use client";
import { useEffect, useMemo, useState } from "react";
import Waveform from "./Waveform";
import ChatLog from "./ChatLog";
import SettingsPanel from "./Settings";
import { loadChat, saveChat, type ChatMessage, loadSettings } from "@/lib/storage";
import { useSpeechRecognition, speak } from "@/hooks/useSpeech";
import { useWakeWord } from "@/hooks/useWakeWord";

async function chatRequest(messages: { role: string; content: string }[], apiKey?: string) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, apiKey }),
    });
    if (!res.ok) throw new Error("chat failed");
    const data = await res.json();
    return data.content as string;
  } catch (e) {
    // Offline fallback: witty reflection
    const last = messages.filter((m) => m.role === "user").pop()?.content ?? "";
    return `I couldn't reach my brain in the cloud, but here's my take: ${last.length > 0 ? last : "I am here with you."}`;
  }
}

export default function HUD() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [settings, setSettings] = useState<{ openaiKey?: string; voiceName?: string; wakeWordEnabled: boolean; speakingRate: number }>({ wakeWordEnabled: true, speakingRate: 1 });
  const [processing, setProcessing] = useState(false);

  const { transcript, interim, listening, supported, start, stop } = useSpeechRecognition();

  useEffect(() => {
    loadChat().then(setMessages);
    loadSettings().then(setSettings);
  }, []);

  useEffect(() => {
    saveChat(messages);
  }, [messages]);

  const wake = useWakeWord({
    enabled: settings.wakeWordEnabled,
    onWake: () => {
      if (!listening) start();
    },
  });

  useEffect(() => {
    if (interim) wake.pushText(interim);
  }, [interim]);

  const systemPrompt = useMemo(
    () =>
      "You are Jarvis, a caring, witty, confident voice companion. Speak concisely, with warmth and practicality. When suggesting actions, be explicit.",
    []
  );

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim(), ts: Date.now() };
    const history = [...messages, userMsg].slice(-20);
    setMessages(history);
    setProcessing(true);
    const res = await chatRequest(
      [{ role: "system", content: systemPrompt }, ...history.map((m) => ({ role: m.role, content: m.content }))],
      settings.openaiKey
    );
    const assistant: ChatMessage = { role: "assistant", content: res, ts: Date.now() };
    const next = [...history, assistant];
    setMessages(next);
    speak(res, settings.voiceName, settings.speakingRate);
    setProcessing(false);
  };

  useEffect(() => {
    if (!listening) return;
    const id = setInterval(() => {
      if (transcript.trim()) {
        stop();
        const text = transcript.trim();
        // Reset captured transcript
        (window as any).lastTranscript = "";
        setTimeout(() => send(text), 50);
      }
    }, 800);
    return () => clearInterval(id);
  }, [listening, transcript]);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6">
      <SettingsPanel />
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative w-[380px] h-[380px] rounded-full hud-ring shadow-hud animate-glow flex items-center justify-center">
          <div className={`w-[300px] h-[300px] rounded-full hud-pulse flex items-center justify-center ${listening ? "ring-4 ring-cyan-400/40" : "ring-2 ring-white/10"}`}>
            <div className="w-[240px] h-[120px]">
              <Waveform active={listening} />
            </div>
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center text-white/70 text-sm">
            {supported ? (listening ? "Listening?" : settings.wakeWordEnabled ? 'Say "Hey Jarvis"' : "Press Mic") : "Speech not supported. Type below."}
          </div>
        </div>

        <ChatLog messages={messages} />

        <div className="w-full max-w-2xl flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
                setInput("");
              }
            }}
            placeholder="Ask me anything?"
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/10 outline-none"
          />
          <button
            onClick={() => {
              if (listening) stop();
              else start();
            }}
            className={`px-4 py-3 rounded-lg border ${listening ? "bg-cyan-500/20 border-cyan-400/40" : "bg-white/10 border-white/15"}`}
          >
            {listening ? "Stop" : "Mic"}
          </button>
          <button
            onClick={() => {
              send(input);
              setInput("");
            }}
            disabled={processing}
            className="px-4 py-3 rounded-lg bg-violet-500/20 border border-violet-400/40 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
