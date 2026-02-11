import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';

export default function Careers() {
  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-between fancy-overlay">
      <Header />

      <div className="w-full flex flex-col items-center my-12">
        <section className="w-full p-6 container-narrow">
          <h1 className="text-4xl font-semibold leading-tight md:leading-tight max-w-xs sm:max-w-none md:text-6xl fancy-heading">
            Join the PLYAZ Team
          </h1>

          <p className="mt-6 md:text-xl">
            Are you passionate about the pulse of the game? At PLYAZ, we're building
            the future of competition management, and we're looking for talented
            individuals to join us on our journey.
          </p>

          <p className="mt-6 md:text-xl">
            We're a team of innovators, dreamers, and doers, all working together
            to revolutionize how leagues are managed and experienced. If you're
            ready to make a real impact and help us shape the world of sport, we
            want to hear from you. Explore our open positions and join the PLYAZ
            family today!
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
