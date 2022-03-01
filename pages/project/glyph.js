import Head from 'next/head';
import { createContext, useContext, useRef, useState } from 'react';
import { processImage, readEmojis, writeEmojis } from '../../lib/glyphio';
import { promptFilesAndReadAsBuffer, saveFile, stripExtension } from '../../lib/files';
import { ToastContainer, useToasts } from '../../lib/toast';

const ALLOWED_MIME_TYPES = new Set([ 'image/webp', 'image/png' ]);
const PATTERNS = {
  name: /^[A-Za-z0-9_]{1,14}/g,
  number: /^-?\d*$/g,
  permission: /^[A-Za-z0-9_.]+$/g,
};

const GlyphContext = createContext([]);

/**
 * Represents an emoji for the emoji editor
 * @typedef {object} Emoji
 * @property {string} name The emoji name
 * @property {string} character The emoji character
 * @property {string} img The emoji data in Base64
 * @property {string} permission The emoji permission
 * @property {number} height The emoji height
 * @property {number} ascent The emoji ascent
 */

function regex(pattern) {
  return value => value.match(pattern);
}

function Input({ emoji, property, validate, parse }) {
  const [ [ emojis, setEmojis ] ] = useContext(GlyphContext);
  parse = parse || (v => v);
  const current = emoji[property];
  const inputRef = useRef();

  return (
    <label className="flex flex-row gap-4 items-center">
      <span className="text-white opacity-80 text-sm font-light capitalize">{property}</span>
      <input
        className="bg-white/0 text-white font-light border-b-white border-opacity-80 border-b opacity-80"
        ref={inputRef}
        type="text"
        spellCheck="false"
        value={current}
        onInput={event => {
          /** @type HTMLElement */
          const element = inputRef.current;
          const value = event.target.value;

          if (!validate(value)) {
            element.classList.add('error');
          } else {
            element.classList.remove('error');
            const newEmojis = new Map(emojis);
            newEmojis.delete(emoji.name);
            const newEmoji = { ...emoji };
            newEmoji[property] = parse(value);
            newEmojis.set(emoji.name, emoji);
            setEmojis(newEmojis);
          }
        }}/>
    </label>
  );
}

/**
 * @param {Emoji} emoji
 */
function EmojiComponent({ emoji }) {
  const [ [ emojis, emojisByChar ], [ setEmojis, setEmojisByChar ] ] = useContext(GlyphContext);
  const name = emoji.name;
  return (
    <div
      className="flex flex-row bg-black bg-opacity-30 hover:bg-opacity-40 cursor-pointer px-8 py-4 gap-4 basis-[30%] items-center">
      <img src={emoji.img} alt={name} className="flex w-24"/>
      <div className="flex flex-col">
        <Input emoji={emoji} property="name" validate={regex(PATTERNS.name)}/>
        <Input emoji={emoji} property="ascent" validate={regex(PATTERNS.number)}/>
        <Input emoji={emoji} property="height" validate={regex(PATTERNS.number)}/>
        <Input emoji={emoji} property="permission" validate={regex(PATTERNS.permission)}/>
        <Input emoji={emoji} property="character" validate={value => {
          const valid = value.length === 1;
          if (valid) {
            // update
            emojisByChar.delete(emoji.character);
            emojisByChar.set(value, emoji);
            setEmojisByChar(emojisByChar);
          }
          return valid;
        }}/>
        <button onClick={() => {
          emojis.delete(name);
          emojisByChar.delete(emoji.character);
          setEmojis(emojis);
          setEmojisByChar(emojisByChar);
        }}>Remove
        </button>
      </div>
    </div>
  );
}

