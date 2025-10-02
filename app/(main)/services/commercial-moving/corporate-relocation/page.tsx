"use client";

import Categories from "@/components/Categories";
// Assuming you use a library like lucide-react for icons
import { 
  ClipboardList, 
  Users, 
  CheckSquare, 
  Building2, 
  UserPlus, 
  Briefcase, 
  Globe, 
  Monitor, 
  Warehouse,  
  ChevronDown 
} from 'lucide-react'; 

export default function CorporateRelocation() {
  // Define content blocks with icons for cleaner JSX
  const benefits = [
    { title: "Strategic Planning", desc: "Customized relocation strategies tailored to your corporate structure and timelines.", icon: ClipboardList },
    { title: "Employee Support", desc: "Assistance for staff relocations including packing, housing coordination, and travel logistics.", icon: Users },
    { title: "Business Continuity", desc: "Relocations designed to minimize downtime and keep business operations uninterrupted.", icon: CheckSquare },
  ];

  const services = [
    { title: "Corporate Office Relocation", desc: "Full-service planning and execution for office moves of all sizes.", icon: Building2 },
    { title: "Employee Relocation Programs", desc: "Customized solutions for relocating staff locally or internationally.", icon: UserPlus },
    { title: "Executive Relocation", desc: "White-glove moving services tailored for executives and VIP employees.", icon: Briefcase },
    { title: "Global Mobility Services", desc: "International relocation support including customs and logistics.", icon: Globe },
    { title: "Technology & IT Relocation", desc: "Secure handling of servers, workstations, and IT infrastructure.", icon: Monitor },
    { title: "Corporate Storage Solutions", desc: "Safe storage for office furniture, files, and business assets.", icon: Warehouse },
  ];

  const processSteps = [
    { step: "1", title: "Consultation", desc: "We evaluate your corporate relocation needs and objectives." },
    { step: "2", title: "Custom Strategy", desc: "A relocation plan is built around your timeline and business goals." },
    { step: "3", title: "Relocation Execution", desc: "Our team manages packing, transport, and employee support." },
    { step: "4", title: "Integration & Setup", desc: "We ensure office setup and employee relocation completion smoothly." },
  ];
  
  const faqs = [
    {
      q: "Do you provide employee relocation assistance?",
      a: "Yes, we coordinate moves for employees, including packing, housing support, and transportation services.",
    },
    {
      q: "Can you manage international corporate moves?",
      a: "Absolutely. Our global mobility team ensures smooth international transitions with customs support and logistics management.",
    },
    {
      q: "How do you minimize disruption to business?",
      a: "We offer phased relocations, after-hours moving, and careful scheduling to keep your operations running smoothly.",
    },
    {
      q: "Do you handle IT and data center relocation?",
      a: "Yes, our IT specialists relocate servers, computers, and networking systems with full security protocols.",
    },
  ];

  return (
    <main className="bg-white">

      {/* Hero / Intro Section (Refined) */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          <span className="text-blue-700">Comprehensive</span> Corporate Relocation & Mobility
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10">
          Relocating your business or employees? Our **corporate relocation services** cover everything from office moves to employee transfers, ensuring smooth transitions and **minimal downtime** for your organization.
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
          Full-Spectrum Corporate Mobility Solutions
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
            Our 4-Step Corporate Relocation Process
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
          Corporate Relocation Frequently Asked Questions
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