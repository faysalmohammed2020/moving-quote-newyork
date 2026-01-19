import { Mail, Phone, MapPin } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Moving Quote New York | Get a Free Moving Quote",
  description:
    "Contact Moving Quote New York for quick, no-obligation moving quotes. Call +1 888 202 1370 or email info@moving-quote-newyork.com for NYC, statewide, and long-distance moves—plus packing, storage, and auto transport.",
  alternates: {
    canonical: "https://movingquotenewyork.com/contacts",
  },
  openGraph: {
    title: "Contact Moving Quote New York | Get a Free Moving Quote",
    description:
      "Reach out for a fast New York moving quote. Get help with NYC moves, statewide relocations, and long-distance planning—plus packing and storage.",
    url: "https://movingquotenewyork.com/contacts",
    siteName: "Moving Quote New York",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Moving Quote New York",
    description:
      "Get a free New York moving quote. Call +1 123 456 7890 or email info@movingquotenewyork.com.",
  },
};

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Page Header */}
      <header className="bg-gray-900 py-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
        <p className="text-lg text-gray-400">
          We'd love to hear from you! Whether you have a question or just want to say hello.
        </p>
      </header>

      {/* Contact Section */}
      <div className="container mx-auto py-16 px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-semibold mb-6">Send Us a Message</h2>
            <form className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block mb-2 text-gray-400">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block mb-2 text-gray-400">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              {/* Message Input */}
              <div>
                <label htmlFor="message" className="block mb-2 text-gray-400">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Write your message here"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                ></textarea>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full p-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-semibold mb-6">Contact Information</h2>
            <p className="text-gray-400 mb-8">
              Feel free to reach out using any of the methods below.
            </p>
            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Mail className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-lg font-medium">Email</p>
                  <p className="text-gray-400">info@movingquotenewyork.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-lg font-medium">Phone</p>
                  <p className="text-gray-400">+1 123 456 7890</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-lg font-medium">Address</p>
                  <p className="text-gray-400">123 Main Street, New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default ContactPage;
