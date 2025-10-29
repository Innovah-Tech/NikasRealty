import { useEffect, useState } from 'react';
import { createProperty, deleteProperty, listProperties, updateProperty, uploadFiles } from '../lib/api';

type Property = {
  _id?: string;
  title: string;
  type: 'Apartment' | 'Studio' | 'Duplex' | 'Triplex' | 'Bungalow' | 'Townhouse' | 'Villa' | 'Maisonette';
  category?: 'Luxury Villas' | 'Luxury Villas & Townhouses' | 'Modern Bungalows' | 'Apartments & Studios';
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  price: number;
  status: 'For Sale' | 'For Rent' | 'Off-plan';
  location: string;
  completionDate?: string;
  completion?: 'Ready' | 'Under Construction' | 'Off-plan';
  deposit?: string;
  paymentPlan?: string;
  description?: string;
  features?: string[];
  images?: string[];
  instagramUrl?: string;
};

const emptyForm: Property = {
  title: '',
  type: 'Apartment',
  category: 'Apartments & Studios',
  bedrooms: undefined,
  bathrooms: undefined,
  sqft: undefined,
  price: 0,
  status: 'For Sale',
  location: '',
  completion: undefined,
  completionDate: '',
  deposit: '',
  paymentPlan: '',
  description: '',
  features: [],
  images: [],
  instagramUrl: ''
};

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
    const payload: Property = {
      ...form,
      // normalize types
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      sqft: form.sqft ? Number(form.sqft) : undefined,
      price: Number(form.price || 0),
      features: form.features || [],
    };
    if (editingId) await updateProperty(editingId, payload);
    else await createProperty(payload);
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
      <form onSubmit={save} style={{ display: 'grid', gap: 8, maxWidth: 720, margin: '12px 0' }}>
        <input placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <select value={form.type} onChange={e=>setForm({ ...form, type: e.target.value as Property['type'] })} required>
            <option value="Apartment">Apartment</option>
            <option value="Studio">Studio</option>
            <option value="Duplex">Duplex</option>
            <option value="Triplex">Triplex</option>
            <option value="Bungalow">Bungalow</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Villa">Villa</option>
            <option value="Maisonette">Maisonette</option>
          </select>
          <select value={form.status} onChange={e=>setForm({ ...form, status: e.target.value as Property['status'] })} required>
            <option value="For Sale">For Sale</option>
            <option value="For Rent">For Rent</option>
            <option value="Off-plan">Off-plan</option>
          </select>
          <select value={form.category} onChange={e=>setForm({ ...form, category: e.target.value as NonNullable<Property['category']> })}>
            <option value="Luxury Villas">Luxury Villas</option>
            <option value="Luxury Villas & Townhouses">Luxury Villas & Townhouses</option>
            <option value="Modern Bungalows">Modern Bungalows</option>
            <option value="Apartments & Studios">Apartments & Studios</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          <input placeholder="Price (KES)" type="number" value={form.price} onChange={e=>setForm({ ...form, price: Number(e.target.value) })} required />
          <input placeholder="Bedrooms" type="number" value={form.bedrooms ?? ''} onChange={e=>setForm({ ...form, bedrooms: e.target.value === '' ? undefined : Number(e.target.value) })} />
          <input placeholder="Bathrooms" type="number" value={form.bathrooms ?? ''} onChange={e=>setForm({ ...form, bathrooms: e.target.value === '' ? undefined : Number(e.target.value) })} />
          <input placeholder="Size (sqft)" type="number" value={form.sqft ?? ''} onChange={e=>setForm({ ...form, sqft: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
        <input placeholder="Location" value={form.location} onChange={e=>setForm({ ...form, location: e.target.value })} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <select value={form.completion ?? ''} onChange={e=>setForm({ ...form, completion: (e.target.value || undefined) as Property['completion'] })}>
            <option value="">Completion status</option>
            <option value="Ready">Ready</option>
            <option value="Under Construction">Under Construction</option>
            <option value="Off-plan">Off-plan</option>
          </select>
          <input placeholder="Completion Date (YYYY-MM-DD)" type="date" value={form.completionDate || ''} onChange={e=>setForm({ ...form, completionDate: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input placeholder="Deposit (e.g., 20%)" value={form.deposit || ''} onChange={e=>setForm({ ...form, deposit: e.target.value })} />
          <input placeholder="Payment Plan" value={form.paymentPlan || ''} onChange={e=>setForm({ ...form, paymentPlan: e.target.value })} />
        </div>
        <textarea placeholder="Description" value={form.description || ''} onChange={e=>setForm({ ...form, description: e.target.value })} />
        <input placeholder="Features (comma-separated)" value={(form.features || []).join(', ')} onChange={e=>setForm({ ...form, features: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
        <input placeholder="Instagram URL (optional)" value={form.instagramUrl || ''} onChange={e=>setForm({ ...form, instagramUrl: e.target.value })} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="file"
            multiple
            onChange={async (e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (!files.length) return;
              const { data } = await uploadFiles(files);
              const urls = (data.files || []).map((f: { url: string }) => f.url);
              setForm(prev => ({ ...prev, images: [ ...(prev.images || []), ...urls ] }));
            }}
          />
          <span>{(form.images || []).length} images</span>
        </div>
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
      </form>
      <table cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Title</th><th>Type</th><th>Status</th><th>Price</th><th>Location</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>{p.type}</td>
              <td>{p.status}</td>
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


