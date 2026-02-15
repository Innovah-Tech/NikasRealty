import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download } from "lucide-react";
import { requestsService, type Request } from "@/services/firestore/requests";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsletterManagement from "@/components/admin/NewsletterManagement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

const AdminRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await requestsService.getAll();

      // Apply search filter
      let filtered = allRequests;
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = allRequests.filter(r =>
          r.name?.toLowerCase().includes(searchLower) ||
          r.phone?.toLowerCase().includes(searchLower) ||
          r.email?.toLowerCase().includes(searchLower) ||
          r.message?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      setRequests(paginated);
    } catch (error) {
      toast.error("Failed to fetch requests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkContacted = async (id: string) => {
    try {
      await requestsService.update(id, { contacted: true });
      toast.success("Request marked as contacted");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to update request");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      await requestsService.delete(id);
      toast.success("Request deleted");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to delete request");
    }
  };

  const handleExportCSV = async () => {
    try {
      const allRequests = await requestsService.getAll();
      if (allRequests.length === 0) {
        toast.info("No requests to export");
        return;
      }

      const headers = ["Name", "Phone", "Email", "Message", "Date", "Status"];
      const csvContent = [
        headers.join(","),
        ...allRequests.map(r => [
          `"${r.name || ''}"`,
          `"${r.phone || ''}"`,
          `"${r.email || ''}"`,
          `"${(r.message || '').replace(/"/g, '""')}"`,
          r.createdAt ? new Date(r.createdAt).toISOString() : "N/A",
          r.contacted ? "Contacted" : "Pending"
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `property_requests_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Requests exported successfully");
    } catch (error) {
      toast.error("Failed to export requests");
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Requests & Leads</h1>
          <p className="text-muted-foreground">Manage customer inquiries and newsletter subscribers</p>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="requests">Property Requests</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter Subscribers</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6 mt-6">
            <div className="flex justify-end">
              <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchRequests();
                  }}
                  className="flex gap-2"
                >
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
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.name}</TableCell>
                          <TableCell>{request.phone}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{request.message}</TableCell>
                          <TableCell>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${request.contacted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {request.contacted ? "Contacted" : "Pending"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {!request.contacted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkContacted(request.id!)}
                                >
                                  Mark Contacted
                                </Button>
                              )}
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(request.id!)}>
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
              <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" onClick={() => setPage(page + 1)} disabled={requests.length < ITEMS_PER_PAGE}>
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="newsletter" className="mt-6">
            <NewsletterManagement />
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Full information from the customer inquiry.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Name</label>
                  <p className="text-foreground">{selectedRequest.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                  <p className="text-foreground">{selectedRequest.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Email</label>
                  <p className="text-foreground">{selectedRequest.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Date</label>
                  <p className="text-foreground">
                    {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Message</label>
                <div className="mt-1 p-3 bg-muted rounded-md text-foreground whitespace-pre-wrap">
                  {selectedRequest.message}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                {!selectedRequest.contacted && (
                  <Button
                    onClick={() => {
                      handleMarkContacted(selectedRequest.id!);
                      setSelectedRequest(null);
                    }}
                  >
                    Mark Contacted
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminRequests;

