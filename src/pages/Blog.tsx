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

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Use getPublished() which is specifically for public blog page
        const data = await blogsService.getPublished();
        setPosts(data);
        if (import.meta.env.DEV) {
          console.log('Blog page: Fetched published blogs:', data.length);
          if (data.length > 0) {
            console.log('Sample blog:', {
              id: data[0].id,
              title: data[0].title,
              status: data[0].status,
              publishedAt: data[0].publishedAt,
            });
          } else {
            console.warn('No published blogs found. Check if blogs are created with status="published"');
          }
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        // Show error to user
        setPosts([]);
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
            <h2 className="text-5xl font-bold text-foreground mb-3">Latest Blog</h2>
            <div className="h-1 w-24 mx-auto gradient-gold mb-3" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get insights, advice, and stories about buying, selling, and investing in real estate with Nikas Realty.
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-16 text-muted-foreground">Loading blogs...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              No blog posts available yet. Check back soon!
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
                    <CardTitle className="text-2xl text-primary mb-1 group-hover:text-primary/80 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mb-3 line-clamp-3">
                      {post.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 mt-auto">
                    <div className="flex items-center text-sm text-muted-foreground gap-4 mb-2">
                      <span>By {post.author}</span>
                      <span className="text-xs">
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
