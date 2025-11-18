import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Eye, Trash2, Search } from 'lucide-react';
import { propertiesService, type Property } from '@/services/firestore/properties';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bedroomsFilter, setBedroomsFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

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
  ]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await propertiesService.getAll({
        search,
        type: typeFilter,
        status: statusFilter,
        bedrooms: bedroomsFilter,
        location: locationFilter,
        completion: completionFilter,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
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
      setProperties(response);
    } catch (error) {
      toast.error('Failed to fetch properties');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertiesService.delete(id);
      toast.success('Property deleted successfully');
      fetchProperties();
    } catch (error) {
      toast.error('Failed to delete property');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground">Manage your property listings</p>
          </div>
          <Button onClick={() => navigate('/admin/add-property')}>
            Add Property
          </Button>
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
                  max={50000000}
                  step={500000}
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
              <p className="text-muted-foreground">No properties found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative h-48 overflow-hidden bg-muted">
                  {property.images?.[0] && (
                    <img
                      src={property.images[0]}
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      {typeof property.price === 'number'
                        ? `KSh ${property.price.toLocaleString()}`
                        : property.price}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                      {property.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => property.id && handleDelete(property.id)}
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

