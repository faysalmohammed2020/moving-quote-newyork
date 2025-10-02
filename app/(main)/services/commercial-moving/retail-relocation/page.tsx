"use client";

import Categories from "@/components/Categories";
// Assuming you use a library like lucide-react for icons
import { 
  ShoppingBag, 
  Box, 
  Clock, 
  CalendarCheck, 
  Package, 
  Wrench, 
  Monitor, 
  Building, 
  Warehouse, 
  ChevronDown 
} from 'lucide-react'; 

export default function RetailRelocation() {
  // Define content blocks with icons for cleaner JSX
  const benefits = [
    { title: "Tailored Planning", desc: "Customized relocation strategies designed around your retail business needs.", icon: CalendarCheck },
    { title: "Product Protection", desc: "Careful packing and transport of inventory, shelving, and fragile merchandise.", icon: Box },
    { title: "Quick Re-Opening", desc: "Efficient moves designed to help you reopen doors faster and resume sales quickly.", icon: Clock },
  ];

  const services = [
    { title: "Store Relocation Planning", desc: "End-to-end project management for retail moves of all sizes.", icon: ShoppingBag },
    { title: "Inventory Packing & Transport", desc: "Safe handling of stock, displays, and retail fixtures.", icon: Package },
    { title: "Fixture & Display Setup", desc: "Disassembly and reassembly of shelving, racks, and counters.", icon: Wrench },
    { title: "Point-of-Sale & Tech Moving", desc: "Secure relocation of registers, POS systems, and electronics.", icon: Monitor },
    { title: "Mall & Strip Center Moves", desc: "Expertise with retail spaces, malls, and high-traffic locations.", icon: Building },
    { title: "Storage & Warehousing", desc: "Short or long-term storage for merchandise and retail equipment.", icon: Warehouse },
  ];

  const processSteps = [
    { step: "1", title: "Consultation", desc: "We assess your store layout, inventory, and timeline." },
    { step: "2", title: "Custom Strategy", desc: "A tailored relocation plan is built to minimize downtime." },
    { step: "3", title: "Secure Move", desc: "Inventory, displays, and equipment transported with care." },
    { step: "4", title: "Setup & Re-Opening", desc: "We reinstall fixtures and prepare your store for business." },
  ];
  
  const faqs = [
    {
      q: "How do you handle store inventory?",
      a: "We pack, label, and securely transport your merchandise with protective materials to ensure nothing is damaged or lost.",
    },
    {
      q: "Can you relocate large store fixtures?",
      a: "Yes, our team disassembles, moves, and reassembles racks, shelving, counters, and displays.",
    },
    {
      q: "How do you minimize downtime?",
      a: "We work nights, weekends, or off-hours to make sure your business reopens quickly with minimal disruption.",
    },
    {
      q: "Do you offer temporary storage?",
      a: "Yes, we provide warehousing and short-term storage solutions for stock and equipment during your transition.",
    },
  ];

  return (
    <main className="bg-white">

      {/* Hero / Intro Section (Refined) */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          <span className="text-blue-700">Zero-Downtime</span> Retail Relocation Services
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10">
          Moving your retail store? We provide tailored retail relocation solutions to ensure **smooth transitions, minimal downtime**, and secure handling of your products, displays, and fixtures.
        </p>
      </section>

      {/* Key Benefits (Iconography and design overhaul) */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-8 bg-white rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8" /> {/* Replaced image with icon */}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services (Iconography and list style) */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
          Specialized Moving for Retail Success
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition">
                <div className="text-blue-600 mr-4 mt-1">
                  <Icon className="w-6 h-6" /> {/* Added icon to list items */}
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

      {/* Process (Refined Step Display) */}
      <section className="bg-blue-50 py-24">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
            Our 4-Step Retail Moving Process
          </h2>
          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Step Line */}
            <div className="absolute top-1/4 left-0 right-0 h-1 bg-blue-200 hidden md:block" />

            {processSteps.map((item, idx) => (
              <div key={idx} className="relative p-6 bg-white rounded-xl shadow-lg border border-blue-100 text-center hover:shadow-xl transition">
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

      {/* FAQs (Accordion Style) */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Retail Relocation Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            // Using <details> for a native, accessible accordion/toggle
            <details key={idx} className="group border border-gray-200 rounded-xl bg-white transition cursor-pointer">
              <summary className="flex justify-between items-center p-5 font-semibold text-gray-800 list-none hover:bg-gray-50 transition rounded-xl">
                <span>{faq.q}</span>
                <span className="transform transition group-open:rotate-180">
                    <ChevronDown className="w-5 h-5 text-blue-600" /> {/* Chevron Icon */}
                </span>
              </summary>
              <div className="px-5 pb-5 text-gray-600 border-t border-gray-100">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <Categories />
    </main>
  );
}