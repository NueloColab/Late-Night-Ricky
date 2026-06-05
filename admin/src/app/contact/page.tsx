'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState('booking');

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Page Title Bar */}
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">Contact</h1>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-200px)] items-stretch">
          {/* Left Image */}
          <div className="relative overflow-hidden min-h-[50vh] md:min-h-0">
            <img src="/assets/ricky-hero-new.jpg" alt="Late Night Ricky" className="absolute top-0 left-0 w-full h-full object-cover object-top" />
          </div>

          {/* Right Form */}
          <div className="p-10 md:p-16 max-w-[600px] mx-auto flex flex-col justify-center">
            {/* Tabs */}
            <div className="flex gap-0 mb-10">
              <button
                onClick={() => setActiveTab('booking')}
                className={`flex-1 py-3.5 px-7 border-2 border-[#111] text-xs font-semibold uppercase tracking-[1.5px] transition ${
                  activeTab === 'booking' ? 'bg-[#111] text-white' : 'bg-white text-[#111] hover:bg-[#E3E8ED]'
                }`}
              >
                Booking
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`flex-1 py-3.5 px-7 border-2 border-[#111] text-xs font-semibold uppercase tracking-[1.5px] transition ${
                  activeTab === 'private' ? 'bg-[#111] text-white' : 'bg-white text-[#111] hover:bg-[#E3E8ED]'
                }`}
              >
                Private Message
              </button>
            </div>

            {/* Booking Form */}
            <form
              action="mailto:samir@wearemediahive.com"
              method="post"
              encType="text/plain"
              className={activeTab === 'booking' ? 'block' : 'hidden'}
            >
              <div className="mb-7">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Name *</label>
                <input type="text" name="name" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
              </div>
              <div className="mb-7">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Email *</label>
                <input type="email" name="email" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
              </div>
              <div className="mb-7">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Club Name *</label>
                <input type="text" name="club" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
              </div>
              <div className="mb-7">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">City *</label>
                <input type="text" name="city" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
              </div>
              <div className="mb-7">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Fee *</label>
                <input type="text" name="fee" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
              </div>
              <div className="mb-7">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Date *</label>
                <input type="date" name="date" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
              </div>
              <button type="submit" className="w-full py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition">Submit</button>
            </form>

            {/* Private Message Form */}
            <form
              action="mailto:samir@wearemediahive.com"
              method="post"
              encType="text/plain"
              className={activeTab === 'private' ? 'block' : 'hidden'}
            >
              <div className="mb-7">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Name *</label>
                <input type="text" name="name" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
              </div>
              <div className="mb-7">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Email *</label>
                <input type="email" name="email" required className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition" />
              </div>
              <div className="mb-7">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] mb-2">Message *</label>
                <textarea name="message" required rows={4} className="w-full border-b-2 border-[#111] py-3 px-0 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition resize-y min-h-[80px]" />
              </div>
              <button type="submit" className="w-full py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition">Submit</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
