import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { properties } from "@/data/properties";
import { ArrowLeft, X } from "lucide-react";

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pid = Number(id);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const property = properties.find((p) => p.id === pid);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const navigateImages = (direction: 'prev' | 'next') => {
    if (!property?.gallery) return;
    
    setSelectedImage(prev => {
      if (direction === 'next') {
        return (prev + 1) % property.gallery.length;
      } else {
        return (prev - 1 + property.gallery.length) % property.gallery.length;
      }
    });
  };

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

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative aspect-video overflow-hidden rounded-xl shadow-lg cursor-zoom-in"
              onClick={() => openLightbox(0)}
            >
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            
            {/* Thumbnail Grid */}
            {property.gallery && property.gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.gallery.map((img, index) => (
                  <button 
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(index);
                    }}
                    className={`relative aspect-square overflow-hidden rounded-lg transition-all duration-200 ${
                      property.image === img ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
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
            )}

            {/* Lightbox Modal */}
            {lightboxOpen && property.gallery && (
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
                    src={property.gallery[selectedImage]} 
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
                  {selectedImage + 1} / {property.gallery.length}
                </div>
              </div>
            )}
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
