import { ReactNode } from "react";
import { Dialog } from "@headlessui/react";

export default function Modal({ children }: { children?: ReactNode }) {
  return (
    <Dialog.Panel className="flex flex-col mas-w-lg mx-auto transform overflow-hidden rounded-2xl bg-wine-900 p-6 text-left align-middle shadow-xl transition-all gap-4">
      {children}
    </Dialog.Panel>
  );
}