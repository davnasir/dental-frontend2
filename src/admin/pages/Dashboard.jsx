import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarDays,
  Hourglass,
  Activity,
  Banknote,
  TrendingUp,
  Stethoscope,
  AlertCircle,
} from 'lucide-react';
import { dashboardApi, settingsApi } from '../../services/contentApi';
import { Card, PageHeader, Spinner, ErrorBanner, Badge, EmptyState, Btn, Field, TextInput } from '../ui';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#5A7A9A]">{label}</p>
        <p className="mt-2 text-2xl font-bold text-[#0A2255]">{Number(value || 0).toLocaleString()}</p>
      </div>
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </span>
    </div>
  </Card>
);

const ChartBar = ({ label, count, max, color }) => (
  <div className="flex items-center gap-3">
    <span className="w-24 text-xs font-medium text-[#5A7A9A] text-right truncate">{label}</span>
    <div className="flex-1 h-3.5 bg-[#EDF7FC] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${max > 0 ? Math.max((count / max) * 100, 4) : 0}%` }}
      />
    </div>
    <span className="w-8 text-xs font-semibold text-[#0A2255]">{count}</span>
  </div>
);

const statusColors = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-[#2299D6]',
  COMPLETED: 'bg-[#2299D6]',
  CANCELLED: 'bg-rose-500',
  NO_SHOW: 'bg-[#5A7A9A]',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [hlStats, setHlStats] = useState({ years: '', patients: '', procedures: '', satisfaction: '' });
  const [hlSaving, setHlSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, chartsRes] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.charts(),
      ]);
      setStats(statsRes.data?.stats || statsRes.data || {});
      setCharts(chartsRes.data?.chartData || chartsRes.data || {});
      settingsApi.getPublic('site_stats').then((r) => {
        const val = r.data?.item?.value || {};
        setHlStats({
          years: String(val.years || ''),
          patients: String(val.patients || ''),
          procedures: String(val.procedures || ''),
          satisfaction: String(val.satisfaction || ''),
        });
      }).catch(() => {});
    } catch (err) {
      setError(err.message || 'Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveHlStats = async (e) => {
    e.preventDefault();
    setHlSaving(true);
    try {
      await settingsApi.upsert('site_stats', {
        years: Number(hlStats.years) || 0,
        patients: Number(hlStats.patients) || 0,
        procedures: Number(hlStats.procedures) || 0,
        satisfaction: Number(hlStats.satisfaction) || 0,
      });
      alert('Dashboard highlights updated successfully.');
    } catch (err) {
      alert(err.message || 'Could not update dashboard highlights');
    } finally {
      setHlSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (error && !stats) return <ErrorBanner message={error} onRetry={load} />;

  const s = stats || {};
  const statusData = charts?.appointmentStatus || [];
  const maxCount = statusData.reduce((m, d) => Math.max(m, d.count), 0);
  const appointmentsByDay = charts?.appointmentsByDay || [];
  const dayMax = appointmentsByDay.reduce((m, d) => Math.max(m, d.count || 0), 0);
  const popularity = charts?.treatmentPopularity || [];

  return (
    <div>
      <PageHeader title="Overview" subtitle="Key performance indicators" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Patients" value={s.totalPatients} accent="bg-[#D6E8F7] text-[#14357B]" />
        <StatCard icon={CalendarDays} label="Today's Appointments" value={s.todayAppointments} accent="bg-[#D6E8F7] text-[#14357B]" />
        <StatCard icon={Hourglass} label="Pending" value={s.pendingAppointments} accent="bg-amber-100 text-amber-700" />
        <StatCard icon={Stethoscope} label="Active Doctors" value={s.activeDoctors} accent="bg-[#D6E8F7] text-[#14357B]" />
        <StatCard icon={Banknote} label="Today's Revenue" value={s.todayRevenue} accent="bg-[#D6E8F7] text-[#14357B]" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={s.totalRevenue} accent="bg-[#D6E8F7] text-[#14357B]" />
        <StatCard icon={Activity} label="Treatments Done" value={s.completedTreatments} accent="bg-[#D6E8F7] text-[#14357B]" />
        <StatCard icon={AlertCircle} label="Outstanding" value={s.outstandingPayments} accent="bg-rose-100 text-rose-700" />
      </div>

      <Card className="mb-6">
        <h3 className="text-base font-bold text-[#0A2255] mb-1">Manage Dashboard Highlights</h3>
        <p className="text-sm text-[#5A7A9A] mb-4">Update the marketing numbers shown in the "Clinic at a Glance" section on the public homepage.</p>
        <form onSubmit={handleSaveHlStats} className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-3xl">
          <Field label="Years of Experience">
            <TextInput type="number" min="0" value={hlStats.years} onChange={(e) => setHlStats({ ...hlStats, years: e.target.value })} />
          </Field>
          <Field label="Patients Treated">
            <TextInput type="number" min="0" value={hlStats.patients} onChange={(e) => setHlStats({ ...hlStats, patients: e.target.value })} />
          </Field>
          <Field label="Procedures">
            <TextInput type="number" min="0" value={hlStats.procedures} onChange={(e) => setHlStats({ ...hlStats, procedures: e.target.value })} />
          </Field>
          <Field label="Satisfaction (%)">
            <TextInput type="number" min="0" max="100" step="0.1" value={hlStats.satisfaction} onChange={(e) => setHlStats({ ...hlStats, satisfaction: e.target.value })} />
          </Field>
          <div className="sm:col-span-4">
            <Btn type="submit" disabled={hlSaving}>{hlSaving ? 'Saving...' : 'Save Dashboard Highlights'}</Btn>
          </div>
        </form>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-bold text-[#0A2255] mb-4">Appointment Status</h3>
          {statusData.length === 0 ? (
            <EmptyState message="No appointments yet." />
          ) : (
            <div className="space-y-3">
              {statusData.map((d) => (
                <ChartBar key={d.status} label={d.status} count={d.count} max={maxCount} color={statusColors[d.status] || 'bg-[#2299D6]'} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#0A2255] mb-4">Appointments — Last 30 Days</h3>
          {appointmentsByDay.length === 0 ? (
            <EmptyState message="No data yet." />
          ) : (
            <div className="flex items-end gap-0.5 h-40">
              {appointmentsByDay.map((d, i) => {
                const v = d.count || 0;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full" title={`${d.date}: ${v}`}>
                    <div
                      className="w-full bg-[#2299D6]/80 rounded-t-sm transition-all duration-500 hover:bg-[#2299D6]"
                      style={{ height: `${dayMax > 0 ? Math.max((v / dayMax) * 100, 2) : 2}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-5 border-t border-[#B8D8EE] pt-4">
            <h4 className="text-sm font-bold text-[#0A2255] mb-3">Most Popular Treatments</h4>
            {popularity.length === 0 ? (
              <p className="text-sm text-[#5A7A9A]">No treatments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {popularity.slice(0, 5).map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="flex-1 text-xs text-[#0A2255] truncate">{p.name}</span>
                    <Badge color="teal">{p.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}