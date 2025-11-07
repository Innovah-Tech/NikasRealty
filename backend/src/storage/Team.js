// In-memory storage
let team = [];
let nextId = 1;

export default {
  async find(query = {}) {
    return [...team];
  },

  async findById(id) {
    const member = team.find(t => t._id.toString() === id.toString());
    return member ? { ...member } : null;
  },

  async create(data) {
    const member = {
      _id: nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    team.push(member);
    return { ...member };
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const index = team.findIndex(t => t._id.toString() === id.toString());
    if (index === -1) return null;
    
    const updated = {
      ...team[index],
      ...update,
      updatedAt: new Date(),
    };
    team[index] = updated;
    return { ...updated };
  },

  async findByIdAndDelete(id) {
    const index = team.findIndex(t => t._id.toString() === id.toString());
    if (index === -1) return null;
    return team.splice(index, 1)[0];
  },
};

