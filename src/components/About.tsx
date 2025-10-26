import { Building2, Award, Users, TrendingUp } from "lucide-react";
import aboutImage from "@/assets/images/about.jpg";

const About = () => {
  const stats = [
    { icon: Building2, value: "500+", label: "Properties Sold" },
    { icon: Users, value: "1000+", label: "Happy Clients" },
    { icon: Award, value: "15+", label: "Years Experience" },
    { icon: TrendingUp, value: "98%", label: "Success Rate" },
  ];

  return (
    <section id="about" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-luxury">
              <img
                src={aboutImage}
                alt="Professional Real Estate Consultation"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent" />
            </div>
            
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-72 h-72 gradient-gold opacity-20 rounded-full blur-3xl -z-10" />
          </div>

          {/* Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Building Dreams,{" "}
                <span className="text-primary">One Home at a Time</span>
              </h2>
              <div className="h-1 w-20 gradient-gold" />
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              At Nikas Realty, we specialize in connecting clients to elegant, modern, and luxurious homes across Kenya. Our team offers professional advice, customized property solutions, and a seamless buying experience.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-card p-6 rounded-xl shadow-card hover:shadow-luxury transition-smooth"
                  >
                    <Icon className="text-primary w-10 h-10 mb-3" />
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
