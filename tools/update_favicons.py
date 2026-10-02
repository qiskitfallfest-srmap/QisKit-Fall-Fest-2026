import os
import shutil
from PIL import Image

def main():
    base_dir = os.path.abspath('.')
    archive_dir = os.path.join(base_dir, 'archive', 'legacy-favicons')
    os.makedirs(archive_dir, exist_ok=True)
    print(f"Archive directory: {archive_dir}")

    # 1. Archive old assets
    old_files_to_copy = [
        ('public/favicon.ico', 'public-favicon.ico'),
        ('public/icon-48.png', 'public-icon-48.png'),
        ('public/icon-192.png', 'public-icon-192.png'),
        ('public/icon.png', 'public-icon.png'),
        ('public/apple-touch-icon.png', 'public-apple-touch-icon.png'),
        ('app/favicon.ico', 'app-favicon.ico'),
        ('app/icon.png', 'app-icon.png'),
        ('app/apple-icon.png', 'app-apple-icon.png'),
    ]

    old_files_to_move = [
        ('public/qff-srmap-logo-circular.png', 'qff-srmap-logo-circular.png'),
        ('public/QFF SRMAP Logo.jfif', 'QFF SRMAP Logo.jfif'),
    ]

    for src_rel, dest_name in old_files_to_copy:
        src = os.path.join(base_dir, src_rel)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(archive_dir, dest_name))
            print(f"Copied to archive: {src_rel} -> {dest_name}")

    for src_rel, dest_name in old_files_to_move:
        src = os.path.join(base_dir, src_rel)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(archive_dir, dest_name))
            os.remove(src)
            print(f"Moved to archive: {src_rel} -> {dest_name}")

    # Write archive README
    readme_path = os.path.join(archive_dir, 'README.md')
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write("""# Legacy Favicons & Brand Assets Archive

Archived on: September 29, 2026

## Contents
This directory archives the v1 circular organizing team badge and legacy favicon set:
- `qff-srmap-logo-circular.png`: Original circular badge with organizing team medallion.
- `QFF SRMAP Logo.jfif`: Original JFIF input asset.
- `public-favicon.ico`, `app-favicon.ico`: v1 multi-size ICOs.
- `public-icon-48.png`, `public-icon-192.png`, `public-icon.png`, `public-apple-touch-icon.png`: v1 PNG icon set.
- `app-icon.png`, `app-apple-icon.png`: v1 App Router icons.

Superseded by the official Qiskit Fall Fest 2026 dual-lobed emblem (`public/QFFSRMAPLOGO (5).png`).
""")
    print("Created archive README.md")

    # 2. Process new image
    source_img_path = os.path.join(base_dir, 'public', 'QFFSRMAPLOGO (5).png')
    if not os.path.exists(source_img_path):
        raise FileNotFoundError(f"Source image not found: {source_img_path}")

    img = Image.open(source_img_path).convert('RGBA')
    print(f"Loaded source image: {img.size}, mode={img.mode}")

    # Crop tightly to non-transparent bounding box with 5% breathing padding on square canvas
    # Non-transparent bbox: [96, 142, 1156, 1092]
    # To be dynamic and exact, compute bbox from alpha:
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    print(f"Dynamic content bbox: {bbox}")
    cropped = img.crop(bbox)

    max_dim = max(cropped.width, cropped.height)
    pad = int(max_dim * 0.05)
    canvas_size = max_dim + 2 * pad
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_x = (canvas_size - cropped.width) // 2
    offset_y = (canvas_size - cropped.height) // 2
    canvas.paste(cropped, (offset_x, offset_y))
    print(f"Created square master canvas: {canvas.size}")

    # Generate multi-size resolutions
    icon_512 = canvas.resize((512, 512), Image.Resampling.LANCZOS)
    icon_192 = canvas.resize((192, 192), Image.Resampling.LANCZOS)
    icon_180 = canvas.resize((180, 180), Image.Resampling.LANCZOS)
    icon_48 = canvas.resize((48, 48), Image.Resampling.LANCZOS)
    icon_32 = canvas.resize((32, 32), Image.Resampling.LANCZOS)
    icon_16 = canvas.resize((16, 16), Image.Resampling.LANCZOS)

    # 3. Write target icons
    # Favicon.ico with (16, 32, 48)
    ico_targets = [
        os.path.join(base_dir, 'public', 'favicon.ico'),
        os.path.join(base_dir, 'app', 'favicon.ico'),
    ]
    for target in ico_targets:
        icon_48.save(
            target,
            format='ICO',
            sizes=[(16, 16), (32, 32), (48, 48)],
            append_images=[icon_16, icon_32]
        )
        print(f"Saved ICO: {target} ({os.path.getsize(target)} bytes)")

    # 48x48 icon
    p48 = os.path.join(base_dir, 'public', 'icon-48.png')
    icon_48.save(p48, format='PNG', optimize=True)
    print(f"Saved: {p48} ({os.path.getsize(p48)} bytes)")

    # 192x192 icon
    p192 = os.path.join(base_dir, 'public', 'icon-192.png')
    icon_192.save(p192, format='PNG', optimize=True)
    print(f"Saved: {p192} ({os.path.getsize(p192)} bytes)")

    # 512x512 icon
    p512 = os.path.join(base_dir, 'public', 'icon.png')
    icon_512.save(p512, format='PNG', optimize=True)
    print(f"Saved: {p512} ({os.path.getsize(p512)} bytes)")

    app_icon = os.path.join(base_dir, 'app', 'icon.png')
    icon_512.save(app_icon, format='PNG', optimize=True)
    print(f"Saved: {app_icon} ({os.path.getsize(app_icon)} bytes)")

    # Apple Touch icon (180x180)
    p_apple = os.path.join(base_dir, 'public', 'apple-touch-icon.png')
    icon_180.save(p_apple, format='PNG', optimize=True)
    print(f"Saved: {p_apple} ({os.path.getsize(p_apple)} bytes)")

    app_apple = os.path.join(base_dir, 'app', 'apple-icon.png')
    icon_180.save(app_apple, format='PNG', optimize=True)
    print(f"Saved: {app_apple} ({os.path.getsize(app_apple)} bytes)")

    # Standardized master brand logo
    master_logo = os.path.join(base_dir, 'public', 'qff-srmap-logo.png')
    canvas.save(master_logo, format='PNG', optimize=True)
    print(f"Saved: {master_logo} ({os.path.getsize(master_logo)} bytes)")

    print("All favicon assets updated successfully.")

if __name__ == '__main__':
    main()
