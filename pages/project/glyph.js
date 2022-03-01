import Head from 'next/head';
import { createContext, useContext, useState } from 'react';
import { processImage, readEmojis, writeEmojis } from '../../lib/glyphio';
import { promptFilesAndReadAsBuffer, saveFile, stripExtension } from '../../lib/files';
import { ToastContainer, useToasts } from '../../components/toast';
import { Card, CardContainer } from '../../components/card';
import { Button } from '../../components/button';

const ALLOWED_MIME_TYPES = new Set([ 'image/webp', 'image/png' ]);
const PATTERNS = {
  name: /^[A-Za-z0-9_]{1,14}/g,
  number: /^-?\d*$/g,
  permission: /^[A-Za-z0-9_.]+$/g,
};

/**
 * Represents an emoji for the emoji editor
 * @typedef {object} Emoji
 * @property {string} name The emoji name
 * @property {number} character The emoji character codepoint
 * @property {string} img The emoji data in Base64
 * @property {string} permission The emoji permission
 * @property {number} height The emoji height
 * @property {number} ascent The emoji ascent
 */

function compareEmoji(a, b) {
  if (a.name < b.name) return -1;
  if (a.name > b.name)return 1;
  return 0;
}

/**
 * Represents a map for Emoji objects
 */
class GlyphMap {

  /**
   * @param {Map<string, Emoji>} byName
   * @param {Map<number, Emoji>} byChar
   */
  constructor(
    byName = new Map(),
    byChar = new Map(),
  ) {
    this.byName = byName;
    this.byChar = byChar;
  }

  /**
   * @param {string} name
   * @returns {Emoji}
   */
  getByName(name) {
    return this.byName.get(name);
  }

  /**
   * @param {number} char
   * @returns {Emoji}
   */
  getByChar(char) {
    return this.byChar.get(char);
  }

  /**
   * @returns {Emoji[]}
   */
  values() {
    return Array.from(this.byName.values());
  }

  /**
   * @param {Emoji} glyph
   */
  add(glyph) {
    this.byName.set(glyph.name, glyph);
    this.byChar.set(glyph.character, glyph);
  }

  removeByName(name) {
    const glyph = this.byName.get(name);
    if (this.byName.delete(name)) {
      this.byChar.delete(glyph.character);
    }
  }

  removeByChar(char) {
    const glyph = this.byChar.get(char);
    if (this.byChar.delete(char)) {
      this.byName.delete(glyph.name);
    }
  }

  /**
   * @returns {GlyphMap}
   */
  copy() {
    return new GlyphMap(
      new Map(this.byName),
      new Map(this.byChar),
    );
  }

  /**
   * @param {Emoji} glyph
   * @returns {GlyphMap}
   */
  with(glyph) {
    const newMap = this.copy();
    newMap.add(glyph);
    return newMap;
  }

  ensureUniqueName(name) {
    if (!this.byName.has(name)) {
      return name;
    } else {
      while (this.byName.has(name)) {
        name = name + Math.floor(Math.random() * 1E5).toString(36);
      }
      return name;
    }
  }

  generateChar() {
    let character = (1 << 15) - this.byChar.size;
    while (this.byChar.has(character)) {
      character--;
    }
    return character;
  }

}

const GlyphContext = createContext([]);

function regex(pattern) {
  return value => value.match(pattern);
}

function Input({
  emoji,
  property,
  validate,
  serialize,
  deserialize
}) {
  serialize = serialize || (v => v);
  deserialize = deserialize || (v => v);

  const [ valid, setValid ] = useState(true);
  const [ value, setValue ] = useState(serialize(emoji[property]));
  const [ map ] = useContext(GlyphContext);

  return (
    <label className="flex flex-row gap-4 items-center">
      <span className="text-white opacity-80 text-sm font-light capitalize">{property}</span>
      <input
        className={`bg-white/0 text-white font-light border-b-white border-opacity-80 border-b opacity-80 ${valid ? '' : ''}`}
        type="text"
        spellCheck="false"
        value={value}
        onInput={event => {
          const newValue = event.target.value;
          setValue(newValue);

          if (!validate(newValue)) {
            setValid(false);
            return;
          }

          setValid(true);

          // mutates map without calling setMap to avoid
          // updating
          map.removeByName(emoji.name);

          emoji[property] = deserialize(newValue);
          map.add(emoji);
        }}/>
    </label>
  );
}

/**
 * @param {Emoji} emoji
 */
function EmojiComponent({ emoji }) {
  const [ map, setMap ] = useContext(GlyphContext);
  const name = emoji.name;
  return (
    <Card>
      <img src={emoji.img} alt={name} className="flex w-24"/>
      <div className="flex flex-col">
        <Input emoji={emoji} property="name" validate={regex(PATTERNS.name)}/>
        <Input emoji={emoji} property="ascent" validate={regex(PATTERNS.number)}/>
        <Input emoji={emoji} property="height" validate={regex(PATTERNS.number)}/>
        <Input emoji={emoji} property="permission" validate={regex(PATTERNS.permission)}/>
        <Input emoji={emoji} property="character" serialize={String.fromCodePoint} validate={value => value.length === 1}/>
        <button onClick={() => {
          const newMap = map.copy();
          newMap.removeByName(emoji.name);
          setMap(newMap);
        }}>Remove
        </button>
      </div>
    </Card>
  );
}

