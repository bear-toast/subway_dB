const TOKEN_PATTERN = /(\d+(?:\.\d+)?(?:dB|%))/g;

export function Highlighted({ text, className = "" }) {
  // split() with a capturing group returns alternating [text, match, text, match, ...]
  const parts = text.split(TOKEN_PATTERN);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-semibold text-white">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}
