"use client";

import { useEffect, useState } from "react";
import MovingCalculator from "./QuoteForm";
// import ScrollForm from "./ScrollingForm";


const HeroSection = () => {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);

      // Clear timeout if user keeps scrolling
      clearTimeout(scrollTimeout);

      // Set timeout to reset the state after scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 500); // Adjust timeout duration as needed
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);


  

  return (
    <section
      className=" bg-black bg-opacity-80 w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/image/truck.png)" }}
    >
      <div className="relative flex justify-between">
      <div className="  text-white py-60 text-left">
        <div className="ml-10">
          <h1 className="text-4xl font-bold">Where Efficiency Meets Excellence</h1>
          <p className="mt-4">Your Gateway to Seamless Logistics</p>
          <button className="mt-6 bg-[#F9AC1E] px-6 py-2 rounded">Get Free Quotes</button>
        </div>
      </div>

     <div
          className="bg-transparent shadow-lg
         pointer-events-auto
            rounded-2xl border border-black/5
            overflow-auto
            max-h-[calc(100vh-7rem)]
            max-w-[calc(100vw-1.5rem)]
            w-[320px]
            md:w-[700px]
            top-[15%]
            mt-40"
          // Adjust origin for zoom effect
        >
          <MovingCalculator />
        </div>
      {/* <div className="fixed top-[15%]">
      <ScrollForm/>
     </div> */}
      </div>
      
      


     
    </section>
  );
};

export default HeroSection;
