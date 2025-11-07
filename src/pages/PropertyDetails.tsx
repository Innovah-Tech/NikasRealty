import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { properties } from "@/data/properties";

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pid = Number(id);
  const property = properties.find((p) => p.id === pid);

  if (!property) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <h1 className="text-2xl font-semibold mb-4">Property not found</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-10">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => {
              // Navigate to home page first
              navigate("/");
              // Wait for navigation to complete, then scroll to properties section
              setTimeout(() => {
                const element = document.querySelector("#properties");
                if (element) {
                  // Scroll with offset for navbar
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - 80; // Account for navbar height
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                  });
                }
              }, 300);
            }}
          >
            Back to Properties
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <img src={property.image} alt={property.title} className="w-full h-auto rounded-xl object-cover shadow-lg" />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize">{property.type}</Badge>
              <Badge variant="outline" className="capitalize">{property.status}</Badge>
              {property.projectStage && (
                <Badge variant="outline" className="capitalize">{property.projectStage}</Badge>
              )}
              {property.featured && (
                <Badge className="gradient-gold text-secondary font-semibold">Featured</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} />
              <span>{property.location}</span>
            </div>
            <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Bed size={16} /> {property.bedrooms} Beds</span>
              <span className="flex items-center gap-1"><Bath size={16} /> {property.bathrooms} Baths</span>
              <span className="flex items-center gap-1"><Square size={16} /> {property.size}</span>
            </div>
            <div className="pt-4 mt-2 border-t">
              <div className="text-3xl font-bold text-primary">{property.price}</div>
            </div>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            <div className="flex gap-3 pt-2">
              <Button
                className="gradient-gold text-secondary font-semibold"
                onClick={() => {
                  const message = `Hi Nikas Realty, I'm interested in ${property.title}.`;
                  const url = `https://wa.me/254710132320?text=${encodeURIComponent(message)}`;
                  window.open(url, "_blank");
                }}
              >
                WhatsApp Agent
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetailsPage;
