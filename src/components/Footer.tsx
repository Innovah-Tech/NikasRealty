import { Instagram, Video, Phone, Mail } from "lucide-react";
import logo from "@/assets/images/logo.png";

const Footer = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about" },
    { name: "Properties", href: "#properties" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  const socialLinks = [
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://instagram.com/nikasrealty",
    },
    {
      icon: Video,
      label: "TikTok",
      href: "https://tiktok.com/@nikas.realty",
    },
    {
      icon: Phone,
      label: "Phone",
      href: "tel:+254710132320",
    },
    {
      icon: Mail,
      label: "Email",
      href: "mailto:nikasrealty@gmail.com",
    },
  ];

  return (
    <footer className="gradient-dark text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="Nikas Realty" className="h-16 w-auto" />
            <p className="text-primary font-semibold text-lg">
              We Turn Dreams Into Reality
            </p>
            <p className="text-white/70 text-sm">
              Your trusted partner in finding elegant, modern, and luxurious homes across Kenya.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/70 hover:text-primary transition-smooth"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types (New Column) */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">Property Types</h3>
            <ul className="space-y-3">
              <li className="text-white/70">Luxury Mansion</li>
              <li className="text-white/70">Modern Apartment</li>
              <li className="text-white/70">Premium Maisonette</li>
              <li className="text-white/70">Executive Bungalow</li>
              <li className="text-white/70">Commercial Land</li>
              <li className="text-white/70">Town House</li>
              <li className="text-white/70">Duplex</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">Contact Us</h3>
            <ul className="space-y-3 text-white/70 text-sm">
              <li>
                <a
                  href="tel:+254710132320"
                  className="hover:text-primary transition-smooth"
                >
                  📞 0710 132 320
                </a>
              </li>
              <li>
                <a
                  href="mailto:nikasrealty@gmail.com"
                  className="hover:text-primary transition-smooth"
                >
                  📩 nikasrealty@gmail.com
                </a>
              </li>
              <li>📍 Westland Arcade, Nairobi, Westlands, Kenya</li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">Follow Us</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary hover:scale-110 transition-smooth"
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">
            © 2025 Nikas Realty. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
