import { useEffect, useState } from 'react';
import { createTeam, deleteTeam, listTeam, updateTeam } from '../lib/api';

type Member = { _id?: string; name: string; role: string };
const emptyForm: Member = { name: '', role: '' };

const Team = () => {
  const [items, setItems] = useState<Member[]>([]);
  const [form, setForm] = useState<Member>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await listTeam();
    setItems(data);
  };
  useEffect(()=>{ load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await updateTeam(editingId, form); else await createTeam(form);
    setForm(emptyForm); setEditingId(null); load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Team</h2>
      <form onSubmit={save} style={{ display: 'grid', gap: 8, maxWidth: 420, margin: '12px 0' }}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Role" value={form.role} onChange={e=>setForm({ ...form, role: e.target.value })} required />
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
      </form>
      <ul>
        {items.map(m => (
          <li key={m._id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{m.name} — {m.role}</span>
            <button onClick={()=>{ setForm({ name: m.name, role: m.role }); setEditingId(m._id || null); }}>Edit</button>
            <button onClick={()=>{ if(m._id) deleteTeam(m._id).then(load); }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Team;


