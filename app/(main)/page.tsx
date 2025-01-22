import BlogSection from "@/components/blog";
import Categories from "@/components/Categories";
import HeroSection from "@/components/Hero";
import ServiceSection from "@/components/service";
import SubscriptionSection from "@/components/subscription";
import TestimonialsSection from "@/components/testimonials";
import VideoSection from "@/components/video";

const page = () => {
  return (
    <>
      <HeroSection />
      <ServiceSection />
      <BlogSection />
      <TestimonialsSection />
      <VideoSection />
      <SubscriptionSection />
      <Categories/>
    </>
  );
};

export default page;
