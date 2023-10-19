import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

export interface SelectProps<T> {
  defaultKey: string;
  options: ({
    key: string;
    value: T;
    label?: string;
  })[];
  onSelect?: (value: T) => void;
}

export default function Select<T>(props: SelectProps<T>) {
  const [ open, setOpen ] = useState(false);
  const [ selection, setSelection ] = useState(props.options.find(o => o.key === props.defaultKey)!);

  const selectorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>();

  useEffect(() => {
    // set the 'list' position at the end of the 'selector' position
    if (selectorRef.current && listRef.current) {
      const rect = selectorRef.current.getBoundingClientRect();
      listRef.current.style.top = `${rect.bottom + 5}px`;
      listRef.current.style.left = `${rect.left}px`;
    }
  }, [ selectorRef, listRef, open ]);

  return (
    <div className={clsx("flex flex-col text-sm text-white/[.45] rounded-lg overflow-hidden shadow-sm border-t border-b border-t-white/10 border-b-black/10 bg-white/[.15]")}>
      <div className="flex flex-row gap-1 px-2 py-0.5 hover:bg-white/20 cursor-pointer" onClick={() => setOpen(s => !s)} ref={selectorRef}>
        <span>{selection.label ?? selection.key}</span>
        <ChevronDownIcon className="w-3" />
      </div>

      {open && (
        <div className="absolute rounded-lg overflow-hidden flex flex-col z-50 border-t border-b border-t-white/10 border-b-black/10 bg-[#3C3249] w-36 text-base py-1 shadow-lg" ref={listRef}>
          {props.options
            .map(option => (
              <div
                key={option.key}
                className={`flex flex-row justify-between items-center w-full px-4 py-1.5 ${option.key === selection.key ? 'text-pink-200' : 'text-white/60 cursor-pointer hover:bg-white/[.15]'}`}
                onClick={() => {
                  setSelection(option);
                  setOpen(false);
                  if (props.onSelect) {
                    props.onSelect(option.value);
                  }
                }}>
                <span>{option.label ?? option.key}</span>
                <span>{option.key === selection.key && (<CheckIcon className="w-5" />)}</span>
              </div>
            ))}
        </div>)}
    </div>
  );
}