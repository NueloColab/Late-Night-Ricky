"use client"

import Link from 'next/link'
import { useState } from 'react'
import {
  Home,
  User,
  Video,
  Mail,
  Navigation,
  Search,
  Image,
  FileText,
  Database,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

const contentPages = [
  {
    label: 'Home Page',
    href: '/admin/pages/home',
    description: 'Hero, video, reach, shows, partners, radio, clients, share music, contact',
    icon: Home,
    color: '#1B3A4C',
    sections: ['Hero', 'Video', 'Reach', 'Shows', 'Partners', 'Radio', 'Clients', 'Contact'],
  },
  {
    label: 'About Page',
    href: '/admin/pages/about',
    description: 'Portrait, bio, stats',
    icon: User,
    color: '#6B8FAB',
    sections: ['Portrait', 'Bio', 'Stats'],
  },
  {
    label: 'Showreel',
    href: '/admin/pages/showreel',
    description: 'Video showreels and highlights',
    icon: Video,
    color: '#1B3A4C',
    sections: ['Videos', 'Highlights'],
  },
  {
    label: 'Contact',
    href: '/admin/pages/contact',
    description: 'Contact form, social links, booking info',
    icon: Mail,
    color: '#6B8FAB',
    sections: ['Contact Info', 'Social Links', 'Booking'],
  },
]

const globalPages = [
  {
    label: 'Navigation & Logo',
    href: '/admin/global/nav',
    description: 'Site navigation links and logo',
    icon: Navigation,
    color: '#1B3A4C',
    sections: ['Nav Items', 'Logo'],
  },
  {
    label: 'SEO & Meta',
    href: '/admin/global/seo',
    description: 'Page titles, descriptions, favicon',
    icon: Search,
    color: '#6B8FAB',
    sections: ['Meta Tags', 'Favicon', 'Open Graph'],
  },
]

const mediaPages = [
  {
    label: 'Media Library',
    href: '/admin/media',
    description: 'Images, videos and files',
    icon: Image,
    color: '#1B3A4C',
    sections: ['Uploads', 'Organise'],
  },
  {
    label: 'Submissions',
    href: '/admin/submissions',
    description: 'Music submissions inbox',
    icon: FileText,
    color: '#6B8FAB',
    sections: ['Inbox', 'Reviewed'],
  },
]

export default function ContentPage() {
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSeed(force = false) {
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await fetch('/api/cms/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      const data = await res.json()
      if (res.ok) {
        setSeedResult({ success: true, message: `Seeded ${data.seeded || 0} sections` })
      } else {
        setSeedResult({ success: false, message: data.error || 'Seed failed' })
      }
    } catch {
      setSeedResult({ success: false, message: 'Seed failed' })
    } finally {
      setSeeding(false)
      setTimeout(() => setSeedResult(null), 4000)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Content Management</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">
          Content
        </h1>
        <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Manage your website pages, media, and submissions.</p>
      </div>

      {/* Database Setup */}
      <div className="bg-white border border-[#A3B5C4]/30 p-8 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Database size={18} className="text-[#1B3A4C]" />
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">Database Setup</p>
        </div>
        <p className="text-sm text-[#5B7A8E] mb-6 font-semibold uppercase tracking-[0.5px]">
          First time? Seed the database with default content from your existing pages.
          <span className="block mt-1 text-xs text-[#6B8FAB] font-normal normal-case tracking-normal">
            “Seed Missing Content” only fills empty tables — it will NOT overwrite anything you’ve already set up.
          </span>
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSeed(false)}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition disabled:opacity-50"
          >
            {seeding ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
            {seeding ? 'Seeding...' : 'Seed Missing Content Only'}
          </button>
          <button
            onClick={() => handleSeed(true)}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-red-300 rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-red-600 hover:bg-red-50 transition disabled:opacity-50"
          >
            ⚠️ Force Reset All Content
          </button>
        </div>
        {seedResult && (
          <div className={`mt-4 flex items-center gap-2 text-sm ${seedResult.success ? 'text-[#2d6a2d]' : 'text-red-600'}`}>
            {seedResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {seedResult.message}
          </div>
        )}
      </div>

      {/* Pages */}
      <div className="mb-10">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-6">Pages</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-[#A3B5C4]/30 p-6 hover:border-[#1B3A4C] transition h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 text-white" style={{ backgroundColor: page.color }}>
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-black text-[#111] group-hover:text-[#1B3A4C] transition-colors mb-1 uppercase tracking-[-0.5px]">
                  {page.label}
                </h3>
                <p className="text-sm text-[#5B7A8E] mb-4 font-semibold uppercase tracking-[0.5px]">{page.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {page.sections.map((section) => (
                    <span
                      key={section}
                      className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] border border-[#A3B5C4]/30 px-2 py-0.5 rounded"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Global Settings */}
      <div className="mb-10">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-6">Global Settings</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-[#A3B5C4]/30 p-6 hover:border-[#6B8FAB] transition h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 text-white" style={{ backgroundColor: page.color }}>
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-black text-[#111] group-hover:text-[#6B8FAB] transition-colors mb-1 uppercase tracking-[-0.5px]">
                  {page.label}
                </h3>
                <p className="text-sm text-[#5B7A8E] mb-4 font-semibold uppercase tracking-[0.5px]">{page.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {page.sections.map((section) => (
                    <span
                      key={section}
                      className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] border border-[#A3B5C4]/30 px-2 py-0.5 rounded"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Media */}
      <div>
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-6">Media & Data</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-[#A3B5C4]/30 p-6 hover:border-[#1B3A4C] transition h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 text-white" style={{ backgroundColor: page.color }}>
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-black text-[#111] group-hover:text-[#1B3A4C] transition-colors mb-1 uppercase tracking-[-0.5px]">
                  {page.label}
                </h3>
                <p className="text-sm text-[#5B7A8E] mb-4 font-semibold uppercase tracking-[0.5px]">{page.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {page.sections.map((section) => (
                    <span
                      key={section}
                      className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] border border-[#A3B5C4]/30 px-2 py-0.5 rounded"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
