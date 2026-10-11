// Placeholder logo. Challenge 8 is to design a real one!
export default function FlameLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1 2.6 2 3 0-3.5-.5-6 .5-9Z"
        fill="var(--accent)"
      />
      <path
        d="M12 13c.6 1.6 2.5 2.5 2.5 4.5a2.5 2.5 0 0 1-5 0c0-1.2.7-2 1.3-2.5.1.8.5 1.3 1 1.5 0-1.5-.2-2.4.2-3.5Z"
        fill="var(--highlight)"
      />
    </svg>
  );
}
