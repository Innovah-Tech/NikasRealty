import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { blogsService, type Blog } from "@/services/firestore/blogs";

const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Use getPublished() which is specifically for public blog page
        const data = await blogsService.getPublished();
        setPosts(data || []);
        if (import.meta.env.DEV) {
          console.log('Blog page: Fetched published blogs:', data?.length || 0);
          if (data && data.length > 0) {
            console.log('Sample blog:', {
              id: data[0].id,
              title: data[0].title,
              status: data[0].status,
              publishedAt: data[0].publishedAt,
            });
          } else {
            console.warn('No published blogs found. Check if blogs are created with status="published"');
            console.warn('Tip: In admin panel, make sure to set blog status to "Published" for them to appear here');
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch blogs:", error);
        console.error("Error details:", {
          message: error?.message,
          code: error?.code,
          stack: error?.stack
        });
        const friendlyMessage = error?.code === "permission-denied"
          ? "Our latest stories are being refreshed. Please check back soon."
          : "We're unable to load new stories right now. Please try again shortly.";
        setPosts([]);
        setDebugError(error?.message || error?.code || "Unknown error");
        setError(friendlyMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar />
      <section className="py-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Latest Blog</h2>
            <div className="h-1 w-24 mx-auto gradient-gold mb-3" />
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get insights, advice, and stories about buying, selling, and investing in real estate with Nikas Realty.
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-16 text-xs text-muted-foreground">Loading blogs...</div>
          ) : error ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-lg font-semibold text-foreground">Our stories are being refreshed</p>
              <p className="text-xs text-muted-foreground">{error}</p>
              {isDev && debugError && (
                <p className="text-xs text-muted-foreground">
                  Debug details: {debugError}
                </p>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  setError(null);
                  setDebugError(null);
                  setLoading(true);
                  window.location.reload();
                }}
              >
                Refresh
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-16">
              <p className="mb-2">No blog posts available yet.</p>
              <p className="text-xs">Check back soon or contact the administrator.</p>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="flex flex-col h-full overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => post.id && navigate(`/blog/${post.id}`)}
                >
                  {post.image && (
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-xl font-semibold text-primary mb-1 group-hover:text-primary/80 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 mt-auto">
                    <div className="flex items-center text-xs text-muted-foreground gap-4 mb-2">
                      <span>By {post.author}</span>
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        post.id && navigate(`/blog/${post.id}`);
                      }}
                    >
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Blog;
