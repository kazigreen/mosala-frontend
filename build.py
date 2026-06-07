#!/usr/bin/env python3
"""
build.py — Mosala.io build system
Injecte les pages/ dans index.html via des marqueurs commentaires.
Usage: python3 build.py
"""
import os, shutil, datetime

VPS_PATH    = '/var/www/mosala.io'
SOURCE_FILE = os.path.join(VPS_PATH, 'index.html')
PAGES_DIR   = os.path.join(VPS_PATH, 'pages')

PAGES = {
    'login': {
        'start': '  <!-- ═══════════════════════════════════════════\n       PAGE : CONNEXION\n  ════════════════════════════════════════════ -->',
        'end':   '  <!-- ═══════════════════════════════════════════\n       APP PRINCIPALE (authentifié)\n  ════════════════════════════════════════════ -->',
        'file':  'login.html',
    },
    # Ajouter register, forgot, etc. ici au fur et à mesure
}

def build():
    with open(SOURCE_FILE, 'r') as f:
        content = f.read()

    changed = []

    for name, cfg in PAGES.items():
        page_file = os.path.join(PAGES_DIR, cfg['file'])
        if not os.path.exists(page_file):
            print(f"⚠️  pages/{cfg['file']} introuvable — ignoré")
            continue

        with open(page_file, 'r') as f:
            new_html = f.read().strip()

        start_marker = cfg['start']
        end_marker   = cfg['end']

        idx_start = content.find(start_marker)
        idx_end   = content.find(end_marker)

        if idx_start == -1 or idx_end == -1:
            print(f"⚠️  Marqueurs de {name} introuvables — ignoré")
            continue

        old_section = content[idx_start + len(start_marker):idx_end]
        new_section = '\n  ' + new_html + '\n\n  '
        content = content[:idx_start + len(start_marker)] + new_section + content[idx_end:]
        changed.append(name)
        print(f"✅ {name} injecté")

    if not changed:
        print("Rien à faire.")
        return

    # Backup automatique
    ts  = datetime.datetime.now().strftime('%Y%m%d_%H%M')
    bak = SOURCE_FILE + f'.bak_{ts}'
    shutil.copy2(SOURCE_FILE, bak)
    print(f"📦 Backup : {bak}")

    with open(SOURCE_FILE, 'w') as f:
        f.write(content)
    print(f"🚀 index.html mis à jour ({len(changed)} section(s) : {', '.join(changed)})")

if __name__ == '__main__':
    build()
