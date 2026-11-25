#!/usr/bin/env python3
"""
Генератор 3D-иконок для модулей KIBERone (62+ модулей).
Использует Google Gemini / Imagen API (пакет google-genai) для создания иконок
в едином стиле и сохраняет их в папку public/assets/modules/.

Установка зависимостей:
  pip install google-genai pillow

Запуск:
  export GEMINI_API_KEY="ваш_ключ"
  python3 generate_icons.py

Полезные флаги:
  python3 generate_icons.py --force             # перезаписать уже существующие файлы
  python3 generate_icons.py --only m_python.png # сгенерировать конкретную иконку
  python3 generate_icons.py --keep-bg           # не удалять белый фон в прозрачность
"""

import argparse
import io
import os
import sys
import time
from collections import deque
from pathlib import Path

BASE_STYLE = (
    "3D isometric icon, glossy cartoon, vibrant colors, "
    "thick white outline (sticker style), transparent background, "
    "isolated on solid pure white background, centered, high quality, 8k, no text"
)

ICON_PROMPTS: dict[str, str] = {
    "m_kodu.png": "Cute 3D cube with a gamepad, isometric",
    "m_python.png": "Friendly 3D python snake curled around a laptop, isometric",
    "m_animaker.png": "3D clapperboard and a play button, isometric",
    "m_scratch_junior.png": "Cute 3D orange cat coding, isometric",
    "m_code_monkey.png": "3D monkey holding a banana with code symbols, isometric",
    "m_scratch_adv.png": "3D rocket taking off from a laptop screen, isometric",
    "m_run_marco.png": "3D running character with a map, isometric",
    "m_pictomir.png": "3D robot navigating a maze, isometric",
    "m_blockly.png": "3D puzzle pieces interlocking, isometric",
    "m_lua_minecraft.png": "3D pickaxe and a grass block, isometric",
    "m_construct3.png": "3D game controller with 2D platform elements, isometric",
    "m_roblox.png": "3D blocky character with a builder tool, isometric",
    "m_minecraft_mods.png": "3D gear and a pixelated sword, isometric",
    "m_unity2d.png": "3D Unity logo with a cute 2D character, isometric",
    "m_unreal.png": "3D Unreal Engine logo with a futuristic landscape, isometric",
    "m_godot.png": "3D Godot robot mascot, isometric",
    "m_pc_device.png": "3D motherboard and CPU chip, isometric",
    "m_word_excel.png": "3D spreadsheet and document, isometric",
    "m_powerpoint.png": "3D presentation slide with a pie chart, isometric",
    "m_qr.png": "3D QR code cube, isometric",
    "m_yandex.png": "3D cloud and search magnifying glass, isometric",
    "m_cyber_security.png": "3D shield with a padlock, isometric",
    "m_prompt_eng.png": "3D brain with a chat bubble, isometric",
    "m_neural_net.png": "3D glowing neural network nodes, isometric",
    "m_ai_story.png": "3D magic book with a wand, isometric",
    "m_vibe_coding.png": "3D musical note and code brackets, isometric",
    "m_ai_product.png": "3D MVP box with gears, isometric",
    "m_alice.png": "3D microphone with sound waves, isometric",
    "m_python_ai.png": "3D python snake with a robot brain, isometric",
    "m_python_web.png": "3D globe with code brackets, isometric",
    "m_vk_shop.png": "3D shopping cart with a VK logo, isometric",
    "m_typescript.png": "3D TS logo with a gear, isometric",
    "m_pixel_art.png": "3D pixelated sword and shield, isometric",
    "m_tinkercad.png": "3D geometric shapes (sphere, cube), isometric",
    "m_figma.png": "3D Figma logo with a paintbrush, isometric",
    "m_gif.png": "3D film strip with a play icon, isometric",
    "m_photoshop.png": "3D paintbrush and a photo, isometric",
    "m_blender.png": "3D Blender logo with a 3D monkey head, isometric",
    "m_motion.png": "3D animated shapes (star, circle), isometric",
    "m_tilda.png": "3D website landing page layout, isometric",
    "m_thunkable.png": "3D mobile phone with puzzle blocks, isometric",
    "m_html_css_basics.png": "3D angle brackets < > with CSS brush, isometric",
    "m_html_css.png": "3D paint palette and code brackets, isometric",
    "m_javascript.png": "3D JS logo with a lightning bolt, isometric",
    "m_tg_bot.png": "3D Telegram paper plane with a robot, isometric",
    "m_tg_mini_app.png": "3D smartphone with TG logo, isometric",
    "m_php_sql.png": "3D elephant and a database cylinder, isometric",
    "m_testing.png": "3D magnifying glass looking at a bug, isometric",
    "m_cloud_web3.png": "3D cloud and blockchain cubes, isometric",
    "m_hacking.png": "3D hacker mask and a shield, isometric",
    "m_csharp.png": "3D C# logo with a game engine gear, isometric",
    "m_olympiad.png": "3D gold medal with code symbols, isometric",
    "m_olympiad_practice.png": "3D trophy and a book, isometric",
    "m_finance.png": "3D coin stack and a growth chart, isometric",
    "m_keyboard.png": "3D keyboard with a lightning bolt, isometric",
    "m_turtle.png": "3D cute turtle with geometric lines, isometric",
    "m_geometry_dash.png": "3D cube jumping over spikes, isometric",
    "m_spline.png": "3D abstract spline shape with a pen, isometric",
    "m_python_pygame.png": "3D gamepad with a python snake, isometric",
    "m_vk_bot.png": "3D VK logo with a friendly robot, isometric",
    "m_kodik.png": "3D AI brain writing code, isometric",
    "m_testing_vibe.png": "3D bug with a Vibe check symbol, isometric",
    "m_pitching.png": "3D microphone on a presentation stand, isometric",
    "m_creative_eng.png": "3D glowing lightbulb with sparkles and gears, isometric",
    "m_python_makecode.png": "3D handheld game console with Python snake logo, isometric",
    "m_gamedesign_concept.png": "3D game design blueprint board with glowing lightbulb and gamepad, isometric",
    "m_finance_business.png": "3D green briefcase with gold coins and growth arrow, isometric",
    "m_graduation.png": "3D graduation cap with rolled diploma scroll, isometric",
}


