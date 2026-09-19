import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Banknote, Pencil, Trash2, Printer } from 'lucide-react';
import { invoiceApi, paymentApi } from '../../services/billingApi';
import { patientApi } from '../../services/patientApi';
import {
  PageHeader, Card, Btn, Spinner, EmptyState, ErrorBanner,
  Th, Td, statusBadge, Modal, Field, TextInput, Select, ConfirmDelete,
} from '../ui';

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('invoices');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [patientSearching, setPatientSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [invOpen, setInvOpen] = useState(false);
  const [invForm, setInvForm] = useState({ patientId: '', appointmentId: '', subtotal: '', discount: '0', tax: '0', note: '' });
  const [invRow, setInvRow] = useState([{ description: '', amount: '' }]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [payFor, setPayFor] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: 'CASH', transactionRef: '', note: '' });

  const [editInv, setEditInv] = useState(null);
  const [editForm, setEditForm] = useState({ subtotal: '', discount: '0', tax: '0', note: '' });
  const [editRow, setEditRow] = useState([{ description: '', amount: '' }]);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const computedSubtotal = invRow.reduce((s, r) => s + Number(r.amount || 0), 0);
  const computedTotal = computedSubtotal - Number(invForm.discount || 0) + Number(invForm.tax || 0);

  const editComputedSubtotal = editRow.reduce((s, r) => s + Number(r.amount || 0), 0);
  const editComputedTotal = editComputedSubtotal - Number(editForm.discount || 0) + Number(editForm.tax || 0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [invRes, payRes] = await Promise.all([invoiceApi.list({ limit: 100 }), paymentApi.list({ limit: 50 })]);
      setInvoices(invRes.data?.items || []);
      setPayments(payRes.data?.items || []);
    } catch (err) {
      setError(err.message || 'Could not load billing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Type-ahead search for the "New Invoice" patient picker.
  useEffect(() => {
    if (!invOpen || selectedPatient) return;
    const q = patientQuery.trim();
    if (!q) {
      setPatientResults([]);
      return;
    }
    setPatientSearching(true);
    const timer = setTimeout(async () => {
      try {
        const r = await patientApi.search({ q, limit: 15 });
        setPatientResults(r.data?.items || []);
      } catch {
        setPatientResults([]);
      } finally {
        setPatientSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [invOpen, patientQuery, selectedPatient]);

  const openNewInvoice = () => {
    setInvForm({ patientId: '', appointmentId: '', subtotal: '', discount: '0', tax: '0', note: '' });
    setInvRow([{ description: '', amount: '' }]);
    setFormError('');
    setPatientQuery('');
    setPatientResults([]);
    setSelectedPatient(null);
    setInvOpen(true);
  };

  const pickPatient = (p) => {
    setSelectedPatient(p);
    setInvForm((f) => ({ ...f, patientId: String(p.id) }));
    setPatientQuery('');
    setPatientResults([]);
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setPatientQuery('');
    setPatientResults([]);
    setInvForm((f) => ({ ...f, patientId: '' }));
  };

  const openPay = (inv) => {
    setPayFor(inv);
    setPayForm({ amount: String(inv.due || 0), method: 'CASH', transactionRef: '', note: '' });
    setPayOpen(true);
  };

  const openEdit = (inv) => {
    setEditInv(inv);
    const items = inv.items?.length ? inv.items : [{ description: '', amount: '' }];
    setEditForm({ subtotal: String(inv.subtotal || 0), discount: String(inv.discount || 0), tax: String(inv.tax || 0), note: inv.note || '' });
    setEditRow(items.map((it) => ({ description: it.description || '', amount: String(it.amount || '') })));
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setFormError('Please search for and select a patient.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const items = invRow.filter((r) => r.description.trim());
      const subtotal = items.length ? computedSubtotal : Number(invForm.subtotal);
      const payload = {
        patientId: Number(invForm.patientId),
        appointmentId: invForm.appointmentId ? Number(invForm.appointmentId) : null,
        subtotal,
        discount: Number(invForm.discount || 0),
        tax: Number(invForm.tax || 0),
        note: invForm.note || null,
        items,
      };
      await invoiceApi.create(payload);
      setInvOpen(false);
      setInvForm({ patientId: '', appointmentId: '', subtotal: '', discount: '0', tax: '0', note: '' });
      setInvRow([{ description: '', amount: '' }]);
      setPatientQuery('');
      setPatientResults([]);
      setSelectedPatient(null);
      load();
    } catch (err) {
      setFormError(err.message || 'Could not create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleEditInvoice = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const items = editRow.filter((r) => r.description.trim());
      await invoiceApi.update(editInv.id, {
        subtotal: editComputedSubtotal,
        discount: Number(editForm.discount || 0),
        tax: Number(editForm.tax || 0),
        note: editForm.note || null,
        items,
      });
      setEditInv(null);
      load();
    } catch (err) {
      setFormError(err.message || 'Could not update invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await invoiceApi.remove(deleteTarget.id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Could not delete invoice');
    } finally {
      setSaving(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await paymentApi.create({
        invoiceId: payFor.id,
        amount: Number(payForm.amount),
        method: payForm.method,
        transactionRef: payForm.transactionRef || null,
        note: payForm.note || null,
      });
      setPayOpen(false);
      load();
    } catch (err) {
      setFormError(err.message || 'Could not record payment');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = (inv) => {
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) return;
    const paid = inv.payments || [];
    const patient = inv.patient || {};
    w.document.write(`
      <html><head><title>Invoice ${inv.invoiceNumber}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #111; max-width: 600px; margin: 0 auto; }
        h1 { font-size: 18px; margin: 0 0 1px; }
        .sub { color: #555; font-size: 12px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; }
        .total { font-weight: bold; font-size: 14px; text-align: right; margin-top: 8px; }
        .note { font-size: 12px; color: #666; margin-top: 12px; border-top: 1px solid #ddd; padding-top: 8px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>Nahol Dental Care </h1>
      <p>Naholdentalcare.com.bd</p>
      <div class="sub">Invoice: ${inv.invoiceNumber} | Date: ${inv.createdAt ? String(inv.createdAt).slice(0, 10) : ''}</div>
      <div class="sub">Patient: ${patient.firstName || ''} ${patient.lastName || ''} | Phone: ${patient.phone || ''}</div>
      <table>
        <thead><tr><th>Description</th><th style="text-align:right">Amount (৳)</th></tr></thead>
        <tbody>
          ${(inv.items || []).map((it) => `<tr><td>${it.description || ''}</td><td style="text-align:right">${Number(it.amount || 0).toLocaleString()}</td></tr>`).join('')}
          ${(!inv.items || inv.items.length === 0) ? `<tr><td>Service charge</td><td style="text-align:right">${Number(inv.subtotal || inv.totalAmount || 0).toLocaleString()}</td></tr>` : ''}
        </tbody>
      </table>
      <div class="total">Subtotal: ৳${Number(inv.subtotal || 0).toLocaleString()}</div>
      ${inv.discount > 0 ? `<div class="total">Discount: -৳${Number(inv.discount).toLocaleString()}</div>` : ''}
      ${inv.tax > 0 ? `<div class="total">Tax: ৳${Number(inv.tax).toLocaleString()}</div>` : ''}
      <div class="total">Total: ৳${Number(inv.total || inv.totalAmount || 0).toLocaleString()}</div>
      <div class="total" style="color:${inv.due > 0 ? '#dc2626' : '#16a34a'}">Due: ৳${Number(inv.due || 0).toLocaleString()}</div>
      ${inv.note ? `<div class="note"><strong>Note:</strong> ${inv.note}</div>` : ''}
      ${paid.length > 0 ? `<div class="note"><strong>Payments:</strong><br/>${paid.map((p) => `${p.paymentNumber || p.receiptNumber || '#'} — ৳${Number(p.amount).toLocaleString()} (${p.method}) — ${p.paymentDate ? String(p.paymentDate).slice(0, 10) : ''}`).join('<br/>')}</div> <br/> <h6> Software Development : webfix.com.bd</h6>` : ''}
      <script>window.onload=()=>window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Invoices and payments"
        actions={
          <>
            <Btn variant="secondary" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Btn>
            <Btn onClick={openNewInvoice}><Plus className="w-4 h-4" /> New Invoice</Btn>
          </>
        }
      />

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('invoices')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'invoices' ? 'bg-[#2299D6] text-white' : 'bg-white border border-[#B8D8EE] text-[#0A2255]'}`}>
          Invoices ({invoices.length})
        </button>
        <button onClick={() => setTab('payments')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'payments' ? 'bg-[#2299D6] text-white' : 'bg-white border border-[#B8D8EE] text-[#0A2255]'}`}>
          Payments ({payments.length})
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {tab === 'invoices' ? (
        <Card className="overflow-hidden p-0">
          {loading ? (
            <Spinner />
          ) : invoices.length === 0 ? (
            <EmptyState message="No invoices yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#EDF7FC]">
                  <tr>
                    <Th>Invoice #</Th>
                    <Th>Patient</Th>
                    <Th>Total</Th>
                    <Th>Due</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8D8EE]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#EDF7FC]">
                      <Td className="font-mono text-xs">{inv.invoiceNumber}</Td>
                      <Td>
                        <div className="font-medium">{inv.patient?.firstName} {inv.patient?.lastName}</div>
                        <div className="text-xs text-[#5A7A9A]">{inv.patient?.phone}</div>
                      </Td>
                      <Td>৳{Number(inv.total ?? inv.totalAmount ?? 0).toLocaleString()}</Td>
                      <Td className={inv.due > 0 ? 'text-rose-500 font-semibold' : 'text-[#2299D6] font-semibold'}>
                        ৳{Number(inv.due || 0).toLocaleString()}
                      </Td>
                      <Td>{statusBadge(inv.paymentStatus)}</Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.due > 0 && (
                            <Btn variant="ghost" className="!px-2 !py-1" onClick={() => openPay(inv)}>
                              <Banknote className="w-4 h-4" /> <span className="text-xs font-semibold">Pay</span>
                            </Btn>
                          )}
                          <Btn variant="ghost" className="!px-2 !py-1" onClick={() => handlePrint(inv)}>
                            <Printer className="w-4 h-4" />
                          </Btn>
                          <Btn variant="ghost" className="!px-2 !py-1" onClick={() => openEdit(inv)}>
                            <Pencil className="w-4 h-4" />
                          </Btn>
                          <Btn variant="ghost" className="!px-2 !py-1 text-rose-500" onClick={() => setDeleteTarget(inv)}>
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
      ) : (
        <Card className="overflow-hidden p-0">
          {loading ? (
            <Spinner />
          ) : payments.length === 0 ? (
            <EmptyState message="No payments recorded yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-[#EDF7FC]">
                  <tr>
                    <Th>Payment</Th>
                    <Th>Invoice</Th>
                    <Th>Amount</Th>
                    <Th>Method</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B8D8EE]">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#EDF7FC]">
                      <Td className="font-mono text-xs">{p.paymentNumber || p.receiptNumber || `#${p.id}`}</Td>
                      <Td className="font-mono text-xs">{p.invoice?.invoiceNumber || `#${p.invoiceId}`}</Td>
                      <Td className="font-semibold">৳{Number(p.amount).toLocaleString()}</Td>
                      <Td>{p.method}</Td>
                      <Td>{p.paymentDate ? String(p.paymentDate).slice(0, 10) : '—'}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* New invoice */}
      <Modal open={invOpen} title="New Invoice" onClose={() => setInvOpen(false)} wide>
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Patient (search by name or phone)">
              {selectedPatient ? (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE]">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0A2255] truncate">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                    <p className="text-xs text-[#5A7A9A] truncate">{selectedPatient.phone || 'No phone'} · {selectedPatient.patientId}</p>
                  </div>
                  <button type="button" onClick={clearPatient} className="text-xs font-semibold text-rose-500 hover:underline shrink-0">Change</button>
                </div>
              ) : (
                <div className="relative">
                  <TextInput
                    placeholder="Search by mobile number or name..."
                    value={patientQuery}
                    onChange={(e) => setPatientQuery(e.target.value)}
                    autoComplete="off"
                  />
                  {patientQuery.trim() && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-60 overflow-y-auto bg-white border border-[#B8D8EE] rounded-xl shadow-lg">
                      {patientSearching ? (
                        <div className="px-3 py-2 text-xs text-[#5A7A9A]">Searching...</div>
                      ) : patientResults.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-[#5A7A9A]">No patients found — register the patient first.</div>
                      ) : (
                        patientResults.map((p) => (
                          <button key={p.id} type="button" onClick={() => pickPatient(p)} className="w-full text-left px-3 py-2 hover:bg-[#EDF7FC] transition-colors">
                            <div className="text-sm font-medium text-[#0A2255] truncate">{p.firstName} {p.lastName}</div>
                            <div className="text-xs text-[#5A7A9A] truncate">{p.phone || 'No phone'} · {p.patientId}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </Field>
            <Field label="Appointment ID (optional)"><TextInput type="number" value={invForm.appointmentId} onChange={(e) => setInvForm({ ...invForm, appointmentId: e.target.value })} /></Field>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5A7A9A] mb-1.5">Line Items</label>
            <div className="space-y-2">
              {invRow.map((row, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2">
                  <TextInput placeholder="Description" value={row.description} onChange={(e) => { const next = [...invRow]; next[i] = { ...row, description: e.target.value }; setInvRow(next); }} />
                  <TextInput type="number" min="0" placeholder="Amount" value={row.amount} onChange={(e) => { const next = [...invRow]; next[i] = { ...row, amount: e.target.value }; setInvRow(next); }} />
                  <button type="button" onClick={() => setInvRow((r) => r.filter((_, idx) => idx !== i))} className="px-3 rounded-xl border border-[#B8D8EE] text-rose-500 text-sm">–</button>
                </div>
              ))}
              <Btn type="button" variant="secondary" onClick={() => setInvRow([...invRow, { description: '', amount: '' }])}>+ Add item</Btn>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Discount (৳)"><TextInput type="number" min="0" value={invForm.discount} onChange={(e) => setInvForm({ ...invForm, discount: e.target.value })} /></Field>
            <Field label="Tax (৳)"><TextInput type="number" min="0" value={invForm.tax} onChange={(e) => setInvForm({ ...invForm, tax: e.target.value })} /></Field>
            <Field label="Subtotal (auto)">
              <div className="px-3 py-2.5 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE] text-sm font-semibold text-[#0A2255]">৳{computedSubtotal.toLocaleString()}</div>
            </Field>
          </div>

          {invRow.some((r) => r.description.trim() || r.amount) && (
            <div className="flex justify-end">
              <div className="p-3 rounded-xl bg-[#14357B] text-white text-sm font-bold">
                Total: ৳{Math.max(computedTotal, 0).toLocaleString()}
              </div>
            </div>
          )}
          <Field label="Note"><TextInput value={invForm.note} onChange={(e) => setInvForm({ ...invForm, note: e.target.value })} /></Field>

          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="secondary" onClick={() => setInvOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Invoice'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Edit invoice */}
      <Modal open={!!editInv} title={`Edit Invoice — ${editInv?.invoiceNumber || ''}`} onClose={() => setEditInv(null)} wide>
        <form onSubmit={handleEditInvoice} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          {editInv && (
            <div className="text-sm text-[#5A7A9A]">
              Patient: <strong>{editInv.patient?.firstName} {editInv.patient?.lastName}</strong> | Total: <strong>৳{Number(editInv.total || editInv.totalAmount || 0).toLocaleString()}</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5A7A9A] mb-1.5">Line Items</label>
            <div className="space-y-2">
              {editRow.map((row, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2">
                  <TextInput placeholder="Description" value={row.description} onChange={(e) => { const next = [...editRow]; next[i] = { ...row, description: e.target.value }; setEditRow(next); }} />
                  <TextInput type="number" min="0" placeholder="Amount" value={row.amount} onChange={(e) => { const next = [...editRow]; next[i] = { ...row, amount: e.target.value }; setEditRow(next); }} />
                  <button type="button" onClick={() => setEditRow((r) => r.filter((_, idx) => idx !== i))} className="px-3 rounded-xl border border-[#B8D8EE] text-rose-500 text-sm">–</button>
                </div>
              ))}
              <Btn type="button" variant="secondary" onClick={() => setEditRow([...editRow, { description: '', amount: '' }])}>+ Add item</Btn>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Discount (৳)"><TextInput type="number" min="0" value={editForm.discount} onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })} /></Field>
            <Field label="Tax (৳)"><TextInput type="number" min="0" value={editForm.tax} onChange={(e) => setEditForm({ ...editForm, tax: e.target.value })} /></Field>
            <Field label="Subtotal (auto)">
              <div className="px-3 py-2.5 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE] text-sm font-semibold text-[#0A2255]">৳{editComputedSubtotal.toLocaleString()}</div>
            </Field>
          </div>

          {editRow.some((r) => r.description.trim() || r.amount) && (
            <div className="flex justify-end">
              <div className="p-3 rounded-xl bg-[#14357B] text-white text-sm font-bold">
                Total: ৳{Math.max(editComputedTotal, 0).toLocaleString()}
              </div>
            </div>
          )}
          <Field label="Note"><TextInput value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} /></Field>

          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="secondary" onClick={() => setEditInv(null)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Payment modal */}
      <Modal open={payOpen && !!payFor} title={`Record Payment — Invoice ${payFor?.invoiceNumber || ''}`} onClose={() => setPayOpen(false)}>
        <form onSubmit={handlePayment} className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          {payFor && (
            <div className="text-sm text-[#0A2255]">
              Amount due: <strong className="text-rose-500">৳{Number(payFor.due || 0).toLocaleString()}</strong>
            </div>
          )}
          <Field label="Amount (৳)"><TextInput required type="number" min="1" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} /></Field>
          <Field label="Method">
            <Select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
              {['CASH', 'CARD', 'BANK', 'MOBILE_BANKING', 'OTHER'].map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Transaction Ref"><TextInput value={payForm.transactionRef} onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })} /></Field>
          <Field label="Note"><TextInput value={payForm.note} onChange={(e) => setPayForm({ ...payForm, note: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="secondary" onClick={() => setPayOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Record Payment'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDelete
        open={!!deleteTarget}
        title={`Delete invoice ${deleteTarget?.invoiceNumber}?`}
        onConfirm={handleDeleteInvoice}
        onClose={() => setDeleteTarget(null)}
        busy={saving}
      />
    </div>
  );
}