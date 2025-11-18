// In-memory storage for Blog posts
let blogs = [];
let nextId = 1;

export default {
  async find(query = {}) {
    let results = [...blogs];
    
    // Apply filters
    if (query.title) {
      const titleLower = query.title.toLowerCase();
      results = results.filter(b => b.title.toLowerCase().includes(titleLower));
    }
    if (query.status) {
      results = results.filter(b => b.status === query.status);
    }
    
    // Sort by createdAt descending (newest first)
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return results;
  },

  async findById(id) {
    const blog = blogs.find(b => b._id.toString() === id.toString());
    return blog ? { ...blog } : null;
  },

  async create(data) {
    const blog = {
      _id: nextId++,
      title: data.title,
      summary: data.summary,
      content: data.content || '',
      image: data.image || '',
      author: data.author || 'Admin',
      status: data.status || 'draft', // draft, published
      publishedAt: data.status === 'published' ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    blogs.push(blog);
    return { ...blog };
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const index = blogs.findIndex(b => b._id.toString() === id.toString());
    if (index === -1) return null;
    
    const updated = {
      ...blogs[index],
      ...update,
      updatedAt: new Date(),
    };
    
    // If status changed to published and publishedAt is not set, set it
    if (update.status === 'published' && !updated.publishedAt) {
      updated.publishedAt = new Date();
    }
    
    blogs[index] = updated;
    return { ...updated };
  },

  async findByIdAndDelete(id) {
    const index = blogs.findIndex(b => b._id.toString() === id.toString());
    if (index === -1) return null;
    return blogs.splice(index, 1)[0];
  },

  async count(query = {}) {
    const results = await this.find(query);
    return results.length;
  },
};

