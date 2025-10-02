"use client";

import Categories from "@/components/Categories";
// Assuming you use a library like lucide-react for icons
import { 
  ClipboardCheck, 
  Laptop, 
  Clock, 
  Package, 
  MonitorPlay, 
  Users, 
  FileLock, 
  Warehouse, 
  CalendarCheck,  
  ChevronDown 
} from 'lucide-react'; 

export default function OfficeRelocation() {
  // Define content blocks with icons for cleaner JSX
  const benefits = [
    { title: "Detailed Planning", desc: "Customized moving plans tailored to your business schedule and requirements.", icon: ClipboardCheck },
    { title: "IT & Equipment Care", desc: "Secure handling of computers, servers, and office equipment to avoid downtime.", icon: Laptop },
    { title: "Minimal Disruption", desc: "Evening and weekend scheduling available to keep your business operations running.", icon: Clock },
  ];

  const services = [
    { title: "Office Moving Planning", desc: "Project management and detailed scheduling for a smooth relocation.", icon: CalendarCheck },
    { title: "Packing & Labeling", desc: "Organized packing and labeling to ensure easy unpacking at the new location.", icon: Package },
    { title: "Workstation Relocation", desc: "Disassembly and reassembly of desks, cubicles, and furniture.", icon: Users },
    { title: "IT & Server Moving", desc: "Safe disconnection, packing, and reinstallation of IT systems.", icon: MonitorPlay },
    { title: "Secure Document Handling", desc: "Confidential files transported with security and discretion.", icon: FileLock },
    { title: "Corporate Storage Solutions", desc: "Short and long-term storage for office furniture and equipment.", icon: Warehouse },
  ];

  const processSteps = [
    { step: "1", title: "Consultation", desc: "We assess your office, inventory, and moving requirements." },
    { step: "2", title: "Custom Plan", desc: "A detailed relocation strategy is created to minimize disruption." },
    { step: "3", title: "Move Execution", desc: "Our professional team handles packing, loading, and transport." },
    { step: "4", title: "Setup & Support", desc: "Furniture, IT, and workstations reinstalled and ready for use." },
  ];
  
  const faqs = [
    {
      q: "How do you minimize business downtime?",
      a: "We offer evening, weekend, and phased relocation services to reduce disruption to your operations.",
    },
    {
      q: "Can you move our IT systems securely?",
      a: "Yes, our specialists handle servers, computers, and network equipment with proper security and care.",
    },
    {
      q: "Do you provide packing materials?",
      a: "We provide all boxes, crates, and packing materials required for a safe move.",
    },
    {
      q: "Can you handle large office relocations?",
      a: "Absolutely, we relocate small businesses as well as large corporate headquarters with detailed project management.",
    },
  ];

  return (
    <main className="bg-white">

      {/* Hero / Intro Section (Refined) */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          <span className="text-blue-700">Seamless</span> Professional Office Relocation
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10">
          Minimize downtime and keep your business running smoothly with our expert office relocation services. From small offices to corporate headquarters, we provide efficient planning, careful packing, and seamless transitions.
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
          Comprehensive Commercial Moving Solutions
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
            Our Business Relocation Methodology
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
          Office Relocation Frequently Asked Questions
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