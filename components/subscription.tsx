import Image from 'next/image';

const SubscriptionSection = () => {
  return (
    <section className="py-16 bg-black text-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left - Subscription Form */}
        <div className="md:w-1/2 w-full">
          <h2 className="text-4xl font-extrabold text-yellow-400 mb-6">
            Stay Ahead with Updates
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Subscribe to our newsletter and be the first to receive the latest news, exclusive offers, and updates on our services. 
            We promise to deliver only valuable insights to your inbox.
          </p>
          <form className="space-y-6">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full p-4 rounded-md bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-md transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Subscribe Now
            </button>
          </form>
        </div>

        {/* Right - Image */}
        <div className="md:w-1/2 w-full">
          <div className="relative overflow-hidden rounded-lg shadow-xl">
            <Image
              src="/image/s2.png" // Replace with your actual image path
              alt="Subscription"
              width={600}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionSection;
