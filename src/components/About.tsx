import { Building2, Award, Users, TrendingUp } from "lucide-react";
import logo from "@/assets/images/logo.png";

const About = () => {
  const stats = [
    { icon: Users, value: "100+", label: "Happy Clients" },
    { icon: Award, value: "6+", label: "Years Experience" },
    { icon: TrendingUp, value: "98%", label: "Success Rate" },
    { icon: Building2, value: "100+", label: "Properties Sold" },
  ];

  return (
    <section id="about" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-luxury">
              <img
                src={logo}
                alt="Nikas Realty Logo"
                className="w-full h-full object-contain p-10 bg-white"
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

        {/* Story, Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center mt-20">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-3">Our Story</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">Nikas Realty began with a vision to connect families, investors, and communities to high-quality homes and properties in Kenya. With our founders deeply rooted in real estate, we’ve grown to be a trusted advisor for hundreds of clients, always valuing service and integrity.</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-primary mb-3">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">To simplify and elevate the property experience in Kenya by offering expert advice, transparent processes, and a curated selection of modern, elegant, and luxurious homes for every need.</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-primary mb-3">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">To be Kenya’s most trusted real estate partner, delivering exceptional value, service, and innovation to our clients and communities.</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-primary mb-3">Our Values</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">Integrity, Excellence, Customer Focus, Innovation, and Community.</p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center text-foreground mb-8">Meet Our Team</h3>
          <div className="flex flex-wrap gap-8 justify-center items-stretch">
            <TeamMember
              name="Monicah Githinji"
              title="Lead Estate Agent"
              image="/images/1000292924.jpg"
              bio="Monicah is passionate about matching clients to the perfect property and is known for her expertise and client-first approach throughout all stages of the buying and selling experience."
              objectPosition="object-top"
            />
            <TeamMember
              name="Brian Wachira"
              title="Estate Agent"
              image="/images/1000295242.jpg"
              bio="Brian is committed to delivering seamless real estate services, leveraging local knowledge and strong client relationships to achieve successful outcomes."
              objectPosition="object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Simple Team Member Card component
const TeamMember = ({ name, title, image, bio, objectPosition = "object-center" }: { name: string; title: string; image: string; bio: string; objectPosition?: string }) => (
  <div className="bg-card rounded-xl shadow-card p-6 max-w-xs flex flex-col items-center text-center gap-3">
    <img
      src={image}
      alt={name}
      className={`w-24 h-24 object-cover ${objectPosition} rounded-full border-4 border-primary shadow-md mb-2`}
      loading="lazy"
    />
    <div className="text-xl font-semibold text-foreground">{name}</div>
    <div className="text-primary font-medium">{title}</div>
    <div className="text-muted-foreground text-sm">{bio}</div>
  </div>
);

export default About;
