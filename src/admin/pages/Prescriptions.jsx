import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus, RefreshCw, Pill, Printer, Pencil, Trash2, X, Stethoscope, Clock, QrCode,
} from 'lucide-react';
import { prescriptionApi, prescriptionVerifyUrl } from '../../services/billingApi';
import { patientApi } from '../../services/patientApi';
import { doctorApi } from '../../services/doctorApi';
import { chamberApi } from '../../services/contentApi';
import { appointmentApi } from '../../services/appointmentApi';
import {
  PageHeader, Card, Btn, Spinner, EmptyState, ErrorBanner, Modal, ConfirmDelete,
  Th, Td, Field, TextInput, Select, Badge,
} from '../ui';

const PAGE_SIZE = 20;

let uidSeq = 0;
const nextUid = () => `rx-${(uidSeq += 1)}`;

const emptyItem = () => ({
  uid: nextUid(),
  medicine: '',
  dosage: [],
  frequency: [],
  duration: [],
  notes: '',
});

const emptyForm = () => ({
  patientId: '',
  doctorId: '',
  chamberId: '',
  items: [emptyItem()],
  notes: '',
  followUpDate: '',
});

// The API stores dosage / frequency / duration as either a string or a list of
// strings, so everything is normalised to an array on the way in and out.
const toEntries = (value) => {
  if (value === null || value === undefined || value === '') return [];
  return (Array.isArray(value) ? value : [value]).map((v) => String(v).trim()).filter(Boolean);
};

const fromDoc = (row) => {
  const items = (Array.isArray(row.items) && row.items.length
    ? row.items
    : row.medicine
      ? [{ medicine: row.medicine, dosage: row.dosage, frequency: row.frequency, duration: row.duration }]
      : []
  ).map((it) => ({
    uid: nextUid(),
    medicine: it.medicine || '',
    dosage: toEntries(it.dosage),
    frequency: toEntries(it.frequency),
    duration: toEntries(it.duration),
    notes: it.notes || '',
  }));

  return {
    patientId: String(row.patientId ?? ''),
    doctorId: String(row.doctorId ?? ''),
    chamberId: String(row.chamberId ?? ''),
    items: items.length ? items : [emptyItem()],
    notes: row.notes || row.instructions || '',
    followUpDate: row.followUpDate || '',
  };
};

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fullName = (p) => (p ? [p.firstName, p.lastName].filter(Boolean).join(' ').trim() : '');

const joinEntries = (list) => (Array.isArray(list) ? list.join(', ') : toEntries(list).join(', '));

// The pad is rendered into a dedicated node appended directly to <body>
// instead of inside a modal. A modal creates its own scroll container and
// stacking context, so window.print() used to capture the page behind it (or
// nothing at all). Hiding every sibling of .rx-print-root in the print
// stylesheet is what makes the output correct -- see src/index.css.
function PrintPortal({ open, onClose, children }) {
  const [host, setHost] = useState(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const el = document.createElement('div');
    el.className = 'rx-print-root';
    document.body.appendChild(el);
    setHost(el);

    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      el.remove();
      setHost(null);
    };
  }, [open]);

  if (!open || !host) return null;
  return createPortal(children, host);
}

// Chip-style input so a single medicine row can hold several dosage, frequency
// or duration entries. Enter or comma commits the current text, Backspace on an
// empty box removes the last chip.
function MultiEntryInput({ value = [], onChange, placeholder, className = '' }) {
  const [text, setText] = useState('');

  const commit = (raw) => {
    const parts = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(text);
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white border border-[#B8D8EE] focus-within:ring-2 focus-within:ring-[#2299D6] transition-all ${className}`}
    >
      {value.map((entry) => (
        <span
          key={entry}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#EDF7FC] text-[#0A2255] text-xs font-medium"
        >
          {entry}
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== entry))}
            className="text-[#5A7A9A] hover:text-rose-600"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => commit(text)}
        placeholder={value.length ? '' : placeholder}
        className="flex-1 min-w-[90px] bg-transparent text-sm text-[#0A2255] focus:outline-none py-0.5"
      />
    </div>
  );
}

