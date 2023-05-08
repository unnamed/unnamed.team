export const DEFAULT_ASCENT = 8;
export const DEFAULT_HEIGHT = 9;
export const DEFAULT_PERMISSION = '';
export const DEFAULT_USAGE = (name: string) => `:${name}:`;

export const NAME_PATTERN = /^[a-z0-9_]{1,32}$/g;
export const NUMBER_PATTERN = /^-?\d+$/g;
export const PERMISSION_PATTERN = /^[A-Za-z0-9_.]*$/g;

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