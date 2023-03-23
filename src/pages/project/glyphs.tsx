/*!
 * The glyphs web-editor page, a web user interface to
 * help with the creation of µŋglyphs (formerly µŋemojis)
 * glyphs
 */
import Link from 'next/link';
import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { processImage } from '@/lib/glyphs/bitmap.font.texture';
import { Emoji, readEmojis, writeEmojis } from '@/lib/glyphs/mcemoji';
import * as Files from '../../lib/files';
import { uploadTemporaryFile } from '@/lib/artemis';
import { ToastContainer, useToasts } from '@/components/toast';
import Button from '@/components/Button';
import Header from '@/components/Header';
import DropRegion from '@/components/DropRegion';
import clsx from 'clsx';
import Metadata from "@/components/Metadata";

const ALLOWED_IMAGE_MIME_TYPES = new Set([ 'image/webp', 'image/png' ]);
const PATTERNS = {
  name: /^[a-z0-9_]{1,32}$/g,
  number: /^-?\d+$/g,
  permission: /^[A-Za-z0-9_.]*$/g,
};

const DEFAULT_ASCENT = 8;
const DEFAULT_HEIGHT = 9;
const DEFAULT_PERMISSION = '';

/**
 * Represents a map for Emoji objects
 */
class GlyphMap {

  constructor(
    public byName: Map<string, Emoji> = new Map<string, Emoji>(),
    public byChar: Map<number, Emoji> = new Map<number, Emoji>(),
  ) {
  }

  values(): Emoji[] {
    return Array.from(this.byName.values());
  }

  add(glyph: Emoji) {
    this.byName.set(glyph.name, glyph);
    this.byChar.set(glyph.character, glyph);
  }

  removeByName(name: string) {
    const glyph = this.byName.get(name);
    if (this.byName.delete(name) && glyph) {
      this.byChar.delete(glyph.character);
    }
  }

  copy(): GlyphMap {
    return new GlyphMap(
      new Map(this.byName),
      new Map(this.byChar),
    );
  }

  ensureUniqueName(name: string) {
    if (!this.byName.has(name)) {
      return name;
    } else {
      while (this.byName.has(name)) {
        name = name + Math.floor(Math.random() * 1E5).toString(36);
      }
      return name;
    }
  }

  generateChar(): number {
    let character = (1 << 15) - this.byChar.size;
    while (this.byChar.has(character)) {
      character--;
    }
    return character;
  }

}

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

const GlyphContext = createContext<[ GlyphMap, Dispatch<SetStateAction<GlyphMap>> ]>([] as any);

function EditorHeader() {
  const [ map ] = useContext(GlyphContext);
  const toasts = useToasts();

  function upload() {
    if (map.byName.size < 1) {
      toasts.add('error', 'No emojis to upload, add some emojis first!');
      return;
    }
    writeEmojis(map.byName)
      .then(uploadTemporaryFile)
      .then(response => {
        if (response.ok) {
          response.json().then(json => {
            const { id } = json;
            const command = `/emojis update ${id}`;

            navigator.clipboard.writeText(command).catch(console.error);

            toasts.add(
              'success',
              'Successfully uploaded emojis, execute the'
              + ` command (${command}) in your Minecraft server to load them.`,
            );
          });
        } else {
          const errorMessages: {
            [ code: number ]: string
          } = {
            413: 'Your emoji pack is too large to be received by our backend,'
              + ' try reducing its size or manually downloading it and uploading to'
              + ' your Minecraft server (plugins/unemojis/emojis.mcemoji)',
          };

          toasts.add('error', errorMessages[response.status] || `HTTP Status ${response.status}`);
        }
      });
  }

  function download() {
    if (map.byName.size < 1) {
      // no emojis, return
      toasts.add('error', 'No emojis to save, add some glyphs first!');
      return;
    }
    writeEmojis(map.byName)
      .then(blob => Files.saveFile(blob, 'emojis.mcemoji'));
  }

  return (
    <Header banner={(<span>
        Important! Update to <span className="font-bold"> 1.4.0+</span> if you want to
        have more than 256 emojis. Report any issue on our <Link href="/discord"><span
        className="underline cursor-pointer">Discord server</span></Link>
    </span>)}>
      <div className="flex flex-row md:w-full md:px-16 justify-start gap-2">
        <Button
          label="Download"
          title="Download the glyphs as an MCEMOJI file"
          color="primaryGhost"
          size="small"
          onClick={download}
        />
        <Button
          label="Upload"
          title="Upload the glyphs to then load them on your Minecraft server"
          color="primaryGhost"
          size="small"
          onClick={upload}
        />
      </div>
    </Header>
  );
}

