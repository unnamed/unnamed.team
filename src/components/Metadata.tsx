import Head from "next/head";

interface MetadataOptions {
    siteName?: string;
    title: string;
    openGraphTitle?: string;
    url: string;
    description: string;
}

export default function Metadata({options}: { options: MetadataOptions }) {
  const siteName = options.siteName ?? 'Unnamed';
  return (
    <Head>
      <title>{options.title + " | " + siteName}</title>
      <meta property="description" content={options.description} />

      {/* OpenGraph Meta */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={options.openGraphTitle ?? options.title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={options.url} />
      <meta property="og:description" content={options.description} />
      <meta property="og:image" content="/logo-256x256.png" />
    </Head>
  );
}