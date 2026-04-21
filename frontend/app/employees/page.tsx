'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { getEmployees, addEmployee, addCertification, deleteEmployee } from '@/lib/api';

const CERT_TYPES = [
  'Food Handler Certificate',
  'Food Safety Manager',
  'Alcohol Service Training',
  'First Aid / CPR',
  'Fire Safety Training',
  'Health & Safety',
  'Other',
];

const getDaysLeft = (date: string) =>
  Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);

const getStatusColor = (date: string) => {
  const days = getDaysLeft(date);
  if (days < 0) return 'text-red-400 bg-red-400/10 border-red-400/20';
  if (days <= 30) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  return 'text-green-400 bg-green-400/10 border-green-400/20';
};

const getStatusLabel = (date: string) => {
  const days = getDaysLeft(date);
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today!';
  return `${days}d left`;
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [showAddCert, setShowAddCert] = useState<string | null>(null);
  const [empForm, setEmpForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [certForm, setCertForm] = useState({ name: '', issuedDate: '', expiryDate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    setLoading(true);
    try {
      const data = await getEmployees(token);
      setEmployees(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!empForm.name) return;
    setSaving(true);
    const token = getToken()!;
    await addEmployee(empForm, token);
    await loadEmployees();
    setShowAddEmp(false);
    setEmpForm({ name: '', email: '', phone: '', role: '' });
    setSaving(false);
  };

  const handleAddCert = async () => {
    if (!certForm.name || !certForm.expiryDate || !showAddCert) return;
    setSaving(true);
    const token = getToken()!;
    await addCertification(showAddCert, certForm, token);
    await loadEmployees();
    setShowAddCert(null);
    setCertForm({ name: '', issuedDate: '', expiryDate: '' });
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const token = getToken()!;
    await deleteEmployee(id, token);
    setEmployees(e => e.filter(emp => emp._id !== id));
  };

  // Stats
  const totalCerts = employees.reduce((acc, e) => acc + e.certifications.length, 0);
  const expiringSoon = employees.reduce((acc, e) =>
    acc + e.certifications.filter((c: any) =>
      getDaysLeft(c.expiryDate) <= 30 && getDaysLeft(c.expiryDate) > 0
    ).length, 0);
  const expired = employees.reduce((acc, e) =>
    acc + e.certifications.filter((c: any) => getDaysLeft(c.expiryDate) < 0).length, 0);

  return (
    <div className="min-h-screen bg-[#060610] text-white p-6 lg:p-10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute w-96 h-96 rounded-full bg-indigo-600/10 -top-20 -right-20 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push('/dashboard')}
              className="text-xs text-white/30 hover:text-white/60 mb-2 flex items-center gap-1 transition-all">
              ← Back to dashboard
            </button>
            <h1 className="text-2xl font-black text-white tracking-tight">Employee certificates</h1>
            <p className="text-white/40 text-sm mt-1">Track certifications for all your team members</p>
          </div>
          <button onClick={() => setShowAddEmp(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all">
            + Add employee
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { val: employees.length, label: 'Total employees', color: 'text-white' },
            { val: totalCerts, label: 'Total certs', color: 'text-indigo-400' },
            { val: expiringSoon, label: 'Expiring soon', color: 'text-yellow-400' },
            { val: expired, label: 'Expired', color: 'text-red-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.val}</div>
              <div className="text-xs text-white/35 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Employees */}
        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-white/40 text-sm mb-4">No employees added yet</p>
            <button onClick={() => setShowAddEmp(true)}
              className="px-6 py-2.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-sm rounded-xl hover:bg-indigo-500/20 transition-all">
              Add your first employee
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {employees.map(emp => (
              <div key={emp._id}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all group">

                {/* Employee header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                      {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{emp.name}</p>
                      <p className="text-xs text-white/35">{emp.role || 'Staff'} {emp.email && `· ${emp.email}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setShowAddCert(emp._id)}
                      className="text-xs text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 rounded-lg px-2.5 py-1.5 hover:bg-indigo-400/15 transition-all">
                      + Cert
                    </button>
                    <button onClick={() => handleDelete(emp._id)}
                      className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-2.5 py-1.5 hover:bg-red-400/15 transition-all">
                      Remove
                    </button>
                  </div>
                </div>

                {/* Certifications */}
                {emp.certifications.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-xl p-4 text-center">
                    <p className="text-xs text-white/25">No certifications yet</p>
                    <button onClick={() => setShowAddCert(emp._id)}
                      className="text-xs text-indigo-400 mt-2 hover:underline">
                      Add certification
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {emp.certifications.map((cert: any, i: number) => (
                      <div key={i}
                        className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-white font-medium">{cert.name}</p>
                            <p className="text-[10px] text-white/30 mt-0.5">
                              Expires {new Date(cert.expiryDate).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] rounded-full px-2.5 py-1 border font-medium ${getStatusColor(cert.expiryDate)}`}>
                          {getStatusLabel(cert.expiryDate)}
                        </span>
                      </div>
                    ))}
                    <button onClick={() => setShowAddCert(emp._id)}
                      className="w-full py-2 border border-dashed border-white/10 rounded-xl text-[10px] text-white/25 hover:border-indigo-500/30 hover:text-indigo-400/60 transition-all">
                      + Add another certification
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddEmp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Add employee</h2>
                <button onClick={() => setShowAddEmp(false)}
                  className="text-white/30 hover:text-white text-xl transition-colors">×</button>
              </div>

              {[
                { label: 'Full name *', key: 'name', placeholder: 'Jane Smith', type: 'text' },
                { label: 'Email', key: 'email', placeholder: 'jane@restaurant.com', type: 'email' },
                { label: 'Phone', key: 'phone', placeholder: '+1 555 000 0000', type: 'tel' },
                { label: 'Role / Position', key: 'role', placeholder: 'Head Chef', type: 'text' },
              ].map(f => (
                <div key={f.key} className="mb-3">
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={(empForm as any)[f.key]}
                    onChange={e => setEmpForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
              ))}

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAddEmp(false)}
                  className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={handleAddEmployee} disabled={!empForm.name || saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Saving...
                    </>
                  ) : 'Add employee'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Certification Modal */}
        {showAddCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Add certification</h2>
                <button onClick={() => setShowAddCert(null)}
                  className="text-white/30 hover:text-white text-xl transition-colors">×</button>
              </div>

              <div className="mb-3">
                <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Certification type *</label>
                <select value={certForm.name}
                  onChange={e => setCertForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all">
                  <option value="" className="bg-[#0d0d1a]">Select certification</option>
                  {CERT_TYPES.map(c => (
                    <option key={c} value={c} className="bg-[#0d0d1a]">{c}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Issue date</label>
                <input type="date" value={certForm.issuedDate}
                  onChange={e => setCertForm(p => ({ ...p, issuedDate: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>

              <div className="mb-5">
                <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Expiry date *</label>
                <input type="date" value={certForm.expiryDate}
                  onChange={e => setCertForm(p => ({ ...p, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowAddCert(null)}
                  className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={handleAddCert}
                  disabled={!certForm.name || !certForm.expiryDate || saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Saving...
                    </>
                  ) : 'Add certification'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}