function EditorDropRegion() {
  const [ map, setMap ] = useContext(GlyphContext);
  const toasts = useToasts();

  async function onDrop(files: FileList) {
    const newMap = map.copy();
    for (let i = 0; i < files.length; i++) {
      await loadGlyphsFromFile(files[i], newMap, toasts);
    }
    setMap(newMap);
  }

  async function _import() {
    const newMap = map.copy();
    for (const file of await Files.promptFiles({
      multiple: true,
      accept: [ '.mcemoji', ...ALLOWED_IMAGE_MIME_TYPES ],
    })) {
      await loadGlyphsFromFile(file, newMap, toasts);
    }
    setMap(newMap);
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

/**
 * @param {Emoji} emoji
 */
function GlyphCard({ emoji }: { emoji: Emoji }) {
  const [ map, setMap ] = useContext(GlyphContext);
  const name = emoji.name;

  function Input({
    property,
    validate,
    serialize,
    deserialize,
    title,
  }: {
    property: string,
    validate: (v: string) => any,
    serialize?: (v: any) => string,
    deserialize?: (v: string) => any;
    title: string;
  }) {
    serialize = serialize || (v => v.toString());
    deserialize = deserialize || (v => v);

    const initialValue = (emoji as any)[property];
    const initialStringValue = serialize(initialValue);

    const [ valid, setValid ] = useState(validate(initialStringValue));
    const [ value, setValue ] = useState(initialStringValue);
    const [ map ] = useContext(GlyphContext);

    return (
      <label className="flex flex-row gap-4 items-center text-white/80">
        <span className="text-sm font-light capitalize w-28 text-right">{property}</span>
        <input
          className={clsx(
            'rounded-lg font-light w-full py-1 px-2 border focus:outline-none focus:ring',
            valid ? 'bg-black/30 border-black/10 focus:ring-pink-200' : 'bg-red-500/30 border-red-500/50 focus:ring-red-400',
          )}
          type="text"
          spellCheck="false"
          value={value}
          title={title}
          onInput={event => {
            const newValue = (event.target as any).value;
            setValue(newValue);

            if (!validate(newValue)) {
              setValid(false);
              return;
            }

            setValid(true);

            // mutates map without calling setMap to avoid
            // updating
            map.removeByName(emoji.name);

            // @ts-ignore
            (emoji as any)[property] = deserialize(newValue);
            map.add(emoji);
          }}/>
      </label>
    );
  }


  function remove() {
    const newMap = map.copy();
    newMap.removeByName(emoji.name);
    setMap(newMap);
  }

  function regex(pattern: RegExp): ((value: string) => any) {
    return (value: string) => value.match(pattern);
  }

  return (
    <div className="flex basis-full p-2 md:p-3 md:basis-1/2 xl:basis-1/3">
      <div
        className="flex flex-row py-2 md:py-4 px-4 md:px-8 gap-4 w-full items-center justify-between rounded-2xl border bg-white/10 border-white/[.15]">
        <img src={emoji.img} alt={name} className="flex w-16 sm:w-24 rendering-pixelated"/>
        <div className="flex flex-col gap-1">
          <Input property="name" validate={regex(PATTERNS.name)}
            title="The emoji name, when it's inside colons (like :emoji:), it will be replaced by the emoji image"/>
          <Input property="ascent" validate={input => {
            if (!input.match(PATTERNS.number)) {
              // not a number, it is invalid
              return false;
            }
            const ascent = parseInt(input);
            return ascent <= emoji.height;
          }} title="(ADVANCED): Adds a vertical shift to the emoji image (specified in pixels)"/>
          <Input property="height" validate={regex(PATTERNS.number)} title="The height of the emoji in pixels"/>
          <Input property="permission" validate={regex(PATTERNS.permission)}
            title="The permission to use the emoji, leave blank to remove"/>
          <Input property="character" serialize={String.fromCodePoint} deserialize={n => n.codePointAt(0)}
            validate={value => {
              const matches = value.match(/([\uD800-\uDBFF][\uDC00-\uDFFF])/g);
              if (matches === null) {
                return value.length === 1;
              } else {
                return matches.length === 1 && value.length === 2;
              }
            }}
            title="(ADVANCED): The replaced character, it will take the texture of the emoji image, so you can't use it in the game anymore, should be a 'rare' character you won't see in the game"/>
        </div>
        <div className="h-full">
          <button className="text-white/70" onClick={remove}>&#10006;</button>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const [ map, setMap ] = useState<GlyphMap>(new GlyphMap());

  return (
    <>
      <Metadata options={{
        title: 'Unnamed | Glyph Editor',
        description: 'A user interface helper for µŋglyphs, a Minecraft plugin by Unnamed',
        url: 'https://unnamed.team/project/glyphs'
      }} />

      <ToastContainer>
        <GlyphContext.Provider value={[ map, setMap ]}>
          <EditorHeader/>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 py-8">
              <EditorDropRegion/>
              <div className="flex flex-wrap -mx-1">
                {map.values().slice().sort((a, b) => {
                  if (a.name < b.name) return -1;
                  if (a.name > b.name) return 1;
                  return 0;
                }).map(emoji => (
                  <GlyphCard
                    key={emoji.name}
                    emoji={emoji}/>
                ))}
              </div>
            </div>
          </div>
        </GlyphContext.Provider>
      </ToastContainer>
    </>
  );
}