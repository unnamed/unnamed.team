import 'tailwindcss/tailwind.css';
import '../styles/global.scss';
import '../styles/highlight.scss';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
