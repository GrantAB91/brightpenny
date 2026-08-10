#!/usr/bin/env python3
"""One-shot: derive web logo assets from supplied brand SVGs (originals untouched)."""
import re
import xml.etree.ElementTree as ET

SVG_NS = "http://www.w3.org/2000/svg"
XLINK_NS = "http://www.w3.org/1999/xlink"
ET.register_namespace("", SVG_NS)
ET.register_namespace("xlink", XLINK_NS)

ROOT = "/Users/grant/BrightPenny"


def has_fill(el, colour):
    if el.get("fill") == colour:
        return True
    return any(has_fill(c, colour) for c in el)


def load(path):
    return ET.parse(path)


def clean_lockup(tree, plate):
    """plate: colour of the page behind the logo — the coin needs a disc under it
    to mask the 'i' stem, and the supplied square white plate shows on any
    non-white background."""
    root = tree.getroot()
    for el in list(root):
        tag = el.tag.split("}")[-1]
        if tag == "rect" and el.get("fill") == "#ffffff":
            root.remove(el)          # full-canvas background plates
        elif tag == "g" and has_fill(el, "#ff0000"):
            root.remove(el)          # hidden export artifact inside the coin
    # swap the square white plate for a circular one, at the same paint position
    # (must sit under the coin ring + glyph but over the 'i' stem)
    white = next(el for el in root
                 if el.tag.endswith("}g") and has_fill(el, "#ffffff"))
    idx = list(root).index(white)
    root.remove(white)
    disc = ET.Element(f"{{{SVG_NS}}}circle",
                      {"cx": "391.02", "cy": "271.04", "r": "39.1", "fill": plate})
    root.insert(idx, disc)
    # measured art bounds (browser getBBox), tight crop
    root.set("viewBox", "205.03 222.23 1040.87 276.52")
    for attr in ("width", "height", "zoomAndPan", "preserveAspectRatio"):
        root.attrib.pop(attr, None)
    return tree


def recolour(tree, mapping):
    for el in tree.getroot().iter():
        f = el.get("fill")
        if f in mapping:
            el.set("fill", mapping[f])
    return tree


def write(tree, path):
    tree.write(path, xml_declaration=False)
    # drop stray whitespace runs to keep files lean
    with open(path) as fh:
        data = re.sub(r">\s+<", "><", fh.read())
    with open(path, "w") as fh:
        fh.write(data)
    print(path)


# 1) header lockup (brand colours, tight crop, paper-coloured plate)
write(clean_lockup(load(f"{ROOT}/logo/1.svg"), "#FCFBF8"),
      f"{ROOT}/site/assets/img/logo-lockup.svg")

# 2) reversed lockup for navy footer (grey -> white, navy plate)
write(recolour(clean_lockup(load(f"{ROOT}/logo/1.svg"), "#0B1B33"), {"#545454": "#ffffff"}),
      f"{ROOT}/site/assets/img/logo-lockup-white.svg")

# 3) favicon: solid penny disc + the supplied white glyph, extracted from 5.svg
tree = load(f"{ROOT}/logo/5.svg")
root = tree.getroot()
glyph = None
for el in list(root):
    tag = el.tag.split("}")[-1]
    if tag == "g" and el.get("transform", "").startswith("matrix(1, 0, 0, 1, 978, 270)"):
        glyph = el
if glyph is None:
    raise SystemExit("glyph group not found")
fav = ET.Element(f"{{{SVG_NS}}}svg", {"viewBox": "0 0 364.65 364.65"})
ET.SubElement(fav, f"{{{SVG_NS}}}circle",
              {"cx": "182.33", "cy": "182.33", "r": "182.33", "fill": "#F7931E"})
wrap = ET.SubElement(fav, f"{{{SVG_NS}}}g", {"transform": "translate(-865.82 -217.53)"})
for el in glyph.iter():
    el.attrib.pop("clip-path", None)
    if el.get("fill"):
        el.set("fill", "#ffffff")
wrap.append(glyph)
write(ET.ElementTree(fav), f"{ROOT}/site/assets/icons/favicon.svg")
