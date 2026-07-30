import { Entry, getStage, entrySections } from "@/content/notebook";
import { toPptxData } from "./images";
export { download } from "./download";
import { SCHEMES } from "./schemes";

/** Oldest first, so the notebook reads forward like a real bound one. */
export function chronological(entries: Entry[]) {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

export function toMarkdown(entries: Entry[], teamName: string): string {
  const ordered = chronological(entries);
  const lines: string[] = [`# ${teamName} Engineering Notebook`, ""];

  lines.push("## Table of contents", "");
  ordered.forEach((e, i) => {
    lines.push(`${i + 1}. ${e.date} — ${e.title || "Untitled"} (${getStage(e.stage).label})`);
  });
  lines.push("");

  ordered.forEach((e, i) => {
    lines.push("---", "");
    lines.push(`## Entry ${i + 1}: ${e.title || "Untitled"}`, "");
    lines.push(`**Date:** ${e.date}  `);
    lines.push(`**Stage:** ${getStage(e.stage).label}  `);
    lines.push(`**Members present:** ${e.members || "—"}`, "");
    entrySections(e).forEach(({ label, value }) => {
      lines.push(`### ${label}`, "", value, "");
    });
    (e.images ?? []).forEach((src, n) => {
      lines.push(`### Photo ${n + 1}`, "", `![Photo ${n + 1}](${src})`, "");
    });
  });

  return lines.join("\n");
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

const SERIF = "'Times New Roman', Times, serif";

/**
 * Rich HTML sized for pasting straight into a Google Doc, set in Times New
 * Roman with a real size hierarchy so it reads like a judged document rather
 * than a dump of text. Google Docs keeps inline styles when HTML arrives on the
 * clipboard as text/html, so the formatting survives the paste.
 *
 * To get a PDF, paste this into a Doc and use File, Download, PDF. That gives
 * better pagination and real embedded fonts than generating a PDF here would.
 */
export function toGoogleDocsHtml(entries: Entry[], teamName: string): string {
  const ordered = chronological(entries);

  const toc = ordered
    .map(
      (e, i) => `<tr>
        <td style="padding:3pt 10pt 3pt 0;font-size:11pt;width:38pt">${i + 1}.</td>
        <td style="padding:3pt 10pt 3pt 0;font-size:11pt;width:88pt">${esc(e.date)}</td>
        <td style="padding:3pt 10pt 3pt 0;font-size:11pt"><b>${esc(e.title || "Untitled")}</b></td>
        <td style="padding:3pt 0;font-size:10pt;color:#555">${esc(getStage(e.stage).label)}</td>
      </tr>`
    )
    .join("");

  const body = ordered
    .map((e, i) => {
      const sections = entrySections(e)
        .map(
          ({ label, value }) => `
            <h3 style="font-family:${SERIF};font-size:12pt;font-weight:bold;margin:12pt 0 2pt">${label}</h3>
            <p style="font-family:${SERIF};font-size:11pt;line-height:1.5;margin:0 0 4pt;text-align:justify">${esc(value)}</p>`
        )
        .join("");

      const photos = (e.images ?? [])
        .map(
          (src, n) => `
            <p style="margin:10pt 0 2pt;text-align:center">
              <img src="${src}" alt="Figure ${i + 1}.${n + 1}" style="max-width:440px">
            </p>
            <p style="font-family:${SERIF};font-size:9.5pt;font-style:italic;color:#555;text-align:center;margin:0 0 10pt">
              Figure ${i + 1}.${n + 1}
            </p>`
        )
        .join("");

      return `
        <h2 style="font-family:${SERIF};font-size:16pt;font-weight:bold;margin:22pt 0 2pt;page-break-before:always">
          Entry ${i + 1}. ${esc(e.title || "Untitled")}
        </h2>
        <p style="font-family:${SERIF};font-size:10.5pt;font-style:italic;color:#444;margin:0 0 2pt">
          ${esc(e.date)} &nbsp;&middot;&nbsp; ${esc(getStage(e.stage).label)} &nbsp;&middot;&nbsp; ${esc(e.members || "no members listed")}
        </p>
        <hr style="border:none;border-top:1px solid #999;margin:4pt 0 0">
        ${sections}${photos}`;
    })
    .join("");

  return `<div style="font-family:${SERIF};color:#000">
    <h1 style="font-family:${SERIF};font-size:26pt;font-weight:bold;text-align:center;margin:0 0 2pt">${esc(teamName)}</h1>
    <p style="font-family:${SERIF};font-size:14pt;text-align:center;margin:0 0 2pt">Engineering Notebook</p>
    <p style="font-family:${SERIF};font-size:10pt;color:#666;text-align:center;margin:0 0 20pt">
      ${ordered.length} ${ordered.length === 1 ? "entry" : "entries"} &nbsp;&middot;&nbsp; exported ${new Date()
        .toISOString()
        .slice(0, 10)}
    </p>

    <h2 style="font-family:${SERIF};font-size:15pt;font-weight:bold;margin:0 0 4pt">Table of Contents</h2>
    <hr style="border:none;border-top:1px solid #999;margin:0 0 6pt">
    <table style="border-collapse:collapse;width:100%">${toc}</table>
    ${body}
  </div>`;
}

/**
 * Older copy path: drop the HTML into an offscreen editable node, select it and
 * let the browser copy the selection. Keeps formatting, and works in the cases
 * where the async Clipboard API refuses (unfocused document, Safari, and so on).
 */
function copyViaSelection(html: string): boolean {
  const holder = document.createElement("div");
  holder.innerHTML = html;
  holder.setAttribute("contenteditable", "true");
  holder.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
  document.body.appendChild(holder);

  const range = document.createRange();
  range.selectNodeContents(holder);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  sel?.removeAllRanges();
  holder.remove();
  return ok;
}

/** Copies both rich HTML and a plain-text fallback to the clipboard. */
export async function copyForGoogleDocs(entries: Entry[], teamName: string) {
  const html = toGoogleDocsHtml(entries, teamName);
  const text = toMarkdown(entries, teamName);

  if (navigator.clipboard && "ClipboardItem" in window) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
      return;
    } catch {
      // fall through to the selection-based copy
    }
  }

  if (copyViaSelection(html)) return;

  // Last resort: plain text only.
  await navigator.clipboard.writeText(text);
}



