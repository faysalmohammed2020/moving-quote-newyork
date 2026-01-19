import BlogSection from "@/components/blog";
import Categories from "@/components/Categories";
import HeroSection from "@/components/Hero";
import ServiceSection from "@/components/service";
import SubscriptionSection from "@/components/subscription";
import TestimonialsSection from "@/components/testimonials";
import VideoSection from "@/components/video";


const HomePage = () => {
  return (
    <div className="overflow-y-auto">

<h1 className="sr-only">Moving Quote New York – Affordable NYC & Long-Distance Moving Services</h1>
      <HeroSection />
      <ServiceSection />
      <BlogSection />
      <TestimonialsSection />
      <VideoSection />
      <SubscriptionSection />
      <Categories />
    </div>
  );
};

export default HomePage;
