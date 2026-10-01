import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Copy,
  Stethoscope,
  Loader2,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { servicesData as localServices } from '../data/services';
import { doctorApi } from '../services/doctorApi';
import { serviceApi } from '../services/serviceApi';
import { appointmentApi } from '../services/appointmentApi';
import { chamberApi } from '../services/contentApi';
import { useAsyncData } from '../services/useAsyncData';
import { useToast } from '../contexts/ToastContext';

const to12h = (time24) => {
  if (!time24) return '';
  const [hStr, mm] = String(time24).split(':');
  let h = Number(hStr);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mm} ${ampm}`;
};

export default function Appointment({ t, lang, preselectedServiceId }) {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    treatment: preselectedServiceId || '',
    doctorId: '',
    chamberId: '',
    date: '',
    time: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [slotWindow, setSlotWindow] = useState(null);

  const { data: servicesData } = useAsyncData(
    () => serviceApi.listPublic().then((r) => r.data?.items || []),
    localServices
  );
  const { data: doctorsData, loading: doctorsLoading } = useAsyncData(
    () => doctorApi.listPublic().then((r) => r.data?.items || []),
    []
  );
  const { data: chambersData } = useAsyncData(
    () => chamberApi.listPublic().then((r) => r.data?.items || []),
    []
  );
  const [availableSlots, setAvailableSlots] = useState([]);

  const copy = {
    pickTreatment: lang === 'en' ? 'Please choose a treatment to continue.' : 'চালিয়ে যেতে একটি চিকিৎসা নির্বাচন করুন।',
    branchClosed: lang === 'en'
      ? 'This branch is closed on the selected day. Please pick another date or branch.'
      : 'নির্বাচিত দিনে এই শাখা বন্ধ। অন্য তারিখ বা শাখা নির্বাচন করুন।',
    noSlots: lang === 'en' ? 'No slots available for this date. Try another date.' : 'এই তারিখে কোনো স্লট নেই। অন্য তারিখে চেষ্টা করুন।',
    loadFailed: lang === 'en' ? 'Could not load available time slots.' : 'উপলব্ধ সময় লোড করা যায়নি।',
    pickTime: lang === 'en' ? 'Select a time slot' : 'সময় নির্বাচন করুন',
    pickDateFirst: lang === 'en' ? 'Select a date first' : 'আগে তারিখ নির্বাচন করুন',
    checking: lang === 'en' ? 'Checking availability...' : 'সময় যাচাই হচ্ছে...',
    retry: lang === 'en' ? 'Retry' : 'আবার চেষ্টা করুন',
    hoursFor: lang === 'en' ? 'Operating hours' : 'সময়সীমা',
    on: lang === 'en' ? 'on' : 'তারিখে',
  };

  useEffect(() => {
    if (chambersData.length > 0 && !formData.chamberId) {
      setFormData((prev) => ({ ...prev, chamberId: String(chambersData[0].id) }));
    }
  }, [chambersData]);

  useEffect(() => {
    if (preselectedServiceId) {
      setFormData((prev) => ({ ...prev, treatment: preselectedServiceId }));
    }
  }, [preselectedServiceId]);

  useEffect(() => {
    if (doctorsData.length > 0 && !formData.doctorId) {
      setFormData((prev) => ({ ...prev, doctorId: String(doctorsData[0].id) }));
    }
  }, [doctorsData]);

  // Slot availability is owned by the server: it intersects the selected
  // branch's operating hours with the doctor's schedule, so the form can never
  // offer (or accept) a time outside the branch's hours.
  const fetchSlots = async () => {
    if (!formData.doctorId || !formData.date) return;
    setLoadingSlots(true);
    setSlotsError('');
    setAvailableSlots([]);
    setSlotWindow(null);
    try {
      const res = await appointmentApi.getSlots(formData.doctorId, formData.date, formData.chamberId || null);
      const data = res.data || {};
      setSlotWindow({
        workingHours: data.workingHours || null,
        closed: Boolean(data.closed),
        branch: data.branch || null,
      });
      const raw = data.slots || [];
      setAvailableSlots(raw.map((slot) => ({ value: slot, label: to12h(slot) })));
      if (data.closed) {
        setSlotsError(copy.branchClosed);
      } else if (!raw.length) {
        setSlotsError(copy.noSlots);
      }
    } catch (err) {
      setAvailableSlots([]);
      setSlotsError(err.message || copy.loadFailed);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.doctorId, formData.date, formData.chamberId]);

  const selectedService = servicesData.find((s) => String(s.id) === String(formData.treatment));

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = lang === 'en' ? 'Please enter your full name' : 'আপনার পুরো নাম লিখুন';
    }
    if (!formData.phone.trim()) {
      errs.phone = lang === 'en' ? 'Mobile number is required' : 'মোবাইল নম্বর আবশ্যক';
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, '')) && formData.phone.length < 8) {
      errs.phone = lang === 'en' ? 'Please enter a valid phone number' : 'সঠিক মোবাইল নম্বর দিন';
    }
    if (!formData.treatment) {
      errs.treatment = copy.pickTreatment;
    }
    if (!formData.date) {
      errs.date = lang === 'en' ? 'Select a preferred date' : 'তারিখ নির্বাচন করুন';
    }
    if (formData.date && !formData.time) {
      errs.time = lang === 'en' ? 'Select a time slot' : 'সময় নির্বাচন করুন';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    // "Desired Treatment" left on the default placeholder blocks the booking.
    if (!formData.treatment) {
      setErrors((prev) => ({ ...prev, treatment: copy.pickTreatment }));
      showToast('alert', copy.pickTreatment);
      document.getElementById('treatment-select')?.focus();
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    setSubmissionError('');

    const payload = {
      patient: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
      },
      doctorId: Number(formData.doctorId),
      chamberId: formData.chamberId ? Number(formData.chamberId) : undefined,
      serviceSlug: selectedService?.slug || formData.treatment,
      appointmentDate: formData.date,
      appointmentTime: formData.time,
      reason: formData.notes,
      notes: formData.notes,
    };

    const [err, res] = await (async () => {
      try {
        const data = await appointmentApi.publicBook(payload);
        return [null, data];
      } catch (caught) {
        return [caught, null];
      }
    })();

    setIsSubmitting(false);

    if (err) {
      setSubmissionError(err.message || 'Could not submit your appointment. Please try again.');
      return;
    }

    setConfirmation(res.data?.appointment || null);
    setIsSubmitted(true);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch { }
  };

  const handleWhatsAppDirect = () => {
    const waLink = confirmation?.whatsappLink;
    if (waLink) {
      window.open(waLink, '_blank');
      return;
    }
    const svcName = selectedService?.name?.en || formData.treatment || (lang === 'en' ? 'General Consultation' : 'সাধারণ পরামর্শ');
    const text = `Hello%20Nahol%20Dental%20Care,%0A%0AI%20would%20like%20to%20request%20an%20appointment:%0A- Name: ${encodeURIComponent(formData.fullName || 'Patient')}%0A- Phone: ${encodeURIComponent(formData.phone || '')}%0A- Treatment: ${encodeURIComponent(svcName)}%0A- Preferred Date: ${encodeURIComponent(formData.date || 'Earliest Available')}%0A- Notes: ${encodeURIComponent(formData.notes || 'None')}`;
    window.open(`https://wa.me/8801966115115?text=${text}`, '_blank');
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(confirmation?.appointmentNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const appointmentRef = confirmation?.appointmentNumber || '';

  return (
    <section id="appointment" className="py-20 lg:py-28 bg-white relative overflow-hidden">

      {/* Background radial glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#2299D6]/10 rounded-full blur-3xl pointer-events-none" />

      <style>{`
        @media print {
          body > *:not(#print-receipt-wrapper) { display: none !important; }
          html, body { margin: 0 !important; padding: 0 !important; overflow: visible !important; height: auto !important; }
          #print-receipt-wrapper {
            position: fixed !important; left: 0 !important; top: 0 !important;
            width: 100vw !important; max-width: 100vw !important;
            background: white !important; color: black !important;
            padding: 32px !important; margin: 0 !important;
            box-shadow: none !important; border: none !important;
            overflow: visible !important; height: auto !important;
          }
          #print-receipt-wrapper * { visibility: visible !important; color: #111 !important; }
          #print-receipt-wrapper .no-print { display: none !important; }
          #print-receipt-wrapper img { max-height: 80px !important; }
          #print-receipt-wrapper .print-header { text-align: center; margin-bottom: 16px; }
          #print-receipt-wrapper .print-header h1 { font-size: 18px; margin: 0; }
          #print-receipt-wrapper .print-header p { font-size: 11px; color: #666; margin: 2px 0 0; }
          #print-receipt-wrapper table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          #print-receipt-wrapper th, #print-receipt-wrapper td { border: 1px solid #ddd; padding: 6px 10px; font-size: 12px; text-align: left; }
          #print-receipt-wrapper th { background: #f5f5f5; font-weight: bold; }
          #print-receipt-wrapper .total-row { font-weight: bold; font-size: 13px; }
          #print-receipt-wrapper .footer { margin-top: 20px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6E8F7] text-[#0A2255] text-xs font-semibold uppercase tracking-wider mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.appointment.eyebrow}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0A2255]">
            {t.appointment.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5A7A9A]">
            {t.appointment.subtitle}
          </p>
        </div>

        {/* Confirmation State or Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#B8D8EE] shadow-2xl">

          {isSubmitted ? (
            /* Digital Confirmation Receipt Card */
            <div id="print-receipt-wrapper" className="text-center space-y-4 py-4 animate-fade-in">
              {/* Print-only header */}
              <div className="print-header hidden print:block">
                <h1>Nahol Dental Care</h1>
                <p>Appointment Confirmation Receipt</p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-[#D6E8F7] text-[#2299D6] flex items-center justify-center mx-auto shadow-sm no-print">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-[#0A2255]">
                  {t.appointment.successTitle}
                </h3>
                <p className="text-sm text-[#5A7A9A] mt-1 max-w-md mx-auto">
                  {t.appointment.successMessage}
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-white border border-[#B8D8EE] text-left space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#EDF7FC] pb-2">
                  <span className="text-xs text-[#5A7A9A]">Appointment Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#14357B] text-sm">
                      {appointmentRef}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="p-1 text-[#5A7A9A] hover:text-[#0A2255]"
                      title="Copy code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-[#5A7A9A]">
                  <div><strong>Patient:</strong> {formData.fullName}</div>
                  <div><strong>Phone:</strong> {formData.phone}</div>
                  <div><strong>Doctor:</strong> {confirmation?.doctor?.name || doctorsData.find((d) => String(d.id) === formData.doctorId)?.name || ''}</div>
                  {formData.chamberId && (
                    <div><strong>Branch:</strong> {chambersData.find((ch) => String(ch.id) === formData.chamberId)?.name || ''}</div>
                  )}
                  <div><strong>Service:</strong> {selectedService?.name?.[lang] || formData.treatment}</div>
                  {formData.date && <div><strong>Preferred Date:</strong> {formData.date}</div>}
                  <div><strong>Time:</strong> {to12h(confirmation?.appointmentTime || formData.time)}</div>
                </div>

                {copied && (
                  <span className="text-[11px] text-[#2299D6] block text-right font-medium">
                    Copied to clipboard!
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 no-print">
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2299D6] hover:bg-[#1A7DB3] text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send to Clinic WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setConfirmation(null);
                    setFormData({
                      fullName: '',
                      phone: '',
                      email: '',
                      treatment: '',
                      doctorId: doctorsData[0] ? String(doctorsData[0].id) : '',
                      chamberId: chambersData[0] ? String(chambersData[0].id) : '',
                      date: '',
                      time: '',
                      notes: ''
                    });
                    setErrors({});
                    setSubmissionError('');
                    setAvailableSlots([]);
                    setSlotWindow(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#B8D8EE] text-[#0A2255] text-sm font-semibold hover:bg-[#EDF7FC] transition-colors"
                >
                  Book Another Appointment
                </button>
              </div>

              {/* Print-only footer */}
              <div className="footer hidden print:block">
                <p>Nahol Dental Care · House#19(1st floor), Lake Drive Road, Sector#07, Uttara, Dhaka-1230</p>
                <p>+8801948921229 · info@naholdental.com</p>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-1.5">
                    {t.appointment.fullName} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A9A] pointer-events-none" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={lang === 'en' ? 'e.g., Sarah Rahman' : 'উদাঃ তানভীর আহমেদ'}
                      className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white border ${errors.fullName ? 'border-rose-500' : 'border-[#B8D8EE]'
                        } text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] transition-all`}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="text-xs text-rose-500 mt-1 block font-medium">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-1.5">
                    {t.appointment.phone} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A9A] pointer-events-none" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white border ${errors.phone ? 'border-rose-500' : 'border-[#B8D8EE]'
                        } text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] transition-all`}
                    />
                  </div>
                  {errors.phone && (
                    <span className="text-xs text-rose-500 mt-1 block font-medium">
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* Treatment Select */}
                <div>
                  <label htmlFor="treatment-select" className="block text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-1.5">
                    {t.appointment.treatment} *
                  </label>

                  <select
                    id="treatment-select"
                    value={formData.treatment}
                    onChange={(e) => {
                      setFormData({ ...formData, treatment: e.target.value });
                      if (e.target.value) setErrors((prev) => ({ ...prev, treatment: '' }));
                    }}
                    className={`w-full py-3 px-4 text-sm rounded-xl bg-white border ${errors.treatment ? 'border-rose-500' : 'border-[#B8D8EE]'
                      } text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] cursor-pointer`}
                  >
                    <option value="">{t.appointment.selectTreatment}</option>
                    {servicesData.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name[lang]} ({svc.priceFormatted || `${svc.priceMin} - ${svc.priceMax}`})
                      </option>
                    ))}
                  </select>
                  {errors.treatment && (
                    <span className="text-xs text-rose-500 mt-1 block font-medium">
                      {errors.treatment}
                    </span>
                  )}
                </div>

                {/* Doctor Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-1.5">
                    {lang === 'en' ? 'Select Doctor' : 'ডাক্তার নির্বাচন করুন'} *
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A9A] pointer-events-none" />
                    <select
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] cursor-pointer"
                    >
                      {doctorsLoading && (
                        <option value="">{lang === 'en' ? 'Loading doctors...' : 'ডাক্তার লোড হচ্ছে...'}</option>
                      )}
                      {!doctorsLoading && doctorsData.length === 0 && (
                        <option value="">{lang === 'en' ? 'No doctors available yet' : 'এখনো কোনো ডাক্তার যোগ হয়নি'}</option>
                      )}
                      {doctorsData.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} {doc.specialization ? `- ${doc.specialization}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Chamber Select */}
                {chambersData.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-1.5">
                      {lang === 'en' ? 'Select Chamber / Branch' : 'শাখা নির্বাচন করুন'}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A9A] pointer-events-none" />
                      <select
                        value={formData.chamberId}
                        onChange={(e) => setFormData({ ...formData, chamberId: e.target.value, time: '' })}
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] cursor-pointer"
                      >
                        {chambersData.map((ch) => (
                          <option key={ch.id} value={ch.id}>{ch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-1.5">
                    {t.appointment.preferredDate} *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value, time: '' });
                        setAvailableSlots([]);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full py-3 px-4 text-sm rounded-xl bg-white border ${errors.date ? 'border-rose-500' : 'border-[#B8D8EE]'
                        } text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] cursor-pointer`}
                    />
                  </div>
                  {errors.date && (
                    <span className="text-xs text-rose-500 mt-1 block font-medium">
                      {errors.date}
                    </span>
                  )}
                </div>

                {/* Available Time — driven entirely by the selected branch's operating hours */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-1.5">
                    {lang === 'en' ? 'Available Time' : 'উপলব্ধ সময়'} *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A9A] pointer-events-none" />
                    {formData.date ? (
                      loadingSlots ? (
                        <div className="w-full py-3 pl-10 pr-4 text-sm rounded-xl bg-white border border-[#B8D8EE] text-[#5A7A9A] flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {copy.checking}
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <select
                          value={formData.time}
                          onChange={(e) => {
                            setFormData({ ...formData, time: e.target.value });
                            if (e.target.value) setErrors((prev) => ({ ...prev, time: '' }));
                          }}
                          className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white border ${errors.time ? 'border-rose-500' : 'border-[#B8D8EE]'
                            } text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] cursor-pointer`}
                        >
                          <option value="">{copy.pickTime}</option>
                          {availableSlots.map((slot) => (
                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                          ))}
                        </select>
                      ) : (
                        <div className={`w-full py-3 pl-10 pr-4 text-sm rounded-xl bg-white border ${slotWindow?.closed ? 'border-amber-300 bg-amber-50' : 'border-[#B8D8EE]'
                          } text-[#5A7A9A] flex items-center gap-2`}>
                          <span>{slotsError || copy.noSlots}</span>
                          {slotsError && !slotWindow?.closed && (
                            <button type="button" onClick={fetchSlots} className="ml-auto text-[#2299D6] font-semibold underline shrink-0">
                              {copy.retry}
                            </button>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="w-full py-3 pl-10 pr-4 text-sm rounded-xl bg-white border border-[#B8D8EE] text-[#5A7A9A]">
                        {copy.pickDateFirst}
                      </div>
                    )}
                  </div>
                  {errors.time && (
                    <span className="text-xs text-rose-500 mt-1 block font-medium">
                      {errors.time}
                    </span>
                  )}
                  {!loadingSlots && slotWindow?.workingHours && (
                    <span className="text-xs text-[#5A7A9A] mt-1.5 block">
                      {copy.hoursFor} {copy.on} {formData.date}: {to12h(slotWindow.workingHours.start)} – {to12h(slotWindow.workingHours.end)}
                    </span>
                  )}
                </div>

                {/* Optional Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-1.5">
                    {t.appointment.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A9A] pointer-events-none" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Symptoms / Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A2255] mb-1.5">
                  {t.appointment.notes}
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={lang === 'en' ? 'Briefly describe your symptoms (e.g., sensitive to cold, night pain, broken tooth)...' : 'আপনার সমস্যার বিবরণ লিখুন (যেমন: ঠাণ্ডা লাগলে শিরশির করে, তীব্র ব্যথা, দাঁত ভাঙা)...'}
                  className="w-full p-4 text-sm rounded-xl bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] transition-all"
                />
              </div>

              {submissionError && (
                <div className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  {submissionError}
                </div>
              )}

              {/* Submit Buttons Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#14357B] to-[#2299D6] hover:from-[#0F2A5E] hover:to-[#1A7DB3] text-white font-semibold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Calendar className="w-4 h-4" /> <span>{t.appointment.submitBtn}</span></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#2299D6] hover:bg-[#1A7DB3] text-white font-semibold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.appointment.whatsappBtn}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[#5A7A9A] text-center pt-2">
                <ShieldCheck className="w-4 h-4 text-[#2299D6]" />
                <span>{t.appointment.fastConfirm}</span>
              </div>
            </form>
          )}

        </div>

      </div>
    </section>
  );
}
