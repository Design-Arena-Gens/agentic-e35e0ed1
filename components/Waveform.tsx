"use client";
import { useEffect, useRef } from "react";

export default function Waveform({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let mounted = true;
    const setup = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted) return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const canvas = canvasRef.current!;
      const c = canvas.getContext("2d")!;

      const draw = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);
        const { width, height } = canvas;
        c.clearRect(0, 0, width, height);
        c.lineWidth = 3;
        c.strokeStyle = "#44e0ff";
        c.beginPath();
        const sliceWidth = width / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
          x += sliceWidth;
        }
        c.lineTo(width, height / 2);
        c.stroke();
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    };

    setup();
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full opacity-90"
      width={480}
      height={240}
    />
  );
}
