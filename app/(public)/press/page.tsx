import Footer from '@/components/app/Footer';
import Header from '@/components/app/Header';

export default function Press() {
  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-between fancy-overlay">
      <Header />

      <div className="w-full flex flex-col items-center my-12">
        <section className="w-full p-6 container-narrow">
          <h1 className="text-4xl font-semibold leading-tight md:leading-tight max-w-xs sm:max-w-none md:text-6xl fancy-heading">
            PLYAZ in the News
          </h1>

          <p className="mt-6 md:text-xl">
            Welcome to PLYAZ's Press Room! Stay up to date with our latest news,
            announcements, and media coverage. From product launches to company
            updates, this is your source for all things PLYAZ.
          </p>

          <p className="mt-6 md:text-xl">
            We're proud of the work we're doing to empower leagues and fans
            everywhere, and we're excited to share our story with the world.
            Whether you're a journalist, blogger, or just curious about our
            journey, we welcome you to explore our press releases and media
            assets to learn more about PLYAZ.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
