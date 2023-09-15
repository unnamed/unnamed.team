import { useToasts } from "@/components/toast";
import * as Files from "@/lib/files";
import DropRegion from "@/components/DropRegion";
import GlyphMap from "@/lib/glyphs/glyph.map";
import { processImage } from "@/lib/glyphs/bitmap.font.texture";
import { DEFAULT_ASCENT, DEFAULT_HEIGHT, DEFAULT_PERMISSION, DEFAULT_USAGE } from "@/lib/glyphs/glyph";
import { readEmojis } from "@/lib/glyphs/mcemoji";
import { useGlyphEditorContext } from "@/context/GlyphEditorContext";

const ALLOWED_IMAGE_MIME_TYPES = new Set([ 'image/webp', 'image/png' ]);

/**
 * Loads glyphs from the given file, the file may be
 * an image (some data will be generated) or an MCEMOJI
 * file containing multiple complete glyphs that must
 * be fixed if broken (collisions, etc)
 *
 * The loaded glyphs are added to the provided map
 * instance, errors are reported using the provided
 * toast manager
 *
 * @param {File} file The file to read
 * @param {GlyphMap} map The glyph map to update
 * @param toasts The toast manager
 */
async function loadGlyphsFromFile(file: File, map: GlyphMap, toasts: any) {

  if (ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {

    // file is an image, import it and generate missing data
    const name = Files.stripExtension(file.name).toLowerCase();
    const uniqueName = map.ensureUniqueName(name);

    if (name !== uniqueName) {
      toasts.add('warning', `Emoji with name '${name}' already exists, name updated to '${uniqueName}'`);
    }

    const img = await processImage(await Files.readAsDataURL(file), file.type);

    map.add({
      name: uniqueName,
      character: map.generateChar(),
      img,
      ascent: DEFAULT_ASCENT,
      height: DEFAULT_HEIGHT,
      permission: DEFAULT_PERMISSION,
      usages: [ DEFAULT_USAGE(uniqueName) ]
    });
    return;
  }

  // try reading as an MCEMOJI file that may contain multiple glyphs
  try {
    for (const emoji of await readEmojis(await Files.readAsArrayBuffer(file))) {
      // process current image data
      emoji.img = await processImage(emoji.img, file.type);

      const uniqueName = map.ensureUniqueName(emoji.name);
      if (emoji.name !== uniqueName) {
        toasts.add('warning', `Emoji with name '${emoji.name}' already exists, name updated to '${uniqueName}'`);
        emoji.name = uniqueName;
      }

      if (map.byChar.has(emoji.character)) {
        emoji.character = map.generateChar();
      }

      map.add(emoji);
    }
  } catch (e: any) {
    // not an MCEMOJI file?
    toasts.add('error', `Cannot load '${file.name}': ${e.message}`);
  }
}

export default function GlyphEditorDropRegion() {
  const [ data, setData ] = useGlyphEditorContext();
  const toasts = useToasts();

  async function onDrop(files: FileList) {

    // set state to loading
    setData({ ...data, loading: true });
    const newMap = data.glyphMap.copy();

    // load glyphs (may take some time)
    for (let i = 0; i < files.length; i++) {
      await loadGlyphsFromFile(files[i], newMap, toasts);
    }

    // set glyph map, remove loading state
    setData({ ...data, glyphMap: newMap, loading: false });
  }

  async function _import() {
    const newMap = data.glyphMap.copy();
    const files = await Files.promptFiles({
      multiple: true,
      accept: [ '.mcemoji', '.mcglyph', ...ALLOWED_IMAGE_MIME_TYPES ],
    });
    // set state to loading
    setData({ ...data, loading: true });

    // load glyphs (may take some time)
    for (const file of files) {
      await loadGlyphsFromFile(file, newMap, toasts);
    }

    // set glyph map, remove loading state
    setData({ ...data, glyphMap: newMap, loading: false });
  }

  return (
    <DropRegion onDrop={onDrop} onClick={_import}>
      <h2>
        Click to select your glyphs<br/>
        or drop them here...
      </h2>
    </DropRegion>
  );
}