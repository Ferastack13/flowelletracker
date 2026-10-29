import type { LearnBlock, LearnSource } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

export function ArticleBody({ blocks }: { blocks: readonly LearnBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "p") {
          return (
            <p key={key} className="text-base leading-relaxed text-plum/90">
              {block.text}
            </p>
          );
        }
        if (block.type === "h2") {
          return (
            <h2
              key={key}
              className="font-serif text-2xl tracking-tight text-plum"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={key} className="space-y-2 pl-1">
              {block.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-base leading-relaxed text-plum/90"
                >
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-rose"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <aside
            key={key}
            className={cn(
              "rounded-xl border px-4 py-4",
              block.tone === "caution"
                ? "border-rose/40 bg-rose-soft/25"
                : "border-sage/40 bg-sage-soft/30",
            )}
          >
            <p className="text-sm font-medium text-plum">{block.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {block.text}
            </p>
          </aside>
        );
      })}
    </div>
  );
}

export function ArticleSources({
  sources,
  reviewedOn,
}: {
  sources: readonly LearnSource[];
  reviewedOn: string;
}) {
  return (
    <section aria-labelledby="learn-sources-heading" className="space-y-3">
      <h2
        id="learn-sources-heading"
        className="font-serif text-2xl tracking-tight text-plum"
      >
        Sources
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Factual health statements in this guide were checked against the pages
        below. Reviewed {reviewedOn}. These links are for education, not a
        personal medical opinion.
      </p>
      <ul className="space-y-2">
        {sources.map((source) => (
          <li key={source.url} className="text-sm leading-relaxed">
            <a
              href={source.url}
              rel="noreferrer"
              target="_blank"
              className="text-plum underline-offset-4 hover:underline"
            >
              {source.title}
            </a>
            <span className="text-muted-foreground"> — {source.publisher}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
