import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'public', 'assets', 'aistudio');
const TARGET_DIR = path.join(ROOT_DIR, 'public', 'assets', 'modules');

/**
 * Exact 1-to-1 mapping of the 61 KIBERone module images from their
 * AI Studio upload filenames to clean lowercase ASCII + underscore filenames.
 */
const MODULE_IMAGE_MAPPING = [
  // Category 1: Алгоритмы и основы (10)
  { src: '________b8dc5877.png', dest: 'm_intro_ai.png' },
  { src: 'Scratch-Jr_c0eb8c49.png', dest: 'm_scratch_junior.png' },
  { src: '____________________2d3487a0.png', dest: 'm_keyboard_master.png' },
  { src: 'Code-Monkey_036b97d7.png', dest: 'm_code_monkey.png' },
  { src: 'Kodu_8a86f025.webp', dest: 'm_kodu.webp' },
  { src: 'Scratch_6a2b6790.png', dest: 'm_scratch_advanced.png' },
  { src: 'Run-Marco_c666ae36.png', dest: 'm_run_marco.png' },
  { src: '_________d62b7705.png', dest: 'm_piktomir.png' },
  { src: 'Blockly_9eb0e095.png', dest: 'm_blockly.png' },
  { src: '___________-_________-_-_________5551f330.png', dest: 'm_turtle.png' },

  // Category 2: Игры и геймдизайн (11)
  { src: 'Minecraft-Education_74f3dae7.png', dest: 'm_minecraft_lua.png' },
  { src: 'Minecraf_mods_4cacc37a.png', dest: 'm_minecraft_mods.png' },
  { src: 'Geometry_Dash_design_and_program_a28ed3d9.png', dest: 'm_geometry_dash.png' },
  { src: 'Replace_Construct_3_ecc10090.png', dest: 'm_construct3.png' },
  { src: 'Roblox_25b8a04c.png', dest: 'm_roblox.png' },
  { src: 'Python_game_creation_in_MakeCode_79487da0.png', dest: 'm_makecode.png' },
  { src: 'Create_game_design_900d65b8.png', dest: 'm_gamedesign_concept.png' },
  { src: 'Create_PyGame_2D_game_e91b56ed.png', dest: 'm_pygame.png' },
  { src: 'Godot_e66bf81c.png', dest: 'm_godot.png' },
  { src: 'Unity_AI_eacd5136.png', dest: 'm_unity2d.png' },
  { src: 'Unreal_b45805bc.png', dest: 'm_unreal.png' },

  // Category 3: Дизайн и 3D (8)
  { src: 'Aseprite_e622030c.png', dest: 'm_aseprite.png' },
  { src: 'Tinkercad_bda7d7c4.png', dest: 'm_tinkercad.png' },
  { src: 'Spline_5a098f70.png', dest: 'm_spline.png' },
  { src: 'Figma_cd091390.png', dest: 'm_figma.png' },
  { src: 'Gif_39cf0af3.png', dest: 'm_gif.png' },
  { src: 'Photoshop_eb296b9e.png', dest: 'm_photoshop.png' },
  { src: 'Blender_d480ae1f.png', dest: 'm_blender.png' },
  { src: 'Motion-Design_afd35a34.png', dest: 'm_motion_design.png' },

  // Category 4: ИИ и нейросети (8)
  { src: 'Prompt_engineering_69be9b39.png', dest: 'm_prompt_engineering.png' },
  { src: '__________9e2e47cb.png', dest: 'm_neural_networks.png' },
  { src: 'AI_Storytelling_4c317722.png', dest: 'm_ai_storytelling.png' },
  { src: '_________-_________67345ba1.png', dest: 'm_voice_assistant.png' },
  { src: 'Python_AI_ed95ddb8.png', dest: 'm_python_ai.png' },
  { src: 'Vibe_Coding_49bc0bae.png', dest: 'm_vibe_coding.png' },
  { src: 'VK_59a0420b.png', dest: 'm_vk_shop.png' },
  { src: '_________________Python_4efea8be.png', dest: 'm_python_web.png' },

  // Category 5: Веб и мобильные (9)
  { src: 'Tilda_7987420b.png', dest: 'm_tilda.png' },
  { src: 'Thunkable_bb2ef7e5.png', dest: 'm_thunkable.png' },
  { src: 'HTML________fdcf76ed.png', dest: 'm_html_basics.png' },
  { src: 'CSS_technology_0b90ecfd.png', dest: 'm_css_tech.png' },
  { src: 'HTML_CSS_300bf4d0.png', dest: 'm_html_css.png' },
  { src: 'JavaScript_8e754879.png', dest: 'm_javascript.png' },
  { src: 'Type_Script_e8335dba.png', dest: 'm_typescript.png' },
  { src: '___-_______Python_0910a635.png', dest: 'm_vk_bot.png' },
  { src: 'PHP-SQL_6cc4207a.png', dest: 'm_php_sql.png' },

  // Category 6: Грамотность и безопасность (6)
  { src: '__________-___________22c6a181.png', dest: 'm_pc_device.png' },
  { src: '______________bd4e9398.png', dest: 'm_word_excel.png' },
  { src: 'PowerPoint_3f73e90b.png', dest: 'm_powerpoint.png' },
  { src: 'QR-____09e98627.png', dest: 'm_qr_code.png' },
  { src: '_______________46145609.png', dest: 'm_yandex_services.png' },
  { src: '__________________36432026.png', dest: 'm_cybersecurity.png' },

  // Category 7: Продвинутые технологии (5)
  { src: 'Vibe_debug_f9f8746b.png', dest: 'm_vibe_debugging.png' },
  { src: '_________________AI_24edf5ad.png', dest: 'm_ethical_hacking.png' },
  { src: '________-_-________-___________88493d3d.png', dest: 'm_cloud_blockchain.png' },
  { src: 'C__9b48990f.png', dest: 'm_csharp.png' },
  { src: '___________-_________________a1365c89.png', dest: 'm_olympiad.png' },

  // Category 8: Финансы и карьера (4)
  { src: '________________c088bec3.png', dest: 'm_finance.png' },
  { src: '______________e28e234e.png', dest: 'm_pitching.png' },
  { src: '____________________84f5d0d2.png', dest: 'm_graduation.png' },
  { src: '_________________6ae1c2b3.png', dest: 'm_ege_prep.png' },
];

