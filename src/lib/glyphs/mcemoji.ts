// JavaScript's implementation of the MCEmoji format, used
// to represent an emoji pack, binary format
import { InputStream, OutputStream } from '../io';

const supportedMcEmojiVersions = [ 1, 2, 3, 4, 5 ];

export * from './glyph';
import { Glyph } from './glyph';

/**
 * Creates a file containing all the emojis using
 * the MCEmoji format
 *
 * @param {Map<string, Glyph>} emojis
 * @returns {Promise<Blob>} The resulting blob
 */
export async function writeEmojis(emojis: Map<string, Glyph>) {

  const output = new OutputStream();

  let formatVersion = 1;

  // TODO: Remove, only for backwards-compatibility
  // @ts-ignore
  for (const emoji of emojis.values()) {
    // if an emoji data length is >= than an unsigned short
    // max value, we must use the format version 2, that fixes it
    const dataLength = window.atob(emoji.img.substring("data:image/png;base64,".length)).length;
    if (dataLength >= 0xFFFF) {
      console.log(`Emoji ${emoji.name} requires MCEmoji v2 as minimum`);
      formatVersion = Math.max(formatVersion, 2); // use 2 if not greater
    }

    // if an emoji character requires 2 bytes to be represented
    // use format version 3
    if (emoji.character >= 0xFFFF) {
      console.log(`Emoji ${emoji.name} requires MCEmoji v3 as minimum`);
      formatVersion = Math.max(formatVersion, 3); // use 3 if not greater
    }

    // if an emoji uses custom "usages", use format version 5
    if (emoji.usages.length != 1 || emoji.usages[0] !== `:${emoji.name}:`) {
      console.log(`Emoji ${emoji.name} requires MCEmoji v5 as minimum`);
      formatVersion = Math.max(formatVersion, 5); // use 5 if not greater
    }
  }

  if (emojis.size >= 250) {
    // if we have more than 250 emojis, we must use an int to represent
    // the emoji count
    formatVersion = Math.max(formatVersion, 4);
  }

  // format version
  output.writeByte(formatVersion);

  // emoji length
  if (formatVersion >= 4) {
    // use integer since format version 4,
    // supporting more than 256 emojis
    output.writeInt(emojis.size);
  } else {
    output.writeByte(emojis.size);
  }

  //@ts-ignore
  for (const emoji of emojis.values()) {

    // emoji name
    output.writeShortString(emoji.name);

    output.writeShort(emoji.height);
    output.writeShort(emoji.ascent);

    // write character
    if (formatVersion >= 3) {
      // use integers since format version 3,
      // supporting UTF-16 surrogate pairs
      output.writeInt(emoji.character);
    } else {
      // doesn't support surrogate pairs :(
      output.writeShort(emoji.character);
    }

    // permission write
    output.writeShortString(emoji.permission);

    if (formatVersion >= 5) {
      // write usages
      output.writeInt(emoji.usages.length);
      for (const usage of emoji.usages) {
        output.writeShortString(usage);
      }
    }

    // image write
    const bin = window.atob(emoji.img.substring("data:image/png;base64,".length));
    const len = bin.length;

    // write emoji image data length
    if (formatVersion >= 2) {
      // use integer since format version 2,
      // a short value wasn't enough to represent
      // the length of images having a maximum of
      // 256x256 pixels
      output.writeInt(len);
    } else {
      output.writeShort(len);
    }

    for (let i = 0; i < len; i++) {
      output.writeByte(bin.charCodeAt(i));
    }
  }

  return new Blob(
    [ output.toUint8Array() ],
    { type: 'octet/stream' },
  );
}

/**
 * Asynchronously reads the emojis from the
 * given array buffer
 *
 * @param {ArrayBuffer} buffer The data source
 * @returns {Promise<Glyph[]>} The read glyphs
 */
export async function readEmojis(buffer: ArrayBuffer): Promise<Glyph[]> {

  const input = new InputStream(buffer);

  const version = input.readByte();

  if (!supportedMcEmojiVersions.includes(version)) {
    throw new Error(`Unsupported format version '${version}', supported versions: ${supportedMcEmojiVersions.join(', ')}`);
  }

  const emojiLength = version >= 4 ? input.readInt() : input.readByte();
  const emojis = [];

  for (let i = 0; i < emojiLength; i++) {

    // read name
    let name = input.readShortString();

    // height, ascent and character
    const height = input.readShort();
    const ascent = input.readShort();
    const character = version >= 3 ? input.readInt() : input.readShort();

    // read permission
    let permission = input.readShortString();
    const usages: string[] = [];

    if (version >= 5) {
      const usagesLength = input.readInt();
      for (let j = 0; j < usagesLength; j++) {
        usages.push(input.readShortString());
      }
    } else {
      // use a default usage (:name:)
      usages.push(`:${name}:`);
    }

    // image read
    const imageLength = version >= 2 ? input.readInt() : input.readShort();
    let image = "";

    for (let j = 0; j < imageLength; j++) {
      image += String.fromCharCode(input.readByte());
    }

    const base64 = "data:image/png;base64," + window.btoa(image);

    emojis.push({
      name,
      height,
      ascent,
      character,
      permission,
      img: base64,
      usages,
    });
  }

  return emojis;
}