function DropRegion() {
  const [ dragOver, setDragOver ] = useState(false);
  const [ [ emojis, setEmojis ], [ emojisByChar, setEmojisByChar ] ] = useContext(GlyphContext);
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

  function onDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    /** @type FileList */
    const files = event.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {

      const file = files[i];

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        toasts.add(
          'error',
          `Cannot load ${file.name}. Invalid file type`,
        );
        return;
      }

      const reader = new FileReader();

      reader.addEventListener('load', ({ target }) => processImage(target.result, file.type, data => {

        const emoji = {
          name: stripExtension(file.name), // remove extension
          character: generateCharacter(emojisByChar),
          img: data,
          ascent: 8,
          height: 9,
          permission: '',
        };

        // if name is taken, use another name
        while (emojis.has(emoji.name)) {
          emoji.name = emoji.name + Math.floor(Math.random() * 1E5).toString(36);
        }

        const newEmojis = new Map(emojis);
        newEmojis.set(emoji.name, emoji);
        setEmojis(newEmojis);
        const newEmojisByChar = new Map(emojisByChar);
        newEmojisByChar.set(emoji.character, emoji);
        setEmojisByChar(newEmojisByChar);
      }));
      reader.readAsDataURL(file);
    }
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

function generateCharacter(emojisByChar) {
  let character = (1 << 15) - emojisByChar.size;
  while (emojisByChar.has(character)) {
    character--;
  }
  return String.fromCodePoint(character);
}

function save(toasts, emojis) {
  if (emojis.size < 1) {
    // no emojis, return
    toasts.add(
      'error',
      'No emojis to save, add some emojis first!',
    );
    return;
  }
  writeEmojis(emojis)
    .then(blob => saveFile(blob, 'emojis.mcemoji'));
}

function _import(emojis, emojisByChar, cb) {
  promptFilesAndReadAsBuffer(
    (file, buffer) => readEmojis(buffer)
      .then(result => result.forEach(emoji => processImage(emoji.img, file.type, imageData => {
        // set emoji data
        emoji.img = imageData;

        // if name is taken, use another name
        while (emojis.has(emoji.name)) {
          emoji.name = emoji.name + Math.floor(Math.random() * 1E5).toString(36);
        }
        if (emojisByChar.has(emoji.character)) {
          emoji.character = generateCharacter(emojisByChar);
        }

        cb(emoji);
      }))),
    { multiple: true },
  );
}

function _export(toasts, emojis) {
  if (emojis.size < 1) {
    toasts.add(
      'error',
      'No emojis to upload, add some emojis first!',
    );
    return;
  }
  writeEmojis(emojis)
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
            + `command (${command}) in your Minecraft server to load them.`,
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

function Control({ label, onClick }) {
  return (
    <button
      className="bg-pink-light font-light py-2 px-3 rounded-md hover:bg-pink-dark"
      onClick={onClick}>
      {label}
    </button>
  );
}

function Editor() {
  const toasts = useToasts();
  const [ [ emojis, setEmojis ], [ emojisByChar, setEmojisByChar ] ] = useContext(GlyphContext);

  function addEmoji(emoji) {
    emojis.set(emoji.name, emoji);
    emojisByChar.set(emoji.character, emoji);
    setEmojis(emojis);
    setEmojisByChar(emojisByChar);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-white text-center font-medium text-5xl opacity-90">Editor</h2>
        <h3 className="text-white text-center font-light text-lg opacity-90">Web-editor for µŋglyphs</h3>
      </div>

      <DropRegion/>

      <div className="flex flex-row w-max mx-auto gap-2">
        <Control label="Save" onClick={() => save(toasts, emojis)} />
        <Control label="Import" onClick={() => _import(emojis, emojisByChar, addEmoji)} />
        <Control label="Export" onClick={() => _export(toasts, emojis)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {[ ...emojis.values() ].map(emoji => (
          <EmojiComponent
            key={emoji.name}
            emoji={emoji}/>
        ))}
      </div>
    </div>
  );
}

export default function EditorPage() {
  const emojis = useState(new Map());
  const emojisByChar = useState(new Map());

  return (
    <ToastContainer>
      <GlyphContext.Provider value={[ emojis, emojisByChar ]}>
        <Head>
          <meta property="og:title" content="Unnamed Team | Emojis"/>
          <meta property="og:description" content="Web-editor for emojis, a Minecraft plugin by Unnamed Team"/>
          <meta property="theme-color" content="#ff8df8"/>
          <title>Unnamed | Emoji Editor</title>
        </Head>
        <div className="bg-gradient-to-r from-night-100 to-night-200 h-screen flex flex-col px-48 py-8">
          <Editor/>
        </div>
      </GlyphContext.Provider>
    </ToastContainer>
  );
}