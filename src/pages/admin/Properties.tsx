import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Trash2, Search, RefreshCw, X, Download } from 'lucide-react';
import { propertiesService, type Property } from '@/services/firestore/properties';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { PROPERTY_CONFIG } from '@/config/constants';
import { getPropertyImageUrl } from '@/utils/imageUtils';

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bedroomsFilter, setBedroomsFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>(PROPERTY_CONFIG.defaultPriceRange);
  const [sortBy, setSortBy] = useState('newest');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh when component mounts or location changes (e.g., coming back from add property)
  useEffect(() => {
    fetchProperties();
  }, [location.pathname]);

  useEffect(() => {
    fetchProperties();
  }, [
    page,
    typeFilter,
    statusFilter,
    bedroomsFilter,
    locationFilter,
    completionFilter,
    priceRange,
    sortBy,
    featuredOnly,
    search,
  ]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setBedroomsFilter('all');
    setLocationFilter('all');
    setCompletionFilter('all');
    setPriceRange(PROPERTY_CONFIG.defaultPriceRange);
    setFeaturedOnly(false);
    setPage(1);
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Don't apply price filter if range is at max (shows all properties)
      const maxPriceFilter = priceRange[1] >= PROPERTY_CONFIG.maxPrice ? undefined : priceRange[1];
      const minPriceFilter = priceRange[0] <= 0 ? undefined : priceRange[0];

      const response = await propertiesService.getAll({
        search: search || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        bedrooms: bedroomsFilter === 'all' ? undefined : bedroomsFilter,
        location: locationFilter === 'all' ? undefined : locationFilter,
        completion: completionFilter === 'all' ? undefined : completionFilter,
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter,
        sortBy:
          sortBy === 'price-asc' || sortBy === 'price-desc'
            ? 'price'
            : sortBy === 'newest'
              ? 'createdAt'
              : undefined,
        order:
          sortBy === 'price-asc'
            ? 'asc'
            : sortBy === 'price-desc'
              ? 'desc'
              : 'desc',
        featured: featuredOnly ? true : undefined,
        page,
        limit: 10,
      });

      // Filter out fallback properties (they shouldn't be in Firestore, but just in case)
      const firestoreProperties = (response || []).filter(
        (p) => p.id && !p.id.startsWith('fallback-')
      );

      setProperties(firestoreProperties);

      if (import.meta.env.DEV) {
        console.log('Properties set in state:', firestoreProperties.length);
        if (firestoreProperties.length > 0) {
          console.log('Sample property:', firestoreProperties[0]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      const errorMessage = error?.message || 'Failed to fetch properties';
      toast.error(errorMessage);
      setProperties([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id || id.startsWith('fallback-')) {
      toast.error('Cannot delete fallback properties');
      return;
    }

    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

    try {
      await propertiesService.delete(id);
      toast.success('Property deleted successfully');
      fetchProperties();
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error?.message || 'Failed to delete property';
      toast.error(errorMessage);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      // Fetch all properties for export (without pagination)
      const allProperties = await propertiesService.getAll();

      if (allProperties.length === 0) {
        toast.info("No properties to export");
        return;
      }

      const headers = [
        "Title",
        "Price",
        "Location",
        "Type",
        "Status",
        "Bedrooms",
        "Bathrooms",
        "Featured",
        "Completion",
        "Created At"
      ];

      const csvContent = [
        headers.join(","),
        ...allProperties.map(p => [
          `"${p.title.replace(/"/g, '""')}"`,
          p.price,
          `"${p.location.replace(/"/g, '""')}"`,
          p.type,
          p.status,
          p.bedrooms || 0,
          p.bathrooms || 0,
          p.featured ? "Yes" : "No",
          p.completion || "N/A",
          p.createdAt ? new Date(p.createdAt).toISOString() : "N/A"
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `nikas_realty_inventory_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Property inventory exported successfully");
    } catch (error) {
      toast.error("Failed to export properties");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sales</h1>
            <p className="text-muted-foreground">Manage your sales listings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={fetchProperties} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => navigate('/admin/add-property')}>
              Add Property
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={featuredOnly}
                    onCheckedChange={(checked) => setFeaturedOnly(Boolean(checked))}
                  />
                  <span>Featured only</span>
                </label>
                <Button type="submit" className="w-full lg:w-auto">
                  Apply Filters
                </Button>
                {(search || typeFilter !== 'all' || statusFilter !== 'all' || bedroomsFilter !== 'all' ||
                  locationFilter !== 'all' || completionFilter !== 'all' || featuredOnly ||
                  priceRange[0] > 0 || priceRange[1] < 50000000) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full lg:w-auto"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Mansion">Mansion</SelectItem>
                    <SelectItem value="Maisonette">Maisonette</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Bungalow">Bungalow</SelectItem>
                    <SelectItem value="Duplex">Duplex</SelectItem>
                    <SelectItem value="Triplex">Triplex</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="For Sale">For Sale</SelectItem>
                    <SelectItem value="For Rent">For Rent</SelectItem>
                    <SelectItem value="Offplan">Offplan</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bedrooms</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
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

                <Select value={completionFilter} onValueChange={setCompletionFilter}>
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

              <div>
                <div className="text-xs text-muted-foreground mb-1">Price Range (KES)</div>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange([value[0], value[1]] as [number, number])}
                  min={0}
                  max={PROPERTY_CONFIG.maxPrice}
                  step={1000000}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>{priceRange[0].toLocaleString()}</span>
                  <span>{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 rounded-t-lg bg-muted" />
                <CardContent className="space-y-3 pt-4">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-2">No properties found</p>
              {import.meta.env.DEV && (
                <p className="text-xs text-muted-foreground">
                  Debug: Check console for fetched properties. Filters may be hiding results.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative h-48 overflow-hidden bg-muted">
                  {property.images?.[0] && (
                    <img
                      src={getPropertyImageUrl(property.images[0], 'thumbnail')}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="space-y-3 pt-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-medium text-primary">
                      {typeof property.price === 'number'
                        ? `KSh ${property.price.toLocaleString()}`
                        : property.price}
                    </span>
                    <div className="flex items-center gap-2">
                      {property.offplan === true && (
                        <Badge className="bg-blue-600 text-white font-semibold">Off-plan</Badge>
                      )}
                      <Badge
                        variant={property.status === "for-sale" || property.status === "For Sale" ? "default" : property.status === "for-rent" || property.status === "For Rent" ? "secondary" : "outline"}
                        className={`font-semibold ${property.status === "for-sale" || property.status === "For Sale"
                          ? "gradient-gold text-secondary"
                          : property.status === "for-rent" || property.status === "For Rent"
                            ? "!text-white bg-secondary"
                            : "!text-white bg-muted"
                          }`}
                      >
                        {property.status === "for-sale" || property.status === "For Sale"
                          ? "For Sale"
                          : property.status === "for-rent" || property.status === "For Rent"
                            ? "For Rent"
                            : property.status === "sold" || property.status === "Sold"
                              ? "Sold"
                              : property.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => property.id && navigate(`/properties/${property.id}`)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => property.id && navigate(`/admin/edit-property/${property.id}`)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => property.id && handleDelete(property.id)}
                      disabled={!property.id || property.id.startsWith('fallback-')}
                      title={property.id?.startsWith('fallback-') ? 'Cannot delete fallback properties' : 'Delete property'}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={properties.length < 10}
          >
            Next
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminProperties;

