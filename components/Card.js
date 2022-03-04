const layouts = {
  horizontal: 'flex-row',
  vertical: 'flex-col'
};

export function CardContainer({ children }) {
  return (
    <div className="flex flex-wrap">
      {children}
    </div>
  );
}

export function Card({ children, layout, onClick }) {
  layout = layout || 'horizontal';
  return (
    <div className="flex basis-full p-1 lg:basis-1/2 xl:basis-1/3">
      <div className={`flex py-4 px-8 gap-4 w-full items-center justify-between cursor-pointer bg-ghost-100 hover:bg-ghost-200 ${layouts[layout]}`} onClick={onClick}>
        {children}
      </div>
    </div>
  );
}