import bcrypt from 'bcrypt';

// In-memory storage
let users = [];
let nextId = 1;

export default {
  async findOne(query) {
    const user = users.find(u => {
      if (query.email) return u.email === query.email;
      if (query._id) return u._id === query._id;
      return false;
    });
    return user ? { ...user } : null;
  },

  async findById(id) {
    const user = users.find(u => u._id === id || u._id.toString() === id);
    return user ? { ...user } : null;
  },

  async create(data) {
    const user = {
      _id: nextId++,
      email: data.email,
      password: data.password,
      role: data.role || 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    return { ...user };
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const index = users.findIndex(u => u._id.toString() === id.toString());
    if (index === -1) return null;
    
    const updated = {
      ...users[index],
      ...update,
      updatedAt: new Date(),
    };
    users[index] = updated;
    return { ...updated };
  },

  async findByIdAndDelete(id) {
    const index = users.findIndex(u => u._id.toString() === id.toString());
    if (index === -1) return null;
    return users.splice(index, 1)[0];
  },
};

