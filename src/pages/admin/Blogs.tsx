import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { blogsService, type Blog } from "@/services/firestore/blogs";

const AdminBlogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogsService.getAll({
        search,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setBlogs(data);
    } catch (error) {
      toast.error("Failed to fetch blogs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBlogs();
  };

  const handleDelete = async (id: string) => {
    try {
      await blogsService.delete(id);
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to delete blog");
      console.error(error);
    }
    setDeleteDialogOpen(false);
    setBlogToDelete(null);
  };

  const handleToggleStatus = async (blog: Blog) => {
    try {
      const newStatus = blog.status === "published" ? "draft" : "published";
      await blogsService.update(blog.id!, { status: newStatus });
      toast.success(`Blog ${newStatus === "published" ? "published" : "unpublished"}`);
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to update blog status");
      console.error(error);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      blog.title?.toLowerCase().includes(searchLower) ||
      blog.summary?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
            <p className="text-muted-foreground">Manage your blog content</p>
          </div>
          <Button onClick={() => navigate("/admin/add-blog")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Blog Post
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search blogs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Blogs List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="mb-4 h-20 w-full rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No blogs found</h3>
                <p className="mb-4 text-muted-foreground">
                  {search || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by creating your first blog post"}
                </p>
                {!search && statusFilter === "all" && (
                  <Button onClick={() => navigate("/admin/add-blog")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Blog Post
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <Card key={blog.id} className="flex flex-col">
                {blog.image && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
                    <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                      {blog.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{blog.summary}</p>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>By {blog.author}</span>
                    <span>
                      {blog.createdAt instanceof Date
                        ? blog.createdAt.toLocaleDateString()
                        : blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => blog.id && navigate(`/admin/edit-blog/${blog.id}`)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleStatus(blog)}>
                      {blog.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!blog.id) return;
                        setBlogToDelete(blog.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blogToDelete && handleDelete(blogToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminBlogs;

