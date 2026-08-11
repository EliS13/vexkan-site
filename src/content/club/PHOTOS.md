# Where each photograph goes

The club's own rules. Apply these when placing anything from
`/Users/eliseeliger/Downloads/Photos VexKan/`.

| Page | What belongs there |
| --- | --- |
| Results (`/events`) | Awards, and the competition floor: fields, pits, other clubs. |
| Programs (`/programs`) | Building. Classes, benches, part-built robots, and the robot each program competes with. |
| About (`/about`) | The World Championship, and the club between competitions. |
| Home (`/`) | The highlights, chosen from across the rest. |

Three standing rules on top of those:

- **No photograph appears on two pages.** Moving between tabs should show new
  pictures, not the same ones again.
- **Lead on the members, not the founder.** The founder's own photo is the
  avatar on the About page. Anywhere else it goes inside a slideshow, never as
  a standing photograph, a band or a program card.
- **Nothing is placed until it has been opened.** Alt text is written from the
  photograph, never from the file name. See the naming trap below.

## Not everything is a slideshow

A carousel shows a visitor its first slide and then loses them, so it earns its
place only where there is a genuine run of similar pictures to hold: the build
photographs on Programs, the awards on Results, the World Championship week on
About. Everything else is placed as itself, next to the paragraph it belongs
to. The shapes available, all in `src/components/club/`:

| Component | Use it for |
| --- | --- |
| `PhotoFrame` | One photograph, standing on its own. `ratio` picks the crop. |
| `PhotoBand` | Edge to edge between two sections, to break a run of cards. |
| `ProgramCard` | A program with its own photograph on it. |
| `Slideshow` | A run of pictures of the same thing, and only then. |

Captions are off by default. The awards slideshow on Results is the one place
that carries them, because a photograph cannot say which award it was.

## Every program carries a photograph

`programPhotos` in `photos.ts` is keyed by program slug, and each entry shows
someone building or the robot that program competes with. It appears twice: on
the program's card in the list, and at the top of the program's own page. A new
program without an entry still renders — the card simply has no picture — but
it should get one.

Portrait phone photographs crop badly in a letterbox, which is why the program
cards are 4:3 rather than 16:9.

## The naming trap, which has already bitten once

Files were converted with positional names (`club-01`, `club-02`, …). The source
folder then grew from 27 files to 50, every index shifted, and the alt text on
the site no longer matched the pictures. Two photographs were also rotated by
index and ended up sideways.

**Name converted files after their source filename, never their position.**
Adding a photograph must not be able to renumber the ones already placed.

The same shift is why `founderPhoto` is still wrong: it points at a photograph
of two clubbers building, not at the founder, and `PersonCard` uses it as his
avatar. The right file has to be picked by someone who can recognise him.

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

- `founderPhoto`, above.
- All 47 photographs in `public/photos/all` are placed, and each one has alt
  text written from the picture. Anything added to that folder needs a home in
  `photos.ts`; nothing reads the folder automatically.
