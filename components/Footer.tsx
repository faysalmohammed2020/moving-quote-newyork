import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1C1C1C] text-white py-4">
      <div className="container mx-auto text-center">
        <nav className="mb-2">
          <Link href="/Home" className="mx-2 hover:underline">
            Home
          </Link>
          <Link href="/services" className="mx-2 hover:underline">
            Services
          </Link>
          <Link href="/allTestimonials" className="mx-2 hover:underline">
            About Us
          </Link>
          <Link href="/Contact" className="mx-2 hover:underline">
            Contact
          </Link>
          <Link href="/allBlogs" className="mx-2 hover:underline">
            Blog
          </Link>
        </nav>

        <p className="text-sm mb-3">
          &copy; 2024 Desined By Birds of Eden. All Rights Reserved.
        </p>

        {/* Social Icons */}
        <div className="flex justify-center space-x-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 bg-white text-blue-500 flex items-center justify-center rounded-md hover:bg-gray-200 transition"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 bg-white text-blue-500 flex items-center justify-center rounded-md hover:bg-gray-200 transition"
          >
            <Instagram className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
