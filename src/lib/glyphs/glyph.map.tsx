import {Emoji} from "@/lib/glyphs/glyph";

/**
 * Represents a map for Emoji objects
 */
export default class GlyphMap {

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