"use client";

import MovingCalculator from "./QuoteForm";
import ScrollForm from "./ScrollingForm";


const HeroSection = () => {
  

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

      <div className="mt-[5%] mr-[5%]">
        <MovingCalculator/>
      </div>
      <div className="fixed top-[15%]">
      <ScrollForm/>
     </div>
      </div>
      
      


     
    </section>
  );
};

export default HeroSection;
