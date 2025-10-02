"use client";

import Categories from "@/components/Categories";
// Assuming you use a library like lucide-react for icons
import { 
  Package, 
  DollarSign, 
  Clock, 
  Home, 
  Box, 
  ChevronsUp, 
  Truck, 
  Archive, 
  Warehouse, 
  ChevronDown 
} from 'lucide-react'; 

export default function SmallMoves() {
  // Define content blocks with icons for cleaner JSX
  const benefits = [
    { title: "Sized For Small Loads", desc: "Ideal for single rooms, minimal furniture, and partial household moves.", icon: Package },
    { title: "Budget Friendly", desc: "Transparent pricing with hourly or flat‑rate options tailored to your load.", icon: DollarSign },
    { title: "Fast Turnaround", desc: "Same‑day or next‑day availability for quick, hassle‑free relocations.", icon: Clock },
  ];

  const services = [
    { title: "Studio & Dorm Moves", desc: "Compact moves tailored for students and single‑room apartments.", icon: Home },
    { title: "Partial Home Moves", desc: "Move only what you need—boxes, a few pieces of furniture, or single items.", icon: Box },
    { title: "In‑Building Moves", desc: "Help switching units or floors with elevator and stair expertise.", icon: ChevronsUp },
    { title: "Man‑with‑a‑Van Service", desc: "Quick local transport for couches, mattresses, appliances, and bulky items.", icon: Truck },
    { title: "Packing & Unpacking", desc: "Add on full or partial packing with quality materials to protect your things.", icon: Archive },
    { title: "Short‑Term Storage", desc: "Secure storage by the week or month for overflow and staging.", icon: Warehouse },
  ];

  const processSteps = [
    { step: "1", title: "Quick Quote", desc: "Share your item list, pickup, and drop‑off details for pricing." },
    { step: "2", title: "Schedule", desc: "Pick a convenient date—often same‑day or next‑day availability." },
    { step: "3", title: "Load & Go", desc: "We wrap, load, and transport your items safely and efficiently." },
    { step: "4", title: "Delivery", desc: "Unloading to the right rooms; optional unpacking and debris removal." },
  ];
  
  const faqs = [
    {
      q: "What counts as a small move?",
      a: "Typically a studio, dorm, or 1–2 bedroom move, or partial shipments like a few pieces of furniture and boxes.",
    },
    {
      q: "Do you have minimum hours?",
      a: "Yes, most small moves include a modest hourly minimum. We'll recommend the most cost‑effective plan for your list.",
    },
    {
      q: "Can you move single items?",
      a: "Absolutely—couches, mattresses, dining sets, appliances, and more. Our man‑with‑a‑van option is ideal.",
    },
    {
      q: "Do you provide packing supplies?",
      a: "We can supply boxes, tape, and wrap, or provide full packing service on request.",
    },
  ];

  return (
    <main className="bg-white">

      {/* Hero / Intro Section (Refined) */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          <span className="text-blue-700">Fast & Affordable</span> Small Moves
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10">
          Perfect for **studios, dorms, 1–2 bedroom apartments, and partial moves**. Get fast, affordable help for small loads—fewer boxes, lighter furniture, and flexible scheduling.
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
          Affordable Small Move Services
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
            Our Simple 4-Step Moving Process
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
          Small Moves Frequently Asked Questions
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