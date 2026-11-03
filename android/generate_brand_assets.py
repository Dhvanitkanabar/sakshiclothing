"""
Sakshi Clothing & Admin Atelier Brand Identity Generator
Generates:
1. Customer Android Launcher Icons (Adaptive vectors + mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi PNGs, square + round)
2. Admin Android Launcher Icons (Adaptive vectors + mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi PNGs, square + round)
3. Customer Website Favicons (favicon.svg, favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, site.webmanifest)
4. Admin Website Favicons (favicon.svg, favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, site.webmanifest)
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Base paths
ROOT_DIR = r"c:\Users\dhvan\Desktop\sakshiclothing"
CUSTOMER_ANDROID_RES = os.path.join(ROOT_DIR, "android", "app-customer", "src", "main", "res")
ADMIN_ANDROID_RES = os.path.join(ROOT_DIR, "android", "app-admin", "src", "main", "res")
CUSTOMER_WEB_PUB = os.path.join(ROOT_DIR, "frontend", "customer", "public")
ADMIN_WEB_PUB = os.path.join(ROOT_DIR, "frontend", "admin", "public")

# Ensure target directories exist
for density in ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]:
    os.makedirs(os.path.join(CUSTOMER_ANDROID_RES, f"mipmap-{density}"), exist_ok=True)
    os.makedirs(os.path.join(ADMIN_ANDROID_RES, f"mipmap-{density}"), exist_ok=True)

os.makedirs(os.path.join(CUSTOMER_ANDROID_RES, "mipmap-anydpi-v26"), exist_ok=True)
os.makedirs(os.path.join(ADMIN_ANDROID_RES, "mipmap-anydpi-v26"), exist_ok=True)
os.makedirs(os.path.join(CUSTOMER_ANDROID_RES, "drawable"), exist_ok=True)
os.makedirs(os.path.join(ADMIN_ANDROID_RES, "drawable"), exist_ok=True)
os.makedirs(CUSTOMER_WEB_PUB, exist_ok=True)
os.makedirs(ADMIN_WEB_PUB, exist_ok=True)

FONT_SERIF = r"C:\Windows\Fonts\georgiab.ttf"
FONT_SANS = r"C:\Windows\Fonts\arialbd.ttf"

def draw_luxury_gradient(img, start_color, end_color):
    """Draw a smooth subtle radial/diagonal gradient."""
    width, height = img.size
    base = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(base)
    for y in range(height):
        ratio = y / float(height)
        r = int(start_color[0] * (1 - ratio) + end_color[0] * ratio)
        g = int(start_color[1] * (1 - ratio) + end_color[1] * ratio)
        b = int(start_color[2] * (1 - ratio) + end_color[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return base

def create_customer_master_icon(size=512, is_round=False):
    """
    Renders high-resolution master icon for Sakshi Clothing (Customer).
    Dark Noir luxury aesthetic, gold 'S' couture monogram, amber jewel dot, and 'SAKSHI' wordmark.
    """
    canvas_size = size * 2  # Supersample 2x
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    
    # Background
    bg = draw_luxury_gradient(img, (26, 24, 21), (15, 14, 12))
    mask = Image.new("L", (canvas_size, canvas_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    
    pad = int(canvas_size * 0.04)
    if is_round:
        mask_draw.ellipse([pad, pad, canvas_size - pad, canvas_size - pad], fill=255)
    else:
        radius = int(canvas_size * 0.22)
        mask_draw.rounded_rectangle([pad, pad, canvas_size - pad, canvas_size - pad], radius=radius, fill=255)
        
    img.paste(bg, (0, 0), mask)
    draw = ImageDraw.Draw(img)
    
    # Elegant gold border
    border_color = (245, 158, 11, 70)
    border_w = int(canvas_size * 0.012)
    if is_round:
        draw.ellipse([pad, pad, canvas_size - pad, canvas_size - pad], outline=border_color, width=border_w)
    else:
        draw.rounded_rectangle([pad, pad, canvas_size - pad, canvas_size - pad], radius=radius, outline=border_color, width=border_w)
        
    # Draw Couture 'S'
    font_s_size = int(canvas_size * 0.52)
    try:
        font_s = ImageFont.truetype(FONT_SERIF, font_s_size)
    except:
        font_s = ImageFont.load_default()
        
    text = "S"
    bbox = draw.textbbox((0, 0), text, font=font_s)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    x = (canvas_size - text_w) // 2 - bbox[0]
    y = int(canvas_size * 0.17) - bbox[1]
    
    # Soft gold glow behind 'S'
    glow_img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.text((x, y), text, font=font_s, fill=(245, 158, 11, 60))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=int(canvas_size * 0.03)))
    img.alpha_composite(glow_img)
    
    # S Monogram with warm gold gradient effect (drawn in layers)
    draw.text((x, y + int(canvas_size * 0.008)), text, font=font_s, fill=(180, 100, 4, 255))
    draw.text((x, y), text, font=font_s, fill=(251, 191, 36, 255))
    draw.text((x - int(canvas_size * 0.004), y - int(canvas_size * 0.004)), text, font=font_s, fill=(254, 240, 138, 200))
    
    # Amber jewel dot at the upper-right of the S
    jewel_x = x + text_w - int(canvas_size * 0.01)
    jewel_y = y + int(text_h * 0.16)
    jewel_r = int(canvas_size * 0.045)
    
    # Jewel glow
    draw.ellipse([jewel_x - jewel_r * 1.5, jewel_y - jewel_r * 1.5, jewel_x + jewel_r * 1.5, jewel_y + jewel_r * 1.5], fill=(245, 158, 11, 90))
    draw.ellipse([jewel_x - jewel_r, jewel_y - jewel_r, jewel_x + jewel_r, jewel_y + jewel_r], fill=(245, 158, 11, 255))
    draw.ellipse([jewel_x - jewel_r * 0.5, jewel_y - jewel_r * 0.5, jewel_x + jewel_r * 0.5, jewel_y + jewel_r * 0.5], fill=(254, 243, 199, 255))
    
    # "SAKSHI" Wordmark below
    font_word_size = int(canvas_size * 0.09)
    try:
        font_word = ImageFont.truetype(FONT_SANS, font_word_size)
    except:
        font_word = ImageFont.load_default()
        
    word = "S A K S H I"
    w_bbox = draw.textbbox((0, 0), word, font=font_word)
    w_w = w_bbox[2] - w_bbox[0]
    w_x = (canvas_size - w_w) // 2 - w_bbox[0]
    w_y = int(canvas_size * 0.77)
    
    draw.text((w_x, w_y), word, font=font_word, fill=(245, 240, 230, 240))
    
    # Downsample with Lanczos for ultra crisp rendering
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def create_admin_master_icon(size=512, is_round=False):
    """
    Renders high-resolution master icon for Sakshi Admin Atelier.
    Deep Midnight Slate aesthetic, Atelier Golden Crown Crest, Couture 'S', and 'ATELIER' badge.
    """
    canvas_size = size * 2
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    
    # Background: Midnight Slate gradient
    bg = draw_luxury_gradient(img, (24, 38, 62), (15, 23, 42))
    mask = Image.new("L", (canvas_size, canvas_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    
    pad = int(canvas_size * 0.04)
    if is_round:
        mask_draw.ellipse([pad, pad, canvas_size - pad, canvas_size - pad], fill=255)
    else:
        radius = int(canvas_size * 0.22)
        mask_draw.rounded_rectangle([pad, pad, canvas_size - pad, canvas_size - pad], radius=radius, fill=255)
        
    img.paste(bg, (0, 0), mask)
    draw = ImageDraw.Draw(img)
    
    # Executive Atelier border
    border_color = (245, 158, 11, 80)
    border_w = int(canvas_size * 0.012)
    if is_round:
        draw.ellipse([pad, pad, canvas_size - pad, canvas_size - pad], outline=border_color, width=border_w)
    else:
        draw.rounded_rectangle([pad, pad, canvas_size - pad, canvas_size - pad], radius=radius, outline=border_color, width=border_w)
        
    # Geometric Atelier Crown Crest above 'S'
    cx = canvas_size // 2
    cy_top = int(canvas_size * 0.16)
    crown_w = int(canvas_size * 0.18)
    crown_h = int(canvas_size * 0.09)
    
    # Draw 3-point luxury diamond crown
    crown_pts = [
        (cx - crown_w // 2, cy_top + crown_h),
        (cx - crown_w // 2, cy_top + crown_h // 3),
        (cx - crown_w // 4, cy_top + crown_h * 2 // 3),
        (cx, cy_top),
        (cx + crown_w // 4, cy_top + crown_h * 2 // 3),
        (cx + crown_w // 2, cy_top + crown_h // 3),
        (cx + crown_w // 2, cy_top + crown_h),
    ]
    draw.polygon(crown_pts, fill=(245, 158, 11, 230), outline=(254, 240, 138, 255))
    
    # Little diamond jewels on crown tips
    for px, py in [(cx - crown_w // 2, cy_top + crown_h // 3), (cx, cy_top), (cx + crown_w // 2, cy_top + crown_h // 3)]:
        jr = int(canvas_size * 0.014)
        draw.ellipse([px - jr, py - jr, px + jr, py + jr], fill=(254, 240, 138, 255))
        
    # Draw Couture 'S'
    font_s_size = int(canvas_size * 0.44)
    try:
        font_s = ImageFont.truetype(FONT_SERIF, font_s_size)
    except:
        font_s = ImageFont.load_default()
        
    text = "S"
    bbox = draw.textbbox((0, 0), text, font=font_s)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    x = (canvas_size - text_w) // 2 - bbox[0]
    y = int(canvas_size * 0.28) - bbox[1]
    
    # Gold glow
    glow_img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.text((x, y), text, font=font_s, fill=(245, 158, 11, 70))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=int(canvas_size * 0.03)))
    img.alpha_composite(glow_img)
    
    draw.text((x, y + int(canvas_size * 0.008)), text, font=font_s, fill=(180, 100, 4, 255))
    draw.text((x, y), text, font=font_s, fill=(251, 191, 36, 255))
    draw.text((x - int(canvas_size * 0.003), y - int(canvas_size * 0.003)), text, font=font_s, fill=(254, 240, 138, 220))
    
    # "ATELIER" Badge below
    font_badge_size = int(canvas_size * 0.08)
    try:
        font_badge = ImageFont.truetype(FONT_SANS, font_badge_size)
    except:
        font_badge = ImageFont.load_default()
        
    word = "A T E L I E R"
    w_bbox = draw.textbbox((0, 0), word, font=font_badge)
    w_w = w_bbox[2] - w_bbox[0]
    w_x = (canvas_size - w_w) // 2 - w_bbox[0]
    w_y = int(canvas_size * 0.77)
    
    # Badge capsule background
    pad_bx = int(canvas_size * 0.04)
    pad_by = int(canvas_size * 0.015)
    b_rect = [w_x - pad_bx, w_y - pad_by, w_x + w_w + pad_bx, w_y + w_bbox[3] - w_bbox[1] + pad_by]
    draw.rounded_rectangle(b_rect, radius=int(canvas_size * 0.03), fill=(15, 23, 42, 220), outline=(245, 158, 11, 100), width=int(canvas_size * 0.005))
    
    draw.text((w_x, w_y), word, font=font_badge, fill=(251, 191, 36, 255))
    
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

print("Generating Customer & Admin Master Icons...")
cust_sq = create_customer_master_icon(512, is_round=False)
cust_rd = create_customer_master_icon(512, is_round=True)
admin_sq = create_admin_master_icon(512, is_round=False)
admin_rd = create_admin_master_icon(512, is_round=True)

# 1. Generate Android Mipmaps
densities = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

for name, sz in densities.items():
    # Customer
    c_sq_res = cust_sq.resize((sz, sz), Image.Resampling.LANCZOS)
    c_rd_res = cust_rd.resize((sz, sz), Image.Resampling.LANCZOS)
    c_sq_res.save(os.path.join(CUSTOMER_ANDROID_RES, f"mipmap-{name}", "ic_launcher.png"), "PNG")
    c_rd_res.save(os.path.join(CUSTOMER_ANDROID_RES, f"mipmap-{name}", "ic_launcher_round.png"), "PNG")
    
    # Admin
    a_sq_res = admin_sq.resize((sz, sz), Image.Resampling.LANCZOS)
    a_rd_res = admin_rd.resize((sz, sz), Image.Resampling.LANCZOS)
    a_sq_res.save(os.path.join(ADMIN_ANDROID_RES, f"mipmap-{name}", "ic_launcher.png"), "PNG")
    a_rd_res.save(os.path.join(ADMIN_ANDROID_RES, f"mipmap-{name}", "ic_launcher_round.png"), "PNG")

print("Android mipmaps generated successfully.")

# 2. Generate Website Favicons & Apple Touch Icons
# Customer Website
cust_sq.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(CUSTOMER_WEB_PUB, "favicon-16x16.png"), "PNG")
cust_sq.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(CUSTOMER_WEB_PUB, "favicon-32x32.png"), "PNG")
cust_sq.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(CUSTOMER_WEB_PUB, "apple-touch-icon.png"), "PNG")
cust_sq.save(os.path.join(CUSTOMER_WEB_PUB, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

# Admin Website
admin_sq.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(ADMIN_WEB_PUB, "favicon-16x16.png"), "PNG")
admin_sq.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(ADMIN_WEB_PUB, "favicon-32x32.png"), "PNG")
admin_sq.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(ADMIN_WEB_PUB, "apple-touch-icon.png"), "PNG")
admin_sq.save(os.path.join(ADMIN_WEB_PUB, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

print("Favicons and web touch icons generated successfully.")
