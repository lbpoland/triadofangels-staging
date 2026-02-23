#!/usr/bin/env python3
"""
TOA — MEGA WAVE E
Generate responsive WebP variants for album cover images and write a manifest.

Input:
  assets/images/albums/*-album.webp (and existing naming variants)

Output:
  assets/images/albums/variants/<base>-w{width}.webp
  assets/images/albums/variants/manifest.json

No existing files are deleted. This is additive and safe.
If Pillow is missing: pip install pillow
"""

from __future__ import annotations
import os, json, time
from pathlib import Path

try:
    from PIL import Image
except Exception as e:
    raise SystemExit("Pillow is required. Install with: pip install pillow") from e

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "assets" / "images" / "albums"
OUT_DIR = SRC_DIR / "variants"
OUT_DIR.mkdir(parents=True, exist_ok=True)

WIDTHS = [320, 480, 640, 800]

def is_cover(p: Path) -> bool:
    name = p.name.lower()
    return name.endswith(".webp") and name.endswith("-album.webp")

def save_webp(im: Image.Image, dst: Path, width: int) -> None:
    # Square crop/pad is not applied; we preserve the original aspect ratio.
    w, h = im.size
    if w == width:
        resized = im
    else:
        new_h = max(1, int(round(h * (width / float(w)))))
        resized = im.resize((width, new_h), Image.LANCZOS)
    # Convert to RGB(A) properly
    if resized.mode not in ("RGB", "RGBA"):
        resized = resized.convert("RGBA" if "A" in resized.getbands() else "RGB")
    # Save webp; quality tuned for cover art, metadata stripped by Pillow by default
    resized.save(dst, "WEBP", quality=84, method=6)

def main() -> None:
    covers = sorted([p for p in SRC_DIR.glob("*.webp") if is_cover(p)])
    if not covers:
        print("No album cover images found in", SRC_DIR)
        return

    manifest = {
        "version": 1,
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "covers": {}
    }

    for src in covers:
        rel_key = "/" + str(src.relative_to(ROOT)).replace(os.sep, "/")
        base = src.stem  # e.g. wingsoffire-album
        pattern = f"/assets/images/albums/variants/{base}-w{{w}}.webp"

        try:
            im = Image.open(src)
            im.load()
        except Exception:
            print("SKIP (unreadable):", src)
            continue

        for w in WIDTHS:
            dst = OUT_DIR / f"{base}-w{w}.webp"
            if dst.exists():
                continue
            try:
                save_webp(im, dst, w)
                print("Wrote", dst.relative_to(ROOT))
            except Exception as e:
                print("FAIL", dst, e)

        manifest["covers"][rel_key] = {
            "sizes": WIDTHS,
            "pattern": pattern
        }

    out_manifest = OUT_DIR / "manifest.json"
    out_manifest.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("Manifest:", out_manifest.relative_to(ROOT))

if __name__ == "__main__":
    main()
