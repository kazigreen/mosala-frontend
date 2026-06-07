#!/usr/bin/env python3
"""
build.py - Mosala.io build system
Usage: python3 build.py              (toutes les sections)
       python3 build.py login        (une seule section)
"""
import os, shutil, datetime, sys

VPS_PATH    = '/var/www/mosala.io'
SOURCE_FILE = os.path.join(VPS_PATH, 'index.html')
PAGES_DIR   = os.path.join(VPS_PATH, 'pages')
TABS_DIR    = os.path.join(VPS_PATH, 'tabs')

SECTIONS = {
    'login': {
        'start': '  <!-- ═══════════════════════════════════════════\n       PAGE : CONNEXION\n  ════════════════════════════════════════════ -->',
        'end':   '  <!-- ═══════════════════════════════════════════\n       APP PRINCIPALE (authentifié)\n  ════════════════════════════════════════════ -->',
        'file':  os.path.join(PAGES_DIR, 'login.html'),
    },
    'register': {
        'start': '  <!-- ═══════════════════════════════════════════\n       PAGE : INSCRIPTION — 3 ÉTAPES\n  ════════════════════════════════════════════ -->',
        'end':   '  <!-- ═══════════════════════════════════════════\n       PAGE : COMPLÉTION PROFIL (après Google)\n  ════════════════════════════════════════════ -->',
        'file':  os.path.join(PAGES_DIR, 'register.html'),
    },
    'forgot': {
        'start': '  <!-- ═══════════════════════════════════════════\n       PAGE : MOT DE PASSE OUBLIÉ\n  ════════════════════════════════════════════ -->',
        'end':   '  <!-- ═══════════════════════════════════════════\n       PAGE : SAISIE CODE OTP\n  ════════════════════════════════════════════ -->',
        'file':  os.path.join(PAGES_DIR, 'forgot.html'),
    },
    'otp': {
        'start': '  <!-- ═══════════════════════════════════════════\n       PAGE : SAISIE CODE OTP\n  ════════════════════════════════════════════ -->',
        'end':   '  <!-- ═══════════════════════════════════════════\n       PAGE : CONNEXION\n  ════════════════════════════════════════════ -->',
        'file':  os.path.join(PAGES_DIR, 'otp.html'),
    },
    'marketplace': {
        'start': '<!-- ─────────────────────────────────────\n         TAB : MARKETPLACE\n    ───────────────────────────────────────── -->',
        'end':   '<!-- ─────────────────────────────────────\n         TAB : DASHBOARD\n    ───────────────────────────────────────── -->',
        'file':  os.path.join(TABS_DIR, 'marketplace.html'),
    },
    'dashboard': {
        'start': '<!-- ─────────────────────────────────────\n         TAB : DASHBOARD\n    ───────────────────────────────────────── -->',
        'end':   '<!-- ══════════════════════════════════════════\n         PROFIL — Mon Profil\n    ══════════════════════════════════════════ -->',
        'file':  os.path.join(TABS_DIR, 'dashboard.html'),
    },
    'profil': {
        'start': '<!-- ══════════════════════════════════════════\n         PROFIL — Mon Profil\n    ══════════════════════════════════════════ -->',
        'end':   '<!-- ══════════════════════════════════════════\n         WALLET — Portefeuille Mosala\n    ══════════════════════════════════════════ -->',
        'file':  os.path.join(TABS_DIR, 'profil.html'),
    },
    'wallet': {
        'start': '<!-- ══════════════════════════════════════════\n         WALLET — Portefeuille Mosala\n    ══════════════════════════════════════════ -->',
        'end':   '<!-- ══ /WALLET ══ -->',
        'file':  os.path.join(TABS_DIR, 'wallet.html'),
    },
    'messages': {
        'start': '<!-- ══ /WALLET ══ -->',
        'end':   '</div><!-- /app principale -->',
        'file':  os.path.join(TABS_DIR, 'messages.html'),
    },
}

def build(only=None):
    with open(SOURCE_FILE, "r") as f:
        content = f.read()
    changed = []
    targets = [only] if only else list(SECTIONS.keys())
    for name in targets:
        if name not in SECTIONS:
            print(f"Unknown section: {name}. Available: {list(SECTIONS.keys())}")
            continue
        cfg = SECTIONS[name]
        if not os.path.exists(cfg["file"]):
            print(f"File not found: {cfg['file']} — skipped")
            continue
        with open(cfg["file"], "r") as f:
            new_html = f.read().strip()
        idx_s = content.find(cfg["start"])
        idx_e = content.find(cfg["end"])
        if idx_s == -1 or idx_e == -1:
            print(f"Markers not found for: {name}")
            continue
        content = content[:idx_s + len(cfg["start"])] + "\n    " + new_html + "\n\n  " + content[idx_e:]
        changed.append(name)
        print(f"OK {name}")
    if not changed:
        print("Nothing to do.")
        return
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    bak = SOURCE_FILE + f".bak_{ts}"
    shutil.copy2(SOURCE_FILE, bak)
    print(f"Backup: {bak}")
    with open(SOURCE_FILE, "w") as f:
        f.write(content)
    print(f"Deployed: {len(changed)} section(s): {chr(44).join(changed)}")

if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    build(only)