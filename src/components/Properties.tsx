import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import property1 from "@/assets/images/property1.jpg";
import property2 from "@/assets/images/property2.jpg";
import property3 from "@/assets/images/property3.jpg";
import property4 from "@/assets/images/property4.jpg";
import property5 from "@/assets/images/property5.jpg";

const Properties = () => {
  const properties = [
    {
      id: 1,
      title: "3 Bedroom All Office Suite",
      description: "Luxury apartment with modern office suite, perfect for professionals",
      price: "KES 14M",
      image: property1,
      location: "Nairobi, Kenya",
      bedrooms: 3,
      bathrooms: 3,
      size: "180 sqm",
      featured: true,
    },
    {
      id: 2,
      title: "Luxury 2 & 3 Bedroom Apartments",
      description: "Contemporary living spaces with premium finishes and city views",
      price: "Starting KES 11.7M",
      image: property2,
      location: "Nairobi, Kenya",
      bedrooms: 3,
      bathrooms: 2,
      size: "150 sqm",
      featured: true,
    },
    {
      id: 3,
      title: "Studio Apartments",
      description: "Modern minimalist design with open plan layout and luxury finishes",
      price: "KES 1.87M",
      image: property3,
      location: "Nairobi, Kenya",
      bedrooms: 1,
      bathrooms: 1,
      size: "45 sqm",
      featured: false,
    },
    {
      id: 4,
      title: "4 Bedroom Bungalow",
      description: "Elegant bungalow with landscaped garden and modern African architecture",
      price: "KES 14M",
      image: property4,
      location: "Nairobi, Kenya",
      bedrooms: 4,
      bathrooms: 3,
      size: "250 sqm",
      featured: false,
    },
    {
      id: 5,
      title: "5 Bedroom Executive Villa",
      description: "Executive villa with swimming pool and contemporary luxury design",
      price: "Price on Request",
      image: property5,
      location: "Nairobi, Kenya",
      bedrooms: 5,
      bathrooms: 4,
      size: "400 sqm",
      featured: true,
    },
  ];

  return (
    <section id="properties" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Discover Your <span className="text-primary">Dream Home</span>
          </h2>
          <div className="h-1 w-20 gradient-gold mx-auto" />
          <p className="text-lg text-muted-foreground">
            Explore our curated selection of elegant, modern, and luxurious properties
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden group hover:shadow-luxury transition-smooth cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                  loading="lazy"
                />
                {property.featured && (
                  <Badge className="absolute top-4 right-4 gradient-gold text-secondary font-semibold">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Content */}
              <CardHeader>
                <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                  {property.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={16} />
                  {property.location}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {property.description}
                </p>

                {/* Property Details */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Bed size={16} />
                    <span>{property.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath size={16} />
                    <span>{property.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square size={16} />
                    <span>{property.size}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-border">
                  <p className="text-2xl font-bold text-primary">{property.price}</p>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full gradient-gold text-secondary font-semibold hover:scale-105 transition-smooth"
                  onClick={() => window.open("https://wa.me/254710132320", "_blank")}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Properties;
