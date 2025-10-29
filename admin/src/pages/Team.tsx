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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Team</h2>
        <p className="text-sm text-gray-500">Manage your team members</p>
      </div>
      <form onSubmit={save} className="card p-4 grid gap-3 max-w-md">
        <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Role" value={form.role} onChange={e=>setForm({ ...form, role: e.target.value })} required />
        <button className="btn btn-primary w-full md:w-auto" type="submit">{editingId ? 'Update' : 'Create'}</button>
      </form>
      <div className="card">
        <ul className="divide-y divide-gray-200">
          {items.map(m => (
            <li key={m._id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm"><span className="font-medium">{m.name}</span> — {m.role}</span>
              <div className="space-x-2">
                <button className="btn border border-gray-300" onClick={()=>{ setForm({ name: m.name, role: m.role }); setEditingId(m._id || null); }}>Edit</button>
                <button className="btn border border-red-200 text-red-600 hover:bg-red-50" onClick={()=>{ if(m._id) deleteTeam(m._id).then(load); }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Team;