function validateMappings() {
  const seenDest = new Set();
  const seenSrc = new Set();
  for (const item of MODULE_IMAGE_MAPPING) {
    if (!/^[a-z0-9_]+\.(png|webp)$/.test(item.dest)) {
      throw new Error(`Invalid destination filename (must be lowercase ASCII + underscores): ${item.dest}`);
    }
    if (seenDest.has(item.dest)) {
      throw new Error(`Duplicate destination filename: ${item.dest}`);
    }
    if (seenSrc.has(item.src)) {
      throw new Error(`Duplicate source filename: ${item.src}`);
    }
    seenDest.add(item.dest);
    seenSrc.add(item.src);
  }
  if (MODULE_IMAGE_MAPPING.length !== 61) {
    throw new Error(`Expected 61 mappings, got ${MODULE_IMAGE_MAPPING.length}`);
  }
}

function run() {
  validateMappings();
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  // Clean out stale files in public/assets/modules/
  const existingTargetFiles = fs.readdirSync(TARGET_DIR);
  let removedOld = 0;
  for (const file of existingTargetFiles) {
    const full = path.join(TARGET_DIR, file);
    if (fs.statSync(full).isFile()) {
      fs.unlinkSync(full);
      removedOld += 1;
    }
  }

  let movedCount = 0;
  for (const { src, dest } of MODULE_IMAGE_MAPPING) {
    const srcPath = path.join(SOURCE_DIR, src);
    const destPath = path.join(TARGET_DIR, dest);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Missing source file in aistudio/: ${src}`);
    }
    fs.renameSync(srcPath, destPath);
    movedCount += 1;
  }

  const finalFiles = fs.readdirSync(TARGET_DIR).sort();
  console.log(`Removed ${removedOld} stale files from public/assets/modules/`);
  console.log(`Moved & renamed ${movedCount} module images into public/assets/modules/`);
  console.log(`Total files in public/assets/modules/: ${finalFiles.length}`);
}

run();
