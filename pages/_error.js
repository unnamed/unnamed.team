import Head from "next/head";
import Header from '../components/Header';

const descriptions = {
  404: {
    name: 'Not Found',
    message: 'Sorry, the page you were looking for does not exist'
  },
  500: {
    name: 'Internal Server Error',
    message: 'Oops, something went wrong. Try refreshing this page or feel free to contact us if the problem persists'
  }
};

function ErrorPage({ statusCode }) {
  const description = descriptions[statusCode] ?? {
    name: `Error ${statusCode}`,
    message: 'Something went wrong!'
  };

  return (
    <>
      <Head>
        <title>{statusCode} | {description.name}</title>
      </Head>
      <Header />
      <div className="flex flex-col items-center gap-4 my-10 p-8">
        <h1 className="text-white/80 font-medium text-6xl text-center">{statusCode}</h1>
        <p className="text-white/70 font-light text-lg text-center">{description.message}</p>
        <img src={`https://http.cat/${statusCode}`} alt="http cat" width={350} />
      </div>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : (err ? err.statusCode : 404);
  return { statusCode };
};

export default ErrorPage;