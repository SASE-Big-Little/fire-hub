// Chunking: split a resource's text into small pieces ("chunks").
//
// Why? Ask the Hub searches chunks, not whole resources, and sends only the
// few best chunks to the AI. Small chunks = more precise answers and fewer
// tokens used.
//
// How: keep paragraphs together when they fit. Join short paragraphs until a
// chunk is about TARGET_CHUNK_SIZE characters. Split long paragraphs at
// sentence ends, and as a last resort at spaces.

export const TARGET_CHUNK_SIZE = 800;

export function splitIntoChunks(text: string, maxChars: number = TARGET_CHUNK_SIZE): string[] {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/) // a blank line separates paragraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Make sure no single piece is longer than maxChars.
  const pieces = paragraphs.flatMap((p) => (p.length <= maxChars ? [p] : splitLongParagraph(p, maxChars)));

  // Join neighboring pieces while they still fit in one chunk.
  const chunks: string[] = [];
  let current = "";
  for (const piece of pieces) {
    const joined = current ? `${current}\n\n${piece}` : piece;
    if (joined.length <= maxChars) {
      current = joined;
    } else {
      chunks.push(current);
      current = piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Splits one long paragraph into pieces of at most maxChars. */
function splitLongParagraph(paragraph: string, maxChars: number): string[] {
  // Sentences end with . ! or ? followed by a space.
  const sentences = paragraph.split(/(?<=[.!?])\s+/);
  const pieces: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > maxChars) {
      // One giant sentence: cut it at spaces.
      if (current) pieces.push(current);
      current = "";
      pieces.push(...splitAtSpaces(sentence, maxChars));
      continue;
    }
    const joined = current ? `${current} ${sentence}` : sentence;
    if (joined.length <= maxChars) {
      current = joined;
    } else {
      pieces.push(current);
      current = sentence;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

function splitAtSpaces(text: string, maxChars: number): string[] {
  const pieces: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    // A single "word" longer than maxChars (like a huge URL) gets cut.
    if (word.length > maxChars) {
      if (current) pieces.push(current);
      current = "";
      for (let i = 0; i < word.length; i += maxChars) pieces.push(word.slice(i, i + maxChars));
      continue;
    }
    const joined = current ? `${current} ${word}` : word;
    if (joined.length <= maxChars) {
      current = joined;
    } else {
      pieces.push(current);
      current = word;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

/**
 * The chunks we store for one resource. The summary comes first, then the
 * content. Each chunk starts with the title so searches for title words
 * still find it.
 */
export function chunkResource(resource: { title: string; summary: string; content: string }): string[] {
  const text = `${resource.summary}\n\n${resource.content}`;
  const prefix = `${resource.title}\n`;
  return splitIntoChunks(text, TARGET_CHUNK_SIZE - prefix.length).map((chunk) => prefix + chunk);
}
