"""Create a measured preview of, or apply, portfolio image optimizations.

By default this writes smaller candidates to a temporary mirror and reports
the total savings. Pass --apply to replace source assets with smaller results.
Long detail-page images are limited by width only, so their full height remains.
"""

from __future__ import annotations

import argparse
import os
import tempfile
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".webp", ".png"}
WIDTH_LIMITS = {
    "c4d-gallery": 1200,
    "ansmen-vi": 1600,
    "offline-materials": 1500,
    "logo-design": 1400,
    "illustrations": 1400,
    "font-generation": 1400,
    "ip-character": 1000,
    "white-model-comparison": 1400,
    "uploads": 1200,
}


def width_limit(path: Path) -> int:
    for directory, limit in WIDTH_LIMITS.items():
        if directory in path.parts:
            return limit
    return 1600


def optimized_copy(source: Path, destination: Path) -> tuple[int, tuple[int, int], tuple[int, int]]:
    with Image.open(source) as opened:
        original_size = opened.size
        profile = opened.info.get("icc_profile")
        image = ImageOps.exif_transpose(opened)
        max_width = width_limit(source)
        if image.width > max_width:
            height = max(1, round(image.height * max_width / image.width))
            image = image.resize((max_width, height), Image.Resampling.LANCZOS)

        destination.parent.mkdir(parents=True, exist_ok=True)
        suffix = source.suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            if image.mode not in {"RGB", "L"}:
                image = image.convert("RGB")
            settings = {"quality": 88 if "detail" in source.stem.lower() else 84,
                        "optimize": True, "progressive": True, "subsampling": 0}
            if profile:
                settings["icc_profile"] = profile
            image.save(destination, format="JPEG", **settings)
        elif suffix == ".webp":
            settings = {"quality": 82, "method": 6}
            if profile:
                settings["icc_profile"] = profile
            image.save(destination, format="WEBP", **settings)
        else:
            image.save(destination, format="PNG", optimize=True)

        return destination.stat().st_size, original_size, image.size


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="replace source assets when the candidate is smaller")
    parser.add_argument("--output-dir", type=Path, help="preview destination; defaults to a folder in the system temp directory")
    args = parser.parse_args()

    preview_root = args.output_dir or Path(tempfile.gettempdir()) / "portfolio-image-optimization-preview"
    files = sorted(path for base in (ROOT / "public", ROOT / "src")
                   for path in base.rglob("*")
                   if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES)
    before_total = 0
    after_total = 0
    changed = 0
    resized = 0
    qr_untouched = 0

    for index, source in enumerate(files, 1):
        before = source.stat().st_size
        before_total += before
        if source.name.lower() == "wechat-contact-qr.jpg":
            after_total += before
            qr_untouched += 1
            continue

        relative = source.relative_to(ROOT)
        destination = source if args.apply else preview_root / relative
        temporary = destination.with_name(destination.stem + ".optimized" + destination.suffix)
        candidate_size, original_dimensions, new_dimensions = optimized_copy(source, temporary)
        if new_dimensions != original_dimensions:
            resized += 1
        if candidate_size >= before:
            temporary.unlink(missing_ok=True)
            after_total += before
            continue

        changed += 1
        after_total += candidate_size
        if args.apply:
            os.replace(temporary, source)
        else:
            os.replace(temporary, destination)
        if changed <= 12:
            print(f"{relative}: {before / 1048576:.2f} -> {candidate_size / 1048576:.2f} MiB; "
                  f"{original_dimensions[0]}x{original_dimensions[1]} -> {new_dimensions[0]}x{new_dimensions[1]}")
        if index % 40 == 0 or index == len(files):
            print(f"Processed {index}/{len(files)} images")

    print(f"Images: {len(files)}; optimized: {changed}; resized by width: {resized}; QR kept unchanged: {qr_untouched}")
    print(f"Total: {before_total / 1048576:.2f} -> {after_total / 1048576:.2f} MiB "
          f"({(before_total - after_total) / 1048576:.2f} MiB saved)")
    if not args.apply:
        print(f"Preview files: {preview_root}")


if __name__ == "__main__":
    main()
