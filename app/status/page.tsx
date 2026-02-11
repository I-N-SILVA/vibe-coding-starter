import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';

export default function Status() {
  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-between fancy-overlay">
      <Header />

      <div className="w-full flex flex-col items-center my-12">
        <section className="w-full p-6 container-narrow">
          <h1 className="text-4xl font-semibold leading-tight md:leading-tight max-w-xs sm:max-w-none md:text-6xl fancy-heading">
            Platform Status
          </h1>

          <p className="mt-6 md:text-xl">
            At PLYAZ, we prioritize the availability and reliability of your
            competition toolset. Our status page provides real-time updates
            on the operational health of our platform, including live scoring,
            management portals, and fan-facing scoreboards. We are committed
            to maintaining zero-downtime during your peak match hours.
          </p>

          <p className="mt-6 md:text-xl">
            If you encounter any issues during a live match session, our
            support team is on standby to assist you. Trust PLYAZ to deliver the
            pulse of the game without interruption.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
