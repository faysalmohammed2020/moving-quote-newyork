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
          className={`fixed top-[15%] right-[2.52%] z-30 w-[650px] h-[600px] transform transition-all duration-300 ${
            isScrolling ? "scale-[0.4]" : "scale-[1]"
          }`}
          style={{ transformOrigin: "top right" }} // Adjust origin for zoom effect
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
