#!/usr/bin/env python3
"""
build.py — Mosala.io build system
Usage: python3 build.py              (toutes les pages)
       python3 build.py login        (une seule page)
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
    'forgot': {
        'start': '  <!-- ═══════════════════════════════════════════\n       PAGE : MOT DE PASSE OUBLIÉ\n  ════════════════════════════════════════════ -->',
        'end':   '  <!-- ═══════════════════════════════════════════\n       PAGE : SAISIE CODE OTP\n  ════════════════════════════════════════════ -->',
        'file':  'forgot.html',
    },
    'otp': {
        'start': '  <!-- ═══════════════════════════════════════════\n       PAGE : SAISIE CODE OTP\n  ════════════════════════════════════════════ -->',
        'end':   '  <!-- ═══════════════════════════════════════════\n       PAGE : CONNEXION\n  ════════════════════════════════════════════ -->',
        'file':  'otp.html',
    },
}

def build(only=None):
    with open(SOURCE_FILE, 'r') as f:
        content = f.read()

    changed = []
    targets = [only] if only else list(PAGES.keys())

    for name in targets:
        if name not in PAGES:
            print(f"⚠️  Page '{name}' inconnue. Disponibles : {list(PAGES.keys())}")
            continue
        cfg = PAGES[name]
        page_file = os.path.join(PAGES_DIR, cfg['file'])
        if not os.path.exists(page_file):
            print(f"⚠️  pages/{cfg['file']} introuvable — ignoré")
            continue

        with open(page_file, 'r') as f:
            new_html = f.read().strip()

        start_m = cfg['start'].encode().decode('unicode_escape')
        end_m   = cfg['end'].encode().decode('unicode_escape')

        idx_start = content.find(start_m)
        idx_end   = content.find(end_m)

        if idx_start == -1 or idx_end == -1:
            print(f"⚠️  Marqueurs de '{name}' introuvables — ignoré")
            continue

        new_section = '\n  ' + new_html + '\n\n  '
        content = content[:idx_start + len(start_m)] + new_section + content[idx_end:]
        changed.append(name)
        print(f"✅ {name} injecté")

    if not changed:
        print("Rien à faire.")
        return

    ts  = datetime.datetime.now().strftime('%Y%m%d_%H%M')
    bak = SOURCE_FILE + f'.bak_{ts}'
    shutil.copy2(SOURCE_FILE, bak)
    print(f"📦 Backup : {bak}")

    with open(SOURCE_FILE, 'w') as f:
        f.write(content)
    print(f"🚀 Déployé ({len(changed)} section(s) : {', '.join(changed)})")

if __name__ == '__main__':
    only = sys.argv[1] if len(sys.argv) > 1 else None
    build(only)
