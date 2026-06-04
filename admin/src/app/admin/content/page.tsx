'use client'

import Link from 'next/link'
import {
  Home,
  User,
  Video,
  Mail,
  Navigation,
  Search,
  Image,
  FileText,
} from 'lucide-react'

const contentPages = [
  {
    label: 'Home Page',
    href: '/admin/pages/home',
    description: 'Hero, video, reach, shows, partners, radio, clients, share music, contact',
    icon: Home,
    color: '#5c7a94',
  },
  {
    label: 'About Page',
    href: '/admin/pages/about',
    description: 'Portrait, bio, stats',
    icon: User,
    color: '#91715c',
  },
  {
    label: 'Showreel',
    href: '/admin/pages/showreel',
    description: 'Video showreels and highlights',
    icon: Video,
    color: '#5c7a94',
  },
  {
    label: 'Contact',
    href: '/admin/pages/contact',
    description: 'Contact form, social links, booking info',
    icon: Mail,
    color: '#91715c',
  },
]

const globalPages = [
  {
    label: 'Navigation & Logo',
    href: '/admin/global/nav',
    description: 'Site navigation links and logo',
    icon: Navigation,
    color: '#5c7a94',
  },
  {
    label: 'SEO & Meta',
    href: '/admin/global/seo',
    description: 'Page titles, descriptions, favicon',
    icon: Search,
    color: '#91715c',
  },
]

const mediaPages = [
  {
    label: 'Media Library',
    href: '/admin/media',
    description: 'Images, videos and files',
    icon: Image,
    color: '#5c7a94',
  },
  {
    label: 'Submissions',
    href: '/admin/submissions',
    description: 'Music submissions inbox',
    icon: FileText,
    color: '#91715c',
  },
]

export default function ContentPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#91715c]"></div>
          <p className="text-xs uppercase tracking-widest text-[#5c7a94] font-medium">Content Management</p>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1a1a] tracking-tight">Content</h1>
        <p className="text-sm text-[#666] mt-1">Edit your website pages, navigation, and media.</p>
      </div>

      {/* Page Sections */}
      <div className="mb-10">
        <h2 className="text-xs uppercase tracking-widest text-[#999] font-medium mb-4">Pages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-[#5c7a94] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: page.color + '15' }}>
                    <Icon size={20} style={{ color: page.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#1a1a1a] group-hover:text-[#5c7a94] transition-colors">{page.label}</h3>
                    <p className="text-sm text-[#666] mt-1">{page.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Global Settings */}
      <div className="mb-10">
        <h2 className="text-xs uppercase tracking-widest text-[#999] font-medium mb-4">Global Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {globalPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-[#91715c] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: page.color + '15' }}>
                    <Icon size={20} style={{ color: page.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#1a1a1a] group-hover:text-[#91715c] transition-colors">{page.label}</h3>
                    <p className="text-sm text-[#666] mt-1">{page.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Media */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-[#999] font-medium mb-4">Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mediaPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-[#5c7a94] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: page.color + '15' }}>
                    <Icon size={20} style={{ color: page.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#1a1a1a] group-hover:text-[#5c7a94] transition-colors">{page.label}</h3>
                    <p className="text-sm text-[#666] mt-1">{page.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}