import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Loader2, ArrowLeft, X } from "lucide-react";
import { propertiesService, type Property } from "@/services/firestore/properties";
import { findFallbackProperty } from "@/utils/fallbackProperties";

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchProperty = async () => {
      try {
        const data = await propertiesService.getById(id);
        if (data) {
          setProperty(data);
          return;
        }
        const fallback = findFallbackProperty(id);
        if (fallback) {
          setProperty(fallback);
        }
      } catch (error) {
        console.error("Failed to load property:", error);
        const fallback = findFallbackProperty(id);
        if (fallback) {
          setProperty(fallback);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    setSelectedImage(0);
  }, [property?.id]);

  const images =
    property?.images?.length
      ? property.images
      : property?.gallery?.length
      ? property.gallery
      : property?.image
      ? [property.image]
      : ["/images/property1.jpg"];

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const navigateImages = (direction: "prev" | "next") => {
    if (!images.length) return;

    setSelectedImage((prev) => {
      if (direction === "next") {
        return (prev + 1) % images.length;
      }
      return (prev - 1 + images.length) % images.length;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-24 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

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
            type="button"
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate("/");
            }}
          >
            Back to Home
          </Button>
        </div>

        {/* Full Page Main Image */}
        <div 
          className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden rounded-xl shadow-lg cursor-zoom-in mb-8"
          onClick={() => openLightbox(0)}
        >
          <img 
            src={images[selectedImage]} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {/* Overlay with Title and Badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8 lg:p-12">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="capitalize bg-white/90 text-foreground">{property.type}</Badge>
              <Badge variant="outline" className="capitalize bg-white/90 text-foreground border-white/50">{property.status}</Badge>
              {property.projectStage && (
                <Badge variant="outline" className="capitalize bg-white/90 text-foreground border-white/50">{property.projectStage}</Badge>
              )}
              {property.featured && (
                <Badge className="gradient-gold text-secondary font-semibold">Featured</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3">{property.title}</h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin size={20} />
              <span className="text-lg md:text-xl">{property.location}</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Thumbnails Left, Details Right */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Side - Thumbnail Grid */}
          {images.length > 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Gallery</h2>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button 
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(index);
                    }}
                    className={`relative aspect-square overflow-hidden rounded-lg transition-all duration-200 ${
                      selectedImage === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${property.title} - ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Right Side - Details */}
          <div className="space-y-6">
            {/* Price */}
            <div className="pt-4 border-t border-border">
                <div className="text-4xl font-bold text-primary">
                  {typeof property.price === "number"
                    ? `KES ${property.price.toLocaleString()}`
                    : property.price}
                </div>
            </div>

            {/* Property Details */}
            <div className="flex flex-wrap gap-6 items-center text-base text-muted-foreground pb-4 border-b border-border">
              <span className="flex items-center gap-2">
                <Bed size={20} />
                <span className="font-medium">{property.bedrooms ?? "-"} Beds</span>
              </span>
              <span className="flex items-center gap-2">
                <Bath size={20} />
                <span className="font-medium">{property.bathrooms ?? "-"} Baths</span>
              </span>
              <span className="flex items-center gap-2">
                <Square size={20} />
                <span className="font-medium">{property.size ?? "N/A"}</span>
              </span>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities/Features */}
            {property.features && property.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-foreground">Amenities & Features</h2>
                <ul className="space-y-3">
                  {property.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-primary mt-1 text-lg">•</span>
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Payment Options */}
            {property.paymentOptions && property.paymentOptions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-foreground">Payment Options</h2>
                <ul className="space-y-3">
                  {property.paymentOptions.map((option, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-primary mt-1 text-lg">•</span>
                      <span className="text-base">{option}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Completion Date */}
            {property.completionDate && (
              <div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">Completion Date</h2>
                <p className="text-muted-foreground text-base">{property.completionDate}</p>
              </div>
            )}

            {/* WhatsApp Button */}
            <div className="pt-4">
              <Button
                className="w-full gradient-gold text-secondary font-semibold text-lg py-6"
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

        {/* Lightbox Modal */}
        {lightboxOpen && images.length > 0 && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
            >
              <X className="w-8 h-8" />
            </button>
            
            <button 
              className="absolute left-4 text-white hover:text-gray-300 z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                navigateImages('prev');
              }}
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            
            <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
              <img 
                src={images[selectedImage]} 
                alt={`${property.title} - ${selectedImage + 1}`}
                className="max-h-[90vh] max-w-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <button 
              className="absolute right-4 text-white hover:text-gray-300 z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                navigateImages('next');
              }}
            >
              <ArrowLeft className="w-8 h-8 transform rotate-180" />
            </button>
            
            <div className="absolute bottom-4 text-white text-center w-full">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetailsPage;
