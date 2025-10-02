"use client";

import Categories from "@/components/Categories";
// Assuming you use a library like lucide-react for icons
import { 
  Lock, 
  Thermometer, 
  CalendarCheck, 
  Warehouse, 
  Sofa, 
  Briefcase, 
  Car, 
  Clock, 
  ChevronDown 
} from 'lucide-react'; 

export default function StorageSolutions() {
  // Define content blocks with icons
  const benefits = [
    { title: "Maximum Security", desc: "24/7 surveillance, gated access, and individually locked storage rooms.", icon: Lock },
    { title: "Climate-Controlled", desc: "Perfect for sensitive items such as electronics, artwork, and fine furniture.", icon: Thermometer },
    { title: "Flexible Plans", desc: "Choose short-term or long-term rentals with convenient monthly payment options.", icon: CalendarCheck },
  ];

  const services = [
    { title: "Short-Term Storage", desc: "Convenient for in-between moves or temporary holding.", icon: Clock },
    { title: "Long-Term Storage", desc: "Affordable, safe storage for months or years.", icon: Warehouse },
    { title: "Furniture Storage", desc: "Protective environment to keep furniture safe and dust-free.", icon: Sofa },
    { title: "Business Storage", desc: "Archive important documents and inventory with ease.", icon: Briefcase },
    { title: "Climate-Controlled Units", desc: "Maintain stable temperature and humidity for sensitive items.", icon: Thermometer },
    { title: "Vehicle Storage", desc: "Secure spaces for cars, bikes, and small recreational vehicles.", icon: Car },
  ];

  const processSteps = [
    { step: "1", title: "Select Unit Size", desc: "Determine the ideal unit size and storage duration for your needs." },
    { step: "2", title: "Schedule Transport", desc: "Our movers can pick up and safely transport items to the facility." },
    { step: "3", title: "Secure Placement", desc: "Items are placed, secured, and digitally inventoried in your unit." },
    { step: "4", title: "Access Anytime", desc: "Access your belongings with personal entry codes whenever you need them." },
  ];
  
  const faqs = [
    {
      q: "Is my storage unit insured and secure?",
      a: "All units are monitored by 24/7 CCTV, gated access, and we offer comprehensive insurance options for your peace of mind.",
    },
    {
      q: "What items can I store?",
      a: "You can store furniture, boxes, business inventory, and more. For safety, prohibited items include hazardous materials and perishables.",
    },
    {
      q: "What are the hours for accessing my items?",
      a: "Our facilities offer 24/7 access for maximum convenience, allowing you to retrieve your belongings anytime.",
    },
    {
      q: "Do you offer pickup and delivery services?",
      a: "Yes, our dedicated moving team can transport items directly to and from your storage unit, saving you time and effort.",
    },
  ];

  return (
    <main className="bg-white">
      {/* Hero / Intro Section (Refined) */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          <span className="text-blue-700">Secure & Flexible</span> Storage Solutions
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10">
          From short-term storage during a move to long-term solutions for your prized possessions, 
          we provide clean, climate-controlled, and professionally secured storage facilities tailored to your needs.
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
                  <Icon className="w-8 h-8" />
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
          Find the Right Storage Solution
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

      {/* Process (Refined Step Display) */}
      <section className="bg-blue-50 py-24">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
            Our Simple 4-Step Storage Process
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
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group border border-gray-200 rounded-xl bg-white transition cursor-pointer">
              <summary className="flex justify-between items-center p-5 font-semibold text-gray-800 list-none hover:bg-gray-50 transition rounded-xl">
                <span>{faq.q}</span>
                <span className="transform transition group-open:rotate-180">
                    <ChevronDown className="w-5 h-5 text-blue-600" />
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