import 'tailwindcss/tailwind.css';
import '../styles/highlight.scss';

import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Unnamed</title>
        <meta property="og:title" content="Unnamed"/>
        <meta property="og:description" content="Welcome to Unnamed. Let's imagine, let's create"/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://unnamed.team/"/>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        <meta name="theme-color" content="#ff8df8"/>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
