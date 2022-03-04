export default function Background({ children }) {
  return (
    <div className="bg-gradient-to-r from-night-100 to-night-200 min-h-screen">
      {children}
    </div>
  );
}