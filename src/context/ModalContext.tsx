import { createContext, Fragment, ReactNode, useContext, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface Control {
  dialog: any;
  setDialog: (dialog: any) => void;
  close: () => void;
}

const ModalContext = createContext<Control>({
  dialog: null,
  setDialog: () => console.error('Control.setDialog(): Not implemented'),
  close: () => console.error('Control.close(): Not implemented'),
});

export function ModalContextProvider({ children, control }: { children: ReactNode, control: Control }) {
  return (
    <ModalContext.Provider value={control}>
      {children}

      <Transition appear show={control.dialog !== null} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => control?.close()}>

          {/* The background */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              <Transition.Child
                as="div"
                className="w-full"
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                {control.dialog}
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </ModalContext.Provider>
  );
}

export function useCreateModalControl(): Control {
  const [ dialog, setDialog ] = useState<any>(null);
  return {
    dialog,
    setDialog,
    close: () => setDialog(null)
  };
}

export function useModalContext(): Control {
  return useContext(ModalContext);
}