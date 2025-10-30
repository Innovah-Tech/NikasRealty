import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { axiosClient } from '@/utils/axiosClient';
import { toast } from 'sonner';

interface Request {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  property?: string;
  createdAt: string;
  contacted: boolean;
}

const Requests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const fetchRequests = async () => {
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;

      const response = await axiosClient.get('/requests', { params });
      setRequests(response.data.requests || response.data || []);
    } catch (error) {
      toast.error('Failed to fetch requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkContacted = async (id: string) => {
    try {
      await axiosClient.patch(`/requests/${id}`, { contacted: true });
      toast.success('Request marked as contacted');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      await axiosClient.delete(`/requests/${id}`);
      toast.success('Request deleted');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Requests & Leads</h1>
          <p className="text-muted-foreground">Manage customer inquiries</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={(e) => { e.preventDefault(); fetchRequests(); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No requests found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.phone}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.message}</TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            request.contacted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {request.contacted ? 'Contacted' : 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!request.contacted && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkContacted(request._id)}
                            >
                              Mark Contacted
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(request._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
            disabled={requests.length < 10}
          >
            Next
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Requests;
