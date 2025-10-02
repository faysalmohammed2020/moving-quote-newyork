"use client";

import Categories from "@/components/Categories";
// Assuming you use a library like lucide-react for icons
import { Car, ShieldCheck, MapPin, Truck, Box, Bolt, Landmark, Users, PlusCircle, Wrench, Package, ChevronDown, Rocket, Gauge } from 'lucide-react'; 

export default function AutoTransportService() {
  // Define icons and items here for cleaner JSX
  const benefits = [
    { title: "Open or Enclosed Carriers", desc: "Pick value‑focused open transport or enclosed trailers for luxury, classic, and exotic vehicles.", icon: Truck },
    { title: "Insured & Vetted Carriers", desc: "Every shipment includes proper coverage and licensed, background‑checked drivers.", icon: ShieldCheck },
    { title: "Live Status Updates", desc: "Real‑time tracking and proactive alerts from pickup through final delivery.", icon: MapPin },
  ];

  const services = [
    { title: "Door‑to‑Door Car Shipping", desc: "Convenient pickup and delivery at accessible addresses you choose.", icon: Car },
    { title: "Open Carrier Transport", desc: "Cost‑effective option ideal for most daily‑driver vehicles.", icon: Truck },
    { title: "Enclosed Carrier Transport", desc: "Maximum protection for high‑value, collectible, or low‑clearance cars.", icon: Box },
    { title: "Expedited Delivery", desc: "Priority scheduling for urgent timelines and time‑sensitive routes.", icon: Rocket },
    { title: "Dealer & Auction Moves", desc: "Coordinated logistics for dealerships, auctions, and fleet transfers.", icon: Landmark },
    { title: "Multi‑Vehicle Shipping", desc: "Move several vehicles together to reduce costs and simplify planning.", icon: Users },
  ];

  const processSteps = [
    { step: "1", title: "Instant Quote", desc: "Provide pickup, drop‑off, and vehicle details to receive pricing." },
    { step: "2", title: "Route Scheduling", desc: "We assign a licensed, insured carrier that matches your dates." },
    { step: "3", title: "Pickup & Inspection", desc: "Your driver performs a condition report and secures the vehicle." },
    { step: "4", title: "Delivery & Sign‑Off", desc: "Final inspection on arrival—fast, simple, and hassle‑free." },
  ];

  const vehicleTypes = [
    { label: "Sedans & Hatchbacks", icon: Car },
    { label: "SUVs & Crossovers", icon: Car }, // Re-using Car, or use a more specific SUV icon if available
    { label: "Pickup Trucks", icon: Truck },
    { label: "Motorcycles", icon: Gauge }, // Using Gauge as a generic icon, or specific 'Motorcycle' if available
    { label: "Classic & Collector Cars", icon: Bolt }, // Bolt for classic/special
    { label: "Luxury & Exotic Vehicles", icon: PlusCircle }, // PlusCircle for luxury/premium
    { label: "Electric & Hybrid Vehicles", icon: Wrench }, // Wrench for technical/electric
    { label: "ATVs & Small Recreational", icon: Package }, // Package for recreational
  ];

  const faqs = [
    {
      q: "How are car‑shipping rates calculated?",
      a: "Pricing is based on distance, vehicle size/weight, carrier type (open vs. enclosed), season, and lead time. Request a free quote for exact costs.",
    },
    {
      q: "Can I place belongings in my vehicle?",
      a: "Some carriers allow light personal items (under ~100 lbs) at their discretion. Extra weight may change pricing and coverage.",
    },
    {
      q: "Do you move inoperable vehicles?",
      a: "Yes—with advance notice. Winch‑capable equipment is scheduled when a car will not start or roll.",
    },
    {
      q: "What is the usual transit time?",
      a: "Many cross‑country shipments arrive in about 5–10 days depending on route, traffic, and weather.",
    },
  ];

  return (
    <main className="bg-white">
      {/* Hero / Intro Section */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center"> {/* Increased padding and max-width */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          Premium Auto Transport & <span className="text-blue-700">Car Shipping</span> Nationwide
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10">
          Coast‑to‑coast car shipping made simple. We arrange professional pickup, secure transit, and on‑time delivery—so your vehicle arrives safely and exactly where you need it.
        </p>
        
      </section>

      {/* Key Benefits */}
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

      {/* Services */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
          Specialized Auto Transport Services
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
            Our Streamlined Car Shipping Process
          </h2>
          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Professional Step Line (optional but highly professional) */}
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

      {/* Vehicle Types */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12 text-center">
          Vehicles We Expertly Transport
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicleTypes.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col items-center p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition">
                <div className="text-blue-600 mb-3">
                  <Icon className="w-8 h-8" />
                </div>
                <p className="font-semibold text-gray-800 text-lg">{item.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Auto Transport Frequently Asked Questions
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

      <Categories />
    </main>
  );
}

// NOTE: You must import ChevronDown if you want the FAQ open/close icon
// import { ChevronDown } from 'lucide-react';