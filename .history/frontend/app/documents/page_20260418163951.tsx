'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { uploadDocument, getDocuments, deleteDocument } from '@/lib/api';
import { downloadAuditPDF } from '@/lib/api';

const CATEGORIES = [
  { id: 'all', label: 'All documents' },
  { id: 'license', label: 'Licences' },
  { id: 'permit', label: 'Permits' },
  { id: 'certificate', label: 'Certificates' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'general', label: 'General' },
];

const getCategoryIcon = (cat: string) => {
  const icons: any = {
    license: '📋', permit: '🏛️',
    certificate: '🎓', insurance: '🛡️',
    general: '📄', default: '📄'
  };
  return icons[cat] || icons.default;
};

const getStatusColor = (expiryDate?: string) => {
  if (!expiryDate) return 'text-white/40 bg-white/[0.06]';
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'text-red-400 bg-red-400/10';
  if (days <= 30) return 'text-yellow-400 bg-yellow-400/10';
  return 'text-green-400 bg-green-400/10';
};

const getStatusLabel = (expiryDate?: string) => {
  if (!expiryDate) return 'No expiry';
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'Expired';
  if (days <= 30) return `${days}d left`;
  return 'Active';
};

export default function DocumentsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    category: 'general',
    expiryDate: '',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    setLoading(true);
    try {
      const data = await getDocuments(token);
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const token = getToken();
    if (!token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('category', form.category);
      if (form.expiryDate) formData.append('expiryDate', form.expiryDate);
      if (form.notes) formData.append('notes', form.notes);

      await uploadDocument(formData, token);
      await loadDocs();
      setShowUpload(false);
      setSelectedFile(null);
      setForm({ category: 'general', expiryDate: '', notes: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    await deleteDocument(id, token);
    setDocs(d => d.filter(doc => doc._id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) { setSelectedFile(file); setShowUpload(true); }
  };

  const filtered = activeTab === 'all'
    ? docs
    : docs.filter(d => d.category === activeTab);

  const formatSize = (bytes: number) => {
    if (!bytes) return '—';
    return bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        

<button onClick={async () => {
  const token = getToken();
  if (token) await downloadAuditPDF(token);
}}
  className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/10 text-white/60 text-sm font-semibold rounded-xl hover:bg-white/[0.08] hover:text-white transition-all">
  📤 Export audit PDF
</button>
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push('/dashboard')}
              className="text-xs text-white/30 hover:text-white/60 mb-2 flex items-center gap-1 transition-all">
              ← Back to dashboard
            </button>
            <h1 className="text-2xl font-black text-white tracking-tight">Document vault</h1>
            <p className="text-white/40 text-sm mt-1">
              {docs.length} documents · Audit-ready at any time
            </p>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all">
            <span className="text-lg leading-none">+</span>
            Upload document
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          {[
            { val: docs.length, label: 'Total docs', color: 'text-white' },
            { val: docs.filter(d => d.expiryDate && Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / 86400000) > 30).length, label: 'Active', color: 'text-green-400' },
            { val: docs.filter(d => d.expiryDate && Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / 86400000) <= 30 && Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / 86400000) > 0).length, label: 'Expiring soon', color: 'text-yellow-400' },
            { val: docs.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date()).length, label: 'Expired', color: 'text-red-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
              <div className={`text-2xl font-black tracking-tight ${s.color}`}>{s.val}</div>
              <div className="text-xs text-white/35 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === cat.id
                  ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
                  : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/60'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Drop zone / Doc grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-indigo-500/60 bg-indigo-500/[0.08]'
                : 'border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/[0.04]'
            }`}
            onClick={() => setShowUpload(true)}>
            <div className="text-4xl mb-4">📁</div>
            <p className="text-white/50 text-sm font-medium mb-1">Drop files here or click to upload</p>
            <p className="text-white/25 text-xs">PDF, JPG, PNG up to 10MB</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(doc => (
              <div key={doc._id}
                className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 hover:border-indigo-500/20 hover:bg-indigo-500/[0.04] transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-2xl">
                    {getCategoryIcon(doc.category)}
                  </div>
                  <span className={`text-[10px] rounded-full px-2.5 py-1 font-medium ${getStatusColor(doc.expiryDate)}`}>
                    {getStatusLabel(doc.expiryDate)}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mb-1 truncate">
                  {doc.originalName}
                </h3>
                <p className="text-xs text-white/35 mb-3 capitalize">{doc.category}</p>

                <div className="space-y-1.5 text-xs text-white/30 mb-4">
                  {doc.expiryDate && (
                    <div className="flex justify-between">
                      <span>Expires</span>
                      <span className="text-white/50">
                        {new Date(doc.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Size</span>
                    <span className="text-white/50">{formatSize(doc.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded</span>
                    <span className="text-white/50">
                      {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2 text-xs text-center text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 rounded-lg hover:bg-indigo-400/15 transition-all">
                    View
                  </a>
                  <button onClick={() => handleDelete(doc._id)}
                    className="flex-1 py-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/15 transition-all opacity-0 group-hover:opacity-100">
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Upload card */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => setShowUpload(true)}
              className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[200px] ${
                dragOver
                  ? 'border-indigo-500/60 bg-indigo-500/[0.08]'
                  : 'border-white/[0.08] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04]'
              }`}>
              <div className="text-3xl mb-2 text-white/30">+</div>
              <p className="text-xs text-white/30 text-center">Upload new document</p>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#13131f] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Upload document</h2>
                <button onClick={() => { setShowUpload(false); setSelectedFile(null); }}
                  className="text-white/30 hover:text-white text-xl transition-colors">×</button>
              </div>

              {/* File picker */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
                  selectedFile
                    ? 'border-indigo-500/40 bg-indigo-500/[0.08]'
                    : 'border-white/10 hover:border-indigo-500/30'
                }`}>
                <input ref={fileRef} type="file"
                  accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />
                {selectedFile ? (
                  <>
                    <div className="text-2xl mb-2">📄</div>
                    <p className="text-sm text-indigo-400 font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-white/30 mt-1">{formatSize(selectedFile.size)}</p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-2 text-white/30">📁</div>
                    <p className="text-sm text-white/50">Click to select file</p>
                    <p className="text-xs text-white/25 mt-1">PDF, JPG, PNG — max 10MB</p>
                  </>
                )}
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Category</label>
                <select value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all">
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id} className="bg-[#13131f]">{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Expiry */}
              <div className="mb-3">
                <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Expiry date (optional)</label>
                <input type="date" value={form.expiryDate}
                  onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1.5">Notes (optional)</label>
                <textarea value={form.notes} rows={2}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any notes about this document..."
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowUpload(false); setSelectedFile(null); }}
                  className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Uploading...
                    </>
                  ) : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}