def floodfill_white_to_transparent(image_bytes: bytes, threshold: int = 242) -> bytes:
    """
    Удаляет внешний белый фон методом обхода от границ изображения,
    сохраняя внутреннюю белую обводку (sticker outline).
    """
    try:
        from PIL import Image
    except ImportError:
        return image_bytes

    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    visited = [[False] * h for _ in range(w)]
    queue: deque[tuple[int, int]] = deque()

    def is_bg(r: int, g: int, b: int, a: int) -> bool:
        return a == 0 or (r >= threshold and g >= threshold and b >= threshold)

    for x in range(w):
        for y in (0, h - 1):
            if is_bg(*pixels[x, y]):
                visited[x][y] = True
                queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not visited[x][y] and is_bg(*pixels[x, y]):
                visited[x][y] = True
                queue.append((x, y))

    while queue:
        cx, cy = queue.popleft()
        r, g, b, _ = pixels[cx, cy]
        pixels[cx, cy] = (r, g, b, 0)
        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                if is_bg(*pixels[nx, ny]):
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    # Обрезка прозрачных полей и масштабирование в 512x512 с сохранением пропорций
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        cropped.thumbnail((460, 460), Image.Resampling.LANCZOS)
        ox = (512 - cropped.width) // 2
        oy = (512 - cropped.height) // 2
        canvas.paste(cropped, (ox, oy), cropped)
        img = canvas

    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def generate_with_genai(client, prompt: str, model: str) -> bytes:
    if model.startswith("imagen"):
        result = client.models.generate_images(
            model=model,
            prompt=prompt,
            config={"number_of_images": 1, "aspect_ratio": "1:1"},
        )
        return result.generated_images[0].image.image_bytes

    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )
    for part in response.candidates[0].content.parts:
        if getattr(part, "inline_data", None):
            return part.inline_data.data
    raise RuntimeError("Модель не вернула изображение в ответе")


def main() -> int:
    parser = argparse.ArgumentParser(description="Генератор 3D-иконок модулей KIBERone")
    parser.add_argument("--out-dir", default="public/assets/modules", help="Папка вывода")
    parser.add_argument("--model", default="imagen-3.0-generate-002", help="Модель Google GenAI")
    parser.add_argument("--only", action="append", default=[], help="Имя файла (можно несколько)")
    parser.add_argument("--force", action="store_true", help="Перезаписывать существующие файлы")
    parser.add_argument("--keep-bg", action="store_true", help="Не удалять белый фон")
    parser.add_argument("--delay", type=float, default=1.0, help="Пауза между запросами (сек)")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Ошибка: не задана переменная окружения GEMINI_API_KEY.", file=sys.stderr)
        print('Задайте ключ: export GEMINI_API_KEY="ваш_ключ"', file=sys.stderr)
        return 1

    try:
        from google import genai
    except ImportError:
        print("Ошибка: установите SDK командой: pip install google-genai pillow", file=sys.stderr)
        return 1

    client = genai.Client(api_key=api_key)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    targets = (
        {k: v for k, v in ICON_PROMPTS.items() if k in set(args.only)}
        if args.only
        else ICON_PROMPTS
    )

    total = len(targets)
    for idx, (filename, subject) in enumerate(targets.items(), start=1):
        out_path = out_dir / filename
        if out_path.exists() and not args.force:
            print(f"[{idx}/{total}] Пропуск {filename} (уже существует)")
            continue

        full_prompt = f"{subject}, {BASE_STYLE}"
        print(f"[{idx}/{total}] Генерация {filename}: {subject}...")
        try:
            raw_bytes = generate_with_genai(client, full_prompt, args.model)
            final_bytes = (
                raw_bytes if args.keep_bg else floodfill_white_to_transparent(raw_bytes)
            )
            out_path.write_bytes(final_bytes)
            print(f"  -> Сохранено в {out_path}")
        except Exception as exc:
            print(f"  ! Ошибка для {filename}: {exc}", file=sys.stderr)
        if idx < total and args.delay > 0:
            time.sleep(args.delay)

    print("Готово!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
