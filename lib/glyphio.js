// Module dedicated to Glyph/Emoji I/O, provides functions
// to convert emoji data to binary buffers, and from binary
// buffers to emoji data

/**
 * Processes the given image {@code data} and
 * executes the following operations if necessary:
 * - Convert it to a PNG image
 * - Resize it to less than previously set {@code MAX_SIZE}
 *
 * @param data The image data, must be a valid
 * image {@code src} property
 * @param mimeType {string} The image data mime type
 * @return Promise<string> The processed data URL
 */
export function processImage(data, mimeType) {
  const MAX_SIZE = 256;
  const PNG_MIME_TYPE = 'image/png';

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('error', reject);
    image.addEventListener('load', () => {
      const { width, height } = image;
      const max = Math.max(width, height);
      const ratio = (max > MAX_SIZE) ? (MAX_SIZE / max) : 1;

      // if width or height exceeds the
      // max glyph size, we have to scale it
      if (mimeType !== PNG_MIME_TYPE || ratio < 1) {
        const scaledWidth = width * ratio;
        const scaledHeight = height * ratio;

        const canvas = document.createElement('canvas');
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        const ctx = canvas.getContext('2d');

        // write scaled image
        ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

        resolve(canvas.toDataURL());
      } else {
        resolve(image.src);
      }
    });
    image.src = data;
  });
}

/**
 * Creates a file containing all the emojis using
 * the MCEmoji format
 * @param {Map<string, Emoji>} emojis
 * @returns {Promise<Blob>} The resulting blob
 */
export async function writeEmojis(emojis) {

  const data = [];
  let formatVersion = 1;

  // TODO: Remove, only for backwards-compatibility
  for (const emoji of emojis.values()) {
    // if an emoji data length is >= than an unsigned short
    // max value, we must use the format version 2, that fixes it
    const dataLength = window.atob(emoji.img.substring("data:image/png;base64,".length)).length;
    if (dataLength >= 0xFFFF) {
      formatVersion = 2;
      break;
    }
  }

  // format version
  data.push(formatVersion);

  // emoji length
  data.push(emojis.size);

  for (const emoji of emojis.values()) {

    // emoji name
    data.push(emoji.name.length & 0xFF);
    for (let i = 0; i < emoji.name.length; i++) {
      const c = emoji.name.codePointAt(i);
      data.push(c >> 8, c & 0xFF);
    }

    const character = emoji.character;

    // height, ascent and character
    data.push(
      emoji.height >> 8, emoji.height & 0xFF,
      emoji.ascent >> 8, emoji.ascent & 0xFF,
      character >> 8, character & 0xFF,
    );

    // permission write
    data.push(emoji.permission.length & 0xFF);
    for (let i = 0; i < emoji.permission.length; i++) {
      const c = emoji.permission.codePointAt(i);
      data.push(c >> 8, c & 0xFF);
    }

    // image write
    const bin = window.atob(emoji.img.substring("data:image/png;base64,".length));
    const len = bin.length;

    if (formatVersion === 1) {
      data.push(len >>> 8, len >>> 0);
    } else {
      data.push(len >>> 24, len >>> 16, len >>> 8, len >>> 0);
    }
    for (let i = 0; i < len; i++) {
      data.push(bin.charCodeAt(i));
    }
  }

  return new Blob(
    [ new Uint8Array(data) ],
    { type: 'octet/stream' },
  );
}

/**
 * Asynchronously reads the emojis from the
 * given array buffer
 *
 * @param {ArrayBuffer} buffer The data source
 * @returns {Promise<Emoji[]>} The read emojis
 */
export async function readEmojis(buffer) {
  const view = new Uint8Array(buffer);
  let cursor = 0;

  function readShort() {
    let byte1 = view[cursor++];
    let byte2 = view[cursor++];
    return (byte1 << 8) + byte2;
  }

  function readInt() {
    let byte1 = view[cursor++];
    let byte2 = view[cursor++];
    let byte3 = view[cursor++];
    let byte4 = view[cursor++];
    return (byte1 << 24) + (byte2 << 16) + (byte3 << 8) + byte4;
  }

  const version = view[cursor++];

  if (version !== 1 && version !== 2) {
    throw new Error("Invalid format version");
  }

  const emojiLength = view[cursor++];
  const emojis = [];

  for (let i = 0; i < emojiLength; i++) {

    // read name
    const nameLength = view[cursor++];
    let name = "";

    for (let j = 0; j < nameLength; j++) {
      name += String.fromCharCode(readShort());
    }

    // height, ascent and character
    const height = readShort();
    const ascent = readShort();
    const character = readShort();

    // read permission
    const permissionLength = view[cursor++];
    let permission = "";

    for (let j = 0; j < permissionLength; j++) {
      permission += String.fromCharCode(readShort());
    }

    // image read
    const imageLength = version === 1
      ? readShort()
      : readInt();
    let image = "";

    for (let j = 0; j < imageLength; j++) {
      image += String.fromCharCode(view[cursor++]);
    }

    const base64 = "data:image/png;base64," + window.btoa(image);

    emojis.push({
      name,
      height,
      ascent,
      character,
      permission,
      img: base64,
    });
  }

  return emojis;
}