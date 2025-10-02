"use client";

import Categories from "@/components/Categories";
// Assuming you use a library like lucide-react for icons
import { 
  Gem, 
  Archive, 
  UserCheck, 
  Piano, 
  Microscope, 
  Monitor, 
  Weight, 
  ShoppingBag,
  Layers,  
  ChevronDown 
} from 'lucide-react'; 

export default function SpecializedMoving() {
  // Define content blocks with icons for cleaner JSX
  const benefits = [
    { title: "Expert Handling", desc: "Trained crews use specialized techniques for fragile, high‑value, and oversized belongings.", icon: Gem },
    { title: "Custom Crating", desc: "Tailor‑made wooden crates safeguard artwork, antiques, electronics, and machinery.", icon: Archive },
    { title: "Dedicated Specialists", desc: "A team of certified movers ensures precision from packing to delivery.", icon: UserCheck },
  ];

  const services = [
    { title: "Antique & Fine Art Moving", desc: "Protective packing, custom crates, and white‑glove handling for irreplaceable items.", icon: Layers },
    { title: "Piano & Musical Instruments", desc: "Special equipment and expertise to move pianos, organs, and delicate instruments.", icon: Piano },
    { title: "Medical & Lab Equipment", desc: "Careful handling of sensitive, high‑value medical and laboratory machinery.", icon: Microscope },
    { title: "IT & Electronics Relocation", desc: "Safe transport of servers, computers, and electronics with anti‑static materials.", icon: Monitor },
    { title: "Large & Heavy Equipment", desc: "Rigging, lifting, and moving oversized machinery with precision.", icon: Weight },
    { title: "Trade Show & Exhibition Logistics", desc: "On‑time delivery and setup of booths, displays, and exhibits nationwide.", icon: ShoppingBag },
  ];

  const processSteps = [
    { step: "1", title: "Assessment", desc: "We evaluate your specialized items and determine packing needs." },
    { step: "2", title: "Custom Packing", desc: "Unique materials and crates are designed for maximum protection." },
    { step: "3", title: "Safe Transport", desc: "Dedicated equipment and vehicles ensure secure relocation." },
    { step: "4", title: "Delivery & Setup", desc: "Items are carefully unloaded, assembled, and placed at destination." },
  ];
  
  const faqs = [
    {
      q: "What types of items require specialized moving?",
      a: "Antiques, artwork, pianos, medical equipment, heavy machinery, and delicate electronics typically require special handling.",
    },
    {
      q: "Do you provide custom crating?",
      a: "Yes, we design and build custom crates to protect fragile or high‑value belongings during transit.",
    },
    {
      q: "How do you ensure safe transport?",
      a: "We use industry‑grade packing, air‑ride vehicles, climate control, and expert crews trained in specialized moves.",
    },
    {
      q: "Can you handle large commercial projects?",
      a: "Absolutely. We manage logistics for offices, labs, trade shows, and industrial relocations of all sizes.",
    },
  ];

  return (
    <main className="bg-white">
      {/* Hero / Intro Section (Refined) */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          <span className="text-blue-700">Expert Care</span> for Specialized Moving
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10">
          From delicate antiques to oversized equipment, our specialized moving team ensures your most valuable, fragile, or unique items are transported with expert care and precision.
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
          Items We Handle with Specialized Care
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
            Our Precision Moving Process
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
          Specialized Moving Frequently Asked Questions
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