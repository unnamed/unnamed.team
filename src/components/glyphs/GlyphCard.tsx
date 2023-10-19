import { Emoji, NAME_PATTERN, NUMBER_PATTERN, PERMISSION_PATTERN } from "@/lib/glyphs/glyph";
import { useGlyphEditorContext } from "@/context/GlyphEditorContext";
import { useState } from "react";
import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/24/solid";

/**
 * @param {Emoji} emoji
 */
export default function GlyphCard({ emoji }: { emoji: Emoji }) {
  const [ data, setData ] = useGlyphEditorContext();
  const name = emoji.name;

  function Input({
    property,
    validate,
    serialize,
    deserialize,
    title,
  }: {
    property: string,
    validate: (v: string) => any,
    serialize?: (v: any) => string,
    deserialize?: (v: string) => any;
    title: string;
  }) {
    serialize = serialize || (v => v.toString());
    deserialize = deserialize || (v => v);

    const initialValue = (emoji as any)[property];
    const initialStringValue = serialize(initialValue);

    const [ valid, setValid ] = useState(validate(initialStringValue));
    const [ value, setValue ] = useState(initialStringValue);
    const [ data ] = useGlyphEditorContext();

    return (
      <label className="flex flex-row gap-4 items-center text-white/80">
        <span className="text-sm font-light capitalize w-28 text-right">{property}</span>
        <input
          className={clsx(
            'rounded-lg font-light w-full py-1 px-2 border focus:outline-none focus:ring',
            valid ? 'bg-black/30 border-black/10 focus:ring-pink-200' : 'bg-red-500/30 border-red-500/50 focus:ring-red-400',
          )}
          type="text"
          spellCheck="false"
          value={value}
          title={title}
          onInput={event => {
            const newValue = (event.target as any).value;
            setValue(newValue);

            if (!validate(newValue)) {
              setValid(false);
              return;
            }

            setValid(true);

            // mutates map without calling setMap to avoid
            // updating
            data.glyphMap.removeByName(emoji.name);

            // @ts-ignore
            (emoji as any)[property] = deserialize(newValue);
            data.glyphMap.add(emoji);
          }}/>
      </label>
    );
  }


  function remove() {
    const newMap = data.glyphMap.copy();
    newMap.removeByName(emoji.name);
    setData({ ...data, glyphMap: newMap });
  }

  function regex(pattern: RegExp): ((value: string) => any) {
    return (value: string) => value.match(pattern);
  }

  return (
    <div className="flex basis-full p-2 md:p-3 md:basis-1/2 xl:basis-1/3">
      <div
        className="flex flex-row py-2 md:py-4 px-4 md:px-8 gap-4 w-full items-center justify-between rounded-2xl border bg-white/10 border-white/[.15]">
        <img src={emoji.img} alt={name} className="flex w-16 sm:w-24 rendering-pixelated"/>
        <div className="flex flex-col gap-1">
          <Input
            property="name"
            validate={regex(NAME_PATTERN)}
            title="The emoji name, when it's inside colons (like :emoji:), it will be replaced by the emoji image"
            deserialize={v => {
              // also update the single usage we have
              // todo: remove and allow multiple usages
              if (!emoji.usages || emoji.usages.length !== 1)
                emoji.usages = [ `:${v}:` ];
              else
                emoji.usages[0] = `:${v}:`;
              return v;
            }}/>
          <Input property="ascent" validate={input => {
            if (!input.match(NUMBER_PATTERN)) {
              // not a number, it is invalid
              return false;
            }
            const ascent = parseInt(input);
            return ascent <= emoji.height;
          }} title="(ADVANCED): Adds a vertical shift to the emoji image (specified in pixels)"/>
          <Input property="height" validate={regex(NUMBER_PATTERN)} title="The height of the emoji in pixels"/>
          <Input property="permission" validate={regex(PERMISSION_PATTERN)}
            title="The permission to use the emoji, leave blank to remove"/>
          <Input property="character" serialize={String.fromCodePoint} deserialize={n => n.codePointAt(0)}
            validate={value => {
              const matches = value.match(/([\uD800-\uDBFF][\uDC00-\uDFFF])/g);
              if (matches === null) {
                return value.length === 1;
              } else {
                return matches.length === 1 && value.length === 2;
              }
            }}
            title="(ADVANCED): The replaced character, it will take the texture of the emoji image, so you can't use it in the game anymore, should be a 'rare' character you won't see in the game"/>
        </div>
        <div className="h-full">
          <button className="text-white/70" onClick={remove}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}