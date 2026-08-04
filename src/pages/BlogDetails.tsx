import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Calendar, User } from "lucide-react";
import { blogsService, type Blog } from "@/services/firestore/blogs";

const BlogDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchBlog = async () => {
      try {
        const data = await blogsService.getById(id);
        setBlog(data);
      } catch (error) {
        console.error("Failed to load blog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <h1 className="text-2xl font-semibold mb-4">Blog post not found</h1>
          <Button variant="outline" onClick={() => navigate("/blog")}>
            Back to Blog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-10">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/blog")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </div>

        {/* Blog Header Image */}
        {blog.image && (
          <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-xl shadow-lg mb-8">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Blog Content */}
        <article className="max-w-4xl mx-auto">
          {/* Title and Meta */}
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{blog.author}</span>
              </div>
              {blog.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Summary */}
            {blog.summary && (
              <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">
                {blog.summary}
              </p>
            )}
          </header>

          {/* Main Content */}
          <div className="space-y-3">
            {blog.content ? (
              <div className="space-y-2">
                {blog.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-xs text-muted-foreground leading-relaxed">
                    {paragraph || "\u00A0"}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {blog.summary}
              </p>
            )}
          </div>

          {/* Back to Blog Button */}
          <div className="mt-12 pt-8 border-t border-border">
            <Button
              variant="outline"
              onClick={() => navigate("/blog")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Posts
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailsPage;

