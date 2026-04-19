import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import {
  LogOut,
  Save,
  IndianRupee,
  Dumbbell,
  LayoutDashboard,
  Plus,
  Trash2,
  Pencil,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

const DURATIONS = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'half_yearly', label: 'Half-Yearly' },
  { key: 'yearly', label: 'Yearly' },
];

// -- Pricing Editor --
function PricingEditor({ plans, onSave }) {
  const [editing, setEditing] = useState(false);
  const [localPlans, setLocalPlans] = useState(plans);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocalPlans(plans); }, [plans]);

  const updatePlan = (index, field, value) => {
    const updated = [...localPlans];
    updated[index] = { ...updated[index], [field]: field === 'badge' ? value : (parseInt(value) || 0) };
    setLocalPlans(updated);
  };

  const updateBadge = (index, value) => {
    const updated = [...localPlans];
    updated[index] = { ...updated[index], badge: value || null };
    setLocalPlans(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = localPlans.map(p => ({
        name: p.name,
        monthly: parseInt(p.monthly) || 0,
        quarterly: parseInt(p.quarterly) || 0,
        half_yearly: parseInt(p.half_yearly) || 0,
        yearly: parseInt(p.yearly) || 0,
        badge: p.badge || null,
      }));
      await onSave(payload);
      toast.success('Pricing updated successfully');
      setEditing(false);
    } catch {
      toast.error('Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-white/5" data-testid="pricing-editor">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-heading text-lg uppercase text-white flex items-center gap-2">
          <IndianRupee size={18} className="text-[#E6FF00]" /> Membership Pricing
        </h3>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                data-testid="cancel-pricing-button"
                onClick={() => { setLocalPlans(plans); setEditing(false); }}
                className="text-zinc-400 text-xs uppercase tracking-wider px-3 py-1.5 border border-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                data-testid="save-pricing-button"
                onClick={handleSave}
                disabled={saving}
                className="bg-[#E6FF00] text-black font-bold text-xs uppercase tracking-wider px-4 py-1.5 flex items-center gap-1 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              data-testid="edit-pricing-button"
              onClick={() => setEditing(true)}
              className="bg-[#E6FF00] text-black font-bold text-xs uppercase tracking-wider px-4 py-1.5 flex items-center gap-1 hover:-translate-y-0.5 transition-all"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm" data-testid="pricing-table-admin">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-[#E6FF00]">Package</th>
              {DURATIONS.map(d => (
                <th key={d.key} className="text-center py-3 px-3 text-xs uppercase tracking-wider text-[#E6FF00]">{d.label}</th>
              ))}
              {editing && <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-zinc-500">Badge</th>}
            </tr>
          </thead>
          <tbody>
            {localPlans.map((plan, i) => (
              <tr key={plan.name} className="border-b border-white/5 hover:bg-white/[0.02]" data-testid={`pricing-row-admin-${i}`}>
                <td className="py-3 px-3">
                  <div>
                    <span className="text-white font-medium">{plan.name}</span>
                    {!editing && plan.badge && (
                      <span className="block text-[10px] text-[#E6FF00] uppercase tracking-wider mt-0.5">{plan.badge}</span>
                    )}
                  </div>
                </td>
                {DURATIONS.map(d => (
                  <td key={d.key} className="py-3 px-3 text-center">
                    {editing ? (
                      <input
                        type="number"
                        data-testid={`price-${plan.name.toLowerCase().replace(/\s+/g, '-')}-${d.key}`}
                        value={plan[d.key]}
                        onChange={(e) => updatePlan(i, d.key, e.target.value)}
                        className="w-24 bg-[#0A0A0A] border border-white/10 px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-[#E6FF00] transition-colors"
                      />
                    ) : (
                      <span className="text-white">&#8377; {parseInt(plan[d.key]).toLocaleString('en-IN')}/-</span>
                    )}
                  </td>
                ))}
                {editing && (
                  <td className="py-3 px-3 text-center">
                    <input
                      type="text"
                      value={plan.badge || ''}
                      onChange={(e) => updateBadge(i, e.target.value)}
                      placeholder="e.g. Best Price"
                      className="w-24 bg-[#0A0A0A] border border-white/10 px-2 py-1.5 text-white text-xs text-center focus:outline-none focus:border-[#E6FF00] transition-colors"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -- Programs Editor --
function ProgramsEditor({ programs, onSave }) {
  const [editing, setEditing] = useState(false);
  const [localPrograms, setLocalPrograms] = useState(programs);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocalPrograms(programs); }, [programs]);

  const updateProgram = (index, field, value) => {
    const updated = [...localPrograms];
    updated[index] = { ...updated[index], [field]: value };
    setLocalPrograms(updated);
  };

  const addProgram = () => {
    setLocalPrograms([...localPrograms, { name: '', description: '', trainer: '', schedule: '' }]);
  };

  const removeProgram = (index) => {
    setLocalPrograms(localPrograms.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const valid = localPrograms.filter(p => p.name.trim() !== '');
    if (valid.length === 0) {
      toast.error('At least one program is required');
      return;
    }
    setSaving(true);
    try {
      await onSave(valid);
      toast.success('Programs updated successfully');
      setEditing(false);
    } catch {
      toast.error('Failed to update programs');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-white/5" data-testid="programs-editor">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-heading text-lg uppercase text-white flex items-center gap-2">
          <Dumbbell size={18} className="text-[#E6FF00]" /> Programs
        </h3>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                data-testid="cancel-programs-button"
                onClick={() => { setLocalPrograms(programs); setEditing(false); }}
                className="text-zinc-400 text-xs uppercase tracking-wider px-3 py-1.5 border border-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                data-testid="save-programs-button"
                onClick={handleSave}
                disabled={saving}
                className="bg-[#E6FF00] text-black font-bold text-xs uppercase tracking-wider px-4 py-1.5 flex items-center gap-1 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              data-testid="edit-programs-button"
              onClick={() => setEditing(true)}
              className="bg-[#E6FF00] text-black font-bold text-xs uppercase tracking-wider px-4 py-1.5 flex items-center gap-1 hover:-translate-y-0.5 transition-all"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {localPrograms.map((prog, i) => (
          <div
            key={prog.id || i}
            data-testid={`program-card-${i}`}
            className={`bg-[#0A0A0A] border border-white/5 p-5 ${editing ? '' : 'hover:border-white/10'} transition-all`}
          >
            {editing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">Program #{i + 1}</p>
                  <button
                    onClick={() => removeProgram(i)}
                    data-testid={`remove-program-${i}`}
                    className="text-zinc-600 hover:text-[#FF3B30] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">Name</label>
                    <input
                      type="text"
                      data-testid={`program-name-${i}`}
                      value={prog.name}
                      onChange={(e) => updateProgram(i, 'name', e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E6FF00] transition-colors"
                      placeholder="e.g. HIIT"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">Trainer</label>
                    <input
                      type="text"
                      data-testid={`program-trainer-${i}`}
                      value={prog.trainer}
                      onChange={(e) => updateProgram(i, 'trainer', e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E6FF00] transition-colors"
                      placeholder="e.g. Coach Vikram"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">Description</label>
                  <textarea
                    data-testid={`program-desc-${i}`}
                    value={prog.description}
                    onChange={(e) => updateProgram(i, 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E6FF00] transition-colors resize-none"
                    placeholder="Describe this program..."
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">Schedule</label>
                  <input
                    type="text"
                    data-testid={`program-schedule-${i}`}
                    value={prog.schedule}
                    onChange={(e) => updateProgram(i, 'schedule', e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E6FF00] transition-colors"
                    placeholder="e.g. Mon, Wed, Fri - 6:00 AM"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-heading text-xl uppercase text-white">{prog.name}</h4>
                  <p className="text-sm text-zinc-400 mt-1">{prog.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="text-xs text-[#E6FF00] uppercase tracking-wider">{prog.trainer}</span>
                    {prog.schedule && (
                      <span className="text-xs text-zinc-500">{prog.schedule}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {editing && (
          <button
            data-testid="add-program-button"
            onClick={addProgram}
            className="w-full border border-dashed border-white/10 py-3 text-sm text-zinc-500 hover:text-[#E6FF00] hover:border-[#E6FF00]/30 flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={16} /> Add Program
          </button>
        )}

        {!editing && localPrograms.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-8">No programs configured yet. Click Edit to add some.</p>
        )}
      </div>
    </div>
  );
}

// -- Change Password --
function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.current_password || !form.new_password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (form.new_password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.changePassword({ current_password: form.current_password, new_password: form.new_password });
      toast.success('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
      setOpen(false);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to change password';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-white/5" data-testid="change-password-section">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-heading text-lg uppercase text-white flex items-center gap-2">
          <Lock size={18} className="text-[#E6FF00]" /> Account Security
        </h3>
        <button
          data-testid="toggle-change-password"
          onClick={() => setOpen(!open)}
          className="bg-[#E6FF00] text-black font-bold text-xs uppercase tracking-wider px-4 py-1.5 flex items-center gap-1 hover:-translate-y-0.5 transition-all"
        >
          <Lock size={14} /> {open ? 'Cancel' : 'Change Password'}
        </button>
      </div>
      {open && (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-md" data-testid="change-password-form">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                data-testid="current-password-input"
                value={form.current_password}
                onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-white/10 px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:border-[#E6FF00] transition-colors font-mono"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                data-testid="new-password-input"
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-white/10 px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:border-[#E6FF00] transition-colors font-mono"
                placeholder="Enter new password (min 6 chars)"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-600 block mb-1">Confirm New Password</label>
            <input
              type="password"
              data-testid="confirm-password-input"
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E6FF00] transition-colors font-mono"
              placeholder="Re-enter new password"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            data-testid="submit-change-password"
            className="bg-[#E6FF00] text-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 flex items-center gap-1 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Save size={14} /> {saving ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}

// -- MAIN DASHBOARD --
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pricing, setPricing] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [pricingRes, programsRes] = await Promise.all([
        api.getPricing(),
        api.getPrograms(),
      ]);
      setPricing(pricingRes.data);
      setPrograms(programsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSavePricing = async (plans) => {
    await api.updatePricing(plans);
    fetchAll();
  };

  const handleSavePrograms = async (progs) => {
    await api.updatePrograms(progs);
    fetchAll();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-[#E6FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid="admin-dashboard">
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={20} className="text-[#E6FF00]" />
            <h1 className="font-heading text-xl uppercase tracking-tight text-white">
              Admin <span className="text-[#E6FF00]">Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 hidden sm:inline">Welcome, {user?.name || 'Admin'}</span>
            <button
              data-testid="logout-button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-[#FF3B30] transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <PricingEditor plans={pricing} onSave={handleSavePricing} />
        <ProgramsEditor programs={programs} onSave={handleSavePrograms} />
        <ChangePassword />
      </main>
    </div>
  );
}
