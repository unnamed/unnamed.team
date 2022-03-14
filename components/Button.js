const types = {
  primary: 'bg-wine-900 dark:bg-pink-200 text-white dark:text-wine-900 hover:bg-wine-700 dark:hover:bg-pink-500',
  secondary: 'dark:bg-gray-700 dark:bg-opacity-30 text-wine-900 dark:text-lightghost-200 hover:bg-gray-100 hover:text-pink-200 dark:hover:bg-opacity-50'
};

export default function Button({ label, color, onClick }) {
  color = color || 'primary';
  return (
    <button
      className={`rounded-lg font-semibold py-4 px-6 text-sm ${types[color]}`}
      onClick={onClick}>
      {label}
    </button>
  );
}