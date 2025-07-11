#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# Create icons directory
icons_dir = "dist/assets/icons"
os.makedirs(icons_dir, exist_ok=True)

# Icon sizes
sizes = [16, 32, 48, 128]

for size in sizes:
    # Create a new image with LinkedIn blue background
    img = Image.new('RGB', (size, size), '#0a66c2')
    draw = ImageDraw.Draw(img)
    
    # Add "LT" text in white
    try:
        # Try to use default font
        font_size = size // 3
        font = ImageFont.load_default()
    except:
        font = None
    
    text = "LT"
    if font:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    else:
        text_width = size // 2
        text_height = size // 3
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    
    # Save the icon
    filename = f"{icons_dir}/icon{size}.png"
    img.save(filename)
    print(f"Created {filename}")

print("All icons created successfully!")