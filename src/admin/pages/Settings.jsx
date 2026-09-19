import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Plus,
  Trash2,
  KeyRound,
  Clock,
  CalendarClock,
  Calculator,
  Image as ImageIcon,
  Save,
} from 'lucide-react';
import { settingsApi } from '../../services/contentApi';
import { authApi } from '../../services/authApi';
import AssetUpload from '../../components/AssetUpload';
import { calculatorTreatments as defaultTreatments } from '../../data/calculator';
import {
  PageHeader, Card, Btn, Spinner, Field, TextInput,
} from '../ui';

const DEFAULT_HOURS = [
  { labelEn: 'Saturday – Thursday', labelBn: 'শনিবার – বৃহস্পতিবার', hours: '10:00 AM – 9:00 PM' },
  { labelEn: 'Friday', labelBn: 'শুক্রবার', hours: '4:00 PM – 9:00 PM' },
];

const emptyTreatment = () => ({
  id: String(Date.now()),
  nameEn: '',
  nameBn: '',
  minPrice: '',
  maxPrice: '',
  duration: '',
  descEn: '',
  descBn: '',
});

export default function Settings() {
  const [loading, setLoading] = useState(true);

  const [uttaraHours, setUttaraHours] = useState(DEFAULT_HOURS);
  const [tongiHours, setTongiHours] = useState(DEFAULT_HOURS);
  const [booking, setBooking] = useState({ enabled: true, start: '10:00 AM', end: '12:00 PM', stepMinutes: 30 });
  const [stage1Image, setStage1Image] = useState('');
  const [stage2Image, setStage2Image] = useState('');
  const [stage3Image, setStage3Image] = useState('');
  const [treatments, setTreatments] = useState(defaultTreatments);
  const [treatmentForm, setTreatmentForm] = useState(emptyTreatment());
  const [editingIndex, setEditingIndex] = useState(null);

  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [hours1Res, hours2Res, bookingRes, tooth1Res, tooth2Res, tooth3Res, estimatorRes] = await Promise.allSettled([
        settingsApi.getPublic('consultation_hours_uttara'),
        settingsApi.getPublic('consultation_hours_tongi'),
        settingsApi.getPublic('booking_hours'),
        settingsApi.getPublic('tooth_stage_1_image'),
        settingsApi.getPublic('tooth_stage_2_image'),
        settingsApi.getPublic('tooth_stage_3_image'),
        settingsApi.getPublic('cost_estimator'),
      ]);
      if (hours1Res.status === 'fulfilled') {
        const rows = hours1Res.value?.data?.item?.value?.rows;
        if (Array.isArray(rows) && rows.length > 0) setUttaraHours(rows);
      }
      if (hours2Res.status === 'fulfilled') {
        const rows = hours2Res.value?.data?.item?.value?.rows;
        if (Array.isArray(rows) && rows.length > 0) setTongiHours(rows);
      }
      if (bookingRes.status === 'fulfilled') {
        const b = bookingRes.value?.data?.item?.value;
        if (b && typeof b === 'object') setBooking({ enabled: true, start: '10:00 AM', end: '12:00 PM', stepMinutes: 30, ...b });
      }
      if (tooth1Res.status === 'fulfilled') {
        const v = tooth1Res.value?.data?.item?.value;
        setStage1Image(v?.url || (typeof v === 'string' ? v : ''));
      }
      if (tooth2Res.status === 'fulfilled') {
        const v = tooth2Res.value?.data?.item?.value;
        setStage2Image(v?.url || (typeof v === 'string' ? v : ''));
      }
      if (tooth3Res.status === 'fulfilled') {
        const v = tooth3Res.value?.data?.item?.value;
        setStage3Image(v?.url || (typeof v === 'string' ? v : ''));
      }
      if (estimatorRes.status === 'fulfilled') {
        const list = estimatorRes.value?.data?.item?.value?.treatments;
        if (Array.isArray(list) && list.length > 0) setTreatments(list.map((tr) => ({ ...tr, id: String(tr.id) })));
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (key, value) => {
    setSaving(true);
    try {
      await settingsApi.upsert(key, value);
      return true;
    } catch (err) {
      alert(err.message || 'Could not save');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHours = async () => {
    setSaving(true);
    try {
      await Promise.all([
        settingsApi.upsert('consultation_hours_uttara', { rows: uttaraHours.filter((h) => h.hours) }),
        settingsApi.upsert('consultation_hours_tongi', { rows: tongiHours.filter((h) => h.hours) }),
      ]);
    } catch (err) {
      alert(err.message || 'Could not save consultation hours');
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (branch, i, field, value) => {
    const setter = branch === 'uttara' ? setUttaraHours : setTongiHours;
    setter((prev) => prev.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)));
  };

  const removeHourRow = (branch, i) => {
    const setter = branch === 'uttara' ? setUttaraHours : setTongiHours;
    setter((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addHourRow = (branch) => {
    const setter = branch === 'uttara' ? setUttaraHours : setTongiHours;
    setter((prev) => [...prev, { labelEn: '', labelBn: '', hours: '' }]);
  };

  const handleSaveBooking = async () => {
    await save('booking_hours', { ...booking, stepMinutes: Number(booking.stepMinutes) || 30 });
  };

  const handleSaveToothImages = async () => {
    setSaving(true);
    try {
      await Promise.all([
        settingsApi.upsert('tooth_stage_1_image', { url: stage1Image }),
        settingsApi.upsert('tooth_stage_2_image', { url: stage2Image }),
        settingsApi.upsert('tooth_stage_3_image', { url: stage3Image }),
      ]);
    } catch (err) {
      alert(err.message || 'Could not save images');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTreatmentList = async () => {
    const cleaned = treatments.map((tr) => ({
      id: String(tr.id),
      name: { en: tr.nameEn || tr.name?.en || '', bn: tr.nameBn || tr.name?.bn || tr.nameEn || '' },
      minPrice: Number(tr.minPrice ?? tr.minPrice) || 0,
      maxPrice: Number(tr.maxPrice ?? tr.maxPrice) || 0,
      duration: tr.duration || '',
      desc: { en: tr.descEn || tr.desc?.en || '', bn: tr.descBn || tr.desc?.bn || tr.descEn || '' },
    }));
    if (await save('cost_estimator', { treatments: cleaned })) {
      setTreatments(treatments.map((tr, idx) => ({
        id: tr.id,
        nameEn: cleaned[idx].name.en,
        nameBn: cleaned[idx].name.bn,
        minPrice: cleaned[idx].minPrice,
        maxPrice: cleaned[idx].maxPrice,
        duration: cleaned[idx].duration,
        descEn: cleaned[idx].desc.en,
        descBn: cleaned[idx].desc.bn,
      })));
    }
  };

  const addTreatment = () => {
    if (!treatmentForm.nameEn && !treatmentForm.nameBn) return;
    if (editingIndex !== null) {
      setTreatments((prev) => prev.map((tr, idx) => (idx === editingIndex ? { ...tr, ...treatmentForm, id: String(treatmentForm.id || tr.id) } : tr)));
      setEditingIndex(null);
    } else {
      setTreatments((prev) => [...prev, { ...treatmentForm, id: String(treatmentForm.id) }]);
    }
    setTreatmentForm(emptyTreatment());
  };

  const editTreatment = (idx) => {
    const tr = treatments[idx];
    setTreatmentForm({
      id: tr.id,
      nameEn: tr.nameEn || tr.name?.en || '',
      nameBn: tr.nameBn || tr.name?.bn || '',
      minPrice: tr.minPrice ?? '',
      maxPrice: tr.maxPrice ?? '',
      duration: tr.duration || '',
      descEn: tr.descEn || tr.desc?.en || '',
      descBn: tr.descBn || tr.desc?.bn || '',
    });
    setEditingIndex(idx);
  };

  const removeTreatment = (idx) => {
    setTreatments((prev) => prev.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
      setTreatmentForm(emptyTreatment());
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (password.next.length < 6) {
      setPwdMsg({ kind: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (password.next !== password.confirm) {
      setPwdMsg({ kind: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPwdSaving(true);
    try {
      await authApi.changePassword(password.current, password.next);
      setPwdMsg({ kind: 'success', text: 'Password changed successfully. Please login again next time.' });
      setPassword({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwdMsg({ kind: 'error', text: err.message || 'Could not change password.' });
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage website configuration: consultation hours, booking times, cost estimator and section image"
        actions={
          <Btn variant="secondary" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn>
        }
      />

      {/* Change password */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center"><KeyRound className="w-4.5 h-4.5" /></span>
          <h3 className="text-base font-bold text-[#0A2255]">Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="max-w-lg space-y-4">
          <Field label="Current Password">
            <TextInput type="password" required value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="New Password">
              <TextInput type="password" required value={password.next} onChange={(e) => setPassword({ ...password, next: e.target.value })} />
            </Field>
            <Field label="Confirm New Password">
              <TextInput type="password" required value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
            </Field>
          </div>
          {pwdMsg && (
            <div className={`text-sm rounded-xl px-4 py-3 ${pwdMsg.kind === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
              {pwdMsg.text}
            </div>
          )}
          <Btn type="submit" disabled={pwdSaving}>{pwdSaving ? 'Saving...' : 'Update Password'}</Btn>
        </form>
      </Card>

      {/* Consultation hours */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center"><Clock className="w-4.5 h-4.5" /></span>
          <div>
            <h3 className="text-base font-bold text-[#0A2255]">Consultation Hours</h3>
            <p className="text-xs text-[#5A7A9A]">Configure consultation hours per branch. Shown exactly as entered (no Open/Close labels).</p>
          </div>
        </div>
        <div className="space-y-6 max-w-3xl">
          {[
            { key: 'uttara', title: 'Uttara Branch', list: uttaraHours },
            { key: 'tongi', title: 'Tongi Branch', list: tongiHours },
          ].map((branch) => (
            <div key={branch.key}>
              <p className="text-sm font-bold text-[#0A2255] mb-2">{branch.title}</p>
              <div className="space-y-2">
                {branch.list.map((h, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4"><Field label="Label (English)"><TextInput value={h.labelEn || ''} onChange={(e) => updateHour(branch.key, i, 'labelEn', e.target.value)} /></Field></div>
                    <div className="col-span-4"><Field label="Label (বাংলা)"><TextInput value={h.labelBn || ''} onChange={(e) => updateHour(branch.key, i, 'labelBn', e.target.value)} /></Field></div>
                    <div className="col-span-3"><Field label="Hours"><TextInput value={h.hours || ''} onChange={(e) => updateHour(branch.key, i, 'hours', e.target.value)} placeholder="10:00 AM – 9:00 PM" /></Field></div>
                    <div className="col-span-1">
                      <Btn variant="ghost" className="!p-2 text-rose-500" onClick={() => removeHourRow(branch.key, i)}><Trash2 className="w-4 h-4" /></Btn>
                    </div>
                  </div>
                ))}
                <Btn variant="secondary" onClick={() => addHourRow(branch.key)}><Plus className="w-4 h-4" /> Add Row</Btn>
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Btn onClick={handleSaveHours} disabled={saving}><Save className="w-4 h-4" /> Save Consultation Hours</Btn>
          </div>
        </div>
      </Card>

      {/* Easy online booking hours */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center"><CalendarClock className="w-4.5 h-4.5" /></span>
          <div>
            <h3 className="text-base font-bold text-[#0A2255]">Easy Online Booking — Available Times</h3>
            <p className="text-xs text-[#5A7A9A]">Enter the open time window (AM/PM). The public booking form will only show these time slots.</p>
          </div>
        </div>
        <div className="max-w-2xl space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setBooking({ ...booking, enabled: !booking.enabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${booking.enabled ? 'bg-[#2299D6]' : 'bg-[#B8D8EE]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${booking.enabled ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm font-medium text-[#0A2255]">{booking.enabled ? 'Online booking time slots enabled' : 'Online booking time slots disabled (falls back to doctor schedule)'}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Start Time (AM/PM)">
              <TextInput value={booking.start || ''} onChange={(e) => setBooking({ ...booking, start: e.target.value })} placeholder="10:00 AM" />
            </Field>
            <Field label="End Time (AM/PM)">
              <TextInput value={booking.end || ''} onChange={(e) => setBooking({ ...booking, end: e.target.value })} placeholder="12:00 PM" />
            </Field>
            <Field label="Slot Interval (minutes)">
              <TextInput type="number" min="10" step="5" value={booking.stepMinutes} onChange={(e) => setBooking({ ...booking, stepMinutes: e.target.value })} />
            </Field>
          </div>
          <Btn onClick={handleSaveBooking} disabled={saving}><Save className="w-4 h-4" /> Save Booking Hours</Btn>
        </div>
      </Card>

      {/* Tooth decay stage images */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center"><ImageIcon className="w-4.5 h-4.5" /></span>
          <div>
            <h3 className="text-base font-bold text-[#0A2255]">Understand Your Tooth Decay Stage — Images</h3>
            <p className="text-xs text-[#5A7A9A]">Upload individual images for each decay stage shown on the public site.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          <div>
            <p className="text-xs font-bold text-[#0A2255] mb-1">Stage 1 — Enamel Decay</p>
            <AssetUpload value={stage1Image} onChange={setStage1Image} label="Stage 1 image" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0A2255] mb-1">Stage 2 — Dentin & Pulp</p>
            <AssetUpload value={stage2Image} onChange={setStage2Image} label="Stage 2 image" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0A2255] mb-1">Stage 3 — Abscess Emergency</p>
            <AssetUpload value={stage3Image} onChange={setStage3Image} label="Stage 3 image" />
          </div>
        </div>
        <div className="mt-3">
          <Btn onClick={handleSaveToothImages} disabled={saving}><Save className="w-4 h-4" /> Save Stage Images</Btn>
        </div>
      </Card>

      {/* Cost estimator treatments */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center"><Calculator className="w-4.5 h-4.5" /></span>
          <div>
            <h3 className="text-base font-bold text-[#0A2255]">Dental Treatment Cost Estimator</h3>
            <p className="text-xs text-[#5A7A9A]">Manage the treatments and price ranges shown in the estimator (English & বাংলা).</p>
          </div>
        </div>

        <div className="space-y-3 max-w-3xl mb-6">
          {treatments.map((tr, idx) => (
            <div key={tr.id || idx} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#B8D8EE] bg-[#EDF7FC]">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0A2255] truncate">{tr.nameEn || tr.name?.en || `Treatment ${idx + 1}`}{tr.nameBn || tr.name?.bn ? ` · ${tr.nameBn || tr.name?.bn}` : ''}</p>
                <p className="text-xs text-[#5A7A9A]">৳{Number(tr.minPrice ?? tr.minPrice) || 0} – ৳{Number(tr.maxPrice ?? tr.maxPrice) || 0} · {tr.duration || '—'}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Btn variant="ghost" className="!px-2 !py-1" onClick={() => editTreatment(idx)}><span className="text-xs font-semibold">Edit</span></Btn>
                <Btn variant="ghost" className="!px-2 !py-1 text-rose-500" onClick={() => removeTreatment(idx)}><Trash2 className="w-4 h-4" /></Btn>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#B8D8EE] pt-4">
          <h4 className="text-sm font-bold text-[#0A2255] mb-3">{editingIndex !== null ? 'Edit Treatment' : 'Add New Treatment'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
            <Field label="Name (English)"><TextInput value={treatmentForm.nameEn} onChange={(e) => setTreatmentForm({ ...treatmentForm, nameEn: e.target.value })} placeholder="Teeth Scaling & Deep Polishing" /></Field>
            <Field label="Name (বাংলা)"><TextInput value={treatmentForm.nameBn} onChange={(e) => setTreatmentForm({ ...treatmentForm, nameBn: e.target.value })} placeholder="টিথ স্কেলিং ও পলিশিং" /></Field>
            <Field label="Min Price (৳)"><TextInput type="number" min="0" value={treatmentForm.minPrice} onChange={(e) => setTreatmentForm({ ...treatmentForm, minPrice: e.target.value })} /></Field>
            <Field label="Max Price (৳)"><TextInput type="number" min="0" value={treatmentForm.maxPrice} onChange={(e) => setTreatmentForm({ ...treatmentForm, maxPrice: e.target.value })} /></Field>
            <Field label="Duration"><TextInput value={treatmentForm.duration} onChange={(e) => setTreatmentForm({ ...treatmentForm, duration: e.target.value })} placeholder="30-45 mins" /></Field>
            <Field label="Description (English)" span={2}><TextInput value={treatmentForm.descEn} onChange={(e) => setTreatmentForm({ ...treatmentForm, descEn: e.target.value })} /></Field>
            <Field label="Description (বাংলা)" span={2}><TextInput value={treatmentForm.descBn} onChange={(e) => setTreatmentForm({ ...treatmentForm, descBn: e.target.value })} /></Field>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Btn variant={editingIndex !== null ? 'primary' : 'secondary'} onClick={addTreatment}>
              <Plus className="w-4 h-4" />
              {editingIndex !== null ? 'Update Treatment' : 'Add to List'}
            </Btn>
            {editingIndex !== null && (
              <Btn variant="secondary" onClick={() => { setEditingIndex(null); setTreatmentForm(emptyTreatment()); }}>Cancel Edit</Btn>
            )}
            <Btn onClick={handleSaveTreatmentList} disabled={saving}><Save className="w-4 h-4" /> Save Estimator List</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}