#!/usr/bin/env python3
"""
build.py — Mosala.io build system v2
Assemble index.html depuis index.template.html + pages/ + tabs/

Usage:
  python3 build.py          — rebuild complet depuis template
  python3 build.py login    — patch uniquement login dans index.html existant
  python3 build.py dashboard
"""
import os, re, shutil, datetime, sys

VPS_PATH     = '/var/www/mosala.io'
TEMPLATE     = os.path.join(VPS_PATH, 'index.template.html')
OUTPUT       = os.path.join(VPS_PATH, 'index.html')

def full_build():
    """Rebuild complet depuis le template — recommandé."""
    with open(TEMPLATE, 'r') as f:
        content = f.read()

    # Trouver tous les @inject
    injections = re.findall(r'<!-- @inject: ([^\s]+) -->', content)
    print(f"Sections à injecter : {injections}")

    for rel_path in injections:
        abs_path = os.path.join(VPS_PATH, rel_path)
        if not os.path.exists(abs_path):
            print(f"⚠️  {rel_path} introuvable — ignoré")
            continue
        with open(abs_path, 'r') as f:
            html = f.read().strip()
        placeholder = f'<!-- @inject: {rel_path} -->'
        content = content.replace(placeholder, html, 1)
        print(f"✅ {rel_path} injecté")

    # Backup + écriture
    ts  = datetime.datetime.now().strftime('%Y%m%d_%H%M')
    bak = OUTPUT + f'.bak_{ts}'
    if os.path.exists(OUTPUT):
        shutil.copy2(OUTPUT, bak)
        print(f"📦 Backup : {bak}")

    with open(OUTPUT, 'w') as f:
        f.write(content)

    lines = content.count('\n')
    print(f"🚀 index.html généré ({lines} lignes, {len(content)//1024}KB)")

def patch_build(section):
    """Patch une seule section dans index.html existant (mode rapide)."""
    section_map = {
        'login':       'pages/login.html',
        'register':    'pages/register.html',
        'forgot':      'pages/forgot.html',
        'otp':         'pages/otp.html',
        'dashboard':   'tabs/dashboard.html',
        'marketplace': 'tabs/marketplace.html',
        'profil':      'tabs/profil.html',
        'wallet':      'tabs/wallet.html',
        'messages':    'tabs/messages.html',
        'nouveau':     'tabs/nouveau.html',
    }
    if section not in section_map:
        print(f"⚠️  Section inconnue: {section}. Disponibles: {list(section_map.keys())}")
        return

    rel_path = section_map[section]
    abs_path = os.path.join(VPS_PATH, rel_path)
    placeholder = f'<!-- @inject: {rel_path} -->'

    with open(TEMPLATE, 'r') as f:
        template = f.read()

    if placeholder not in template:
        print(f"⚠️  Placeholder '{placeholder}' introuvable dans le template")
        return

    with open(abs_path, 'r') as f:
        html = f.read().strip()

    # Rebuild complet mais rapide
    full_build()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        patch_build(sys.argv[1])
    else:
        full_build()
