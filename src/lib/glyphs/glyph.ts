export interface Glyph {
  img: string;
  character: number;
  name: string;
  height: number;
  ascent: number;
  permission: string;
  usages: string[];
}

// TODO: Remove this interface and use Glyph instead
export interface Emoji extends Glyph {
}