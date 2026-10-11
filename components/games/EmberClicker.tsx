"use client";

// Example game: click the ember to stoke the fire!
//
// A good template for a new game (challenge 1):
//   1. "use client" at the top, because games react to clicks.
//   2. Keep the game's data in useState.
//   3. Small functions that change that state (stoke, reset).
//   4. Return what the player sees.
// Then add your game to the GAMES list in app/games/page.tsx.

import { useState } from "react";
import FlameLogo from "@/components/FlameLogo";

// Every LEVEL_SIZE clicks, the fire grows one level.
const LEVEL_SIZE = 10;
const LEVEL_NAMES = ["Spark", "Ember", "Flame", "Blaze", "Bonfire", "Inferno"];

export default function EmberClicker() {
  const [clicks, setClicks] = useState(0);

  const level = Math.min(Math.floor(clicks / LEVEL_SIZE), LEVEL_NAMES.length - 1);
  const flameSize = 48 + level * 16; // the flame grows with each level

  function stoke() {
    setClicks(clicks + 1);
  }

  function reset() {
    setClicks(0);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={stoke}
        aria-label="Stoke the fire"
        className="rounded-full p-4 transition-transform hover:scale-110 active:scale-95"
      >
        <FlameLogo size={flameSize} />
      </button>
      <p className="text-lg">
        <span className="font-bold text-highlight">{clicks}</span> clicks ·{" "}
        <span className="font-semibold">{LEVEL_NAMES[level]}</span>
      </p>
      <button type="button" onClick={reset} disabled={clicks === 0} className="btn-secondary">
        Put it out
      </button>
    </div>
  );
}
