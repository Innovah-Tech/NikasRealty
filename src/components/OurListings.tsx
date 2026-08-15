import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { propertiesService, type Property } from "@/services/firestore/properties";
import { Loader2 } from "lucide-react";

interface PropertyCategory {
  name: string;
  count: number;
}

const OurListings = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const allProperties = await propertiesService.getAll();

        // Define property categories
        const categoryMap = new Map<string, number>();
        const defaultCategories = [
          'Residential',
          'Apartment',
          'Duplex',
          'PentHouse',
          'TownHouse',
          'Triplex',
          'Villa',
          'Mansion',
          'Maisonette',
          'Bungalow'
        ];

        // Initialize all categories with 0
        defaultCategories.forEach(cat => categoryMap.set(cat, 0));

        // Count properties by type
        allProperties.forEach(property => {
          const type = property.type;
          if (type) {
            // Check if it matches any of our categories (case-insensitive)
            for (const cat of defaultCategories) {
              if (type.toLowerCase() === cat.toLowerCase()) {
                categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
                break;
              }
            }
          }
        });

        // Convert to array and filter out categories with 0 count
        const categoryArray = Array.from(categoryMap.entries())
          .map(([name, count]) => ({ name, count }))
          .filter(cat => cat.count > 0);

        setCategories(categoryArray);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Our Listings</h3>
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Our Listings</h3>
      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
            onClick={() => navigate(`/properties?type=${category.name}`)}
          >
            <span className="text-sm text-foreground">{category.name}</span>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
              {category.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurListings;
