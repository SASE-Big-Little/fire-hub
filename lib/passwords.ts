// Memorable passwords like "ember-otter-42": two random words and a number.
// Works in the browser and on the server (both have crypto.getRandomValues).

export const MIN_PASSWORD_LENGTH = 8;
// Supabase (bcrypt) ignores anything past 72 characters.
export const MAX_PASSWORD_LENGTH = 72;

const WORDS = [
  "ember", "flame", "spark", "blaze", "torch", "cinder", "glow", "ash",
  "smoke", "lantern", "candle", "comet", "meteor", "sunset", "dawn", "solar",
  "otter", "falcon", "fox", "lynx", "heron", "panda", "tiger", "wolf",
  "badger", "raven", "salmon", "gecko", "koala", "bison", "owl", "eagle",
  "maple", "cedar", "willow", "aspen", "river", "canyon", "meadow", "summit",
  "harbor", "island", "forest", "glacier", "pebble", "thunder", "breeze", "galaxy",
  "violet", "amber", "copper", "cobalt", "scarlet", "golden", "silver", "indigo",
  "rocket", "puzzle", "banjo", "pixel", "anchor", "compass", "kettle", "quill",
];

function randomInt(maxExclusive: number): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % maxExclusive;
}

export function generatePassword(): string {
  const first = WORDS[randomInt(WORDS.length)];
  let second = WORDS[randomInt(WORDS.length)];
  while (second === first) second = WORDS[randomInt(WORDS.length)];
  const number = 10 + randomInt(90); // 10 to 99
  return `${first}-${second}-${number}`;
}

/** Returns an error message, or null if the password is OK. */
export function checkPassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return null;
}
