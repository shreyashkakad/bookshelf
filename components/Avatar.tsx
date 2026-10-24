const TINTS = ["bg-mint", "bg-butter", "bg-peach", "bg-lilac"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2) ?? "R";
  return letters.toUpperCase();
}

export default function Avatar({ name, className = "h-9 w-9 text-sm" }: { name: string; className?: string }) {
  // Hash instead of random so a reader keeps the same colour between visits.
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-ink ${TINTS[hash % TINTS.length]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
