import { DragEvent, ReactNode, useState } from 'react';
import clsx from 'clsx';

export interface DropRegionProps {
  onDrop: (files: FileList) => void,
  onClick: any,
  children: ReactNode;
  [name: string]: any;
}

export default function DropRegion({ onDrop, onClick, children, ...props }: DropRegionProps) {
  const [ dragOver, setDragOver ] = useState(false);

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  }

  function onDragEnd(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }

  function _onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    onDrop(event.dataTransfer.files);
  }

  return (
    <div
      className={clsx(
        'flex justify-center items-center w-full lg:w-1/3 h-48 my-0 mx-auto text-lg text-white/50 border-white/[.15] rounded-2xl text-center',
        dragOver ? 'bg-white/[.15]' : 'bg-white/10 border',
        onClick && 'cursor-pointer hover:bg-white/[.15]'
      )}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragEnd}
      onDragEnd={onDragEnd}
      onDrop={_onDrop}
      onClick={onClick}
      {...props}>
      {children}
    </div>
  );
}