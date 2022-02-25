// import Head from "next/head";
// import { useState } from "react";

// /**
//  * Max size for emojis, applies for both
//  * width and height
//  */
// const MAX_SIZE = 256;
// const PNG_MIME_TYPE = 'image/png';
// const ALLOWED_MIME_TYPES = new Set([ 'image/webp', PNG_MIME_TYPE ]);
// const PATTERNS = {
//   name: /^[A-Za-z0-9_]{1,14}/g,
//   number: /^-?\d*$/g,
//   permission: /^[A-Za-z0-9_.]+$/g
// };
//
// /**
//  * Represents an emoji for the emoji editor
//  * @typedef {object} Emoji
//  * @property {string} name The emoji name
//  * @property {string} character The emoji character
//  * @property {string} img The emoji data in Base64
//  * @property {string} permission The emoji permission
//  * @property {number} height The emoji height
//  * @property {number} ascent The emoji ascent
//  */
//
// /**
//  * Tries to validate the given glyph if it is
//  * currently invalid and can not be exported,
//  * and returns the found issues (empty array
//  * if valid)
//  *
//  * @param glyph {Emoji} The glyph to check
//  * @return {string[]} An array of the glyph
//  * issues as user-friendly messages, empty
//  * if glyph is valid
//  */
// function validate(glyph) {
//   const issues = [];
//   const { name, character, height, ascent, permission } = glyph;
//
//   if (!name.match(PATTERNS.name)) {
//     issues.push(`Invalid name ${name}, it must be from 1 to 14`
//       + ' characters long and can only have [A-z, 0-9, _]');
//   }
//
//   if (!permission.match(PATTERNS.permission)) {
//     issues.push(`Invalid permission ${permission}, it must only have`
//       + ' alphanumeric characters, underscores or dots');
//   }
//
//   if (character.length !== 1) {
//     issues.push(`Invalid character ${character}, it must`
//       + 'be a single character');
//   }
//
//   // Minecraft limitation, "ascent" property can not
//   // be higher than "height" property
//   if (ascent > height) {
//     issues.push(`Ascent ${ascent} is higher than height ${height}`);
//   }
//
//   return issues;
// }
//
// /**
//  * Strips the extension from a file name
//  * if it exists
//  * @param filename {string} The filename
//  * @returns {string} The filename, without
//  * extension
//  */
// function stripExtension(filename) {
//   const index = filename.lastIndexOf('.');
//   return (index === -1)
//     ? filename
//     : filename.substring(0, index);
// }

