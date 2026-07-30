import { Block } from "@/content/types";
import { Callout } from "./Callout";
import { RealBuild } from "./RealBuild";
import { Takeaway } from "./Takeaway";
import { ChapterTable } from "./ChapterTable";
import { LinkCard } from "./LinkCard";
import { Figure } from "./diagrams";

export function ChapterBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-chapter">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="text-[16px] text-[var(--ink-body)]">
                {block.text}
              </p>
            );
          case "h2":
            return (
              <h2
                key={i}
                className="mt-10 mb-3 font-serif text-xl font-semibold text-foreground first:mt-0"
              >
                {block.text}
              </h2>
            );
          case "list":
            return (
              <ul key={i} className="my-4 space-y-2.5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-[16px] leading-relaxed text-[var(--ink-body)]">
                    <span
                      className="mt-2.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: "var(--purple)" }}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "diagram":
            return <Figure key={i} id={block.id} caption={block.caption} />;
          case "callout":
            return <Callout key={i} kind={block.kind} text={block.text} />;
          case "realbuild":
            return <RealBuild key={i} title={block.title} text={block.text} />;
          case "takeaway":
            return <Takeaway key={i} text={block.text} />;
          case "table":
            return <ChapterTable key={i} headers={block.headers} rows={block.rows} />;
          case "link":
            return (
              <LinkCard
                key={i}
                label={block.label}
                href={block.href}
                description={block.description}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
