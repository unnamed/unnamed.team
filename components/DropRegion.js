import { useState } from 'react';
import clsx from 'clsx';

export default function DropRegion({ onDrop, onClick, children, ...props }) {
  const [ dragOver, setDragOver ] = useState(false);

  function onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  }

  function onDragEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }

  function _onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    onDrop(event.dataTransfer.files);
  }

  return (
    <div
      className={clsx(
        'flex justify-center items-center w-96 h-48 my-0 mx-auto text-lg text-white/50 border-white/[.15] rounded-2xl text-center',
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