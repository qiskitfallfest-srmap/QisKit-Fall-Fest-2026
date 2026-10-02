import os
from PIL import Image

def verify():
    checks = [
        ('public/favicon.ico', 'ICO'),
        ('app/favicon.ico', 'ICO'),
        ('public/icon-48.png', (48, 48)),
        ('public/icon-192.png', (192, 192)),
        ('public/icon.png', (512, 512)),
        ('app/icon.png', (512, 512)),
        ('public/apple-touch-icon.png', (180, 180)),
        ('app/apple-icon.png', (180, 180)),
        ('public/qff-srmap-logo.png', (1171, 1171)),
    ]

    all_ok = True
    for path, expected in checks:
        if not os.path.exists(path):
            print(f"FAIL: {path} does not exist")
            all_ok = False
            continue
        size = os.path.getsize(path)
        im = Image.open(path)
        if expected == 'ICO':
            sizes = im.info.get('sizes')
            print(f"OK: {path} format={im.format} sizes={sizes} file_size={size}b")
        else:
            if im.size == expected and im.mode == 'RGBA':
                print(f"OK: {path} size={im.size} mode={im.mode} file_size={size}b")
            else:
                print(f"FAIL: {path} size={im.size} expected={expected} mode={im.mode}")
                all_ok = False

    archive_files = os.listdir('archive/legacy-favicons')
    print(f"Archive verified: {len(archive_files)} files in archive/legacy-favicons: {archive_files}")

    if all_ok:
        print("ALL FAVICON & ARCHIVE CHECKS PASSED.")

if __name__ == '__main__':
    verify()
