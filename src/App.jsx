import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import ServiceModal from './components/ServiceModal';
import Lightbox from './components/Lightbox';
import FloatingActions from './components/FloatingActions';
import Toast from './components/Toast';

import Hero from './sections/Hero';
import StatsBar from './sections/StatsBar';
import AboutDoctor from './sections/AboutDoctor';
import ToothProblem from './sections/ToothProblem';
import Services from './sections/Services';
import CostCalculator from './sections/CostCalculator';
import WhyChooseUs from './sections/WhyChooseUs';
import TreatmentJourney from './sections/TreatmentJourney';
import Gallery from './sections/Gallery';
import Reviews from './sections/Reviews';
import SocialMedia from './sections/SocialMedia';
import Blog from './sections/Blog';
import AllBlogs from './pages/AllBlogs';
import BlogPost from './pages/BlogPost';
import VerifyPrescription from './pages/VerifyPrescription';
import FAQ from './sections/FAQ';
import Appointment from './sections/Appointment';
import EmergencyCTA from './sections/EmergencyCTA';
import ContactLocation from './sections/ContactLocation';
import Footer from './sections/Footer';

import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Appointments from './admin/pages/Appointments';
import Patients from './admin/pages/Patients';
import Prescriptions from './admin/pages/Prescriptions';
import Doctors from './admin/pages/Doctors';
import ServicesAdmin from './admin/pages/Services';
import Billing from './admin/pages/Billing';
import Content from './admin/pages/Content';
import Settings from './admin/pages/Settings';
import Support from './admin/pages/Support';
import IpBlocking from './admin/pages/IpBlocking';

import { translations } from './data/content';
import { galleryCases } from './data/gallery';

function PublicSite() {
  const [lang] = useState(() => {
    try {
      return localStorage.getItem('dental_lang') || 'en';
    } catch (_) {
      return 'en';
    }
  });

  const [selectedService, setSelectedService] = useState(null);
  const [selectedLightboxCase, setSelectedLightboxCase] = useState(null);
  const [preselectedServiceId, setPreselectedServiceId] = useState('scaling');
  const [toastMessage, setToastMessage] = useState(null);

  // Sync Language

  useEffect(() => {
    try {
      localStorage.setItem('dental_lang', lang);
    } catch (_) { /* storage unavailable - ignore */ }
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang] || translations.en;

  // Navigation to Appointment section
  const handleOpenAppointment = (serviceId) => {
    if (serviceId && typeof serviceId === 'string') {
      setPreselectedServiceId(serviceId);
    }
    const elem = document.getElementById('appointment');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookFromServiceModal = (service) => {
    setSelectedService(null);
    handleOpenAppointment(service.id);
  };

  // Lightbox handlers
  const handleLightboxNext = () => {
    if (!selectedLightboxCase) return;
    const currentIndex = galleryCases.findIndex((c) => c.id === selectedLightboxCase.id);
    const nextIndex = (currentIndex + 1) % galleryCases.length;
    setSelectedLightboxCase(galleryCases[nextIndex]);
  };

  const handleLightboxPrev = () => {
    if (!selectedLightboxCase) return;
    const currentIndex = galleryCases.findIndex((c) => c.id === selectedLightboxCase.id);
    const prevIndex = (currentIndex - 1 + galleryCases.length) % galleryCases.length;
    setSelectedLightboxCase(galleryCases[prevIndex]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#D6E8F7] text-[#0A2255] antialiased">

      {/* Subtle Top Scroll Progress Bar */}
      <ScrollProgress />

      {/* Sticky Premium Navbar */}
      <Navbar
        t={t}
        onOpenAppointment={() => handleOpenAppointment()}
      />

      {/* Main Page Sections */}
      <main className="flex-grow">
        <Hero
          t={t}
          lang={lang}
          onOpenAppointment={() => handleOpenAppointment()}
        />

        <StatsBar
          t={t}
        />

        <AboutDoctor
          t={t}
          lang={lang}
          onOpenAppointment={() => handleOpenAppointment()}
        />

        <ToothProblem
          t={t}
          lang={lang}
          onBookTreatment={(svcId) => handleOpenAppointment(svcId)}
        />

        <Services
          t={t}
          lang={lang}
          onSelectService={(svc) => setSelectedService(svc)}
          onBookService={(svc) => handleOpenAppointment(svc.id)}
        />

        <CostCalculator
          t={t}
          lang={lang}
          onOpenAppointment={() => handleOpenAppointment()}
        />

        <WhyChooseUs
          t={t}
          lang={lang}
        />

        <TreatmentJourney
          t={t}
          lang={lang}
        />

        <Gallery
          t={t}
          lang={lang}
          onOpenLightbox={(item) => setSelectedLightboxCase(item)}
        />

        <Reviews
          t={t}
          lang={lang}
        />

        <SocialMedia
          t={t}
          lang={lang}
        />

        <Blog
          t={t}
          lang={lang}
        />

        <FAQ
          t={t}
          lang={lang}
        />

        <EmergencyCTA
          t={t}
          lang={lang}
        />

        <Appointment
          t={t}
          lang={lang}
          preselectedServiceId={preselectedServiceId}
        />

        <ContactLocation
          t={t}
          lang={lang}
          onOpenAppointment={() => handleOpenAppointment()}
        />
      </main>

      {/* Multi-Column Footer */}
      <Footer
        t={t}
        lang={lang}
        onOpenAppointment={() => handleOpenAppointment()}
      />

      {/* Floating Desktop & Mobile Quick Action Buttons */}
      <FloatingActions
        t={t}
        onOpenAppointment={() => handleOpenAppointment()}
      />

      {/* Service Details Accessible Modal */}
      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onBookService={handleBookFromServiceModal}
        lang={lang}
        t={t}
      />

      {/* Fullscreen Gallery Lightbox */}
      <Lightbox
        item={selectedLightboxCase}
        onClose={() => setSelectedLightboxCase(null)}
        onNext={handleLightboxNext}
        onPrev={handleLightboxPrev}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/blog" element={<AllBlogs />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/verify-prescription" element={<VerifyPrescription />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="patients" element={<Patients />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="services" element={<ServicesAdmin />} />
          <Route path="billing" element={<Billing />} />
          <Route path="content" element={<Content />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<Support />} />
          <Route path="ip-blocking" element={<IpBlocking />} />
        </Route>
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </ToastProvider>
  );
}