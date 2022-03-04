const layouts = {
  horizontal: 'flex-row',
  vertical: 'flex-col'
};

function Container({ children }) {
  return (
    <div className="flex flex-wrap -mx-1">
      {children}
    </div>
  );
}

function Card({ children, layout, onClick }) {
  layout = layout || 'horizontal';
  return (
    <div className="flex basis-full p-1 md:basis-1/2 lg:basis-1/3">
      <div
        className={`flex py-2 md:py-4 px-4 md:px-8 gap-4 w-full items-center justify-between cursor-pointer bg-ghost-100 hover:bg-ghost-200 ${layouts[layout]}`}
        onClick={onClick}>
        {children}
      </div>
    </div>
  );
}

Card.Container = Container;

export default Card;