import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import heroImage from "@/assets/images/hero.jpg";

const Hero = () => {
  const scrollToProperties = () => {
    const element = document.querySelector("#properties");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Luxury Modern Villa"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Nikas Realty
          </h1>
          <div className="h-1 w-32 mx-auto gradient-gold" />
          <p className="text-2xl md:text-3xl text-primary font-semibold">
            We Turn Dreams Into Reality
          </p>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Modern & Luxurious Living | Professional Advice & Customized Solutions
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              onClick={scrollToProperties}
              size="lg"
              className="gradient-gold text-secondary font-semibold text-lg px-8 py-6 shadow-luxury hover:scale-105 transition-smooth"
            >
              Explore Properties
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              onClick={() => window.open("https://wa.me/254710132320", "_blank")}
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-secondary font-semibold text-lg px-8 py-6 backdrop-blur-sm transition-smooth"
            >
              <MessageCircle className="mr-2" size={20} />
              WhatsApp Us
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
