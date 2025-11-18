import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: string;
  featured?: boolean;
  type: string;
  status: string;
  projectStage?: string;
  completion?: string;
}

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bedrooms, setBedrooms] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [propertyType, setPropertyType] = useState("all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");
  const [completion, setCompletion] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${API_URL}/properties`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesBedrooms = bedrooms === "all" ? true : String(p.bedrooms || 0) === bedrooms;
    const matchesFeatured = featuredOnly ? p.featured : true;
    const matchesType = propertyType === "all" ? true : p.type === propertyType;
    const matchesStatus = status === "all" ? true : p.status === status;
    const matchesLocation = location === "all" ? true : p.location.toLowerCase().includes(location.toLowerCase());
    const matchesCompletion = completion === "all" ? true : (p.projectStage?.toLowerCase() || p.completion?.toLowerCase() || '') === completion.toLowerCase();
    const priceNum = p.price || 0;
    const matchesPrice = priceNum >= priceRange[0] && priceNum <= priceRange[1];
    return matchesSearch && matchesBedrooms && matchesFeatured && matchesType && matchesStatus && matchesLocation && matchesCompletion && matchesPrice;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    // default newest first
    return 0;
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `KES ${(price / 1000000).toFixed(1)}M`;
    }
    return `KES ${price.toLocaleString()}`;
  };

  return (
    <section id="properties" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Featured Properties Slides */}
        <FeaturedPropertiesSlides items={properties} />
        {/* Search and Filter Row */}
        <div className="flex flex-wrap gap-4 mb-10 items-end">
          <div className="flex-1 w-full sm:min-w-[200px] sm:w-auto">
            <Input
              placeholder="Search by title or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className=""
            />
          </div>
          <div className="w-full sm:min-w-[160px] sm:w-auto">
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Mansion">Mansion</SelectItem>
                <SelectItem value="Maisonette">Maisonette</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Bungalow">Bungalow</SelectItem>
                <SelectItem value="Duplex">Duplex</SelectItem>
                <SelectItem value="Triplex">Triplex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:min-w-[130px] sm:w-auto">
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
                <SelectItem value="5+">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:min-w-[140px] sm:w-auto">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="For Sale">For Sale</SelectItem>
                <SelectItem value="For Rent">For Rent</SelectItem>
                <SelectItem value="Offplan">Off-plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:min-w-[160px] sm:w-auto">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Langata">Langata</SelectItem>
                <SelectItem value="Ruiru">Ruiru</SelectItem>
                <SelectItem value="Kikuyu">Kikuyu</SelectItem>
                <SelectItem value="Kilimani">Kilimani</SelectItem>
                <SelectItem value="Kileleshwa">Kileleshwa</SelectItem>
                <SelectItem value="Syokimau">Syokimau</SelectItem>
                <SelectItem value="Kabete">Kabete</SelectItem>
                <SelectItem value="Muthaiga">Muthaiga</SelectItem>
                <SelectItem value="Riverside">Riverside</SelectItem>
                <SelectItem value="Kiambu Road">Kiambu Road</SelectItem>
                <SelectItem value="Ngong">Ngong</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:min-w-[160px] sm:w-auto">
            <Select value={completion} onValueChange={setCompletion}>
              <SelectTrigger>
                <SelectValue placeholder="Completion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Under Construction">Under Construction</SelectItem>
                <SelectItem value="Offplan">Off-plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 w-full sm:min-w-[220px] sm:w-auto">
            <div className="text-xs text-muted-foreground mb-1">Price Range (KES)</div>
            <Slider value={priceRange} onValueChange={(v)=>setPriceRange([v[0], v[1]] as [number, number])} min={0} max={50000000} step={500000} />
            <div className="flex justify-between text-xs mt-1">
              <span>{priceRange[0].toLocaleString()}</span>
              <span>{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full sm:min-w-[160px] sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
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
          {sortedProperties.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8 text-lg">No properties match your search.</div>
          )}
          {sortedProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden group hover:shadow-luxury transition-smooth cursor-pointer"
              onClick={() => navigate(`/properties/${property.id}`)}
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
                  <Badge variant="outline" className="capitalize">{property.projectStage}</Badge>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/properties/${property.id}`);
                  }}
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
// --- Slides: Featured Properties (no external deps) ---
const FeaturedPropertiesSlides = ({ items }: { items: Array<{ id: number; title: string; image: string; price: string; location: string }>; }) => {
  const [index, setIndex] = useState(0);
  const last = items.length - 1;

  const next = useCallback(() => setIndex((i) => (i >= last ? 0 : i + 1)), [last]);
  const prev = useCallback(() => setIndex((i) => (i <= 0 ? last : i - 1)), [last]);

  useEffect(() => {
    const id = window.setInterval(next, 4000);
    return () => window.clearInterval(id);
  }, [next]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-foreground">Featured Properties</h3>
        <div className="flex gap-2">
          <button onClick={prev} className="h-9 w-9 rounded-md border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-smooth">‹</button>
          <button onClick={next} className="h-9 w-9 rounded-md border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-smooth">›</button>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-xl">
        {/* Fade slides */}
        {items.map((p, i) => (
          <div
            key={p.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="rounded-xl overflow-hidden shadow-card bg-card group cursor-pointer h-full">
              <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                <Badge className="absolute top-3 right-3 gradient-gold text-secondary font-semibold">Hot</Badge>
              </div>
              <div className="p-4">
                <div className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={14} />{p.location}</div>
                <div className="font-semibold text-foreground mt-1 group-hover:text-primary transition-smooth line-clamp-1">{p.title}</div>
                <div className="text-primary font-bold mt-2">{p.price}</div>
              </div>
            </div>
          </div>
        ))}
        {/* Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-smooth ${i === index ? 'bg-primary' : 'bg-muted'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
