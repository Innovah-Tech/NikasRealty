// In-memory storage
let services = [];
let nextId = 1;

export default {
  async find(query = {}) {
    return [...services];
  },

  async findById(id) {
    const service = services.find(s => s._id.toString() === id.toString());
    return service ? { ...service } : null;
  },

  async create(data) {
    const service = {
      _id: nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    services.push(service);
    return { ...service };
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const index = services.findIndex(s => s._id.toString() === id.toString());
    if (index === -1) return null;
    
    const updated = {
      ...services[index],
      ...update,
      updatedAt: new Date(),
    };
    services[index] = updated;
    return { ...updated };
  },

  async findByIdAndDelete(id) {
    const index = services.findIndex(s => s._id.toString() === id.toString());
    if (index === -1) return null;
    return services.splice(index, 1)[0];
  },
};

