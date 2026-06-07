#!/usr/bin/env python3
"""
build.py — Mosala.io build system
Injecte les pages/ dans index.html via des marqueurs commentaires.
Usage: python3 build.py
       python3 build.py login       ← rebuild une seule page
"""
import os, shutil, datetime, sys

VPS_PATH    = '/var/www/mosala.io'
SOURCE_FILE = os.path.join(VPS_PATH, 'index.html')
PAGES_DIR   = os.path.join(VPS_PATH, 'pages')

PAGES = {
    'login': {
        'start': '  <!-- ═══════════════════════════════════════════\n       PAGE : CONNEXION\n  ════════════════════════════════════════════ -->',
        'end':   '  <!-- ═══════════════════════════════════════════\n       APP PRINCIPALE (authentifié)\n  ════════════════════════════════════════════ -->',
        'file':  'login.html',
    },
    'register': {
        'start': '  <!-- ═══════════════════════════════════════════\n       PAGE : INSCRIPTION — 3 ÉTAPES\n  ════════════════════════════════════════════ -->',
        'end':   '  <!-- ═══════════════════════════════════════════\n       PAGE : COMPLÉTION PROFIL (après Google)\n  ════════════════════════════════════════════ -->',
        'file':  'register.html',
    },
}

def build(only=None):
    with open(SOURCE_FILE, 'r') as f:
        content = f.read()

    changed = []
    targets = [only] if only else list(PAGES.keys())

    for name in targets:
        if name not in PAGES:
            print(f"⚠️  Page '{name}' inconnue")
            continue
        cfg = PAGES[name]
        page_file = os.path.join(PAGES_DIR, cfg['file'])
        if not os.path.exists(page_file):
            print(f"⚠️  pages/{cfg['file']} introuvable — ignoré")
            continue

        with open(page_file, 'r') as f:
            new_html = f.read().strip()

        idx_start = content.find(cfg['start'])
        idx_end   = content.find(cfg['end'])

        if idx_start == -1 or idx_end == -1:
            print(f"⚠️  Marqueurs de '{name}' introuvables — ignoré")
            continue

        new_section = '\n  ' + new_html + '\n\n  '
        content = content[:idx_start + len(cfg['start'])] + new_section + content[idx_end:]
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
    only = sys.argv[1] if len(sys.argv) > 1 else None
    build(only)
