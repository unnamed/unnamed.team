export class OutputStream {

  constructor() {
    this._buffer = [];
  }

  /**
   * @param {number} byte
   */
  writeByte(byte) {
    this._buffer.push(byte);
  }

  /**
   * @param {number} short
   */
  writeShort(short) {
    this._buffer.push(short >>> 8, short);
  }

  /**
   * @param {number} int
   */
  writeInt(int) {
    this._buffer.push(int >>> 24, int >>> 16, int >>> 8, int);
  }

  /**
   * @param {string} string
   */
  writeShortString(string) {
    this.writeByte(string.length);                 // length (1 byte)
    for (let i = 0; i < string.length; i++) {
      this.writeShort(string.codePointAt(i));      // character (2 bytes)
    }
  }

  /**
   * @returns {Uint8Array}
   */
  toUint8Array() {
    return new Uint8Array(this._buffer);
  }

}

export class InputStream {

  /**
   * @param {ArrayLike<number>} buffer
   */
  constructor(buffer) {
    this._view = new Uint8Array(buffer);
    this._cursor = 0;
  }

  /**
   * @returns {number}
   */
  readByte() {
    return this._view[this._cursor++];
  }

  /**
   * @returns {number}
   */
  readShort() {
    let byte1 = this._view[this._cursor++];
    let byte2 = this._view[this._cursor++];
    return (byte1 << 8) + byte2;
  }

  /**
   * @returns {number}
   */
  readInt() {
    let byte1 = this._view[this._cursor++];
    let byte2 = this._view[this._cursor++];
    let byte3 = this._view[this._cursor++];
    let byte4 = this._view[this._cursor++];
    return (byte1 << 24) + (byte2 << 16) + (byte3 << 8) + byte4;
  }

  /**
   * @returns {string}
   */
  readShortString() {
    let len = this.readByte();
    let chars = [];
    for (let i = 0; i < len; i++) {
      chars.push(String.fromCharCode(this.readShort()));
    }
    return chars.join('');
  }

}