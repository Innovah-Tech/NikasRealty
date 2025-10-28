import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const blogPosts = [
  {
    id: 1,
    title: "Tips for First-Time Homebuyers in Kenya",
    summary: "Discover the key steps and expert advice for purchasing your first home in Kenya's dynamic real estate market.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    author: "Jane Mwangi",
    date: "2024-05-10",
  },
  {
    id: 2,
    title: "Should You Buy or Rent? Pros and Cons Explained",
    summary: "Should you buy or rent a home? We break down the advantages of both to help you make an informed decision.",
    image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=600&q=80",
    author: "Samuel Otieno",
    date: "2024-03-17",
  },
  {
    id: 3,
    title: "Understanding Home Loans: A Beginner’s Guide",
    summary: "Home loans can be complex. Here’s a simple, actionable guide for understanding mortgage basics in Kenya.",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    author: "Susan Kimani",
    date: "2024-01-28",
  },
];

const Blog = () => (
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
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map(post => (
            <Card key={post.id} className="flex flex-col h-full overflow-hidden">
              <img src={post.image} alt={post.title} className="h-48 w-full object-cover" loading="lazy"/>
              <CardHeader className="flex-grow">
                <CardTitle className="text-2xl text-primary mb-1">{post.title}</CardTitle>
                <CardDescription className="text-muted-foreground mb-3">{post.summary}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 mt-auto">
                <div className="flex items-center text-sm text-muted-foreground gap-4 mb-2">
                  <span>By {post.author}</span>
                  <span className="text-xs">{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Blog;
