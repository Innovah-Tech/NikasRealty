// In-memory storage
let properties = [];
let nextId = 1;

export default {
  async find(query = {}) {
    let results = [...properties];

    // Apply filters
    if (query.type) {
      results = results.filter(p => p.type === query.type);
    }
    if (query.status) {
      results = results.filter(p => p.status === query.status);
    }
    if (query.location) {
      const locationRegex = new RegExp(query.location, 'i');
      results = results.filter(p => locationRegex.test(p.location));
    }
    if (query.category) {
      results = results.filter(p => p.category === query.category);
    }
    if (query.completion) {
      results = results.filter(p => p.completion === query.completion);
    }
    if (query.bedrooms !== undefined) {
      if (typeof query.bedrooms === 'object' && query.bedrooms.$gte !== undefined) {
        results = results.filter(p => p.bedrooms >= query.bedrooms.$gte);
      } else {
        results = results.filter(p => p.bedrooms === query.bedrooms);
      }
    }
    if (query.price) {
      if (query.price.$gte !== undefined) {
        results = results.filter(p => p.price >= query.price.$gte);
      }
      if (query.price.$lte !== undefined) {
        results = results.filter(p => p.price <= query.price.$lte);
      }
    }

    return results;
  },

  async findById(id) {
    const property = properties.find(p => p._id.toString() === id.toString());
    return property ? { ...property } : null;
  },

  async create(data) {
    const property = {
      _id: nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    properties.push(property);
    return { ...property };
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const index = properties.findIndex(p => p._id.toString() === id.toString());
    if (index === -1) return null;
    
    const updated = {
      ...properties[index],
      ...update,
      updatedAt: new Date(),
    };
    properties[index] = updated;
    return { ...updated };
  },

  async findByIdAndDelete(id) {
    const index = properties.findIndex(p => p._id.toString() === id.toString());
    if (index === -1) return null;
    return properties.splice(index, 1)[0];
  },
};

