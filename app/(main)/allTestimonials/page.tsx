import { testimonials } from "@/app/(main)/data/testimonialsData";
import Image from "next/image";



const TestimonialsAll = () => {
 
  const renderStars = (rating) => {
    const fullStars = Array(rating).fill('★'); // Full stars based on rating
    const emptyStars = Array(5 - rating).fill('☆'); // Empty stars to make up 5 total
    return [...fullStars, ...emptyStars].join(''); // Combine and join them
  };

  return (
    <section className="py-16 bg-black text-black">
      <h2 className="text-4xl font-bold text-center mb-12 text-white">
        What Our Clients Say
      </h2>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-8 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-6">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                height={200}
                width={200}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <p className="text-black italic mb-4">{testimonial.feedback}</p>
                <p className="text-gray-900 font-bold text-lg"> - {testimonial.name}</p>
                <p className="text-yellow-400 text-lg">
                  {renderStars(testimonial.rating)} {/* Display stars */}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsAll;
