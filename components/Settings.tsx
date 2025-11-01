"use client";
import { useEffect, useState } from "react";
import { loadSettings, saveSettings, type Settings } from "@/lib/storage";

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({ wakeWordEnabled: true, speakingRate: 1 });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadSettings().then(setSettings);
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.onvoiceschanged = update;
  }, []);

  const handleChange = async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveSettings(next);
  };

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/15"
      >
        Settings
      </button>
      {open && (
        <div className="mt-2 w-[320px] bg-black/60 backdrop-blur rounded-lg border border-white/10 p-4 space-y-3">
          <div>
            <label className="block text-sm text-white/70">OpenAI API Key</label>
            <input
              type="password"
              value={settings.openaiKey ?? ""}
              onChange={(e) => handleChange({ openaiKey: e.target.value })}
              placeholder="sk-..."
              className="mt-1 w-full px-3 py-2 rounded bg-white/10 border border-white/10 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70">Voice</label>
            <select
              value={settings.voiceName ?? ""}
              onChange={(e) => handleChange({ voiceName: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded bg-white/10 border border-white/10 outline-none"
            >
              <option value="">System Default</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} {v.lang ? `(${v.lang})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70">Speaking Rate</label>
            <input
              type="range"
              min={0.75}
              max={1.25}
              step={0.05}
              value={settings.speakingRate}
              onChange={(e) => handleChange({ speakingRate: parseFloat(e.target.value) })}
              className="mt-2 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="wake"
              type="checkbox"
              checked={settings.wakeWordEnabled}
              onChange={(e) => handleChange({ wakeWordEnabled: e.target.checked })}
            />
            <label htmlFor="wake" className="text-sm text-white/80">Wake Word: "Hey Jarvis"</label>
          </div>
        </div>
      )}
    </div>
  );
}
