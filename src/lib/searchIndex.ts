import { chapters } from "@/content/chapters";

export interface SearchDoc {
  id: string;
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
  heading: string;
  text: string;
}

export function buildSearchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const chapter of chapters) {
    if (chapter.status !== "ready") continue;
    let heading = chapter.title;
    let seq = 0;

    for (const block of chapter.blocks) {
      if (block.type === "h2") {
        heading = block.text;
        continue;
      }
      let text: string | undefined;
      if (block.type === "p" || block.type === "takeaway") text = block.text;
      else if (block.type === "realbuild") text = `${block.title}: ${block.text}`;
      else if (block.type === "callout" && block.kind !== "flag") text = block.text;
      else if (block.type === "diagram") text = block.caption;
      else if (block.type === "list") text = block.items.join(" ");

      if (!text) continue;
      seq += 1;
      docs.push({
        id: `${chapter.slug}-${seq}`,
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title,
        chapterNumber: chapter.number,
        heading,
        text,
      });
    }
  }

  return docs;
}
