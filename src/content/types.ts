export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; kind: "visual" | "photo" | "video" | "flag" | "note"; text: string }
  | { type: "diagram"; id: string; caption: string }
  | { type: "realbuild"; title: string; text: string }
  | { type: "takeaway"; text: string }
  | { type: "link"; label: string; href: string; description: string }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
    };

export type Part = "iq" | "vrc" | "back-matter";

export interface Chapter {
  number: number;
  part: Part;
  title: string;
  slug: string;
  status: "ready" | "coming-soon";
  dek: string;
  tools?: string[];
  blocks: Block[];
}
