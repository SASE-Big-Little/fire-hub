"use client";

import { generatePassword } from "@/lib/passwords";

// A password box with a "Generate" button that fills in something
// memorable like "ember-otter-42". You can also type your own.
export default function PasswordInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="at least 8 characters"
        autoComplete="new-password"
        minLength={8}
        required
        className="input min-w-0 flex-1 font-mono"
      />
      <button type="button" onClick={() => onChange(generatePassword())} className="btn-secondary">
        Generate
      </button>
    </div>
  );
}
