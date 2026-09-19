import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Ban, Unlock, Search } from 'lucide-react';
import { ipBlockApi } from '../../services/contentApi';
import {
  PageHeader, Card, Btn, Spinner, EmptyState, ErrorBanner,
  Th, Td, Field, TextInput, ConfirmDelete,
} from '../ui';

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function IpBlocking() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ip: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 50 };
      if (q) params.q = q;
      const res = await ipBlockApi.list(params);
      setItems(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      setError(err.message || 'Could not load blocked IPs');
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  const handleBlock = async (e) => {
    e.preventDefault();
    if (!form.ip.trim()) {
      setFormError('Please enter an IP address.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await ipBlockApi.block({ ip: form.ip.trim(), reason: form.reason.trim() || null });
      setFormOpen(false);
      setForm({ ip: '', reason: '' });
      setPage(1);
      load();
    } catch (err) {
      setFormError(err.message || 'Could not block IP');
    } finally {
      setSaving(false);
    }
  };

  const confirmUnblock = async () => {
    setDeleting(true);
    try {
      await ipBlockApi.remove(deleteTarget.id);
      setItems((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Unblock failed');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <div>
      <PageHeader
        title="IP Blocking"
        subtitle={`${total} blocked IP${total === 1 ? '' : 's'}`}
        actions={
          <>
            <Btn variant="secondary" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn>
            <Btn onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" /> Block IP</Btn>
          </>
        }
      />

      <Card className="p-4 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7A9A]" />
          <TextInput
            className="!pl-9"
            placeholder="Search IP or reason..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState message="No blocked IPs found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-[#EDF7FC]">
                <tr>
                  <Th>IP Address</Th>
                  <Th>Reason</Th>
                  <Th>Blocked By</Th>
                  <Th>Blocked At</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B8D8EE]">
                {items.map((b) => (
                  <tr key={b.id} className="hover:bg-[#EDF7FC]">
                    <Td>
                      <span className="font-mono text-xs px-2 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                        <Ban className="w-3 h-3 inline mr-1" />{b.ip}
                      </span>
                    </Td>
                    <Td className="text-[#5A7A9A]">{b.reason || '—'}</Td>
                    <Td>{b.createdBy?.name || '—'}</Td>
                    <Td className="text-xs text-[#5A7A9A]">{fmtDate(b.createdAt)}</Td>
                    <Td className="text-right">
                      <Btn variant="ghost" className="!px-2 !py-1 text-rose-500" onClick={() => setDeleteTarget(b)}>
                        <Unlock className="w-4 h-4" />
                      </Btn>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#B8D8EE]">
            <span className="text-xs text-[#5A7A9A]">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Btn variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Btn>
              <Btn variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Btn>
            </div>
          </div>
        )}
      </Card>

      {/* Block IP modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setFormOpen(false)}>
          <div className="bg-white border border-[#B8D8EE] rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-display text-[#0A2255] mb-4">Block IP Address</h3>
            <form onSubmit={handleBlock} className="space-y-4">
              {formError && <ErrorBanner message={formError} />}
              <Field label="IP Address">
                <TextInput
                  required
                  placeholder="e.g. 203.0.113.25"
                  value={form.ip}
                  onChange={(e) => setForm({ ...form, ip: e.target.value })}
                />
              </Field>
              <Field label="Reason (optional)">
                <TextInput
                  placeholder="e.g. Repeated spam bookings"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <Btn type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>{saving ? 'Blocking...' : 'Block IP'}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDelete
        open={!!deleteTarget}
        title={`Unblock ${deleteTarget?.ip || 'this IP'}?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmUnblock}
        busy={deleting}
      />
    </div>
  );
}