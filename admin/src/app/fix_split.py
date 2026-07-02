import re

with open('page.tsx', 'r') as f:
    content = f.read()

# Split into two sections: Artists and Venues
# Find the split point: after "And many more..." closing tag and before "Locations text"

split_marker = 'And many more...\n          </p>\n\n          <!-- Locations text -->'

if split_marker in content:
    # Split the content
    parts = content.split(split_marker, 1)
    before = parts[0]
    after = parts[1]
    
    # Close the first section: add closing div and section tags
    # Add back the split marker content but with section close
    new_content = before + '''And many more...
          </p>
        </div>
      </section>

      <!-- ═══ WORLDWIDE PERFORMANCES ═══ -->
      <section id=\"venues\" className=\"relative py-20 md:py-28 px-6 md:px-14 overflow-hidden\">
        <div className=\"relative z-10 max-w-[1400px] mx-auto\">

          <!-- Locations text -->''' + after
    
    # Also add background to the first section (Acts & Private Clients)
    # Find and replace the first section opening
    first_section_old = '''      <!-- ═══ ARTISTS & VENUES — brown background, carousel, locations ═══ -->
      <section id=\"artists\" className=\"relative py-20 md:py-28 px-6 md:px-14 overflow-hidden\">
        <div className=\"relative z-10 max-w-[1400px] mx-auto\">'''
    
    first_section_new = '''      <!-- ═══ ACTS & PRIVATE CLIENTS ═══ -->
      <section id=\"artists\" className=\"relative py-20 md:py-28 px-6 md:px-14 overflow-hidden\">
        <!-- Dark leather background -->
        <div className=\"absolute inset-0 bg-gradient-to-b from-[#7a5c3a] via-[#5c4328] to-[#4a3520]\" />
        <div className=\"absolute inset-0 opacity-[0.12]\" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")', backgroundSize: '256px 256px' }} />
        <div className=\"absolute inset-0 bg-gradient-to-br from-[#b89a6e]/40 via-transparent to-transparent\" />
        <div className=\"absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,170,130,0.25)_0%,transparent_60%)]\" />
        <div className=\"absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(40,25,10,0.3)_0%,transparent_70%)]\" />

        <div className=\"relative z-10 max-w-[1400px] mx-auto\">'''
    
    if first_section_old in new_content:
        new_content = new_content.replace(first_section_old, first_section_new)
        print('Replaced first section header')
    else:
        print('First section header not found')
    
    with open('page.tsx', 'w') as f:
        f.write(new_content)
    print('Done - split into two sections')
else:
    print('Split marker not found')
