import sys
from PIL import Image

def get_hex(img_path):
    try:
        img = Image.open(img_path)
        img = img.convert('RGB')
        
        # Pick a pixel from the top left corner (which is part of the background)
        r, g, b = img.getpixel((10, 10))
        
        print(f"#{r:02x}{g:02x}{b:02x}")
    except Exception as e:
        print(e)

get_hex(sys.argv[1])
