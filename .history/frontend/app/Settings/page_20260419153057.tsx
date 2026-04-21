'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, removeToken } from '@/lib/auth';
import { getMe, updateProfile, changePassword, getBusiness, updateBusiness } from '@/lib/api';

const TABS = ['Profile', 'Business', 'Security', 'Notifications', 'Billing'];

const US_STATES = [
  'California', 'Texas', 'New York', 'Florida', 'Illinois',
  'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan',
];

const BUSINESS_TYPES = [
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'clinic', label: 'Clinic' },
  { id: 'retail', label: 'Retail store' },
  { id: 'construction', label: 'Construction' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Profile');
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [businessForm, setBusinessForm] = useState({
    name: '', type: '', state: '', city: '',
    employees: '1', hasAlcohol: false, hasDelivery: false,
  });
  const [notifForm, setNotifForm] = useState({
    emailAlerts: true, smsAlerts: false,
    alert90: true, alert60: true, alert30: true,
    alert14: true, alert7: true, alert1: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    try {
      const [userData, bizData] = await Promise.all([
        getMe(token), getBusiness(token)
      ]);
      setUser(userData);
      setBusiness(bizData);
      setProfileForm({ name: userData.name || '', email: userData.email || '' });
      if (bizData) {
        setBusinessForm({
          name: bizData.name || '',
          type: bizData.type || '',
          state: bizData.state || '',
          city: bizData.city || '',
          employees: String(bizData.employees || 1),
          hasAlcohol: bizData.hasAlcohol || false,
          hasDelivery: bizData.hasDelivery || false,
        });
      }
    } catch (err) { console.error(err); }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setSuccess('');
    setTimeout(() => setError(''), 3000);
  };

  const handleProfileSave = async () => {
    setSaving(true);
    const token = getToken()!;
    const data = await updateProfile(profileForm, token);
    if (data.email) showSuccess('Profile updated successfully!');
    else showError(data.message || 'Failed to update profile');
    setSaving(false);
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    const token = getToken()!;
    const data = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    }, token);
    if (data.message === 'Password updated successfully') {
      showSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showError(data.message || 'Failed to change password');
    }
    setSaving(false);
  };

  const handleBusinessSave = async () => {
    setSaving(true);
    const token = getToken()!;
    const data = await updateBusiness(businessForm, token);
    if (data._id) showSuccess('Business info updated!');
    else showError(data.message || 'Failed to update business');
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.06] transition-all";
  const labelClass = "text-[11px] text-white/40 uppercase tracking-wider block mb-1.5";

  return (
    <div className="min-h-screen bg-[#060610] text-white relative overflow-hidden">

      {/* Background */}
      <div className="absolute w-96 h-96 rounded-full bg-indigo-600/10 -top-20 -right-20 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />

      <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push('/dashboard')}
            className="text-xs text-white/30 hover:text-white/60 mb-3 flex items-center gap-1 transition-all">
            ← Back to dashboard
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-white/40 text-sm mt-1">Manage your account and business preferences</p>
        </div>

        {/* Success / Error */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#4ade80" strokeWidth="1.5"/>
              <path d="M4.5 7l2 2 3-3" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-6">

          {/* Sidebar Tabs */}
          <div className="w-48 flex-shrink-0">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-2">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 last:mb-0 ${
                    activeTab === tab
                      ? 'bg-indigo-500/15 border border-indigo-500/20 text-white'
                      : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
                  }`}>
                  {tab}
                </button>
              ))}

              <div className="border-t border-white/[0.06] mt-3 pt-3">
                <button onClick={() => { removeToken(); router.push('/login'); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-all">
                  Sign out
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">

            {/* PROFILE TAB */}
            {activeTab === 'Profile' && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Personal information</h2>
                <p className="text-xs text-white/35 mb-6">Update your name and email address</p>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.06]">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
                    {profileForm.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{profileForm.name || 'Your Name'}</p>
                    <p className="text-xs text-white/35 mt-0.5">{profileForm.email}</p>
                    <button className="text-[11px] text-indigo-400 mt-2 hover:underline">
                      Change avatar
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Full name</label>
                    <input type="text" placeholder="Jane Smith"
                      className={inputClass} value={profileForm.name}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Email address</label>
                    <input type="email" placeholder="jane@restaurant.com"
                      className={inputClass} value={profileForm.email}
                      onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>

                <button onClick={handleProfileSave} disabled={saving}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save changes'}
                </button>
              </div>
            )}

            {/* BUSINESS TAB */}
            {activeTab === 'Business' && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Business information</h2>
                <p className="text-xs text-white/35 mb-6">Update your business details to keep your compliance checklist accurate</p>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Business name</label>
                    <input type="text" placeholder="Jane's Diner"
                      className={inputClass} value={businessForm.name}
                      onChange={e => setBusinessForm(p => ({ ...p, name: e.target.value }))} />
                  </div>

                  <div>
                    <label className={labelClass}>Business type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {BUSINESS_TYPES.map(t => (
                        <button key={t.id} onClick={() => setBusinessForm(p => ({ ...p, type: t.id }))}
                          className={`py-2.5 px-4 rounded-xl text-sm border transition-all text-left ${
                            businessForm.type === t.id
                              ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-400'
                              : 'border-white/10 bg-white/[0.04] text-white/40 hover:border-white/20'
                          }`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>State</label>
                      <select value={businessForm.state}
                        onChange={e => setBusinessForm(p => ({ ...p, state: e.target.value }))}
                        className={inputClass}>
                        <option value="" className="bg-[#060610]">Select state</option>
                        {US_STATES.map(s => (
                          <option key={s} value={s} className="bg-[#060610]">{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>City</label>
                      <input type="text" placeholder="Los Angeles"
                        className={inputClass} value={businessForm.city}
                        onChange={e => setBusinessForm(p => ({ ...p, city: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Number of employees</label>
                    <div className="flex gap-2">
                      {['1', '2–5', '6–15', '16–50', '50+'].map(e => (
                        <button key={e} onClick={() => setBusinessForm(p => ({ ...p, employees: e }))}
                          className={`flex-1 py-2 rounded-lg text-xs border transition-all ${
                            businessForm.employees === e
                              ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-400'
                              : 'border-white/10 bg-white/[0.04] text-white/40 hover:border-white/20'
                          }`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  {[
                    { key: 'hasAlcohol', label: 'Serve alcohol', desc: 'Liquor licence required' },
                    { key: 'hasDelivery', label: 'Offer delivery', desc: 'Food/product delivery service' },
                  ].map(t => (
                    <div key={t.key} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm text-white font-medium">{t.label}</p>
                        <p className="text-xs text-white/35">{t.desc}</p>
                      </div>
                      <button onClick={() => setBusinessForm(p => ({ ...p, [t.key]: !(p as any)[t.key] }))}
                        className={`w-10 h-6 rounded-full border transition-all flex items-center px-0.5 ${
                          (businessForm as any)[t.key]
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500/60'
                            : 'bg-white/[0.06] border-white/10'
                        }`}>
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${(businessForm as any)[t.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleBusinessSave} disabled={saving}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save changes'}
                </button>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'Security' && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Security</h2>
                <p className="text-xs text-white/35 mb-6">Change your password to keep your account secure</p>

                <div className="space-y-4">
                  {[
                    { label: 'Current password', key: 'currentPassword', placeholder: '••••••••' },
                    { label: 'New password', key: 'newPassword', placeholder: 'Min. 8 characters' },
                    { label: 'Confirm new password', key: 'confirmPassword', placeholder: 'Repeat new password' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className={labelClass}>{f.label}</label>
                      <input type="password" placeholder={f.placeholder}
                        className={inputClass}
                        value={(passwordForm as any)[f.key]}
                        onChange={e => setPasswordForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                </div>

                <button onClick={handlePasswordSave} disabled={saving}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Updating...
                    </>
                  ) : 'Update password'}
                </button>

                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white mb-1">Danger zone</h3>
                  <p className="text-xs text-white/35 mb-4">Permanently delete your account and all data</p>
                  <button className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/15 transition-all">
                    Delete account
                  </button>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'Notifications' && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Notification preferences</h2>
                <p className="text-xs text-white/35 mb-6">Control how and when you receive compliance alerts</p>

                <div className="space-y-3 mb-6">
                  {[
                    { key: 'emailAlerts', label: 'Email alerts', desc: 'Receive alerts via email', icon: '📧' },
                    { key: 'smsAlerts', label: 'SMS alerts', desc: 'Receive urgent alerts via SMS', icon: '📱' },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{n.icon}</span>
                        <div>
                          <p className="text-sm text-white font-medium">{n.label}</p>
                          <p className="text-xs text-white/35">{n.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => setNotifForm(p => ({ ...p, [n.key]: !(p as any)[n.key] }))}
                        className={`w-10 h-6 rounded-full border transition-all flex items-center px-0.5 ${
                          (notifForm as any)[n.key]
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500/60'
                            : 'bg-white/[0.06] border-white/10'
                        }`}>
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${(notifForm as any)[n.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Alert timing — notify me before expiry:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'alert90', label: '90 days' },
                      { key: 'alert60', label: '60 days' },
                      { key: 'alert30', label: '30 days' },
                      { key: 'alert14', label: '14 days' },
                      { key: 'alert7', label: '7 days' },
                      { key: 'alert1', label: '1 day' },
                    ].map(a => (
                      <button key={a.key}
                        onClick={() => setNotifForm(p => ({ ...p, [a.key]: !(p as any)[a.key] }))}
                        className={`py-2 rounded-xl text-xs border font-medium transition-all ${
                          (notifForm as any)[a.key]
                            ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-400'
                            : 'border-white/10 bg-white/[0.04] text-white/35'
                        }`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => showSuccess('Notification preferences saved!')}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
                  Save preferences
                </button>
              </div>
            )}

            {/* BILLING TAB */}
            {activeTab === 'Billing' && (
              <div className="space-y-4">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                  <h2 className="text-base font-bold text-white mb-1">Current plan</h2>
                  <p className="text-xs text-white/35 mb-5">Manage your subscription</p>

                  <div className="bg-indigo-500/[0.08] border border-indigo-500/20 rounded-xl p-4 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">Starter plan</p>
                        <p className="text-xs text-white/40 mt-0.5">1 location · 20 compliance items</p>
                      </div>
                      <span className="text-lg font-black text-indigo-400">$29<span className="text-xs font-normal text-white/30">/mo</span></span>
                    </div>
                    <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    </div>
                    <p className="text-[10px] text-white/30 mt-2">8 of 20 compliance items used</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => router.push('/pricing')}
                      className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
                      Upgrade plan
                    </button>
                    <button className="flex-1 py-2.5 border border-white/10 text-white/50 text-sm rounded-xl hover:border-white/20 hover:text-white/70 transition-all">
                      Manage billing
                    </button>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4">Billing history</h3>
                  {[
                    { date: 'Apr 1, 2026', amount: '$29.00', status: 'Paid' },
                    { date: 'Mar 1, 2026', amount: '$29.00', status: 'Paid' },
                    { date: 'Feb 1, 2026', amount: '$29.00', status: 'Paid' },
                  ].map((inv, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="text-xs text-white font-medium">Starter plan</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{inv.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white font-semibold">{inv.amount}</span>
                        <span className="text-[10px] text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">{inv.status}</span>
                        <button className="text-[10px] text-indigo-400 hover:underline">Download</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}