#!/usr/bin/env python3
"""Composite exact titles + phonics tiles onto Imagine paper/fox plates."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

CREAM = (247, 241, 230, 255)
INK = (44, 38, 30, 255)
CORAL = (212, 90, 58, 255)
CORAL_DEEP = (181, 68, 44, 255)
CORAL_HI = (232, 132, 108, 255)
TEAL = (47, 138, 123, 255)
TEAL_DEEP = (36, 110, 98, 255)
TEAL_HI = (90, 168, 154, 255)
WHITE = (255, 255, 255, 255)

OG_BG = Path("/workspace/artifacts/imagine_images/662aaca4-3997-46eb-8a3f-a5565ea09b96.jpg")
BANNER_BG = Path("/workspace/artifacts/imagine_images/b0c41f9b-9a72-4f30-b559-fd8c9db6f709.jpg")
TITLE_FONT = Path("/workspace/.grok/fonts/ZCOOLKuaiLe-Regular.ttf")
LATIN_FONT = Path("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf")
OUT_DIR = Path("/workspace/.grok")

TITLE = "拼拼乐"
SUB = "三年级上册 · 单词闯关"


def cover_crop(im: Image.Image, w: int, h: int) -> Image.Image:
    scale = max(w / im.width, h / im.height)
    nw, nh = max(1, round(im.width * scale)), max(1, round(im.height * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return im.crop((left, top, left + w, top + h)).convert("RGBA")


def depurple(im: Image.Image) -> Image.Image:
    """Shift indigo/purple fox faces toward warm ink/terracotta."""
    arr = np.asarray(im.convert("RGB")).astype(np.float32) / 255.0
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    df = np.clip(mx - mn, 1e-6, None)
    sat = np.where(mx > 0, df / np.clip(mx, 1e-6, None), 0.0)
    hue = np.zeros_like(mx)
    rc = ((g - b) / df) % 6
    gc = (b - r) / df + 2.0
    bc = (r - g) / df + 4.0
    hue = np.where((mx == r) & (df > 1e-5), rc, hue)
    hue = np.where((mx == g) & (df > 1e-5), gc, hue)
    hue = np.where((mx == b) & (df > 1e-5), bc, hue)
    hue_deg = hue * 60.0
    purple = (hue_deg >= 235) & (hue_deg <= 310) & (sat > 0.12) & (mx < 0.78)
    if not np.any(purple):
        return im.convert("RGBA")
    # Mix toward terracotta ink rather than re-hueing (keeps paper grain).
    target = np.array([0.55, 0.28, 0.20], dtype=np.float32)
    mix = np.clip((sat - 0.12) / 0.5, 0.35, 0.85)
    out = arr.copy()
    for c in range(3):
        out[..., c] = np.where(purple, out[..., c] * (1 - mix) + target[c] * mix, out[..., c])
    return Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8), "RGB").convert("RGBA")


def rounded_tile(letter: str, color: str, size: int) -> Image.Image:
    fill = CORAL if color == "coral" else TEAL
    deep = CORAL_DEEP if color == "coral" else TEAL_DEEP
    hi = CORAL_HI if color == "coral" else TEAL_HI
    pad = max(10, size // 5)
    canvas = Image.new("RGBA", (size + pad * 2, size + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    x0, y0 = pad, pad
    x1, y1 = pad + size, pad + size
    rad = max(8, round(size * 0.18))
    # Drop shadow
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        [x0 + 2, y0 + 4, x1 + 2, y1 + 5],
        radius=rad,
        fill=(44, 38, 30, 70),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(2.4))
    canvas = Image.alpha_composite(canvas, shadow)
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle([x0, y0, x1, y1], radius=rad, fill=deep)
    d.rounded_rectangle([x0, y0, x1, y1 - max(3, size // 18)], radius=rad, fill=fill)
    # Top sheen
    sheen = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sh = ImageDraw.Draw(sheen)
    sh.rounded_rectangle(
        [x0 + 3, y0 + 2, x1 - 3, y0 + int(size * 0.38)],
        radius=rad - 2,
        fill=(hi[0], hi[1], hi[2], 70),
    )
    canvas = Image.alpha_composite(canvas, sheen)
    d = ImageDraw.Draw(canvas)
    font_size = max(18, int(size * 0.58))
    font = ImageFont.truetype(str(LATIN_FONT), font_size)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 - size * 0.03
    d.text((cx, cy), letter, font=font, fill=WHITE, anchor="mm")
    return canvas


def paste_rotated(base: Image.Image, tile: Image.Image, cx: int, cy: int, angle: float) -> None:
    rot = tile.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    x = int(cx - rot.width / 2)
    y = int(cy - rot.height / 2)
    base.alpha_composite(rot, (x, y))


def draw_word(
    base: Image.Image,
    word: str,
    origin_x: int,
    cy: int,
    size: int,
    gap: int,
    start_coral: bool,
    tilts: list[float],
) -> int:
    colors = []
    coral_first = start_coral
    for i, _ in enumerate(word):
        colors.append("coral" if (i % 2 == 0) == coral_first else "teal")
    total = len(word) * size + (len(word) - 1) * gap
    x = origin_x
    for i, ch in enumerate(word):
        tile = rounded_tile(ch, colors[i], size)
        cx = x + size // 2
        paste_rotated(base, tile, cx, cy, tilts[i % len(tilts)])
        x += size + gap
    return total


def stroke_text(draw: ImageDraw.ImageDraw, xy, text, font, fill, stroke, width: int) -> None:
    x, y = xy
    for dx in range(-width, width + 1):
        for dy in range(-width, width + 1):
            if dx * dx + dy * dy > width * width:
                continue
            if dx == 0 and dy == 0:
                continue
            draw.text((x + dx, y + dy), text, font=font, fill=stroke, anchor="mm")
    draw.text((x, y), text, font=font, fill=fill, anchor="mm")


def compose_og() -> Image.Image:
    raw = Image.open(OG_BG)
    base = cover_crop(raw, 1200, 630)
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    title_font = ImageFont.truetype(str(TITLE_FONT), 148)
    sub_font = ImageFont.truetype(str(TITLE_FONT), 34)

    cx, title_y = 560, 148
    stroke_text(
        d,
        (cx, title_y),
        TITLE,
        title_font,
        INK,
        (247, 241, 230, 230),
        4,
    )
    stroke_text(
        d,
        (cx, 232),
        SUB,
        sub_font,
        (44, 38, 30, 220),
        (247, 241, 230, 210),
        3,
    )

    # Phonics rows, slightly left of true center so the fox stays clear.
    tile = 62
    gap = 9
    smile_w = 5 * tile + 4 * gap
    help_w = 4 * tile + 3 * gap
    friend_w = 6 * tile + 5 * gap
    draw_word(
        overlay,
        "SMILE",
        cx - smile_w // 2,
        318,
        tile,
        gap,
        True,
        [-3.5, 2.8, -1.8, 3.2, -2.6],
    )
    draw_word(
        overlay,
        "HELP",
        cx - help_w // 2,
        400,
        tile,
        gap,
        False,
        [2.2, -3.0, 2.6, -2.0],
    )
    draw_word(
        overlay,
        "FRIEND",
        cx - friend_w // 2,
        482,
        tile,
        gap,
        True,
        [-2.8, 2.4, -3.4, 1.8, -2.2, 3.0],
    )
    return Image.alpha_composite(base, overlay)


def compose_banner() -> Image.Image:
    raw = depurple(Image.open(BANNER_BG))
    base = cover_crop(raw, 1200, 264)
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    title_font = ImageFont.truetype(str(TITLE_FONT), 62)
    sub_font = ImageFont.truetype(str(TITLE_FONT), 22)

    # Left-half lockup, sitting above the midline, empty bottom strip.
    left = 54
    title_w = title_font.getbbox(TITLE)[2] - title_font.getbbox(TITLE)[0]
    sub_w = sub_font.getbbox(SUB)[2] - sub_font.getbbox(SUB)[0]
    stroke_text(
        d,
        (left + title_w / 2, 52),
        TITLE,
        title_font,
        INK,
        (247, 241, 230, 235),
        3,
    )
    stroke_text(
        d,
        (left + sub_w / 2, 96),
        SUB,
        sub_font,
        (44, 38, 30, 220),
        (247, 241, 230, 220),
        2,
    )

    tile, gap = 34, 6
    # SMILE + HELP on one row, FRIEND on a second — all inside left 50% / top 80%.
    y1, y2 = 142, 186
    smile_w = 5 * tile + 4 * gap
    help_w = 4 * tile + 3 * gap
    friend_w = 6 * tile + 5 * gap
    draw_word(overlay, "SMILE", left, y1, tile, gap, True, [-2.5, 2.0, -1.5, 2.4, -1.8])
    help_x = left + smile_w + 14
    draw_word(overlay, "HELP", help_x, y1, tile, gap, False, [1.6, -2.2, 2.0, -1.4])
    draw_word(overlay, "FRIEND", left, y2, tile, gap, True, [-2.0, 1.8, -2.6, 1.4, -1.6, 2.2])
    return Image.alpha_composite(base, overlay)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    og = compose_og().convert("RGB")
    banner = compose_banner().convert("RGB")
    og.save(OUT_DIR / "og-card.png", optimize=True)
    banner.save(OUT_DIR / "x-banner-card.png", optimize=True)
    print("og", og.size, "banner", banner.size)


if __name__ == "__main__":
    main()
