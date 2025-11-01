"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechResult = {
  transcript: string;
  interim: string;
  listening: boolean;
  supported: boolean;
  start: () => void;
  stop: () => void;
};

export function useSpeechRecognition(lang: string = "en-US"): SpeechResult {
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    typeof window !== "undefined" &&
      ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)
      ? true
      : false
  );
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!supported) return;
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (event: any) => {
      let interimText = "";
      let finalText = transcript;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0].transcript;
        if (res.isFinal) finalText += (finalText ? " " : "") + text.trim();
        else interimText += text;
      }
      setInterim(interimText);
      setTranscript(finalText);
    };

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [supported, lang, transcript]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch {}
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  }, []);

  return { transcript, interim, listening, supported, start, stop };
}

export function speak(text: string, voiceName?: string, rate: number = 1) {
  if (typeof window === "undefined") return;
  const uttr = new SpeechSynthesisUtterance(text);
  uttr.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  if (voiceName) {
    const v = voices.find((x) => x.name === voiceName);
    if (v) uttr.voice = v;
  }
  window.speechSynthesis.speak(uttr);
}
