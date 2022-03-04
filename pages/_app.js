import 'tailwindcss/tailwind.css';
import '../lib/highlight.scss';
import './global.scss';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
