'use client'
import Image from 'next/image';

const BlogPostPage = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-extrabold text-yellow-400 mb-6">
            Mastering Logistics: Best Practices for Your Business
          </h1>
          <p className="text-gray-300 text-lg">
            Published on <span className="text-yellow-400">December 21, 2024</span> by{' '}
            <span className="text-yellow-400">John Doe</span>
          </p>
        </div>
        <div className="relative w-full h-96">
          <Image
            src="/image/truck.png" // Replace with your hero image
            alt="Blog Hero Image"
            layout="fill"
            className="object-cover opacity-80"
            priority
          />
        </div>
      </section>

      {/* Blog Content Section */}
      <section className="py-16 px-4 md:px-16 lg:px-32 bg-black">
        <div className="container mx-auto">
          {/* Introduction */}
          <p className="text-gray-300 text-xl leading-relaxed mb-8">
            Logistics is the backbone of any business that deals with goods and supply chain
            management. In this blog, we’ll explore the best practices and strategies for
            optimizing your logistics operations.
          </p>

          {/* Content Blocks */}
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">
            Why Logistics Matters
          </h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            Efficient logistics ensures timely delivery of goods, enhances customer satisfaction,
            and reduces operational costs. For businesses looking to scale, optimizing logistics
            is not just an option—it’s a necessity.
          </p>

          <h2 className="text-3xl font-bold text-yellow-400 mb-6">
            Key Strategies for Success
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-4 mb-8">
            <li>Invest in robust logistics management software.</li>
            <li>Streamline your supply chain by eliminating bottlenecks.</li>
            <li>Focus on data analytics to improve forecasting accuracy.</li>
            <li>Partner with reliable logistics providers.</li>
          </ul>

          <h2 className="text-3xl font-bold text-yellow-400 mb-6">
            Emerging Trends
          </h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            From AI-powered logistics to sustainability initiatives, the industry is rapidly
            evolving. Companies that embrace these trends will stay ahead of the competition.
          </p>

          {/* Conclusion */}
          <div className="bg-gray-800 p-8 rounded-lg text-gray-300 shadow-lg">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">
              Final Thoughts
            </h3>
            <p>
              Optimizing logistics is a continuous process. By adopting best practices and keeping
              up with emerging trends, businesses can achieve greater efficiency and scalability.
              Stay tuned for more tips and insights in our upcoming blogs.
            </p>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-12 bg-yellow-400 text-black text-center">
        <h2 className="text-3xl font-extrabold mb-4">Want to Learn More?</h2>
        <p className="text-lg mb-6">
          Subscribe to our newsletter and get the latest updates straight to your inbox.
        </p>
        <button className="bg-black text-yellow-400 font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition duration-300">
          Subscribe Now
        </button>
      </section>
    </div>
  );
};

export default BlogPostPage;
