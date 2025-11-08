import { useEffect } from 'react';
import { ParallaxProvider } from 'react-scroll-parallax';
import Navbar from '../landing/Navbar';
import HeroSection from '../landing/HeroSection';
import SocialProofStrip from '../landing/SocialProofStrip';
import ProblemSection from '../landing/ProblemSection';
import FeatureShowcase from '../landing/FeatureShowcase';
import HowItWorks from '../landing/HowItWorks';
import PlatformShowcase from '../landing/PlatformShowcase';
import TestimonialsSection from '../landing/TestimonialsSection';
import PricingSection from '../landing/PricingSection';
import FAQ from '../landing/FAQ';
import CTASection from '../landing/CTASection';
import Footer from '../landing/Footer';
import GalaxyBackground from '../landing/GalaxyBackground';
import GalaxySphere from '../landing/GalaxySphere';
import ParallaxSection from '../landing/ParallaxSection';

const LandingPage = () => {
  useEffect(() => {
    // Update the title and meta description for SEO
    document.title = "MOMENTUM.AI | AI Content Repurposing Platform";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Transform one piece of content into viral hits across every platform with MOMENTUM.AI's advanced AI-powered content repurposing platform. Start your free trial today!");
    }
  }, []);

  return (
    <ParallaxProvider>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Galaxy background with scroll effects */}
        <GalaxyBackground />
        
        {/* 3D Galaxy Sphere */}
        <GalaxySphere />
        
        <Navbar />
        <main className="relative z-10">
          <HeroSection />
          
          <ParallaxSection speed={0.3}>
            <SocialProofStrip />
          </ParallaxSection>
          
          <ParallaxSection speed={0.5}>
            <ProblemSection />
          </ParallaxSection>
          
          <ParallaxSection speed={0.4}>
            <FeatureShowcase />
          </ParallaxSection>
          
          <ParallaxSection speed={0.6}>
            <HowItWorks />
          </ParallaxSection>
          
          <ParallaxSection speed={0.35}>
            <PlatformShowcase />
          </ParallaxSection>
          
          <ParallaxSection speed={0.45}>
            <TestimonialsSection />
          </ParallaxSection>
          
          <ParallaxSection speed={0.5}>
            <PricingSection />
          </ParallaxSection>
          
          <ParallaxSection speed={0.4}>
            <FAQ />
          </ParallaxSection>
          
          <ParallaxSection speed={0.3}>
            <CTASection />
          </ParallaxSection>
        </main>
        <Footer />
      </div>
    </ParallaxProvider>
  );
};

export default LandingPage;

