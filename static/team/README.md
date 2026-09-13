Anime profile artwork lives here. Each file is referenced by the `image` field in
src/lib/team.ts. Until a file exists the team screen falls back to the portrait
placeholder, so a missing image never shows as a broken picture.

Filenames wired up in src/lib/team.ts:
  bunleap.webp     -> Thay Bunleap    / タイ・ブンリープ
  phourivath.webp  -> Sin Phourivath  / シン・プリワット
  thida.webp       -> Saphorn Thida   / サポーン・ティダ
  sreysor.webp     -> Ouk Sreysor     / オク・スレイソー
  sovathanak.webp  -> Phon Sovatanak  / ポン・ソヴァタナク
  sonika.webp      -> Tang Sonika     / タン・ソニカ

Artwork is stored as WebP, max 760px on the long edge - big enough for the card at 2x
screens, small enough to stay light. Convert a new PNG/JPG the same way:
  ffmpeg -i new.png -vf "scale='min(760,iw)':-2:flags=lanczos" -c:v libwebp -quality 80 -frames:v 1 new.webp

Square artwork works best (the frame crops to fill, biased 25% from the top so faces
stay in view). No image upload service is required.
