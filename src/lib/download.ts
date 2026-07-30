/**
 * Triggering a file download from the browser.
 *
 * The anchor has to be in the document for Firefox to honour a synthetic
 * click, and the object URL has to outlive the click long enough for the
 * browser to start fetching it, hence the delayed revoke. Getting either wrong
 * makes the download silently do nothing.
 */
export function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
