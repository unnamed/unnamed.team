import 'tailwindcss/tailwind.css';
import '../lib/highlight.scss';
import './styles.scss';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
