import React from 'react';
import { ExternalLink, Heart, Globe, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Card, PageHeader } from '../ui';

export default function Support() {
  return (
    <div>
      <PageHeader title="Support" subtitle="Development & technical support information" />

      <div className="max-w-3xl space-y-6">
        {/* Developer Info */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14357B] to-[#2299D6] flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0A2255]">Nahol Dental Care</h3>
                <p className="text-sm text-[#5A7A9A]">Clinic Management System</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE]">
              <p className="text-sm text-[#0A2255] leading-relaxed">
                This dental clinic management system is designed and developed to provide
                comprehensive appointment scheduling, patient management, billing, and content
                management for dental clinics. It features a bilingual (English/Bangla) public
                website with online booking, real-time notifications, and a full-featured admin panel.
              </p>
            </div>
          </div>
        </Card>

        {/* Development Company */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center">
              <Heart className="w-4.5 h-4.5" />
            </span>
            <h3 className="text-base font-bold text-[#0A2255]">Developed By</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#14357B] text-white flex items-center justify-center font-bold text-sm">
                WB
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A2255]">WebFix Digital Agency</p>
                <p className="text-xs text-[#5A7A9A]">Web Development & Digital Solutions</p>
              </div>
            </div>
            <a
              href="https://webfix.com.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14357B] text-white text-sm font-semibold hover:bg-[#0F2A5E] transition-colors"
            >
              <Globe className="w-4 h-4" />
              Visit webfix.com.bd
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </Card>

        {/* Technical Support */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5" />
            </span>
            <h3 className="text-base font-bold text-[#0A2255]">Technical Support</h3>
          </div>
          <div className="space-y-3 text-sm text-[#5A7A9A]">
            <p>For any technical issues, feature requests, or bug reports related to this system, please contact the development team.</p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:support@webfix.com.bd"
                className="inline-flex items-center gap-2 text-[#14357B] font-semibold hover:text-[#2299D6] transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@webfix.com.bd
              </a>
              <a
                href="https://webfix.com.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#14357B] font-semibold hover:text-[#2299D6] transition-colors"
              >
                <Globe className="w-4 h-4" />
                https://webfix.com.bd
              </a>
            </div>
          </div>
        </Card>

        {/* System Info */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-xl bg-[#EDF7FC] text-[#14357B] flex items-center justify-center">
              <Phone className="w-4.5 h-4.5" />
            </span>
            <h3 className="text-base font-bold text-[#0A2255]">System Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE]">
              <p className="text-xs text-[#5A7A9A]">Platform</p>
              <p className="font-semibold text-[#0A2255]">React + Vite</p>
            </div>
            <div className="p-3 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE]">
              <p className="text-xs text-[#5A7A9A]">Backend</p>
              <p className="font-semibold text-[#0A2255]">Express + MongoDB</p>
            </div>
            <div className="p-3 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE]">
              <p className="text-xs text-[#5A7A9A]">Database</p>
              <p className="font-semibold text-[#0A2255]">MongoDB</p>
            </div>
            <div className="p-3 rounded-xl bg-[#EDF7FC] border border-[#B8D8EE]">
              <p className="text-xs text-[#5A7A9A]">Realtime</p>
              <p className="font-semibold text-[#0A2255]">WebSocket</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
