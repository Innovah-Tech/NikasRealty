import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import property1 from "@/assets/images/property1.jpg";
import property2 from "@/assets/images/property2.jpg";
import property3 from "@/assets/images/property3.jpg";
import property4 from "@/assets/images/property4.jpg";
import property5 from "@/assets/images/property5.jpg";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

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
      type: "Modern Apartment",
      status: "For Sale",
      projectStage: "Ready",
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
      type: "Premium Maisonette",
      status: "For Sale",
      projectStage: "Offplan",
    },
    {
      id: 3,
      title: "Contemporary Town House",
      description: "Spacious town house with lush garden, suitable for family living.",
      price: "KES 10M",
      image: property3,
      location: "Nairobi, Kenya",
      bedrooms: 4,
      bathrooms: 3,
      size: "220 sqm",
      featured: false,
      type: "Town House",
      status: "For Sale",
      projectStage: "Ready",
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
      type: "Executive Bungalow",
      status: "For Sale",
      projectStage: "Ready",
    },
    {
      id: 5,
      title: "Elegant Duplex Home",
      description: "A stylish duplex with a private entrance and rooftop views.",
      price: "KES 18M",
      image: property5,
      location: "Nairobi, Kenya",
      bedrooms: 5,
      bathrooms: 4,
      size: "365 sqm",
      featured: true,
      type: "Duplex",
      status: "For Sale",
      projectStage: "Offplan",
    },
  ];

  const [selected, setSelected] = useState<null | typeof properties[0]>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [bedrooms, setBedrooms] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [propertyType, setPropertyType] = useState("all");

  // Filtering logic
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesBedrooms = bedrooms === "all" ? true : String(p.bedrooms) === bedrooms;
    const matchesFeatured = featuredOnly ? p.featured : true;
    const matchesType = propertyType === "all" ? true : p.type === propertyType;
    return matchesSearch && matchesBedrooms && matchesFeatured && matchesType;
  });

  return (
    <section id="properties" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Search and Filter Row */}
        <div className="flex flex-wrap gap-4 mb-10 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by title or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className=""
            />
          </div>
          <div className="min-w-[160px]">
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Luxury Mansion">Luxury Mansion</SelectItem>
                <SelectItem value="Modern Apartment">Modern Apartment</SelectItem>
                <SelectItem value="Premium Maisonette">Premium Maisonette</SelectItem>
                <SelectItem value="Executive Bungalow">Executive Bungalow</SelectItem>
                <SelectItem value="Commercial Land">Commercial Land</SelectItem>
                <SelectItem value="Town House">Town House</SelectItem>
                <SelectItem value="Duplex">Duplex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[130px]">
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger>
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center space-x-2 select-none cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={() => setFeaturedOnly(f => !f)}
              className="accent-primary w-4 h-4"
            />
            <span>Featured only</span>
          </label>
        </div>
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
          {filteredProperties.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8 text-lg">No properties match your search.</div>
          )}
          {filteredProperties.map((property) => (
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
                {/* Classification badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary" className="capitalize">{property.type}</Badge>
                  <Badge variant="outline" className="capitalize">{property.status}</Badge>
                  <Badge variant="ghost" className="capitalize">{property.projectStage}</Badge>
                  {property.featured && (
                    <Badge className="gradient-gold text-secondary font-semibold">Featured</Badge>
                  )}
                </div>
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
                  onClick={() => {
                    setSelected(property);
                    setOpen(true);
                  }}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl w-full">
            {selected && <PropertyDetails property={selected} />}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

// Detailed Property Modal Content
const PropertyDetails = ({ property }: { property: typeof properties[0] }) => (
  <div>
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        <img src={property.image} alt={property.title} className="max-w-md w-full rounded-xl object-cover shadow-lg" />
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary" className="capitalize">{property.type}</Badge>
            <Badge variant="outline" className="capitalize">{property.status}</Badge>
            <Badge variant="ghost" className="capitalize">{property.projectStage}</Badge>
            {property.featured && (
              <Badge className="gradient-gold text-secondary font-semibold">Featured</Badge>
            )}
          </div>
          <h3 className="text-3xl font-bold text-primary mb-2">{property.title}</h3>
          <p className="text-muted-foreground text-lg mb-4">{property.description}</p>
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <span className="flex items-center gap-1"><MapPin size={16} /> {property.location}</span>
            <span className="flex items-center gap-1"><Bed size={16} /> {property.bedrooms} Beds</span>
            <span className="flex items-center gap-1"><Bath size={16} /> {property.bathrooms} Baths</span>
            <span className="flex items-center gap-1"><Square size={16} /> {property.size}</span>
          </div>
          <div className="text-2xl font-bold text-primary border-t pt-4 mt-4">{property.price}</div>
        </div>
      </div>
    </div>
    {/* Gallery or More Images could go here */}
    <div className="flex justify-end mt-4">
      <Button
        className="gradient-gold text-secondary font-semibold"
        onClick={() => window.open("https://wa.me/254710132320", "_blank")}
      >
        WhatsApp Agent
      </Button>
    </div>
  </div>
);

export default Properties;