function DropRegion() {
  const [ dragOver, setDragOver ] = useState(false);
  const [ map, setMap ] = useContext(GlyphContext);
  const toasts = useToasts();

  function onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  }

  function onDragEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }

  async function onDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    /** @type FileList */
    const files = event.dataTransfer.files;
    const toAdd = [];

    for (let i = 0; i < files.length; i++) {

      const file = files[i];

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        toasts.add(
          'error',
          `Cannot load ${file.name}. Invalid file type`,
        );
        continue;
      }

      const reader = new FileReader();
      const loadPromise = new Promise((resolve, reject) => {
        reader.addEventListener('load', ({ target }) =>
          processImage(target.result, file.type, data =>
            resolve({
              name: map.ensureUniqueName(stripExtension(file.name)),
              character: map.generateChar(),
              img: data,
              ascent: 8,
              height: 9,
              permission: '',
            })
          )
        );
        reader.addEventListener('error', reject);
        reader.addEventListener('abort', reject);
      });
      reader.readAsDataURL(file);

      toAdd.push(await loadPromise);
    }

    const newMap = map.copy();
    for (const glyph of toAdd) {
      newMap.add(glyph);
    }
    setMap(newMap);
  }

  const styles = {
    def: "flex justify-center items-center mx-auto w-1/3 h-36 bg-black bg-opacity-30 text-white opacity-80 text-lg",
    dragOver: "bg-opacity-40 opacity-90",
  };

  return (
    <div
      className={`${styles.def} ${dragOver ? styles.dragOver : ''}`}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragEnd}
      onDragEnd={onDragEnd}
      onDrop={onDrop}>
      <h2>Drop your emojis here</h2>
    </div>
  );
}

function save(toasts, map) {
  if (map.byName.size < 1) {
    // no emojis, return
    toasts.add(
      'error',
      'No emojis to save, add some emojis first!',
    );
    return;
  }
  writeEmojis(map.byName)
    .then(blob => saveFile(blob, 'emojis.mcemoji'));
}

function _import(map, cb) {
  promptFilesAndReadAsBuffer(
    (file, buffer) => readEmojis(buffer)
      .then(result => result.forEach(emoji => processImage(emoji.img, file.type, imageData => {
        // set emoji data
        emoji.img = imageData;

        // if name is taken, use another name
        emoji.name = map.ensureUniqueName(emoji.name);
        if (map.byChar.has(emoji.character)) {
          emoji.character = map.generateChar();
          // todo: warn or skip this emoji
        }

        cb(emoji);
      }))),
    { multiple: true },
  );
}

function _export(toasts, map) {
  if (map.byName.size < 1) {
    toasts.add(
      'error',
      'No emojis to upload, add some emojis first!',
    );
    return;
  }
  writeEmojis(map.byName)
    .then(blob => {
      const formData = new FormData();
      formData.set('file', blob);
      return fetch(
        'https://artemis.unnamed.team/tempfiles/upload/',
        { method: 'POST', body: formData },
      );
    })
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
        const errorMessages = {
          413: 'Your emoji pack is too large to be received by our backend,'
            + ' try reducing its size or manually downloading it and uploading to'
            + ' your Minecraft server (plugins/unemojis/emojis.mcemoji)',
        };

        toasts.add('error', errorMessages[response.status] || `HTTP Status ${response.status}`);
      }
    });
}

function Editor() {
  const toasts = useToasts();
  const [ map, setMap ] = useContext(GlyphContext);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-white text-center font-medium text-5xl opacity-90">Editor</h2>
        <h3 className="text-white text-center font-light text-lg opacity-90">Web-editor for µŋglyphs</h3>
      </div>

      <DropRegion/>

      <div className="flex flex-row w-max mx-auto gap-2">
        <Button label="Save" onClick={() => save(toasts, map)}/>
        <Button label="Import" onClick={() => _import(map, setMap)}/>
        <Button label="Export" onClick={() => _export(toasts, map)}/>
      </div>

      <CardContainer>
        {map.values().sort(compareEmoji).map(emoji => (
          <EmojiComponent
            key={emoji.name}
            emoji={emoji}/>
        ))}
      </CardContainer>
    </div>
  );
}

export default function EditorPage() {
  const [ map, setMap ] = useState(new GlyphMap());

  return (
    <ToastContainer>
      <GlyphContext.Provider value={[ map, setMap ]}>
        <Head>
          <meta property="og:title" content="Unnamed Team | Emojis"/>
          <meta property="og:description" content="Web-editor for emojis, a Minecraft plugin by Unnamed Team"/>
          <meta property="theme-color" content="#ff8df8"/>
          <title>Unnamed | Emoji Editor</title>
        </Head>
        <div className="bg-gradient-to-r from-night-100 to-night-200 min-h-screen flex flex-col px-48 py-8">
          <Editor/>
        </div>
      </GlyphContext.Provider>
    </ToastContainer>
  );
}