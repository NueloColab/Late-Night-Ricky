'use client'

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
    color: '#5c7a94',
    sections: ['Hero', 'Video', 'Reach', 'Shows', 'Partners', 'Radio', 'Clients', 'Contact'],
  },
  {
    label: 'About Page',
    href: '/admin/pages/about',
    description: 'Portrait, bio, stats',
    icon: User,
    color: '#91715c',
    sections: ['Portrait', 'Bio', 'Stats'],
  },
  {
    label: 'Showreel',
    href: '/admin/pages/showreel',
    description: 'Video showreels and highlights',
    icon: Video,
    color: '#5c7a94',
    sections: ['Videos', 'Highlights'],
  },
  {
    label: 'Contact',
    href: '/admin/pages/contact',
    description: 'Contact form, social links, booking info',
    icon: Mail,
    color: '#91715c',
    sections: ['Contact Info', 'Social Links', 'Booking'],
  },
]

const globalPages = [
  {
    label: 'Navigation & Logo',
    href: '/admin/global/nav',
    description: 'Site navigation links and logo',
    icon: Navigation,
    color: '#5c7a94',
    sections: ['Nav Items', 'Logo'],
  },
  {
    label: 'SEO & Meta',
    href: '/admin/global/seo',
    description: 'Page titles, descriptions, favicon',
    icon: Search,
    color: '#91715c',
    sections: ['Meta Tags', 'Favicon', 'Open Graph'],
  },
]

const mediaPages = [
  {
    label: 'Media Library',
    href: '/admin/media',
    description: 'Images, videos and files',
    icon: Image,
    color: '#5c7a94',
    sections: ['Uploads', 'Organise'],
  },
  {
    label: 'Submissions',
    href: '/admin/submissions',
    description: 'Music submissions inbox',
    icon: FileText,
    color: '#91715c',
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#91715c]"></div>
          <p className="text-xs uppercase tracking-widest text-[#5c7a94] font-medium">Content Management</p>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1a1a] tracking-tight">Content</h1>
        <p className="text-sm text-[#666] mt-1">Manage your website pages, media, and submissions.</p>
      </div>

      {/* Database Setup */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Database size={18} className="text-[#5c7a94]" />
          <h2 className="text-base font-serif font-semibold text-[#1a1a1a]">Database Setup</h2>
        </div>
        <p className="text-sm text-[#666] mb-4">
          First time? Seed the database with default content from your existing pages.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSeed(false)}
            disabled={seeding}
            className="px-4 py-2 bg-[#1a1a1a] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {seeding ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
            {seeding ? 'Seeding...' : 'Seed Missing Content'}
          </button>
          <button
            onClick={() => handleSeed(true)}
            disabled={seeding}
            className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Force Reset All Content
          </button>
        </div>
        {seedResult && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${seedResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {seedResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {seedResult.message}
          </div>
        )}
      </div>

      {/* Pages */}
      <div className="mb-10">
        <h2 className="text-xs uppercase tracking-widest text-[#999] font-medium mb-4">Pages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-[#5c7a94] hover:shadow-sm transition-all h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 text-white" style={{ backgroundColor: page.color }}>
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#1a1a1a] group-hover:text-[#5c7a94] transition-colors mb-1">
                  {page.label}
                </h3>
                <p className="text-sm text-[#666] mb-4">{page.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {page.sections.map((section) => (
                    <span
                      key={section}
                      className="text-[10px] uppercase tracking-wider text-[#666] border border-gray-200 px-2 py-0.5 rounded"
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
        <h2 className="text-xs uppercase tracking-widest text-[#999] font-medium mb-4">Global Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-[#91715c] hover:shadow-sm transition-all h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 text-white" style={{ backgroundColor: page.color }}>
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#1a1a1a] group-hover:text-[#91715c] transition-colors mb-1">
                  {page.label}
                </h3>
                <p className="text-sm text-[#666] mb-4">{page.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {page.sections.map((section) => (
                    <span
                      key={section}
                      className="text-[10px] uppercase tracking-wider text-[#666] border border-gray-200 px-2 py-0.5 rounded"
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
        <h2 className="text-xs uppercase tracking-widest text-[#999] font-medium mb-4">Media & Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-[#5c7a94] hover:shadow-sm transition-all h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 text-white" style={{ backgroundColor: page.color }}>
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#1a1a1a] group-hover:text-[#5c7a94] transition-colors mb-1">
                  {page.label}
                </h3>
                <p className="text-sm text-[#666] mb-4">{page.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {page.sections.map((section) => (
                    <span
                      key={section}
                      className="text-[10px] uppercase tracking-wider text-[#666] border border-gray-200 px-2 py-0.5 rounded"
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