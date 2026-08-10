# Where each photograph goes

The club's own rules. Apply these when placing anything from
`/Users/eliseeliger/Downloads/Photos VexKan/`.

| Page | What belongs there |
| --- | --- |
| Results (`/events`) | Every award photograph. Anything with a trophy or a certificate in it. |
| Programs (`/programs`) | Every building photograph. Classes, benches, part-built robots. |
| About (`/about`) | Every World Championship photograph, all of them. |
| Home (`/`) | The highlights, chosen from across the rest. |

Two standing rules on top of those:

- **No photograph appears on two pages.** Moving between tabs should show new
  pictures, not the same ones again.
- **Lead on the members, not the founder.** His own photo appears once, on the
  About page, and nowhere else.

## The naming trap, which has already bitten once

Files were converted with positional names (`club-01`, `club-02`, …). The source
folder then grew from 27 files to 50, every index shifted, and the alt text on
the site no longer matched the pictures. Two photographs were also rotated by
index and ended up sideways.

**Name converted files after their source filename, never their position.**
Adding a photograph must not be able to renumber the ones already placed.

## Conversion settings

Pillow, not `sips`: `sips` does not apply EXIF orientation to the pixels.

```python
im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
im.thumbnail((2400, 2400), Image.LANCZOS)
im.save(out, "JPEG", quality=92, optimize=True, subsampling=0)
```

A few photographs are rotated in the pixels rather than by an EXIF flag, so
nothing automatic catches them. Open each one and turn it by hand.

## Still to do

- Reconvert all 50 with source-derived names.
- Place them by the table above, writing alt text only for photographs that have
  actually been opened.
- Replace the "VK" square and the wordmark in `ClubHeader` with the real VexKan
  logo, which is one of the images in that folder.
