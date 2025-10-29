import { useEffect, useState } from 'react';
import { createProperty, deleteProperty, listProperties, updateProperty } from '../lib/api';

type Property = {
  _id?: string;
  title: string;
  type: string;
  price: number;
  location: string;
};

const emptyForm: Property = { title: '', type: 'Apartment', price: 0, location: '' };

const Properties = () => {
  const [items, setItems] = useState<Property[]>([]);
  const [form, setForm] = useState<Property>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await listProperties();
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProperty(editingId, form);
    } else {
      await createProperty(form);
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const edit = (p: Property) => {
    setForm({ title: p.title, type: p.type, price: p.price, location: p.location });
    setEditingId(p._id || null);
  };

  const remove = async (id?: string) => {
    if (!id) return;
    await deleteProperty(id);
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Properties</h2>
      <form onSubmit={save} style={{ display: 'grid', gap: 8, maxWidth: 420, margin: '12px 0' }}>
        <input placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Type" value={form.type} onChange={e=>setForm({ ...form, type: e.target.value })} required />
        <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({ ...form, price: Number(e.target.value) })} required />
        <input placeholder="Location" value={form.location} onChange={e=>setForm({ ...form, location: e.target.value })} required />
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
      </form>
      <table cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Title</th><th>Type</th><th>Price</th><th>Location</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>{p.type}</td>
              <td>{p.price}</td>
              <td>{p.location}</td>
              <td>
                <button onClick={()=>edit(p)}>Edit</button>
                <button onClick={()=>remove(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Properties;


