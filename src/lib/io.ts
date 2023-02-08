export class OutputStream {

  private _buffer: number[] = [];

  writeByte(byte: number) {
    this._buffer.push(byte);
  }

  writeShort(short: number) {
    this._buffer.push(short >>> 8, short);
  }

  writeInt(int: number) {
    this._buffer.push(int >>> 24, int >>> 16, int >>> 8, int);
  }

  writeShortString(string: string) {
    this.writeByte(string.length);                 // length (1 byte)
    for (let i = 0; i < string.length; i++) {
      this.writeShort(string.codePointAt(i) as number);      // character (2 bytes)
    }
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this._buffer);
  }

}

export class InputStream {

  private readonly _view: Uint8Array;
  private _cursor: number;

  constructor(buffer: ArrayLike<number> | ArrayBufferLike) {
    this._view = new Uint8Array(buffer);
    this._cursor = 0;
  }

  readByte(): number {
    return this._view[this._cursor++];
  }

  readShort(): number {
    let byte1 = this._view[this._cursor++];
    let byte2 = this._view[this._cursor++];
    return (byte1 << 8) + byte2;
  }

  readInt(): number {
    let byte1 = this._view[this._cursor++];
    let byte2 = this._view[this._cursor++];
    let byte3 = this._view[this._cursor++];
    let byte4 = this._view[this._cursor++];
    return (byte1 << 24) + (byte2 << 16) + (byte3 << 8) + byte4;
  }

  readShortString(): string {
    let len = this.readByte();
    let chars = [];
    for (let i = 0; i < len; i++) {
      chars.push(String.fromCharCode(this.readShort()));
    }
    return chars.join('');
  }

}