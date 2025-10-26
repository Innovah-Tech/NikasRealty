import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Instagram, Video, MessageCircle, MapPin } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // WhatsApp message format
    const message = `Hi! I'm ${formData.name}. ${formData.message}. You can reach me at ${formData.email} or ${formData.phone}.`;
    const whatsappUrl = `https://wa.me/254710132320?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Redirecting to WhatsApp...");
    
    // Reset form
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: "0710 132 320",
      link: "tel:+254710132320",
    },
    {
      icon: Mail,
      title: "Email",
      value: "nikasrealty@gmail.com",
      link: "mailto:nikasrealty@gmail.com",
    },
    {
      icon: Instagram,
      title: "Instagram",
      value: "@nikasrealty",
      link: "https://instagram.com/nikasrealty",
    },
    {
      icon: Video,
      title: "TikTok",
      value: "@nikas.realty",
      link: "https://tiktok.com/@nikas.realty",
    },
  ];

  return (
    <section id="contact" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Let's Talk <span className="text-primary">Real Estate</span>
          </h2>
          <div className="h-1 w-20 gradient-gold mx-auto" />
          <p className="text-lg text-muted-foreground">
            Get in touch with our team to discuss your property needs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-luxury">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+254 710 123 456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Tell us about your property requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-gold text-secondary font-semibold h-12 text-lg shadow-luxury hover:scale-105 transition-smooth"
                >
                  <MessageCircle className="mr-2" size={20} />
                  Chat on WhatsApp
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <a
                    key={index}
                    href={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-card p-6 rounded-xl shadow-card hover:shadow-luxury transition-smooth group"
                  >
                    <Icon className="text-primary w-8 h-8 mb-3 group-hover:scale-110 transition-smooth" />
                    <div className="text-sm text-muted-foreground mb-1">
                      {info.title}
                    </div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-smooth">
                      {info.value}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Map */}
            <Card className="shadow-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255282.35846803324!2d36.70730744853516!3d-1.3028617999999892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1647888888888!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Nikas Realty Location"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-card">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-primary" size={20} />
                      <div>
                        <div className="font-semibold text-foreground">Our Location</div>
                        <div className="text-sm text-muted-foreground">Nairobi, Kenya</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
