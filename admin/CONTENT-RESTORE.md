# Content Restore Log — 5 June 2026

## Problem
Rory reported that original CMS content had been wiped/changed. Screenshots showed a different version of the site than what was live.

## Root Cause
The database content (about/content, home/content, home/radio) had been overwritten by a later commit ("feat: integrate press pack content" - commit 79ccbb2) that replaced the original text with Grammy-focused copy.

## Changes Made

### Database Updates
1. About page text — Restored original "From late-night sets in London's underground clubs..."
2. Radio track names — Updated to original: Midnight in London, Vegas Lights, Ibiza Sunrise, South Side, After Hours
3. Home content — Updated heading back to original text
4. Showreel content — Restored original text
5. raw_html sections deleted (4 junk records)
6. CMS sections seeded — 12 structured sections for admin editor

### Code Changes
1. About page — Filter out page title and copyright from body paragraphs
2. Navbar — Added "Supporting" link
3. Homepage — Added id="supporting" anchor

## Original Content (from git commit 87f4179 — LNR v5)
See above for full text.