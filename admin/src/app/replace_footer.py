with open('/home/node/.openclaw/workspace/late-night-ricky/admin/src/app/page.tsx', 'r') as f:
    content = f.read()

with open('/home/node/.openclaw/workspace/late-night-ricky/admin/src/app/footer-new.txt', 'r') as f:
    new_footer = f.read()

# Find the footer start marker
marker = '{/* ═══ FOOTER ═══ */}'
idx = content.find(marker)

if idx != -1:
    content = content[:idx] + new_footer
    with open('/home/node/.openclaw/workspace/late-night-ricky/admin/src/app/page.tsx', 'w') as f:
        f.write(content)
    print('Footer replaced successfully')
else:
    print('Footer marker not found')
