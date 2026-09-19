import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Eye, CalendarX2, Ban } from 'lucide-react';
import { appointmentApi } from '../../services/appointmentApi';
import { doctorApi } from '../../services/doctorApi';
import { patientApi } from '../../services/patientApi';
import { serviceApi } from '../../services/serviceApi';
import { ipBlockApi } from '../../services/contentApi';
import {
  PageHeader, Card, Btn, Spinner, EmptyState, ErrorBanner,
  Th, Td, statusBadge, Select, Modal, Field, TextInput, ConfirmDelete,
} from '../ui';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
const fmtDate = (d) => {
  if (!d) return '—';
  return String(d).slice(0, 10);
};

export default function Appointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', doctorId: '', q: '' });

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [newForm, setNewForm] = useState({
    patientId: '',
    doctorId: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '10:00',
    reason: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.doctorId) params.doctorId = filters.doctorId;
      if (filters.q) params.q = filters.q;
      const res = await appointmentApi.list(params);
      setItems(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      setError(err.message || 'Could not load appointments');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    doctorApi.listPublic().then((r) => setDoctors(r.data?.items || [])).catch(() => { });
    patientApi.list({ limit: 200 }).then((r) => setPatients(r.data?.items || [])).catch(() => { });
    serviceApi.list({ limit: 100 }).then((r) => setServices(r.data?.items || [])).catch(() => { });
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await appointmentApi.changeStatus(id, { status });
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      if (selected && selected.id === id) setSelected({ ...selected, status });
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await appointmentApi.create({
        ...newForm,
        patientId: Number(newForm.patientId),
        doctorId: Number(newForm.doctorId),
        serviceId: newForm.serviceId ? Number(newForm.serviceId) : undefined,
      });
      setNewOpen(false);
      setNewForm({ patientId: '', doctorId: '', serviceId: '', appointmentDate: '', appointmentTime: '10:00', reason: '' });
      load();
    } catch (err) {
      setFormError(err.message || 'Could not create appointment');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await appointmentApi.remove(deleteTarget.id);
      setItems((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const blockIp = async (ip) => {
    if (!ip) {
      alert('No IP address recorded for this booking.');
      return;
    }
    if (!window.confirm(`Block this IP address?\n\n${ip}\n\nThe visitor will no longer be able to book appointments.`)) return;
    try {
      await ipBlockApi.block({ ip, reason: `Blocked from appointment ${selected?.appointmentNumber || ''}` });
      alert(`${ip} has been blocked.`);
    } catch (err) {
      alert(err.message || 'Failed to block IP');
    }
  };


  const totalPages = Math.max(1, Math.ceil(total / 20));
  const dateStr = (d) => String(d || '').slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={`${total} total`}
        actions={
          <>
            <Btn variant="secondary" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn>
            <Btn onClick={() => setNewOpen(true)}><Plus className="w-4 h-4" /> New</Btn>
          </>
        }
      />

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            placeholder="Search number / patient / phone..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={filters.doctorId} onChange={(e) => setFilters({ ...filters, doctorId: e.target.value })}>
            <option value="">All doctors</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState message="No appointments found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#EDF7FC]">
                <tr>
                  <Th>Ref</Th>
                  <Th>Patient</Th>
                  <Th>Date</Th>
                  <Th>Time</Th>
                  <Th>IP</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B8D8EE]">
                {items.map((a) => (
                  <tr key={a.id} className="hover:bg-[#EDF7FC]">
                    <Td className="font-mono text-xs">{a.appointmentNumber}</Td>
                    <Td>
                      <div className="font-medium">{a.patient?.firstName} {a.patient?.lastName}</div>
                      <div className="text-xs text-[#5A7A9A]">{a.patient?.phone}</div>
                    </Td>
                    <Td>{dateStr(a.appointmentDate)}</Td>
                    <Td>{a.appointmentTime || '—'}</Td>
                    <Td>
                      {a.ipAddress ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs">{a.ipAddress}</span>
                      ) : (
                        <span className="text-[#BDC9D6]">—</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {statusBadge(a.status)}
                        <select
                          value={a.status}
                          onChange={(e) => changeStatus(a.id, e.target.value)}
                          className="text-xs bg-transparent border border-[#B8D8EE] rounded-lg px-1.5 py-0.5 text-[#0A2255]"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Btn variant="ghost" className="!px-2 !py-1" onClick={() => { setSelected(a); setViewOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Btn>
                        <Btn variant="ghost" className="!px-2 !py-1 text-rose-500" onClick={() => setDeleteTarget(a)}>
                          <CalendarX2 className="w-4 h-4" />
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
      <Modal open={viewOpen} title="Appointment Details" onClose={() => setViewOpen(false)} wide>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Reference"><div className="text-sm font-mono">{selected.appointmentNumber}</div></Field>
              <Field label="Status"><div>{statusBadge(selected.status)}</div></Field>
              <Field label="Patient">
                <div className="text-sm">
                  {selected.patient?.firstName} {selected.patient?.lastName}<br />
                  <span className="text-xs text-[#5A7A9A]">{selected.patient?.phone} · {selected.patient?.email || 'no email'}</span>
                </div>
              </Field>
              <Field label="Doctor"><div className="text-sm">{selected.doctor?.name || '—'}</div></Field>
              <Field label="Service"><div className="text-sm">{selected.service?.name?.en || selected.service?.name || selected.service?.slug || '—'}</div></Field>
              <Field label="Date & Time"><div className="text-sm">{dateStr(selected.appointmentDate)} at {selected.appointmentTime || '—'}</div></Field>
              {selected.ipAddress && (
                <Field label="Booking IP">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{selected.ipAddress}</span>
                    <Btn variant="secondary" className="!px-2 !py-1 text-rose-600" onClick={() => blockIp(selected.ipAddress)}>
                      <Ban className="w-3.5 h-3.5" /> Block
                    </Btn>
                  </div>
                </Field>
              )}
            </div>
            {selected.reason && (
              <Field label="Reason"><div className="text-sm text-[#0A2255]">{selected.reason}</div></Field>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {STATUS_OPTIONS.filter((s) => s !== selected.status).map((s) => (
                <Btn key={s} variant="secondary" onClick={() => { changeStatus(selected.id, s); setViewOpen(false); }}>
                  Mark {s}
                </Btn>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Create modal */}
      <Modal open={newOpen} title="New Appointment" onClose={() => setNewOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          <Field label="Patient">
            <Select required value={newForm.patientId} onChange={(e) => setNewForm({ ...newForm, patientId: e.target.value })}>
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.patientId} — {p.firstName} {p.lastName} ({p.phone})</option>
              ))}
            </Select>
          </Field>
          <Field label="Doctor">
            <Select required value={newForm.doctorId} onChange={(e) => setNewForm({ ...newForm, doctorId: e.target.value })}>
              <option value="">Select doctor...</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Field>
          <Field label="Service">
            <Select value={newForm.serviceId} onChange={(e) => setNewForm({ ...newForm, serviceId: e.target.value })}>
              <option value="">No service (optional)</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name?.en || s.slug}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><TextInput required type="date" value={newForm.appointmentDate} onChange={(e) => setNewForm({ ...newForm, appointmentDate: e.target.value })} /></Field>
            <Field label="Time"><TextInput required type="time" value={newForm.appointmentTime} onChange={(e) => setNewForm({ ...newForm, appointmentTime: e.target.value })} /></Field>
          </div>
          <Field label="Reason"><TextInput value={newForm.reason} onChange={(e) => setNewForm({ ...newForm, reason: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</Btn>
          </div>
        </form>
      </Modal>

      <ConfirmDelete open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} busy={deleting} />
    </div>
  );
}