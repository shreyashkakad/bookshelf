import Link from "next/link";
import Container from "./Container";

export const SUBJECTS = [
  "Fantasy",
  "Mystery",
  "Science fiction",
  "Romance",
  "Historical fiction",
  "Horror",
  "Biography",
  "Philosophy",
  "Poetry",
  "Children",
];

const TINTS = ["bg-mint", "bg-butter", "bg-peach", "bg-lilac"];

export default function SubjectTiles({ withHeading = false }: { withHeading?: boolean }) {
  const list = (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {SUBJECTS.map((subject, i) => (
        <li key={subject}>
          <Link
            href={`/search?subject=${encodeURIComponent(subject)}`}
            className={`flex min-h-24 items-end rounded-xl p-4 font-display text-lg font-bold leading-tight transition-transform hover:-translate-y-0.5 ${TINTS[i % TINTS.length]}`}
          >
            {subject}
          </Link>
        </li>
      ))}
    </ul>
  );
  if (!withHeading) return list;
  return (
    <section aria-labelledby="subjects-heading" className="py-10">
      <Container>
        <h2 id="subjects-heading" className="mb-5 font-display text-3xl font-bold">
          Browse by subject
        </h2>
        {list}
      </Container>
    </section>
  );
}