// The printable doctor prescription pad.
function PrescriptionPad({ data }) {
  const items = Array.isArray(data.items) && data.items.length
    ? data.items
    : data.medicine
      ? [{ medicine: data.medicine, dosage: data.dosage, frequency: data.frequency, duration: data.duration, notes: null }]
      : [];

  const p = data.patient || {};

  // The pad prints the clinic the patient actually booked at -- prescriptions
  // written from a booking carry the chamber that was selected. Records created
  // before the chamber was stored fall back to the original Uttara letterhead.
  const ch = data.chamber || {};
  const title = ch.name || 'Nahol Dental Care';
  const identLines = (
    ch.name
      ? [ch.address, ch.phone]
      : ['House#19 (1st floor), Lake Drive Road, Sector#07, Uttara, Dhaka-1230', '+8801948921229']
  ).filter(Boolean);

  return (
    <div className="bg-white text-[#0A2255]">
      <div className="text-center pb-4 border-b-2 border-[#0A2255]">
        <h2 className="text-2xl font-bold font-display tracking-wide">{title}</h2>
        {identLines.length > 0 && (
          <p className="text-[11px] text-[#5A7A9A] mt-1 leading-relaxed">
            {identLines.map((line, i) => (
              <span key={i}>{line}{i < identLines.length - 1 && <br />}</span>
            ))}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 py-4 text-xs border-b border-[#B8D8EE]">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A]">Patient Name</span>
          <span className="font-semibold">{fullName(p) || data.patientName || '—'}</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A]">Patient ID</span>
          <span className="font-semibold">{p.patientId || '—'}</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A]">Age / Sex</span>
          <span className="font-semibold">
            {[p.age, p.gender].filter(Boolean).join(' / ') || '—'}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A]">Date</span>
          <span className="font-semibold">{fmtDate(data.createdAt)}</span>
        </div>
      </div>

      <div className="py-3">
        <span className="text-2xl font-display font-bold italic text-[#2299D6]">Rx</span>
      </div>

      <table className="w-full border border-[#B8D8EE] rx-print-table">
        <thead className="bg-[#EDF7FC]">
          <tr>
            <Th className="w-8">#</Th>
            <Th>Medicine</Th>
            <Th>Dosage</Th>
            <Th>Frequency</Th>
            <Th>Duration</Th>
            <Th>Note</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.medicine + i} className="border-t border-[#B8D8EE] align-top">
              <Td className="text-[#5A7A9A]">{i + 1}</Td>
              <Td className="font-semibold">{item.medicine}</Td>
              <Td className="text-[#5A7A9A]">{joinEntries(item.dosage) || '—'}</Td>
              <Td className="text-[#5A7A9A]">{joinEntries(item.frequency) || '—'}</Td>
              <Td className="text-[#5A7A9A]">{joinEntries(item.duration) || '—'}</Td>
              <Td className="text-[#5A7A9A]">
                {item.notes || <span className="opacity-40">—</span>}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      {(data.notes || data.instructions) && (
        <div className="mt-4 text-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A] mb-1">Advice</span>
          <p className="whitespace-pre-line leading-relaxed">{data.notes || data.instructions}</p>
        </div>
      )}

      {data.followUpDate && (
        <div className="mt-3 text-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A] mb-1">Follow-up</span>
          <p className="font-semibold">{fmtDate(data.followUpDate)}</p>
        </div>
      )}

      <div className="mt-8 flex items-end justify-between gap-6 rx-keep-together">
        <div className="flex items-center gap-3">
          {data.verificationCode ? (
            <>
              <div className="p-1.5 bg-white border border-[#B8D8EE] rounded-lg">
                <QRCodeSVG
                  value={prescriptionVerifyUrl(data.verificationCode)}
                  size={78}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#0A2255"
                />
              </div>
              <div className="text-[10px] text-[#5A7A9A] leading-relaxed">
                <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                  <QrCode className="w-3 h-3" /> Scan to verify
                </span>
                <span className="block mt-0.5 font-mono text-xs font-bold tracking-widest text-[#0A2255]">
                  {data.verificationCode}
                </span>
                <span className="block mt-0.5">
                  {data.expireAt
                    ? `Valid until ${fmtDate(data.expireAt)}`
                    : 'No expiry date'}
                </span>
              </div>
            </>
          ) : (
            <span className="text-[11px] text-[#5A7A9A]">
              <Clock className="w-3 h-3 inline" />&nbsp;Auto-expires {fmtDate(data.expireAt)}
            </span>
          )}
        </div>

        <div className="text-center">
          <div className="w-44 border-t border-[#0A2255] pt-1.5">
            <p className="text-sm font-semibold flex items-center justify-center gap-1">
              <Stethoscope className="w-4 h-4" /> {data.doctor?.name || '—'}
            </p>
            <p className="text-[10px] text-[#5A7A9A]">
              {data.doctor?.specialization || 'Prescribing Doctor'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small datalist-backed input so staff can find a patient by name, id or phone
// without leaving the prescription form. In filter mode `clearOnType` is false
// so typing a new search does not drop the filter that is currently applied.
function PatientPicker({ value, onChange, autoFocus = false, clearOnType = true }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const runSearch = (q) => {
    setQuery(q);
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await patientApi.search({ q: q.trim(), limit: 8 });
        setResults(res.data?.items || res.data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
  };

  useEffect(() => {
    if (value && !selected) {
      patientApi.get(value).then((res) => setSelected(res.data?.patient || null)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <TextInput
        autoFocus={autoFocus}
        value={selected ? `${fullName(selected)} (${selected.patientId})` : query}
        onChange={(e) => {
          if (clearOnType) { setSelected(null); onChange(''); }
          runSearch(e.target.value);
        }}
        placeholder="Search patient by name, ID or phone..."
      />
      {searching && <span className="absolute right-3 top-2.5 text-xs text-[#5A7A9A]">...</span>}
      {results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#B8D8EE] rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {results.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => { setSelected(p); setResults([]); setQuery(''); onChange(String(p.id)); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#EDF7FC] border-b border-[#EDF7FC] last:border-0"
            >
              <span className="font-medium text-[#0A2255]">{fullName(p)}</span>
              <span className="text-xs text-[#5A7A9A] ml-2">{p.patientId}{p.phone ? ` · ${p.phone}` : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Prescriptions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkPatientId = searchParams.get('patientId') || '';
  const openNewFromLink = searchParams.get('new') === '1';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [retentionLabel, setRetentionLabel] = useState('6 months');

  const [filterPatient, setFilterPatient] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [chambers, setChambers] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [viewing, setViewing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Arriving from a patient record: pre-filter the list and open a blank form
  // for that patient.
  useEffect(() => {
    if (!deepLinkPatientId) return;
    setFilterPatient(deepLinkPatientId);
    setPage(1);
    if (openNewFromLink) {
      setEditing(null);
      setForm({ ...emptyForm(), patientId: deepLinkPatientId });
      setFormError('');
      setFormOpen(true);
      prefillBranchForPatient(deepLinkPatientId);
    }
    setSearchParams({}, { replace: true });
  }, [deepLinkPatientId, openNewFromLink, setSearchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (filterPatient) params.patientId = filterPatient;
      const res = await prescriptionApi.list(params);
      setItems(res.data?.items || []);
      setTotal(res.data?.total || 0);
      if (res.data?.retentionLabel) setRetentionLabel(res.data.retentionLabel);
    } catch (err) {
      setError(err.message || 'Could not load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [page, filterPatient]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    doctorApi.list({ limit: 100 })
      .then((res) => setDoctors(res.data?.items || []))
      .catch(() => setDoctors([]));
    chamberApi.listPublic()
      .then((res) => setChambers(res.data?.items || []))
      .catch(() => setChambers([]));
  }, []);

  // Prescriptions are usually written for the branch the patient just visited,
  // so picking a patient fills the Branch field from their most recent booked
  // appointment. Staff can override it in the Branch select; if left at
  // "Auto", the API applies the same inference on save.
  const prefillBranchForPatient = (patientId) => {
    if (!patientId) return;
    appointmentApi.list({ patientId, page: 1, limit: 1 })
      .then((res) => {
        const latest = res.data?.items?.[0];
        if (latest?.chamberId) setForm((f) => ({ ...f, chamberId: String(latest.chamberId) }));
      })
      .catch(() => {});
  };

  const pickPatient = (id) => {
    setForm((f) => ({ ...f, patientId: id }));
    prefillBranchForPatient(id);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(fromDoc(row));
    setFormError('');
    setFormOpen(true);
  };

  const setItem = (uid, patch) =>
    setForm((f) => ({ ...f, items: f.items.map((it) => (it.uid === uid ? { ...it, ...patch } : it)) }));

  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));

  const removeItem = (uid) =>
    setForm((f) => {
      const next = f.items.filter((it) => it.uid !== uid);
      return { ...f, items: next.length ? next : [emptyItem()] };
    });

  const moveItem = (index, delta) =>
    setForm((f) => {
      const target = index + delta;
      if (target < 0 || target >= f.items.length) return f;
      const next = [...f.items];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...f, items: next };
    });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.patientId) { setFormError('Please select a patient.'); return; }
    if (!form.doctorId) { setFormError('Please select the prescribing doctor.'); return; }

    const filled = form.items.filter((it) => it.medicine.trim());
    if (!filled.length) { setFormError('Add at least one medicine.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        chamberId: form.chamberId ? Number(form.chamberId) : null,
        items: filled.map((it) => ({
          medicine: it.medicine.trim(),
          dosage: it.dosage.length ? it.dosage : null,
          frequency: it.frequency.length ? it.frequency : null,
          duration: it.duration.length ? it.duration : null,
          notes: it.notes.trim() || null,
        })),
        notes: form.notes.trim() || null,
        followUpDate: form.followUpDate || null,
      };

      if (editing) {
        await prescriptionApi.update(editing.id, payload);
      } else {
        await prescriptionApi.create(payload);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err.message || 'Could not save prescription');
    } finally {
      setSaving(false);
    }
  };

  const openView = async (row) => {
    try {
      const res = await prescriptionApi.get(row.id);
      setViewing(res.data?.prescription || row);
    } catch {
      setViewing(row);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await prescriptionApi.remove(deleteTarget.id);
      setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Could not delete prescription');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // With a 6-month window, "182d left" is less readable than "6mo left".
  const remainingLabel = (days) =>
    days <= 0 ? 'Expired' : days <= 60 ? `${days}d left` : `${Math.round(days / 30)}mo left`;

  const expiryColor = (days) => {
    if (days === null || days === undefined) return 'slate';
    if (days <= 14) return 'rose';
    if (days <= 45) return 'amber';
    return 'teal';
  };

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        subtitle={`${total} prescription${total === 1 ? '' : 's'} on record · entries auto-delete after ${retentionLabel}`}
        actions={
          <>
            <Btn variant="secondary" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn>
            <Btn onClick={openCreate}><Plus className="w-4 h-4" /> New Prescription</Btn>
          </>
        }
      />

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <Field label="Filter by Patient">
              <PatientPicker
                value={filterPatient}
                clearOnType={false}
                onChange={(id) => { setFilterPatient(id); setPage(1); }}
              />
            </Field>
          </div>
          {filterPatient && (
            <Btn variant="ghost" onClick={() => { setFilterPatient(''); setPage(1); }}>
              Clear
            </Btn>
          )}
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState message="No prescriptions found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#EDF7FC]">
                <tr>
                  <Th>Date</Th>
                  <Th>Patient</Th>
                  <Th>Doctor</Th>
                  <Th>Medicines</Th>
                  <Th>Prescription</Th>
                  <Th>Expires</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B8D8EE]">
                {items.map((row) => {
                  const list = Array.isArray(row.items) ? row.items : [];
                  return (
                    <tr key={row.id} className="hover:bg-[#EDF7FC] align-top">
                      <Td className="text-xs text-[#5A7A9A] whitespace-nowrap">{fmtDate(row.createdAt)}</Td>
                      <Td>
                        <span className="font-medium">{fullName(row.patient)}</span>
                        <span className="block text-xs text-[#5A7A9A]">{row.patient?.patientId}</span>
                      </Td>
                      <Td className="text-[#5A7A9A]">{row.doctor?.name || '—'}</Td>
                      <Td>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Pill className="w-3.5 h-3.5 text-[#2299D6]" />
                          {row.medicineCount || list.length} medicine{(row.medicineCount || list.length) === 1 ? '' : 's'}
                        </span>
                      </Td>
                      <Td>
                        {list.length === 0 ? (
                          <span className="text-[#5A7A9A]">—</span>
                        ) : (
                          <ul className="space-y-1">
                            {list.slice(0, 3).map((it, i) => (
                              <li key={i} className="text-xs">
                                <span className="font-medium text-[#0A2255]">{it.medicine}</span>
                                <span className="text-[#5A7A9A]">
                                  {joinEntries(it.dosage) && ` · ${joinEntries(it.dosage)}`}
                                  {joinEntries(it.frequency) && ` · ${joinEntries(it.frequency)}`}
                                  {joinEntries(it.duration) && ` · ${joinEntries(it.duration)}`}
                                </span>
                                {it.notes && (
                                  <span className="block text-[11px] italic text-[#5A7A9A]">
                                    Note: {it.notes}
                                  </span>
                                )}
                              </li>
                            ))}
                            {list.length > 3 && (
                              <li className="text-xs text-[#5A7A9A]">+{list.length - 3} more</li>
                            )}
                          </ul>
                        )}
                      </Td>
                      <Td>
                        <Badge color={expiryColor(row.daysRemaining)}>
                          {row.daysRemaining === null || row.daysRemaining === undefined
                            ? 'No expiry'
                            : remainingLabel(row.daysRemaining)}
                        </Badge>
                        <span className="block text-[11px] text-[#5A7A9A] mt-1">{fmtDate(row.expireAt)}</span>
                      </Td>
                      <Td className="text-right">
                        <div className="inline-flex gap-1">
                          <Btn variant="ghost" className="!px-2 !py-1" title="View / print" onClick={() => openView(row)}>
                            <Printer className="w-4 h-4" />
                          </Btn>
                          <Btn variant="ghost" className="!px-2 !py-1" title="Edit" onClick={() => openEdit(row)}>
                            <Pencil className="w-4 h-4" />
                          </Btn>
                          <Btn variant="ghost" className="!px-2 !py-1 text-rose-500" title="Delete" onClick={() => setDeleteTarget(row)}>
                            <Trash2 className="w-4 h-4" />
                          </Btn>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
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

      {/* Create / edit prescription */}
      <Modal
        open={formOpen}
        title={editing ? 'Edit Prescription' : 'New Prescription'}
        onClose={() => setFormOpen(false)}
        wide
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Patient *" span={2}>
              <PatientPicker value={form.patientId} onChange={pickPatient} />
            </Field>

            <Field label="Prescribing Doctor *">
              <Select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.specialization ? ` - ${d.specialization}` : ''}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Follow-up Date">
              <TextInput
                type="date"
                value={form.followUpDate}
                onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
              />
            </Field>

            <Field label="Branch" span={2}>
              <Select value={form.chamberId} onChange={(e) => setForm({ ...form, chamberId: e.target.value })}>
                <option value="">Auto — patient&apos;s last booked branch</option>
                {chambers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="border-t border-[#B8D8EE] pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A7A9A]">
                Medicines ({form.items.length})
              </span>
              <Btn type="button" variant="secondary" className="!px-3 !py-1.5" onClick={addItem}>
                <Plus className="w-4 h-4" /> Add Medicine
              </Btn>
            </div>

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={item.uid} className="rounded-xl border border-[#B8D8EE] p-3 bg-[#F7FCFE]">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 w-6 h-6 shrink-0 rounded-lg bg-[#EDF7FC] text-[#0A2255] text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A] mb-1">Medicine *</label>
                        <TextInput
                          value={item.medicine}
                          onChange={(e) => setItem(item.uid, { medicine: e.target.value })}
                          placeholder="e.g. Amoxicillin 500mg"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A] mb-1">Dosage</label>
                        <MultiEntryInput
                          value={item.dosage}
                          onChange={(v) => setItem(item.uid, { dosage: v })}
                          placeholder="1 tablet (Enter to add more)"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A] mb-1">Frequency</label>
                        <MultiEntryInput
                          value={item.frequency}
                          onChange={(v) => setItem(item.uid, { frequency: v })}
                          placeholder="After meals (Enter to add more)"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A] mb-1">Duration</label>
                        <MultiEntryInput
                          value={item.duration}
                          onChange={(v) => setItem(item.uid, { duration: v })}
                          placeholder="7 days (Enter to add more)"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7A9A] mb-1">Row Note</label>
                        <TextInput
                          value={item.notes}
                          onChange={(e) => setItem(item.uid, { notes: e.target.value })}
                          placeholder="Take with plenty of water"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                        className="p-1 text-[#5A7A9A] hover:text-[#0A2255] disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === form.items.length - 1}
                        title="Move down"
                        className="p-1 text-[#5A7A9A] hover:text-[#0A2255] disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.uid)}
                        title="Remove medicine"
                        className="p-1 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#B8D8EE] pt-4">
            <Field label="Advice / Notes">
              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Complete the full course. Do not skip doses."
                className="w-full p-3 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] transition-all"
              />
            </Field>
          </div>

          <p className="text-xs text-[#5A7A9A] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> This prescription will be permanently deleted {retentionLabel} after it is created.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Prescription' : 'Create Prescription'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Printable prescription pad, portalled to <body> so window.print()
          captures only the pad. */}
      <PrintPortal open={!!viewing} onClose={() => setViewing(null)}>
        {viewing && (
          <div className="min-h-full flex flex-col items-center py-6">
            <div className="rx-no-print w-full max-w-4xl flex items-center justify-between gap-3 mb-4">
              <p className="text-xs text-[#5A7A9A]">
                Preview — use your browser&apos;s print dialogue to save as PDF.
              </p>
              <div className="flex gap-2">
                <Btn variant="secondary" onClick={() => setViewing(null)}>Close</Btn>
                <Btn onClick={() => window.print()}><Printer className="w-4 h-4" /> Print</Btn>
              </div>
            </div>
            <div className="rx-print-sheet w-full max-w-4xl bg-white rounded-2xl shadow-card-soft p-8">
              <PrescriptionPad data={viewing} />
            </div>
          </div>
        )}
      </PrintPortal>

      <ConfirmDelete
        open={!!deleteTarget}
        title="Delete this prescription?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        busy={deleting}
      />
    </div>
  );
}
