import { ReactNode } from "react";
import { useModalContext } from "@/context/ModalContext";
import Modal from "@/components/modal/Modal";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function CloseableModal({ title, children }: { title: string, children?: ReactNode }) {
  const modal = useModalContext();
  return (
    <Modal>
      <div className="flex flex-row py-6 pt-0 border-b border-white/10 items-center">
        <span className="flex-1" />

        <Dialog.Title
          as="h3"
          className="text-xl flex-l font-medium leading-6 text-center text-white/80 whitespace-nowrap"
        >
          {title}
        </Dialog.Title>

        <span className="flex flex-row flex-1 justify-end">
          <button
            className="bg-black/40 hover:bg-black/60 rounded-full p-2"
            onClick={() => modal.close()}>
            <XMarkIcon className="w-5 h-5 text-white/80" />
          </button>
        </span>
      </div>

      {children}
    </Modal>
  );
}