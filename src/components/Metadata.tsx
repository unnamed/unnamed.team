import Head from "next/head";

interface MetadataOptions {
    title: string;
    openGraphTitle?: string;
    url: string;
    description: string;
}

export default function Metadata({options}: { options: MetadataOptions }) {
  return (
    <Head>
      <title>{options.title}</title>
      <meta property="og:title" content={options.openGraphTitle ?? options.title} />
      <meta property="og:url" content={options.url} />
      <meta property="og:description" content={options.description} />
    </Head>
  );
}