export default function Editor() {
  // const [ emojis, setEmojis ] = useState(new Map());
  // const [ emojisByChar, setEmojisByChar ] = useState(new Map());
  //
  // const EmojiIO = (function () {
  //
  //   /**
  //    * Creates a file containing all the emojis using
  //    * the MCEmoji format
  //    * @param {Map<string, Emoji>} emojis
  //    * @returns {Promise<Blob>} The resulting blob
  //    */
  //   async function write(emojis) {
  //
  //     const data = [];
  //
  //     // format version
  //     data.push(1);
  //
  //     // emoji length
  //     data.push(emojis.size);
  //
  //     for (const emoji of emojis.values()) {
  //
  //       // emoji name
  //       data.push(emoji.name.length & 0xFF);
  //       for (let i = 0; i < emoji.name.length; i++) {
  //         const c = emoji.name.codePointAt(i);
  //         data.push(c >> 8, c & 0xFF);
  //       }
  //
  //       const character = emoji.character.codePointAt(0);
  //
  //       // height, ascent and character
  //       data.push(
  //         emoji.height >> 8, emoji.height & 0xFF,
  //         emoji.ascent >> 8, emoji.ascent & 0xFF,
  //         character >> 8, character & 0xFF
  //       );
  //
  //       // permission write
  //       data.push(emoji.permission.length & 0xFF);
  //       for (let i = 0; i < emoji.permission.length; i++) {
  //         const c = emoji.permission.codePointAt(i);
  //         data.push(c >> 8, c & 0xFF);
  //       }
  //
  //       // image write
  //       const bin = window.atob(emoji.img.substring("data:image/png;base64,".length));
  //       const len = bin.length;
  //
  //       data.push(len >> 8, len & 0xFF);
  //       for (let i = 0; i < len; i++) {
  //         data.push(bin.charCodeAt(i));
  //       }
  //     }
  //
  //     return new Blob(
  //       [ new Uint8Array(data) ],
  //       { type: 'octet/stream' }
  //     );
  //   }
  //
  //   /**
  //    *
  //    * @param {ArrayBuffer} buffer
  //    * @returns {Promise<Emoji[]>}
  //    */
  //   async function read(buffer) {
  //     const view = new Uint8Array(buffer);
  //     let cursor = 0;
  //
  //     function readShort() {
  //       let byte1 = view[cursor++];
  //       let byte2 = view[cursor++];
  //       return (byte1 << 8) + byte2;
  //     }
  //
  //     const version = view[cursor++];
  //
  //     if (version !== 1) {
  //       throw new Error("Invalid format version");
  //     }
  //
  //     const emojiLength = view[cursor++];
  //     const emojis = [];
  //
  //     for (let i = 0; i < emojiLength; i++) {
  //
  //       // read name
  //       const nameLength = view[cursor++];
  //       let name = "";
  //
  //       for (let j = 0; j < nameLength; j++) {
  //         name += String.fromCharCode(readShort());
  //       }
  //
  //       // height, ascent and character
  //       const height = readShort();
  //       const ascent = readShort();
  //       const character = String.fromCodePoint(readShort());
  //
  //       // read permission
  //       const permissionLength = view[cursor++];
  //       let permission = "";
  //
  //       for (let j = 0; j < permissionLength; j++) {
  //         permission += String.fromCharCode(readShort());
  //       }
  //
  //       // image read
  //       const imageLength = readShort();
  //       let image = "";
  //
  //       for (let j = 0; j < imageLength; j++) {
  //         image += String.fromCharCode(view[cursor++]);
  //       }
  //
  //       const base64 = "data:image/png;base64," + window.btoa(image);
  //
  //       emojis.push({
  //         name,
  //         height,
  //         ascent,
  //         character,
  //         permission,
  //         img: base64
  //       });
  //     }
  //
  //     return emojis;
  //   }
  //
  //   return { write, read };
  // })();
  //
  // const Dialog = (function () {
  //
  //   const maxDialogs = 1;
  //   const dialogContainer = document.createElement("div");
  //   let dialogs = [];
  //
  //   dialogContainer.classList.add("dialogs");
  //   document.body.appendChild(dialogContainer);
  //
  //   /**
  //    * Shows a dialog with the given
  //    * heading and message
  //    * @param {string} heading Dialog title
  //    * @param {string} message Dialog message
  //    * @param {"info" | "error"} type Type of dialog
  //    */
  //   function add(heading, message, type = "info") {
  //     const close = document.createElement("button");
  //     const title = document.createElement("h3");
  //     const body = document.createElement("p");
  //     const element = document.createElement("div");
  //     element.classList.add("dialog");
  //     element.classList.add(type);
  //
  //     title.innerText = heading;
  //     body.innerText = message;
  //     close.innerHTML = "&#10005;";
  //
  //     element.append(title, close, body);
  //     dialogContainer.appendChild(element)
  //       .animate([
  //         { opacity: 0 },
  //         { opacity: 1 }
  //       ], {
  //         duration: 500
  //       });
  //
  //     // remove last dialog if required
  //     if (dialogs.length >= maxDialogs) {
  //       const lastDialog = dialogs.shift();
  //       lastDialog.element.remove();
  //       clearTimeout(lastDialog.id);
  //     }
  //
  //     // closing
  //     function remove() {
  //       element.remove();
  //       dialogs = dialogs.filter(e => e.id !== id);
  //     }
  //     const id = setTimeout(remove, 5000);
  //     close.addEventListener("click", () => {
  //       remove();
  //       clearTimeout(id);
  //     });
  //
  //     dialogs.push({ id, element });
  //   }
  //
  //   return { add };
  // })();
  //
  // function generateCharacter() {
  //   let character = (1 << 15) - emojisByChar.size;
  //   while (emojisByChar.has(character)) {
  //     character--;
  //   }
  //   return String.fromCodePoint(character);
  // }
  //
  // /**
  //  * Processes the given image {@code data} and
  //  * executes the following operations if necessary:
  //  * - Convert it to a PNG image
  //  * - Resize it to less than previously set {@code MAX_SIZE}
  //  *
  //  * @param data The image data, must be a valid
  //  * image {@code src} property
  //  * @param mimeType {string} The image data mime type
  //  * @param cb {(string) => any} The resulting image data callback
  //  */
  // function processImage(data, mimeType, cb) {
  //   const image = new Image();
  //   image.onload = () => {
  //     const { width, height } = image;
  //     const max = Math.max(width, height);
  //     const ratio = (max > MAX_SIZE) ? (MAX_SIZE / max) : 1;
  //
  //     // if width or height exceeds the
  //     // max glyph size, we have to scale it
  //     if (mimeType !== PNG_MIME_TYPE || ratio < 1) {
  //       const scaledWidth = width * ratio;
  //       const scaledHeight = height * ratio;
  //
  //       const canvas = document.createElement('canvas');
  //       canvas.width = scaledWidth;
  //       canvas.height = scaledHeight;
  //
  //       const ctx = canvas.getContext('2d');
  //
  //       // write scaled image
  //       ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
  //
  //       cb(canvas.toDataURL());
  //     } else {
  //       cb(image.src);
  //     }
  //   };
  //   image.src = data;
  // }
  //
  // const EditorUI = (function () {
  //
  //   const form = $('.file-input');
  //
  //   on(form, [ 'dragover', 'dragenter' ], event => {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     form.classList.add('is-dragover');
  //   });
  //
  //   on(form, [ 'dragleave', 'dragend' ], event => {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     form.classList.remove('is-dragover');
  //   });
  //
  //   form.addEventListener('drop', event => {
  //     event.preventDefault();
  //     event.stopPropagation();
  //
  //     /** @type FileList */
  //     const files = event.dataTransfer.files;
  //     for (let i = 0; i < files.length; i++) {
  //
  //       const file = files[i];
  //
  //       if (!ALLOWED_MIME_TYPES.has(file.type)) {
  //         Dialog.add(
  //           'Error loading emoji',
  //           `Cannot load ${file.name}. Invalid image type`
  //         );
  //         return;
  //       }
  //
  //       const reader = new FileReader();
  //
  //       reader.addEventListener('load', ({ target }) => processImage(target.result, file.type, data => {
  //
  //         const emoji = {
  //           name: stripExtension(file.name), // remove extension
  //           character: generateCharacter(),
  //           img: data,
  //           ascent: 8,
  //           height: 9,
  //           permission: ''
  //         };
  //
  //         // if name is taken, use another name
  //         while (emojis.has(emoji.name)) {
  //           emoji.name = emoji.name + Math.floor(Math.random() * 1E5).toString(36);
  //         }
  //
  //         emojis.set(emoji.name, emoji);
  //         emojisByChar.set(emoji.character, emoji);
  //         EditorUI.add(emoji);
  //       }));
  //       reader.readAsDataURL(file);
  //     }
  //   });
  //
  //   const container = $('.emojis');
  //
  //   /**
  //    * @param {Emoji} emoji
  //    */
  //   function add(emoji) {
  //     const name = emoji.name;
  //
  //     function input(property, parse, validate, current) {
  //       const labelElement = document.createElement('label');
  //       labelElement.innerText = property;
  //       const element = document.createElement('input');
  //       element.type = 'text';
  //       element.spellcheck = false;
  //       element.value = current;
  //       labelElement.appendChild(element);
  //
  //       element.addEventListener('input', event => {
  //         const value = event.target.value;
  //         if (!validate(value)) {
  //           element.classList.add('error');
  //         } else {
  //           element.classList.remove('error');
  //           emojis.get(name)[property] = parse(value);
  //         }
  //       });
  //
  //       return { label: labelElement, input: element };
  //     }
  //
  //     function regex(pattern) {
  //       return value => value.match(pattern);
  //     }
  //
  //     const div = document.createElement('div');
  //
  //     div.classList.add('emoji');
  //
  //     const imgElement = document.createElement('img');
  //     const propertiesElement = document.createElement('div');
  //
  //     propertiesElement.classList.add('properties');
  //
  //     const nameElement = input('name', v => v, regex(PATTERNS.name), emoji.name);
  //     const characterElement = input('character', v => v, value => {
  //       const valid = value.length === 1;
  //       if (valid) {
  //         // update
  //         emojisByChar.delete(emoji.character);
  //         emojisByChar.set(value, emoji);
  //       }
  //       return valid;
  //     }, emoji.character);
  //     const ascentElement = input('ascent', parseInt, regex(PATTERNS.number), emoji.ascent);
  //     const heightElement = input('height', parseInt, regex(PATTERNS.number), emoji.height);
  //     const permissionElement = input('permission', v => v, regex(PATTERNS.permission), emoji.permission);
  //     const deleteElement = document.createElement('button');
  //
  //     imgElement.src = emoji.img;
  //     deleteElement.innerText = 'Remove';
  //
  //     deleteElement.addEventListener('click', () => {
  //       div.remove();
  //       emojis.delete(name);
  //     });
  //
  //     propertiesElement.append.apply(propertiesElement, [ nameElement, ascentElement, heightElement, permissionElement, characterElement ].map(e => e.label));
  //     propertiesElement.appendChild(deleteElement);
  //     div.append(imgElement, propertiesElement);
  //
  //     container.appendChild(div);
  //   }
  //
  //   return { add };
  // })();
  //
  // function save() {
  //   if (emojis.size < 1) {
  //     // no emojis, return
  //     Dialog.add(
  //       'Error',
  //       'No emojis to save, add some emojis first!',
  //       'error'
  //     );
  //     return;
  //   }
  //   EmojiIO.write(emojis).then(blob => {
  //     const a = document.createElement('a');
  //     a.setAttribute('href', URL.createObjectURL(blob));
  //     a.setAttribute('download', 'emojis.mcemoji');
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //   });
  // }
  //
  // function _import() {
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.addEventListener('change', ({ target }) => {
  //     /** @type FileList */
  //     const files = target.files;
  //     for (let i = 0; i < files.length; i++) {
  //       const reader = new FileReader();
  //       reader.onload = e => EmojiIO.read(e.target.result)
  //         .then(result => result.forEach(emoji => processImage(emoji.img, PNG_MIME_TYPE, data => {
  //           // set emoji data
  //           emoji.img = data;
  //
  //           // if name is taken, use another name
  //           while (emojis.has(emoji.name)) {
  //             emoji.name = emoji.name + Math.floor(Math.random() * 1E5).toString(36);
  //           }
  //           if (emojisByChar.has(emoji.character)) {
  //             emoji.character = generateCharacter();
  //           }
  //
  //           emojis.set(emoji.name, emoji);
  //           emojisByChar.set(emoji.character, emoji);
  //           EditorUI.add(emoji);
  //         })));
  //       reader.readAsArrayBuffer(files[i]);
  //     }
  //   });
  //   document.body.appendChild(input);
  //   input.click();
  //   input.remove();
  // }
  //
  // function _export() {
  //   if (emojis.size < 1) {
  //     // no emojis, return
  //     Dialog.add(
  //       'Error',
  //       'No emojis to upload, add some emojis first!',
  //       'error'
  //     );
  //     return;
  //   }
  //   EmojiIO.write(emojis)
  //     .then(blob => {
  //       const formData = new FormData();
  //       formData.set('file', blob);
  //       return fetch(
  //         'https://artemis.unnamed.team/tempfiles/upload/',
  //         { method: 'POST', body: formData }
  //       );
  //     })
  //     .then(response => {
  //       if (response.ok) {
  //         response.json().then(json => {
  //           const { id } = json;
  //           const command = `/emojis update ${id}`;
  //
  //           navigator.clipboard.writeText(command).catch(console.error);
  //
  //           Dialog.add(
  //             'Uploaded & Copied Command!',
  //             'Successfully uploaded emojis, execute the'
  //             + `command (${command}) in your Minecraft server to load them.`,
  //             'info'
  //           );
  //         });
  //       } else {
  //         const errorMessages = {
  //           413: {
  //             heading: 'Error: Too Heavy!',
  //             message: 'Your emoji pack is too large to be received by our backend,'
  //               + ' try reducing its size or manually downloading it and uploading to'
  //               + ' your Minecraft server (plugins/unemojis/emojis.mcemoji)'
  //           }
  //         };
  //
  //         const errorMessage = errorMessages[response.status] || {
  //           heading: 'Error uploading emojis',
  //           message: `HTTP Status ${response.status}`
  //         };
  //
  //         Dialog.add(errorMessage.heading, errorMessage.message, 'error');
  //       }
  //     });
  // }

  return (
    <>
      {/*<Head>*/}
      {/*  <meta property="og:title" content="Unnamed Team | Emojis"/>*/}
      {/*  <meta property="og:description" content="Web-editor for emojis, a Minecraft plugin by Unnamed Team"/>*/}
      {/*  <meta property="theme-color" content="#ff8df8"/>*/}
      {/*  <title>Unnamed | Emoji Editor</title>*/}
      {/*</Head>*/}

      {/*<div>*/}
      {/*  <h2>Editor</h2>*/}
      {/*  <p>Web-editor for µŋglyphs</p>*/}

      {/*  <div>*/}
      {/*    <h2>Drop your emojis here</h2>*/}
      {/*  </div>*/}

      {/*  <div>*/}
      {/*    <button onClick={save}>Save</button>*/}
      {/*    <button onClick={_import}>Import</button>*/}
      {/*    <button onClick={_export}>Export</button>*/}
      {/*  </div>*/}

      {/*  <div>*/}
      {/*    /!* Add emojis here*!/*/}
      {/*  </div>*/}
      {/*</div>*/}
    </>
  );
}