/**
 * Builds a .pptx as portrait 8.5 by 11 inch pages, which is the size VEX's own
 * digital notebook templates use and what teams set Google Slides to. Each
 * entry becomes one numbered notebook page, so an imported deck reads like a
 * bound notebook rather than a presentation.
 */
export async function downloadPptx(entries: Entry[], teamName: string) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();

  const PAGE_W = 8.5;
  const PAGE_H = 11;
  pptx.defineLayout({ name: "NOTEBOOK_PORTRAIT", width: PAGE_W, height: PAGE_H });
  pptx.layout = "NOTEBOOK_PORTRAIT";

  const LEFT = 0.62;
  const RIGHT_MARGIN = 0.45;
  const CONTENT_W = PAGE_W - LEFT - RIGHT_MARGIN;
  const FOOTER_Y = PAGE_H - 0.52;
  const BODY_TOP = 1.95;
  const BODY_BOTTOM = FOOTER_Y - 0.25;

  const ordered = chronological(entries);

  // ---- Cover page ----
  const cover = pptx.addSlide();
  cover.background = { color: "FBFAF7" };
  cover.addShape("rect", { x: 0, y: 0, w: 0.16, h: PAGE_H, fill: { color: SCHEMES.purple.hex } });
  cover.addText(teamName, {
    x: LEFT, y: 3.6, w: CONTENT_W, h: 0.9, fontSize: 40, bold: true, color: "171717", fontFace: "Times New Roman",
  });
  cover.addText("Engineering Notebook", {
    x: LEFT, y: 4.5, w: CONTENT_W, h: 0.6, fontSize: 22, color: "534AB7", fontFace: "Times New Roman",
  });
  cover.addShape("rect", { x: LEFT, y: 5.25, w: CONTENT_W, h: 0.014, fill: { color: "E5E5E5" } });
  cover.addText(`${ordered.length} entries  ·  exported ${new Date().toISOString().slice(0, 10)}`, {
    x: LEFT, y: 5.45, w: CONTENT_W, h: 0.4, fontSize: 12, color: "737373", fontFace: "Times New Roman",
  });

  // ---- One page per entry ----
  ordered.forEach((e, i) => {
    const stage = getStage(e.stage);
    const hex = SCHEMES[stage.scheme].hex;
    const photos = e.images ?? [];
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };

    // Spine down the left edge, coloured by stage
    s.addShape("rect", { x: 0, y: 0, w: 0.16, h: PAGE_H, fill: { color: hex } });

    s.addText(`ENTRY ${i + 1}  ·  ${stage.label.toUpperCase()}`, {
      x: LEFT, y: 0.5, w: CONTENT_W, h: 0.28, fontSize: 10, bold: true, color: hex, fontFace: "Times New Roman",
    });
    s.addText(e.title || "Untitled", {
      x: LEFT, y: 0.8, w: CONTENT_W, h: 0.75, fontSize: 22, bold: true, color: "171717", valign: "top", fontFace: "Times New Roman",
    });
    s.addText(`${e.date}   |   ${e.members || "no members listed"}`, {
      x: LEFT, y: 1.55, w: CONTENT_W, h: 0.28, fontSize: 10.5, color: "737373", fontFace: "Times New Roman", italic: true,
    });
    s.addShape("rect", { x: LEFT, y: 1.86, w: CONTENT_W, h: 0.014, fill: { color: "E5E5E5" } });

    const blocks = entrySections(e);
    const bodySize = blocks.length > 5 ? 10 : 11.5;

    // Photos take the lower part of the page, text keeps the top.
    const photoBandH = photos.length === 0 ? 0 : photos.length <= 2 ? 2.7 : 3.5;
    const bodyH = BODY_BOTTOM - BODY_TOP - (photoBandH ? photoBandH + 0.25 : 0);

    const rich = blocks.flatMap((b) => [
      { text: `${b.label}\n`, options: { fontSize: bodySize - 1, bold: true, color: hex, breakLine: true, fontFace: "Times New Roman" } },
      { text: `${b.value}\n`, options: { fontSize: bodySize, color: "333333", breakLine: true, fontFace: "Times New Roman" } },
    ]);

    if (rich.length) {
      s.addText(rich, {
        x: LEFT, y: BODY_TOP, w: CONTENT_W, h: Math.max(1, bodyH), valign: "top", lineSpacingMultiple: 1.12,
      });
    } else {
      s.addText("No details recorded for this entry.", {
        x: LEFT, y: BODY_TOP, w: CONTENT_W, h: 0.4, fontSize: 11.5, italic: true, color: "999999", fontFace: "Times New Roman",
      });
    }

    if (photos.length) {
      const bandY = BODY_BOTTOM - photoBandH;
      if (photos.length === 1) {
        s.addImage({
          data: toPptxData(photos[0]),
          x: LEFT, y: bandY, w: CONTENT_W, h: photoBandH,
          sizing: { type: "contain", w: CONTENT_W, h: photoBandH },
        });
      } else if (photos.length === 2) {
        const w = (CONTENT_W - 0.2) / 2;
        photos.forEach((src, n) => {
          s.addImage({
            data: toPptxData(src),
            x: LEFT + n * (w + 0.2), y: bandY, w, h: photoBandH,
            sizing: { type: "contain", w, h: photoBandH },
          });
        });
      } else {
        const w = (CONTENT_W - 0.2) / 2;
        const h = (photoBandH - 0.2) / 2;
        photos.slice(0, 4).forEach((src, n) => {
          s.addImage({
            data: toPptxData(src),
            x: LEFT + (n % 2) * (w + 0.2),
            y: bandY + Math.floor(n / 2) * (h + 0.2),
            w, h,
            sizing: { type: "contain", w, h },
          });
        });
      }
    }

    // Numbered pages, which the notebook rubric asks for.
    s.addShape("rect", { x: LEFT, y: FOOTER_Y - 0.12, w: CONTENT_W, h: 0.014, fill: { color: "E5E5E5" } });
    s.addText(teamName, {
      x: LEFT, y: FOOTER_Y, w: CONTENT_W / 2, h: 0.28, fontSize: 9, color: "A3A3A3", fontFace: "Times New Roman",
    });
    s.addText(`${i + 1}`, {
      x: LEFT + CONTENT_W / 2, y: FOOTER_Y, w: CONTENT_W / 2, h: 0.28, fontSize: 9, color: "A3A3A3", align: "right", fontFace: "Times New Roman",
    });
  });

  await pptx.writeFile({ fileName: `${teamName.replace(/\s+/g, "-")}-notebook.pptx` });
}
