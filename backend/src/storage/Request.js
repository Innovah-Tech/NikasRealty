// In-memory storage for requests
let requests = [];
let nextId = 1;

export default {
  async find(query = {}) {
    let results = [...requests];
    
    // Apply filters if needed
    if (query.status) {
      results = results.filter(r => r.status === query.status);
    }
    
    return results;
  },

  async findById(id) {
    const request = requests.find(r => r._id.toString() === id.toString());
    return request ? { ...request } : null;
  },

  async create(data) {
    const request = {
      _id: nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    requests.push(request);
    return { ...request };
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const index = requests.findIndex(r => r._id.toString() === id.toString());
    if (index === -1) return null;
    
    const updated = {
      ...requests[index],
      ...update,
      updatedAt: new Date(),
    };
    requests[index] = updated;
    return { ...updated };
  },

  async findByIdAndDelete(id) {
    const index = requests.findIndex(r => r._id.toString() === id.toString());
    if (index === -1) return null;
    return requests.splice(index, 1)[0];
  },
};

