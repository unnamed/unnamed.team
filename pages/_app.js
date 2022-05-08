import 'tailwindcss/tailwind.css';
import '../styles/highlight.scss';
import '../styles/global.scss';

import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Unnamed</title>
        <meta property="og:type" content="website"/>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        <meta name="theme-color" content="#ff8df8"/>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
