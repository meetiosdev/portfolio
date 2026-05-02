from PIL import Image, ImageDraw
import sys

def make_circular_favicon(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Ensure it's square
        min_dim = min(img.size)
        left = (img.width - min_dim) / 2
        top = (img.height - min_dim) / 2
        right = (img.width + min_dim) / 2
        bottom = (img.height + min_dim) / 2
        img = img.crop((left, top, right, bottom))
        
        # Create mask
        mask = Image.new('L', img.size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, min_dim, min_dim), fill=255)
        
        # Apply mask
        img.putalpha(mask)
        
        # Resize for favicon size (optional but good practice)
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        
        # Save
        img.save(output_path, "PNG")
        print("Successfully created circular favicon!")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    make_circular_favicon("assets/images/profile.jpeg", "assets/images/favicon.png")
