const types = {
  primary: 'bg-primary text-night-300 hover:bg-secondary',
  secondary: 'bg-ghost-100 text-lightghost-300 hover:bg-ghost-200'
};

export function Button({ label, color, onClick }) {
  color = color || 'primary';
  return (
    <button
      className={`font-light py-2 px-3 ${types[color]}`}
      onClick={onClick}>
      {label}
    </button>
  );
}