"use client";

import Categories from "@/components/Categories";
// Assuming you use a library like lucide-react for icons
import { Truck, Shield, Clock, Package, Warehouse, Car, User, CheckCircle } from 'lucide-react'; 
import { ChevronDown } from 'lucide-react';

export default function LongDistanceMoving() {
  // Define icons and items here for cleaner JSX
  const benefits = [
    { title: "Expert Long Distance Movers", desc: "Decades of nationwide moving experience with proven reliability and care.", icon: Truck },
    { title: "Safe & Secure Transport", desc: "Belongings are protected with high-quality packing materials and careful handling.", icon: Shield },
    { title: "24/7 Dedicated Support", desc: "A personal moving coordinator is available around the clock to assist you.", icon: User },
  ];

  const services = [
    { title: "Professional Packing & Unpacking", desc: "Keep your belongings secure with our full-service packing solutions.", icon: Package },
    { title: "Loading & Unloading", desc: "Trained crews carefully handle furniture, boxes, and fragile items.", icon: CheckCircle },
    { title: "Custom Crating Solutions", desc: "Special protection for artwork, antiques, and oversized valuables.", icon: Warehouse },
    { title: "Secure Storage Options", desc: "Short-term and long-term storage available in climate-controlled facilities.", icon: Clock },
    { title: "Vehicle Relocation", desc: "Safe and insured transport for cars, motorcycles, and specialty vehicles.", icon: Car },
    { title: "Furniture Assembly", desc: "We handle disassembly and reassembly for your convenience.", icon: Package },
  ];

  const processSteps = [
    { step: "1", title: "Free Estimate", desc: "Request a no-obligation quote customized to your move." },
    { step: "2", title: "Personalized Planning", desc: "A coordinator designs a schedule that works for you." },
    { step: "3", title: "Moving Day", desc: "Our crew packs, loads, and transports with expert care." },
    { step: "4", title: "Delivery & Setup", desc: "Unloading, unpacking, and furniture setup at your new home." },
  ];

  const faqs = [
    {
      q: "What is the cost of a long-distance move?",
      a: "The price depends on distance, shipment weight, and extra services like storage or packing. We provide a detailed free quote upfront.",
    },
    {
      q: "How long does delivery take?",
      a: "Transit times vary by location and season. Your coordinator will give you an accurate timeline during the quote process.",
    },
    {
      q: "Are my belongings insured?",
      a: "Yes. We offer several insurance coverage options to protect your valuables throughout the move.",
    },
  ];

  return (
    <main className="bg-white">
      {/* Hero / Intro Section */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center"> {/* Increased padding and max-width */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          Reliable Long Distance Moving Services <span className="text-blue-700">Across the Country</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10"> {/* Larger, softer text */}
          Looking for stress-free long distance moving? Our certified movers provide safe packing, careful transportation, and on-time delivery—whether you’re moving state-to-state or across the country.
        </p>
      </section>

      {/* Key Benefits */}
      <section className="bg-gray-50 py-20"> {/* Increased padding */}
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          {benefits.map((item, idx) => {
            const Icon = item.icon; // Component convention for icons
            return (
              <div key={idx} className="p-8 bg-white rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"> {/* Enhanced shadow and hover effect */}
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8" /> {/* Using the Icon component */}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3> {/* Stronger text */}
                <p className="text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
          Comprehensive Long Distance Moving Solutions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition">
                <div className="text-blue-600 mr-4 mt-1">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="bg-blue-50 py-24">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
            Our Simplified Moving Process
          </h2>
          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Professional Step Line (optional but highly professional) */}
            <div className="absolute top-1/4 left-0 right-0 h-1 bg-blue-200 hidden md:block" />

            {processSteps.map((item, idx) => (
              <div key={idx} className="relative p-6 bg-white rounded-xl shadow-lg border border-blue-100 text-center hover:shadow-xl transition">
                {/* Subtle Step Number with accent color */}
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-5 font-bold text-lg border-4 border-white z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group border border-gray-200 rounded-xl bg-white transition cursor-pointer">
              <summary className="flex justify-between items-center p-5 font-semibold text-gray-800 list-none hover:bg-gray-50 transition rounded-xl">
                <span>{faq.q}</span>
                <span className="transform transition group-open:rotate-180">
                    <ChevronDown className="w-5 h-5 text-blue-600" /> {/* Placeholder for a Chevron icon */}
                </span>
              </summary>
              <div className="px-5 pb-5 text-gray-600 border-t border-gray-100">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Categories */}
      <Categories />
    </main>
  );
}

