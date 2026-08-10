#!/usr/bin/env python3
"""Convert root-absolute paths to relative so the site works from any subpath
(GitHub Pages project URL, a subfolder, or straight off the filesystem)."""
import re
import pathlib

SITE = pathlib.Path('/Users/grant/BrightPenny/site')

# internal page directories that appear as "/name/"
PAGE_DIRS = ['finance-options', 'sectors', 'about', 'contact', 'privacy', 'thank-you']

html_files = sorted(SITE.rglob('*.html'))
changed = []

for f in html_files:
    depth = len(f.relative_to(SITE).parts) - 1     # 0 for root files, 1 for subfolder pages
    prefix = '../' * depth
    text = original = f.read_text()

    # home link: href="/" -> "./" at root, "../" in a subfolder
    text = text.replace('href="/"', f'href="{prefix or "./"}"')

    # assets referenced from href/src/srcset (srcset entries are comma separated)
    text = text.replace('"/assets/', f'"{prefix}assets/')
    text = text.replace(', /assets/', f', {prefix}assets/')

    # root files
    text = text.replace('href="/favicon.ico"', f'href="{prefix}favicon.ico"')

    # internal page links and the form action
    for d in PAGE_DIRS:
        text = text.replace(f'href="/{d}/', f'href="{prefix}{d}/')
        text = text.replace(f'action="/{d}/', f'action="{prefix}{d}/')

    if text != original:
        f.write_text(text)
        changed.append(f'{f.relative_to(SITE)}  (prefix "{prefix}")')

print('rewritten:')
for c in changed:
    print('  ' + c)

# the webmanifest points at icons that sit beside it
mani = SITE / 'assets/icons/site.webmanifest'
m = mani.read_text()
m2 = m.replace('"/assets/icons/', '"')
if m2 != m:
    mani.write_text(m2)
    print('  assets/icons/site.webmanifest')

# report anything still absolute
leftovers = []
for f in html_files:
    for match in re.finditer(r'(href|src|srcset|action)="(/[^"]*)"', f.read_text()):
        leftovers.append(f'{f.relative_to(SITE)}: {match.group(0)[:80]}')
print('\nremaining absolute refs:', len(leftovers))
for l in leftovers[:20]:
    print('  ' + l)
