import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Trash2, Check } from 'lucide-react';
import { blogApi, reviewApi, galleryApi, faqApi, settingsApi, reelApi, chamberApi, categoryApi } from '../../services/contentApi';
import { useToast } from '../../contexts/ToastContext';
import {
  PageHeader, Card, Btn, Spinner, EmptyState, ErrorBanner,
  Th, Td, statusBadge, Modal, Field, TextInput, Select, ConfirmDelete,
} from '../ui';
import AssetUpload from '../../components/AssetUpload';
import { resolveImg } from '../../utils/image';

const TABS = ['blog', 'faq', 'gallery', 'reviews', 'reels', 'categories', 'chambers', 'settings'];

const crudApis = {
  blog: blogApi,
  faq: faqApi,
  gallery: galleryApi,
  reviews: reviewApi,
  reels: reelApi,
  categories: categoryApi,
  chambers: chamberApi,
};

const capital = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function Content() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('blog');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statsForm, setStatsForm] = useState({ years: '', patients: '', procedures: '', satisfaction: '' });
  const [visibility, setVisibility] = useState({ categories_visibility: true, reels_visibility: true, before_after_visibility: true });
  const [statsSaving, setStatsSaving] = useState(false);
  const [visSaving, setVisSaving] = useState(false);

  const fetchers = {
    blog: () => blogApi.list({ limit: 100 }).then((r) => r.data?.items || []),
    faq: () => faqApi.list({ limit: 100 }).then((r) => r.data?.items || []),
    gallery: () => galleryApi.list({ limit: 100 }).then((r) => r.data?.items || []),
    reviews: () => reviewApi.list({ limit: 100 }).then((r) => r.data?.items || []),
    reels: () => reelApi.list({ limit: 100 }).then((r) => r.data?.items || []),
    categories: () => categoryApi.list({ limit: 100 }).then((r) => r.data?.items || []),
    chambers: () => chamberApi.list({ limit: 100 }).then((r) => r.data?.items || []),
    settings: async () => {
      try {
        const [statsRes, catRes, reelRes, baRes] = await Promise.allSettled([
          settingsApi.getPublic('site_stats'),
          settingsApi.getPublic('categories_visibility'),
          settingsApi.getPublic('reels_visibility'),
          settingsApi.getPublic('before_after_visibility'),
        ]);
        const val = (statsRes.status === 'fulfilled' ? statsRes.value?.data?.item?.value : null) || {};
        setStatsForm({
          years: String(val.years || ''),
          patients: String(val.patients || ''),
          procedures: String(val.procedures || ''),
          satisfaction: String(val.satisfaction || ''),
        });
        setVisibility({
          categories_visibility: (catRes.status === 'fulfilled' ? catRes.value?.data?.item?.value?.enabled : true) !== false,
          reels_visibility: (reelRes.status === 'fulfilled' ? reelRes.value?.data?.item?.value?.enabled : true) !== false,
          before_after_visibility: (baRes.status === 'fulfilled' ? baRes.value?.data?.item?.value?.enabled : true) !== false,
        });
      } catch (_) {}
      return [];
    },
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setData([]);
    try {
      setData(await fetchers[tab]());
    } catch (err) {
      setError(err.message || `Could not load ${tab}`);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleSaveStats = async (e) => {
    e.preventDefault();
    setStatsSaving(true);
    try {
      await settingsApi.upsert('site_stats', {
        years: Number(statsForm.years) || 0,
        patients: Number(statsForm.patients) || 0,
        procedures: Number(statsForm.procedures) || 0,
        satisfaction: Number(statsForm.satisfaction) || 0,
      });
      showToast('success', 'Statistics saved');
    } catch (err) {
      setError(err.message || 'Could not save settings');
      showToast('alert', err.message || 'Could not save settings');
    } finally {
      setStatsSaving(false);
    }
  };

  const handleSaveVisibility = async () => {
    setVisSaving(true);
    try {
      await Promise.all([
        settingsApi.upsert('categories_visibility', { enabled: visibility.categories_visibility }),
        settingsApi.upsert('reels_visibility', { enabled: visibility.reels_visibility }),
        settingsApi.upsert('before_after_visibility', { enabled: visibility.before_after_visibility }),
      ]);
      showToast('success', 'Section visibility saved');
    } catch (err) {
      showToast('alert', err.message || 'Could not save visibility');
    } finally {
      setVisSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      if (tab === 'categories' || tab === 'chambers') {
        await crudApis[tab].update(item.id, { status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
      } else if (tab === 'reels') {
        const payload = { title: { en: item.title?.en || '', bn: item.title?.bn || '' }, url: item.url, videoUrl: item.videoUrl, image: item.image, status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
        await crudApis[tab].update(item.id, payload);
      }
      showToast('success', `${item.status === 'ACTIVE' ? 'Deactivated' : 'Activated'} ${capital(tab).replace(/s$/, '')}`);
      load();
    } catch (err) {
      showToast('alert', err.message || 'Could not update status');
    }
  };

  // ----- default empty forms per entity -----
  const emptyForms = {
    blog: { titleEn: '', titleBn: '', slug: '', excerptEn: '', excerptBn: '', contentEn: '', contentBn: '', category: '', status: 'DRAFT', readTime: '', featuredImage: '' },
    faq: { questionEn: '', questionBn: '', answerEn: '', answerBn: '', status: 'ACTIVE' },
    gallery: { titleEn: '', titleBn: '', category: '', beforeImg: '', afterImg: '', treatmentType: '', status: 'ACTIVE' },
    reviews: { author: '', rating: '5', commentEn: '', commentBn: '', treatmentEn: '', treatmentBn: '' },
    reels: { titleEn: '', titleBn: '', url: '', videoUrl: '', image: '', status: 'ACTIVE' },
    categories: { key: '', nameEn: '', nameBn: '', status: 'ACTIVE' },
    chambers: { name: '', address: '', phone: '', workingHours: '', status: 'ACTIVE', sortOrder: '0' },
  };

  const [form, setForm] = useState(emptyForms.blog);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForms[tab]);
    setFormError('');
    setEditOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setFormError('');
    if (tab === 'blog') {
      setForm({
        titleEn: item.title?.en || '',
        titleBn: item.title?.bn || '',
        slug: item.slug || '',
        excerptEn: item.excerpt?.en || '',
        excerptBn: item.excerpt?.bn || '',
        contentEn: item.content?.en || '',
        contentBn: item.content?.bn || '',
        category: item.category || '',
        status: item.status || 'DRAFT',
        readTime: item.readTime || '',
        featuredImage: item.featuredImage || item.image || '',
      });
    } else if (tab === 'faq') {
      setForm({
        questionEn: item.question?.en || '',
        questionBn: item.question?.bn || '',
        answerEn: item.answer?.en || '',
        answerBn: item.answer?.bn || '',
        status: item.status || 'ACTIVE',
      });
    } else if (tab === 'gallery') {
      setForm({
        titleEn: item.title?.en || '',
        titleBn: item.title?.bn || '',
        category: item.category || '',
        beforeImg: item.beforeImg || '',
        afterImg: item.afterImg || '',
        treatmentType: item.treatmentType || '',
        status: item.status || 'ACTIVE',
      });
    } else if (tab === 'reels') {
      setForm({
        titleEn: item.title?.en || '',
        titleBn: item.title?.bn || '',
        url: item.url || '',
        videoUrl: item.videoUrl || '',
        image: item.image || '',
        status: item.status || 'ACTIVE',
      });
    } else if (tab === 'categories') {
      setForm({
        key: item.key || '',
        nameEn: item.name?.en || '',
        nameBn: item.name?.bn || '',
        status: item.status || 'ACTIVE',
      });
    } else if (tab === 'chambers') {
      setForm({
        name: item.name || '',
        address: item.address || '',
        phone: item.phone || '',
        workingHours: JSON.stringify(item.workingHours || {}, null, 2),
        status: item.status || 'ACTIVE',
        sortOrder: String(item.sortOrder || 0),
      });
    } else {
      setForm({
        author: item.author || '',
        rating: String(item.rating || 5),
        commentEn: item.comment?.en || '',
        commentBn: item.comment?.bn || '',
        treatmentEn: item.treatment?.en || '',
        treatmentBn: item.treatment?.bn || '',
      });
    }
    setEditOpen(true);
  };

  const buildPayload = () => {
    if (tab === 'blog') {
      return {
        title: { en: form.titleEn, bn: form.titleBn || form.titleEn },
        slug: form.slug || undefined,
        excerpt: { en: form.excerptEn, bn: form.excerptBn || form.excerptEn },
        content: { en: form.contentEn, bn: form.contentBn || form.contentEn },
        category: form.category || null,
        status: form.status,
        featuredImage: form.featuredImage || null,
      };
    }
    if (tab === 'faq') {
      return {
        question: { en: form.questionEn, bn: form.questionBn || form.questionEn },
        answer: { en: form.answerEn, bn: form.answerBn || form.answerEn },
        status: form.status,
      };
    }
    if (tab === 'gallery') {
      return {
        title: { en: form.titleEn, bn: form.titleBn || form.titleEn },
        category: form.category || null,
        beforeImg: form.beforeImg || null,
        afterImg: form.afterImg || null,
        treatmentType: form.treatmentType || null,
        status: form.status,
      };
    }
    if (tab === 'reels') {
      return {
        title: { en: form.titleEn, bn: form.titleBn || form.titleEn },
        url: form.url || null,
        videoUrl: form.videoUrl || null,
        image: form.image || null,
        status: form.status,
      };
    }
    if (tab === 'categories') {
      return {
        key: form.key,
        name: { en: form.nameEn, bn: form.nameBn || form.nameEn },
        status: form.status,
      };
    }
    if (tab === 'chambers') {
      let workingHours = {};
      try { workingHours = form.workingHours ? JSON.parse(form.workingHours) : {}; } catch { /* ignore */ }
      return {
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
        workingHours,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
      };
    }
    return {
      author: form.author,
      rating: Number(form.rating || 5),
      comment: { en: form.commentEn, bn: form.commentBn || form.commentEn },
      treatment: { en: form.treatmentEn, bn: form.treatmentBn || form.treatmentEn },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tab === 'reels' && !form.titleEn.trim() && !form.titleBn.trim()) {
      setFormError('Title is required (English or বাংলা)');
      return;
    }
    if (tab === 'categories' && !form.key.trim()) {
      setFormError('Category key is required');
      return;
    }
    if (tab === 'chambers' && !form.name.trim()) {
      setFormError('Chamber name is required');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const api = crudApis[tab];
      const payload = buildPayload();
      if (editId) await api.update(editId, payload);
      else await api.create(payload);
      setEditOpen(false);
      showToast('success', `${editId ? 'Updated' : 'Created'} ${capital(tab).replace(/s$/, '')}`);
      load();
    } catch (err) {
      setFormError(err.message || 'Could not save');
      showToast('alert', err.message || `Could not save ${capital(tab).replace(/s$/, '')}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await crudApis[tab].remove(deleteTarget.id);
      setDeleteTarget(null);
      showToast('success', `Deleted ${capital(tab).replace(/s$/, '')}`);
      load();
    } catch (err) {
      showToast('alert', err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const approveReview = async (id) => {
    try {
      await reviewApi.approve(id);
      load();
    } catch (err) {
      alert(err.message || 'Could not approve');
    }
  };

  const colFor = (item, i) => {
    if (tab === 'blog') return `#${item.id} — ${item.title?.en || item.slug}`;
    if (tab === 'faq') return item.question?.en || `#${item.id}`;
    if (tab === 'gallery') return <span className="flex items-center gap-2">{(item.beforeImg || item.afterImg) && <img src={resolveImg(item.beforeImg || item.afterImg)} alt="" className="w-9 h-9 rounded-lg object-cover" />}{item.title?.en || `#${item.id}`}</span>;
    if (tab === 'reels') return <span className="flex items-center gap-2">{item.image && <img src={resolveImg(item.image)} alt="" className="w-9 h-9 rounded-lg object-cover" />}{item.title?.en || `#${item.id}`}</span>;
    if (tab === 'categories') return `${item.key}`;
    if (tab === 'chambers') return item.name || `#${item.id}`;
    return `${item.author} — ${(item.comment?.en || commentPreview(item.comment))?.slice(0, 40)}${commentPreview(item.comment).length > 40 ? '…' : ''}`;
  };
  const commentPreview = (c) => (typeof c === 'string' ? c : c?.en || c?.bn || '');

  const detailFor = (item) => {
    if (tab === 'blog') return item.category || '—';
    if (tab === 'faq') return item.answer?.en?.slice(0, 60) || '';
    if (tab === 'gallery') return item.treatmentType || item.category || '—';
    if (tab === 'reels') return item.url || item.videoUrl || '—';
    if (tab === 'categories') return item.name?.en || '—';
    if (tab === 'chambers') return item.address || item.phone || '—';
    return `Rating: ${item.rating}/5`;
  };

  return (
    <div>
      <PageHeader
        title="Content"
        subtitle="Manage blog posts, FAQs, gallery, reviews, reels, categories, chambers and site settings"
        actions={
          <>
            <Btn variant="secondary" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn>
            <Btn onClick={openCreate}><Plus className="w-4 h-4" /> New {tab}</Btn>
          </>
        }
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${tab === tb ? 'bg-[#2299D6] text-white' : 'bg-white border border-[#B8D8EE] text-[#0A2255]'}`}
          >
            {tb}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {tab === 'settings' ? (
        <div className="space-y-4">
        <Card className="p-6">
          <h3 className="text-base font-bold mb-4">Site Statistics (Public Homepage)</h3>
          <form onSubmit={handleSaveStats} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Years of Experience">
                <TextInput type="number" min="0" value={statsForm.years} onChange={(e) => setStatsForm({ ...statsForm, years: e.target.value })} placeholder="e.g. 12" />
              </Field>
              <Field label="Patients Treated">
                <TextInput type="number" min="0" value={statsForm.patients} onChange={(e) => setStatsForm({ ...statsForm, patients: e.target.value })} placeholder="e.g. 15000" />
              </Field>
              <Field label="Procedures">
                <TextInput type="number" min="0" value={statsForm.procedures} onChange={(e) => setStatsForm({ ...statsForm, procedures: e.target.value })} placeholder="e.g. 25" />
              </Field>
              <Field label="Satisfaction (%)">
                <TextInput type="number" min="0" max="100" step="0.1" value={statsForm.satisfaction} onChange={(e) => setStatsForm({ ...statsForm, satisfaction: e.target.value })} placeholder="e.g. 99.2" />
              </Field>
            </div>
            <Btn type="submit" disabled={statsSaving}>{statsSaving ? 'Saving...' : 'Save Statistics'}</Btn>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-bold mb-1">Public Section Visibility</h3>
          <p className="text-sm text-[#5A7A9A] mb-4">Toggle which sections appear on the public homepage.</p>
          <div className="space-y-3 max-w-lg">
            {[
              ['categories_visibility', 'Categories & "Comprehensive Dental Care" section'],
              ['reels_visibility', 'Customer Reels / Social Media section'],
              ['before_after_visibility', 'Before / After Gallery section'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-[#B8D8EE] bg-[#EDF7FC] cursor-pointer">
                <span className="text-sm font-medium text-[#0A2255]">{label}</span>
                <button
                  type="button"
                  onClick={() => setVisibility({ ...visibility, [key]: !visibility[key] })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${visibility[key] ? 'bg-[#2299D6]' : 'bg-[#B8D8EE]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${visibility[key] ? 'translate-x-5' : ''}`} />
                </button>
              </label>
            ))}
            <div className="pt-1">
              <Btn variant="secondary" onClick={handleSaveVisibility} disabled={visSaving}>{visSaving ? 'Saving...' : 'Save Visibility'}</Btn>
            </div>
          </div>
        </Card>
        </div>
      ) : (
      <Card className="overflow-hidden p-0">
        {loading ? (
          <Spinner />
        ) : data.length === 0 ? (
          <EmptyState message={`No ${tab} items found`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-[#EDF7FC]">
                <tr>
                  <Th>{tab === 'reviews' ? 'Review' : tab === 'gallery' ? 'Item' : tab === 'blog' ? 'Post' : 'Question'}</Th>
                  <Th>Detail</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B8D8EE]">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-[#EDF7FC]">
                    <Td>{colFor(item)}</Td>
                    <Td className="text-[#5A7A9A]">{detailFor(item)}</Td>
                    <Td>{statusBadge(item.status)}</Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {['reels', 'categories', 'chambers'].includes(tab) && (
                          <Btn variant="ghost" className="!px-2 !py-1 text-amber-500" onClick={() => toggleStatus(item)}>
                            <span className="text-xs font-semibold">{item.status === 'ACTIVE' ? 'Disable' : 'Enable'}</span>
                          </Btn>
                        )}
                        {tab === 'reviews' && item.status !== 'APPROVED' && (
                          <Btn variant="ghost" className="!px-2 !py-1 text-[#2299D6]" onClick={() => approveReview(item.id)}>
                            <Check className="w-4 h-4" />
                          </Btn>
                        )}
                        <Btn variant="ghost" className="!px-2 !py-1" onClick={() => openEdit(item)}>
                          <span className="text-xs font-semibold">Edit</span>
                        </Btn>
                        <Btn variant="ghost" className="!px-2 !py-1 text-rose-500" onClick={() => setDeleteTarget(item)}>
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
      )}

      {/* Edit / create */}
      <Modal open={editOpen} title={`${editId ? 'Edit' : 'New'} ${tab}`} onClose={() => setEditOpen(false)} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}

          {tab === 'blog' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Title (English)"><TextInput required value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></Field>
              <Field label="Title (বাংলা)"><TextInput value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} /></Field>
              <Field label="Slug"><TextInput value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
              <Field label="Category"><TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
              <Field label="Excerpt (English)"><TextInput value={form.excerptEn} onChange={(e) => setForm({ ...form, excerptEn: e.target.value })} /></Field>
              <Field label="Content (English)" span={2}><textarea rows="5" value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} className="w-full p-3 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6]" /></Field>
              <Field label="Content (বাংলা)" span={2}><textarea rows="5" value={form.contentBn} onChange={(e) => setForm({ ...form, contentBn: e.target.value })} className="w-full p-3 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6]" /></Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Featured Image">
                  <AssetUpload
                    value={form.featuredImage}
                    onChange={(url) => setForm({ ...form, featuredImage: url })}
                    label="Upload blog image"
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === 'faq' && (
            <div className="space-y-3">
              <Field label="Question (English)"><TextInput required value={form.questionEn} onChange={(e) => setForm({ ...form, questionEn: e.target.value })} /></Field>
              <Field label="Question (বাংলা)"><TextInput value={form.questionBn} onChange={(e) => setForm({ ...form, questionBn: e.target.value })} /></Field>
              <Field label="Answer (English)"><textarea rows="3" value={form.answerEn} onChange={(e) => setForm({ ...form, answerEn: e.target.value })} className="w-full p-3 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6]" /></Field>
              <Field label="Answer (বাংলা)"><textarea rows="3" value={form.answerBn} onChange={(e) => setForm({ ...form, answerBn: e.target.value })} className="w-full p-3 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6]" /></Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </Field>
            </div>
          )}

          {tab === 'gallery' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Title (English)"><TextInput required value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></Field>
              <Field label="Title (বাংলা)"><TextInput value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} /></Field>
              <Field label="Category"><TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
              <Field label="Treatment Type"><TextInput value={form.treatmentType} onChange={(e) => setForm({ ...form, treatmentType: e.target.value })} /></Field>
              <div className="sm:col-span-2">
                <Field label="Before Image">
                  <AssetUpload value={form.beforeImg} onChange={(url) => setForm({ ...form, beforeImg: url })} label="Upload before photo" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="After Image">
                  <AssetUpload value={form.afterImg} onChange={(url) => setForm({ ...form, afterImg: url })} label="Upload after photo" />
                </Field>
              </div>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </Field>
            </div>
          )}

          {tab === 'reels' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Title (English)"><TextInput required value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></Field>
              <Field label="Title (বাংলা)"><TextInput value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} /></Field>
              <Field label="Reel URL"><TextInput value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></Field>
              <Field label="Video URL"><TextInput value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." /></Field>
              <div className="sm:col-span-2">
                <Field label="Cover Image">
                  <AssetUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Upload reel cover" />
                </Field>
              </div>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </Field>
            </div>
          )}

          {tab === 'categories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Key"><TextInput required value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="e.g. implants" /></Field>
              <Field label="Name (English)"><TextInput value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></Field>
              <Field label="Name (বাংলা)"><TextInput value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} /></Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </Field>
            </div>
          )}

          {tab === 'chambers' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Banani Branch" /></Field>
              <Field label="Phone"><TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Address" span={2}><TextInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
              <Field label="Working Hours" span={2}>
                <textarea rows="5" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} className="w-full p-3 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] font-mono" placeholder='{"sat":"10:00-21:00","sun":"10:00-21:00","mon":"10:00-21:00","tue":"10:00-21:00","wed":"10:00-21:00","thu":"10:00-21:00","fri":"16:00-21:00"}' />
                <p className="text-xs text-[#5A7A9A] mt-1">JSON object of day → "open-close". Missing days use defaults.</p>
              </Field>
              <Field label="Sort Order"><TextInput type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </Field>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Author Name"><TextInput required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></Field>
              <Field label="Rating">
                <Select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
                </Select>
              </Field>
              <Field label="Treatment (English)"><TextInput value={form.treatmentEn} onChange={(e) => setForm({ ...form, treatmentEn: e.target.value })} /></Field>
              <Field label="Treatment (বাংলা)"><TextInput value={form.treatmentBn} onChange={(e) => setForm({ ...form, treatmentBn: e.target.value })} /></Field>
              <Field label="Comment (English)" span={2}><textarea rows="3" value={form.commentEn} onChange={(e) => setForm({ ...form, commentEn: e.target.value })} className="w-full p-3 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6]" /></Field>
              <Field label="Comment (বাংলা)" span={2}><textarea rows="3" value={form.commentBn} onChange={(e) => setForm({ ...form, commentBn: e.target.value })} className="w-full p-3 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6]" /></Field>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Btn>
          </div>
        </form>
      </Modal>

      <ConfirmDelete open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} busy={deleting} />
    </div>
  );
}