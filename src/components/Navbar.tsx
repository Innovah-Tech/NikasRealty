import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/images/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to section after navigation
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const navLinks = [
    { name: "Home", href: "#home", type: "anchor" },
    { name: "About Us", href: "#about", type: "anchor" },
    { name: "Properties", href: "#properties", type: "anchor" },
    { name: "Services", href: "#services", type: "anchor" },
    { name: "Blog", href: "/blog", type: "route" },
    { name: "Contact", href: "#contact", type: "anchor" },
  ];

  const handleAnchorClick = (href: string) => {
    setIsOpen(false);
    // If we're not on the home page, navigate to home first, then scroll
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    } else {
      // If we're on home page, just scroll
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const goToAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-card" : "bg-transparent"
      }`}
      style={{ minHeight: '6rem' }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center py-2 pr-2 group"
            onClick={() => setIsOpen(false)}
            aria-label="Nikas Realty home"
          >
            <img 
              src={logo} 
              alt="Nikas Realty" 
              className="h-16 sm:h-20 md:h-24 w-auto object-contain"
              style={{ mixBlendMode: 'normal' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.type === "route" ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-foreground hover:text-primary transition-smooth font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={() => handleAnchorClick(link.href)}
                  className="text-foreground hover:text-primary transition-smooth font-medium"
                >
                  {link.name}
                </button>
              )
            ))}
            <button
              aria-label="Toggle theme"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-smooth"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>
            <Button
              onClick={goToAdminLogin}
              className="gradient-gold text-secondary font-semibold shadow-luxury hover:scale-105 transition-smooth"
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="flex flex-col space-y-4 py-6">
              {navLinks.map((link) => (
                link.type === "route" ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-foreground hover:text-primary transition-smooth font-medium text-left px-4"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => handleAnchorClick(link.href)}
                    className="text-foreground hover:text-primary transition-smooth font-medium text-left px-4"
                  >
                    {link.name}
                  </button>
                )
              ))}
              <div className="px-4">
                <button
                  aria-label="Toggle theme"
                  className="w-full inline-flex h-10 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-smooth"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-5 w-5 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="h-5 w-5 mr-2 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  Toggle theme
                </button>
              </div>
              <div className="px-4">
                <Button
                  onClick={() => {
                    goToAdminLogin();
                    setIsOpen(false);
                  }}
                  className="w-full gradient-gold text-secondary font-semibold shadow-luxury"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
