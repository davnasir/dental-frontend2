import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Trash2, Clock } from 'lucide-react';
import { doctorApi } from '../../services/doctorApi';
import {
  PageHeader, Card, Btn, Spinner, EmptyState, ErrorBanner,
  Th, Td, statusBadge, Modal, Field, TextInput, Select, ConfirmDelete,
} from '../ui';
import AssetUpload from '../../components/AssetUpload';
import { resolveImg } from '../../utils/image';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const emptyForm = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  qualification: '',
  registrationNumber: '',
  experience: 0,
  bio: '',
  consultationFee: 0,
  profileImage: '',
  status: 'ACTIVE',
};

export default function Doctors() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [availFor, setAvailFor] = useState(null);
  const [availability, setAvailability] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await doctorApi.list();
      setItems(res.data?.items || []);
    } catch (err) {
      setError(err.message || 'Could not load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (d) => {
    setEditId(d.id);
    setForm({
      name: d.name || '',
      email: d.email || '',
      phone: d.phone || '',
      specialization: d.specialization || '',
      qualification: d.qualification || '',
      registrationNumber: d.registrationNumber || '',
      experience: d.experience || 0,
      bio: d.bio || '',
      consultationFee: d.consultationFee || 0,
      profileImage: d.profileImage || '',
      status: d.status || 'ACTIVE',
    });
    setFormError('');
    setFormOpen(true);
  };

  const openAvailability = (d) => {
    setAvailFor(d);
    setAvailability({ ...(d.availability || {}) });
  };

  const daysOff = Array.isArray(availability.daysOff) ? availability.daysOff : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        consultationFee: Number(form.consultationFee),
        experience: Number(form.experience),
      };
      if (editId) {
        await doctorApi.update(editId, payload);
      } else {
        await doctorApi.create(payload);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err.message || 'Could not save doctor');
    } finally {
      setSaving(false);
    }
  };

  const saveAvailability = async () => {
    if (!availFor) return;
    setSaving(true);
    try {
      await doctorApi.setAvailability(availFor.id, { availability });
      setAvailFor(null);
      load();
    } catch (err) {
      alert(err.message || 'Could not save availability');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await doctorApi.remove(deleteTarget.id);
      setItems((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle={`${items.length} doctors`}
        actions={
          <>
            <Btn variant="secondary" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn>
            <Btn onClick={openCreate}><Plus className="w-4 h-4" /> New Doctor</Btn>
          </>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState message="No doctors found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-[#EDF7FC]">
                <tr>
                  <Th>Doctor</Th>
                  <Th>Specialization</Th>
                  <Th>Phone</Th>
                  <Th>Fee</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B8D8EE]">
                {items.map((d) => (
                  <tr key={d.id} className="hover:bg-[#EDF7FC]">
                    <Td>
                      <div className="flex items-center gap-3">
                        {d.profileImage ? (
                          <img src={resolveImg(d.profileImage)} alt={d.name} className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-[#D6E8F7] flex items-center justify-center text-sm font-bold text-[#14357B]">
                            {(d.name || '?')[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{d.name}</div>
                          <div className="text-xs text-[#5A7A9A]">{d.qualification || ''}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>{d.specialization || '—'}</Td>
                    <Td>{d.phone || '—'}</Td>
                    <Td>{d.consultationFee ? `৳${d.consultationFee}` : '—'}</Td>
                    <Td>{statusBadge(d.status)}</Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Btn variant="ghost" className="!px-2 !py-1" onClick={() => openAvailability(d)}>
                          <Clock className="w-4 h-4" />
                        </Btn>
                        <Btn variant="ghost" className="!px-2 !py-1" onClick={() => openEdit(d)}>
                          <span className="text-xs font-semibold">Edit</span>
                        </Btn>
                        <Btn variant="ghost" className="!px-2 !py-1 text-rose-500" onClick={() => setDeleteTarget(d)}>
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
      </Card>

      {/* Create / Edit modal */}
      <Modal open={formOpen} title={editId ? 'Edit Doctor' : 'New Doctor'} onClose={() => setFormOpen(false)} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full Name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Specialization"><TextInput value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Orthodontist" /></Field>
            <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Phone"><TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Qualification"><TextInput value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></Field>
            <Field label="Registration No."><TextInput value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} /></Field>
            <Field label="Experience (years)"><TextInput type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></Field>
            <Field label="Consultation Fee (৳)"><TextInput type="number" min="0" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Profile Image">
                <AssetUpload
                  value={form.profileImage}
                  onChange={(url) => setForm({ ...form, profileImage: url })}
                  label="Upload doctor photo"
                />
              </Field>
            </div>
            <Field label="Bio" span={2}><textarea rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio / education" className="w-full p-3 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6]" /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Availability modal */}
      <Modal open={!!availFor} title={`Availability — ${availFor?.name || ''}`} onClose={() => setAvailFor(null)}>
        {availFor && (
          <div className="space-y-4">
            <p className="text-xs text-[#5A7A9A]">
              Select the weekly days this doctor is off. Slots are only generated on working days (default hours 10:00–21:00).
            </p>
            <div className="grid grid-cols-1 gap-2">
              {DAY_NAMES.map((day, idx) => {
                const off = daysOff.includes(idx) || daysOff.includes(day.toLowerCase());
                return (
                  <label key={day} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${off ? 'border-rose-300 bg-rose-50' : 'border-[#B8D8EE]'}`}>
                    <span className="text-sm font-semibold text-[#0A2255]">{day}</span>
                    <span className="flex items-center gap-2 text-xs">
                      {off ? <span className="text-rose-500 font-medium">Day off</span> : <span className="text-[#2299D6] font-medium">Working</span>}
                      <input
                        type="checkbox"
                        checked={off}
                        onChange={() => {
                          const next = [...daysOff];
                          const forms = [idx, day.toLowerCase()];
                          if (off) {
                            setAvailability({ ...availability, daysOff: next.filter((x) => !forms.includes(x)) });
                          } else {
                            forms.forEach((f) => { if (!next.includes(f)) next.push(f); });
                            setAvailability({ ...availability, daysOff: next });
                          }
                        }}
                        className="accent-rose-600"
                      />
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="secondary" onClick={() => setAvailFor(null)}>Cancel</Btn>
              <Btn onClick={saveAvailability} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Btn>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDelete open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} busy={deleting} />
    </div>
  );
}