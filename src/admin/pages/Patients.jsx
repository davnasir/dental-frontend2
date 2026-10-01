import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Eye, Trash2, Pill } from 'lucide-react';
import { patientApi } from '../../services/patientApi';
import {
  PageHeader, Card, Btn, Spinner, EmptyState, ErrorBanner,
  Th, Td, statusBadge, Modal, Field, TextInput, Select, ConfirmDelete,
} from '../ui';

const emptyForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  gender: 'MALE',
  dateOfBirth: '',
  bloodGroup: '',
  address: '',
};

export default function Patients() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');

  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await patientApi.list({ page, limit: 20, q });
      setItems(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      setError(err.message || 'Could not load patients');
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      phone: p.phone || '',
      email: p.email || '',
      gender: p.gender || 'MALE',
      dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : '',
      bloodGroup: p.bloodGroup || '',
      address: p.address || '',
    });
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editId) {
        await patientApi.update(editId, form);
      } else {
        await patientApi.create(form);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err.message || 'Could not save patient');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await patientApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${total} total`}
        actions={
          <>
            <Btn variant="secondary" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn>
            <Btn onClick={openCreate}><Plus className="w-4 h-4" /> New Patient</Btn>
          </>
        }
      />

      <Card className="p-4 mb-4">
        <TextInput
          placeholder="Search by name, phone, or patient ID..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
      </Card>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState message="No patients found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-[#EDF7FC]">
                <tr>
                  <Th>Patient ID</Th>
                  <Th>Name</Th>
                  <Th>Phone</Th>
                  <Th>Gender</Th>
                  <Th>Appointments</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B8D8EE]">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-[#EDF7FC]">
                    <Td className="font-mono text-xs">{p.patientId}</Td>
                    <Td>
                      <div className="font-medium">{p.firstName} {p.lastName}</div>
                      <div className="text-xs text-[#5A7A9A]">{p.email || ''}</div>
                    </Td>
                    <Td>{p.phone}</Td>
                    <Td>{p.gender || '—'}</Td>
                    <Td>{p._count?.appointments ?? '—'}</Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Btn variant="ghost" className="!px-2 !py-1" onClick={() => { setSelected(p); setViewOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Btn>
                        <Btn variant="ghost" className="!px-2 !py-1" onClick={() => openEdit(p)}>
                          <span className="text-xs font-semibold">Edit</span>
                        </Btn>
                        <Btn variant="ghost" className="!px-2 !py-1 text-rose-500" onClick={() => setDeleteTarget(p)}>
                          <Trash2 className="w-4 h-4" />
                        </Btn>
                      </div>
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

      {/* View modal */}
      <Modal open={viewOpen} title="Patient Details" onClose={() => setViewOpen(false)}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#D6E8F7] flex items-center justify-center text-xl font-bold text-[#14357B]">
                {(selected.firstName || '?')[0]}
              </div>
              <div>
                <h4 className="font-bold text-[#0A2255]">{selected.firstName} {selected.lastName}</h4>
                <p className="text-xs font-mono text-[#5A7A9A]">{selected.patientId}</p>
                <div className="mt-1">{selected.status ? statusBadge(selected.status) : null}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Phone"><div className="text-sm">{selected.phone}</div></Field>
              <Field label="Email"><div className="text-sm">{selected.email || '—'}</div></Field>
              <Field label="Gender"><div className="text-sm">{selected.gender || '—'}</div></Field>
              <Field label="DOB"><div className="text-sm">{selected.dateOfBirth ? String(selected.dateOfBirth).slice(0, 10) : '—'}</div></Field>
              <Field label="Blood Group"><div className="text-sm">{selected.bloodGroup || '—'}</div></Field>
              <Field label="Address"><div className="text-sm">{selected.address || '—'}</div></Field>
            </div>
            <div className="flex justify-end gap-2">
              <Btn variant="secondary" onClick={() => setViewOpen(false)}>Close</Btn>
              <Btn variant="secondary" onClick={() => { setViewOpen(false); openEdit(selected); }}>Edit</Btn>
              <Btn onClick={() => { setViewOpen(false); navigate(`/admin/prescriptions?patientId=${selected.id}&new=1`); }}>
                <Pill className="w-4 h-4" /> Prescribe
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit modal */}
      <Modal open={formOpen} title={editId ? 'Edit Patient' : 'New Patient'} onClose={() => setFormOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name"><TextInput required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
            <Field label="Last Name"><TextInput required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><TextInput required minLength={8} placeholder="e.g. 01712345678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </Field>
            <Field label="Blood Group">
              <Select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => <option key={b} value={b}>{b}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Date of Birth"><TextInput type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></Field>
          <Field label="Address"><TextInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Btn>
          </div>
        </form>
      </Modal>

      <ConfirmDelete open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} busy={deleting} />
    </div>
  );
}