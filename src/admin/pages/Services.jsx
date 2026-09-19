import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { serviceApi } from '../../services/serviceApi';
import { categoryApi } from '../../services/contentApi';
import { useToast } from '../../contexts/ToastContext';
import {
  PageHeader, Card, Btn, Spinner, EmptyState, ErrorBanner,
  Th, Td, statusBadge, Modal, Field, TextInput, Select, ConfirmDelete,
} from '../ui';
import AssetUpload from '../../components/AssetUpload';
import { resolveImg } from '../../utils/image';

const emptyForm = {
  nameEn: '',
  nameBn: '',
  slug: '',
  category: '',
  categoryKey: '',
  shortDescEn: '',
  shortDescBn: '',
  duration: '',
  priceMin: 0,
  priceMax: 0,
  priceFormatted: '',
  badge: '',
  image: '',
  status: 'ACTIVE',
};

export default function Services() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await serviceApi.list({ limit: 100 });
      setItems(res.data?.items || []);
    } catch (err) {
      setError(err.message || 'Could not load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    categoryApi.listPublic()
      .then((res) => setCategories(res.data?.items || []))
      .catch(() => setCategories([]));
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setEditId(s.id);
    setForm({
      nameEn: s.name?.en || '',
      nameBn: s.name?.bn || '',
      slug: s.slug || '',
      category: s.category || '',
      categoryKey: s.categoryKey || '',
      shortDescEn: s.shortDesc?.en || '',
      shortDescBn: s.shortDesc?.bn || '',
      duration: s.duration || '',
      priceMin: s.priceMin || 0,
      priceMax: s.priceMax || 0,
      priceFormatted: s.priceFormatted || '',
      badge: s.badge || '',
      image: s.image || '',
      status: s.status || 'ACTIVE',
    });
    setFormError('');
    setFormOpen(true);
  };

  const buildPayload = () => ({
    name: { en: form.nameEn, bn: form.nameBn || form.nameEn },
    slug: form.slug || undefined,
    category: form.category,
    categoryKey: form.categoryKey || null,
    shortDesc: { en: form.shortDescEn, bn: form.shortDescBn || form.shortDescEn },
    duration: form.duration || null,
    priceMin: Number(form.priceMin),
    priceMax: Number(form.priceMax),
    priceFormatted: form.priceFormatted || null,
    badge: form.badge || null,
    image: form.image || null,
    status: form.status,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = buildPayload();
      if (editId) {
        await serviceApi.update(editId, payload);
      } else {
        await serviceApi.create(payload);
      }
      setFormOpen(false);
      showToast('success', `${editId ? 'Updated' : 'Created'} service`);
      load();
    } catch (err) {
      setFormError(err.message || 'Could not save service');
      showToast('alert', err.message || 'Could not save service');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (s) => {
    try {
      await serviceApi.update(s.id, { status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
      showToast('success', `${s.status === 'ACTIVE' ? 'Deactivated' : 'Activated'} ${s.name?.en || 'service'}`);
      load();
    } catch (err) {
      showToast('alert', err.message || 'Could not update status');
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await serviceApi.remove(deleteTarget.id);
      setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('success', 'Service deleted');
    } catch (err) {
      showToast('alert', err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle={`${items.length} services (shown on the public site)`}
        actions={
          <>
            <Btn variant="secondary" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn>
            <Btn onClick={openCreate}><Plus className="w-4 h-4" /> New Service</Btn>
          </>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState message="No services found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-[#EDF7FC]">
                <tr>
                  <Th>Service</Th>
                  <Th>Category</Th>
                  <Th>Price Range</Th>
                  <Th>Duration</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B8D8EE]">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-[#EDF7FC]">
                    <Td>
                      <div className="flex items-center gap-3">
                        {s.image ? (
                          <img src={resolveImg(s.image)} alt={s.name?.en} className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-[#D6E8F7] flex items-center justify-center text-sm font-bold text-[#14357B]">
                            {(s.name?.en || 'S')[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{s.name?.en || s.slug}</div>
                          <div className="text-xs font-mono text-[#5A7A9A]">{s.slug}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>{s.category}{s.categoryKey && s.categoryKey !== s.category ? <span className="block text-xs font-mono text-[#5A7A9A]">{s.categoryKey}</span> : null}</Td>
                    <Td>{s.priceFormatted || `৳${s.priceMin} - ৳${s.priceMax}`}</Td>
                    <Td>{s.duration || '—'}</Td>
                    <Td>
                      <button onClick={() => toggleStatus(s)}>{statusBadge(s.status)}</button>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Btn variant="ghost" className="!px-2 !py-1" onClick={() => openEdit(s)}>
                          <span className="text-xs font-semibold">Edit</span>
                        </Btn>
                        <Btn variant="ghost" className="!px-2 !py-1 text-rose-500" onClick={() => setDeleteTarget(s)}>
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
      <Modal open={formOpen} title={editId ? 'Edit Service' : 'New Service'} onClose={() => setFormOpen(false)} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name (English)"><TextInput required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></Field>
            <Field label="Name (বাংলা)"><TextInput value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} /></Field>
            <Field label="Slug"><TextInput value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" /></Field>
            <Field label="Category (display name)">
              <TextInput required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} list="service-categories" />
              <datalist id="service-categories">
                {categories.filter((c) => c.status === 'ACTIVE').map((c) => <option key={c.key} value={c.name?.en || c.key} />)}
              </datalist>
            </Field>
            <Field label="Category Key (for grouping)">
              <Select value={form.categoryKey} onChange={(e) => setForm({ ...form, categoryKey: e.target.value })}>
                <option value="">— None —</option>
                {categories.filter((c) => c.status === 'ACTIVE').map((c) => <option key={c.key} value={c.key}>{c.name?.en || c.key}</option>)}
              </Select>
            </Field>
            <Field label="Price Min (৳)"><TextInput type="number" min="0" value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} /></Field>
            <Field label="Price Max (৳)"><TextInput type="number" min="0" value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} /></Field>
            <Field label="Price Formatted"><TextInput value={form.priceFormatted} onChange={(e) => setForm({ ...form, priceFormatted: e.target.value })} placeholder="e.g. ৳800 - ৳2,500" /></Field>
            <Field label="Duration"><TextInput value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 30-45 min" /></Field>
            <Field label="Badge"><TextInput value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Most Popular" /></Field>
            <div className="sm:col-span-2">
              <Field label="Service Image">
                <AssetUpload
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  label="Upload service image"
                />
              </Field>
            </div>
            <Field label="Short Desc (English)"><TextInput value={form.shortDescEn} onChange={(e) => setForm({ ...form, shortDescEn: e.target.value })} /></Field>
            <Field label="Short Desc (বাংলা)"><TextInput value={form.shortDescBn} onChange={(e) => setForm({ ...form, shortDescBn: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </Field>
          </div>
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