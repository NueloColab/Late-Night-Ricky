with open('/home/node/.openclaw/workspace/late-night-ricky/admin/src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the end of the artists section (before MUSIC & MIXES)
insert_marker = '      {/* ═══ MUSIC & MIXES ═══ */}'
insert_idx = content.find(insert_marker)

if insert_idx == -1:
    print('Insert marker not found')
else:
    # The section to insert
    worldwide_section = '''
      {/* ═══ WORLDWIDE PERFORMANCES ═══ */}
      <section id="venues" className="relative py-20 md:py-28 px-6 md:px-14 overflow-hidden">
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <div className="relative text-center reveal-fade border-t border-[#c4b498]/20 pt-12 pb-10 rounded-xl overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <img src="/assets/venues-bg.jpg" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#2a1a0a]/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#5c4328]/40 via-transparent to-[#2a1a0a]/70" />
            </div>
            <h2 className="relative z-10 text-[clamp(28px,3.5vw,48px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] text-center mb-12">
              Worldwide Performances
            </h2>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-1 max-w-[800px] mx-auto pl-4 md:pl-12 justify-items-start">
              <div className="space-y-1">
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">LIV (Miami)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">WALL (Miami)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">TAPE (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">HAKKASAN (Las Vegas)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">MOVIDA (Dubai)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">JIMMY\'Z (Monte Carlo)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">MINISTRY OF SOUND (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">1 OAK (New York)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">BYBLOS (Milan)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">PACHA (Ibiza)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">ARMANI (Dubai)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">MANDALAY BAY (Las Vegas)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">TEMPLE (San Francisco)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">POPPY (Los Angeles)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">CIRQUE LE SOIR (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">HIGHLIGHT ROOM (Los Angeles)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">TEDDY\'S @ ROOSEVELT (Los Angeles)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">DELILAH (Los Angeles)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">GIBSON (Frankfurt)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">LIO (Ibiza)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">STUDIO PARIS (Chicago)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">PREMIER @ BORGATE (Atlantic City)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">PARQ (San Diego)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">BOOTSY BELLOWS (Los Angeles)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">WARWICK (Los Angeles)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">LAVO (New York)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">TAO (New York)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">UP & DOWN (New York)</p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">LIBERTINE (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">SCANDAL (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">TOY ROOM (Dubai)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">1 OAK (Dubai)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">TAO (Las Vegas)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">BAOLI (Cannes)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">SHOKO (Barcelona)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">LASTA (Serbia)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">REX ROOMS (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">HARRIET\'S (Los Angeles)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">VIP ROOM (St. Tropez)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">BON BONNIERE (Mykonos)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">DRAMA (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">DEAR DARLING (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">TRAMP (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">SPIRITO (Brussels)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">CUCKOO CLUB (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">RAFFLES (London)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">SUBOIS (Montreal)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">P1 (Munich)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">ZELO\'S (Monte Carlo)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">BOOTSY BELLOWS (Los Angeles)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">WARWICK (Los Angeles)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">LAVO (New York)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">TAO (New York)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">UP & DOWN (New York)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">WIRELESS FESTIVAL (UK)</p>
                <p className="text-[12px] md:text-[13px] text-[#d4c4a8]/80">READING & LEEDS FESTIVAL (UK)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

'''
    
    # Insert the section before the MUSIC & MIXES section
    new_content = content[:insert_idx] + worldwide_section + content[insert_idx:]
    
    with open('/home/node/.openclaw/workspace/late-night-ricky/admin/src/app/page.tsx', 'w') as f:
        f.write(new_content)
    
    print('Worldwide Performances section restored')
