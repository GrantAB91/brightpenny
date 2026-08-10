#!/usr/bin/env python3
"""Wrap each finance product's two-column prose in an image/text media row."""
import re

PATH = '/Users/grant/BrightPenny/site/finance-options/index.html'

# slug -> (image basename, alt text)
IMAGES = {
    'asset-finance': ('product-asset-finance',
                      'Two new white panel vans parked on a yard under a clear sky'),
    'asset-refinance': ('product-asset-refinance',
                        'A tracked excavator standing on a mound of aggregate against blue sky'),
    'business-loans': ('product-business-loans',
                       'Independent shops along a red-brick and timber-framed British high street'),
    'invoice-finance': ('product-invoice-finance',
                        'Pallets of stock on orange racking in a bright, orderly warehouse'),
    'merchant-cash-advance': ('product-merchant-cash-advance',
                              'The counter of a small independent shop with a card terminal and refill jars'),
    'commercial-mortgages': ('product-commercial-mortgages',
                             'A converted brick mill building with tall arched windows in commercial use'),
    'development-bridging': ('product-development-bridging',
                             'Newly built brick houses on a UK residential street'),
    'structured-finance': ('product-structured-finance',
                           'A complex of old brick warehouse buildings under a bright cloudy sky'),
    'trade-finance': ('product-trade-finance',
                      'Container cranes and stacked shipping containers at a port quayside'),
}


def picture(base, alt, lazy=True):
    sizes = '(min-width: 768px) 46vw, 94vw'
    loading = ' loading="lazy"' if lazy else ''
    return (
        '<figure class="media-row__fig">\n'
        '              <picture>\n'
        f'                <source type="image/avif" srcset="/assets/img/{base}-480.avif 480w, /assets/img/{base}-800.avif 800w, /assets/img/{base}-1200.avif 1200w" sizes="{sizes}">\n'
        f'                <source type="image/webp" srcset="/assets/img/{base}-480.webp 480w, /assets/img/{base}-800.webp 800w, /assets/img/{base}-1200.webp 1200w" sizes="{sizes}">\n'
        f'                <img src="/assets/img/{base}-800.jpg" srcset="/assets/img/{base}-480.jpg 480w, /assets/img/{base}-800.jpg 800w, /assets/img/{base}-1200.jpg 1200w" sizes="{sizes}" width="800" height="500" alt="{alt}"{loading}>\n'
        '              </picture>\n'
        '            </figure>'
    )


src = open(PATH).read()
count = 0

for idx, (slug, (base, alt)) in enumerate(IMAGES.items()):
    # locate this product's article, then its inner two-column row
    art = re.search(
        rf'(<article class="product[^"]*" id="{slug}">.*?)(<div class="row g-4">\s*<div class="col-md-6">)(.*?)(</div>\s*</div>)',
        src, re.S)
    if not art:
        print('MISS', slug)
        continue

    head, row_open, row_inner, row_close = art.groups()
    # pull the two paragraph columns out and stack them in the text half
    paras = re.findall(r'<p class="mb-0">(.*?)</p>', row_inner, re.S)
    if len(paras) != 2:
        print('PARA MISS', slug, len(paras))
        continue

    flip = ' media-row--flip' if idx % 2 else ''
    lazy = not (idx == 0)
    body = (
        f'<div class="media-row{flip}">\n'
        f'            {picture(base, alt, lazy)}\n'
        '            <div>\n'
        f'              <p>{paras[0].strip()}</p>\n'
        f'              <p class="mb-0">{paras[1].strip()}</p>\n'
        '            </div>\n'
        '          </div>'
    )
    src = src.replace(row_open + row_inner + row_close, body, 1)
    count += 1

open(PATH, 'w').write(src)
print(f'rewrote {count} product sections')
