import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { JournalDocument } from '../types/journal';

export interface PreflightIssue {
  id: string;
  severity: 'error' | 'warning' | 'ok';
  category: 'overflow' | 'text' | 'screenshots' | 'bounds' | 'format';
  message: string;
}

export interface PreflightResult {
  passed: boolean;
  warningsCount: number;
  errorsCount: number;
  issues: PreflightIssue[];
}

export function runPreflightChecks(doc: JournalDocument): PreflightResult {
  const issues: PreflightIssue[] = [];

  const visibleModules = doc.page1.modules.filter((m) => !m.hidden);
  const visibleProjects = doc.page1.projects.filter((p) => !p.hidden);
  const visibleStrengths = doc.page2.strengths.filter((s) => !s.hidden);

  // 1. Overflow checks
  if (doc.page1.showModules && visibleModules.length > 6) {
    issues.push({
      id: 'overflow-modules',
      severity: 'error',
      category: 'overflow',
      message: `Слишком много активных модулей (${visibleModules.length}). На стр. 1 помещается до 6 карточек.`,
    });
  } else if (doc.page1.showModules && visibleModules.length > 4) {
    issues.push({
      id: 'dense-modules',
      severity: 'warning',
      category: 'overflow',
      message: `На стр. 1 размещено ${visibleModules.length} модулей — включён компактный режим сетки.`,
    });
  }

  if (doc.page1.showProjects && visibleProjects.length > 4) {
    issues.push({
      id: 'overflow-projects',
      severity: 'error',
      category: 'overflow',
      message: `Проектов больше 4 (${visibleProjects.length}). В макет стр. 1 войдут первые 4 карточки.`,
    });
  }

  if (doc.page2.showStrengths && visibleStrengths.length > 6) {
    issues.push({
      id: 'overflow-strengths',
      severity: 'warning',
      category: 'overflow',
      message: `Сильных сторон больше 6 (${visibleStrengths.length}). Отображаются первые 6 качеств.`,
    });
  }

  if (doc.page1.showSkills && doc.page1.skills.length > 8) {
    issues.push({
      id: 'overflow-skills',
      severity: 'warning',
      category: 'overflow',
      message: `Навыков больше 8 (${doc.page1.skills.length}). Показаны первые 8 тегов.`,
    });
  }

  // 2. Text clipping / length checks
  const mentorTextLen =
    (doc.page2.mentorNote.greeting?.length || 0) +
    (doc.page2.mentorNote.body?.length || 0);
  if (doc.page2.showMentorNote && mentorTextLen > 360) {
    issues.push({
      id: 'text-mentor',
      severity: 'warning',
      category: 'text',
      message: `Текст записки наставника длинный (${mentorTextLen} симв.) — проверьте, чтобы он не обрезался на листе.`,
    });
  }

  if (doc.page2.showPride && (doc.page2.prideText?.length || 0) > 220) {
    issues.push({
      id: 'text-pride',
      severity: 'warning',
      category: 'text',
      message: 'Текст в блоке гордости длиннее 220 символов и может сдвинуть маскота.',
    });
  }

  const longModules = visibleModules.filter(
    (m) => (m.description?.length || 0) > 130
  );
  if (longModules.length > 0) {
    issues.push({
      id: 'text-module-desc',
      severity: 'warning',
      category: 'text',
      message: `У ${longModules.length} модулей длинное описание (>130 симв.) — в карточке отображаются первые 3 строки.`,
    });
  }

  // 3. Real screenshots check
  if (doc.page1.showProjects) {
    const fallbackProjects = visibleProjects.filter(
      (p) => !p.isRealScreenshot && !p.imageUrl
    );
    if (fallbackProjects.length > 0) {
      issues.push({
        id: 'missing-screenshots',
        severity: 'warning',
        category: 'screenshots',
        message: `У ${fallbackProjects.length} проектов вместо скриншота используется тематическая иллюстрация.`,
      });
    }
  }

  // 4. Object bounds & layout checks
  const allTransforms = [
    ...Object.entries(doc.page1.objectLayouts || {}),
    ...Object.entries(doc.page2.objectLayouts || {}),
  ];
  const shiftedFar = allTransforms.filter(
    ([, t]) => Math.abs(t.x) > 420 || Math.abs(t.y) > 520
  );
  if (shiftedFar.length > 0) {
    issues.push({
      id: 'bounds-transforms',
      severity: 'warning',
      category: 'bounds',
      message: 'Некоторые блоки сильно смещены относительно сетки А4 — проверьте поля при печати.',
    });
  }

  // 5. Format compliance
  issues.push({
    id: 'format-a4',
    severity: 'ok',
    category: 'format',
    message: 'Формат А4 (210 × 297 мм · 794 × 1123 px) готов к цветной печати.',
  });

  const errorsCount = issues.filter((i) => i.severity === 'error').length;
  const warningsCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    passed: errorsCount === 0,
    warningsCount,
    errorsCount,
    issues,
  };
}

function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function sanitizeFilename(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9_-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || 'resident';
}

export function formatJournalPdfFilename(
  fullName: string,
  usedNames?: Set<string>
): string {
  const parts = fullName
    .trim()
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const base = parts.length > 0 ? parts.join('_') : 'Резидент';
  let candidate = `Журнал_${base}.pdf`;
  if (usedNames) {
    let counter = 2;
    while (usedNames.has(candidate.toLowerCase())) {
      candidate = `Журнал_${base}_${counter}.pdf`;
      counter += 1;
    }
    usedNames.add(candidate.toLowerCase());
  }
  return candidate;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const GOOGLE_FONTS_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Golos+Text:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Montserrat+Alternates:wght@700;800;900&family=Rubik:wght@500;600;700;800;900&display=swap';

let cachedFontCssPromise: Promise<string> | null = null;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Failed to encode font blob'));
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

async function getEmbeddedFontCss(): Promise<string> {
  if (cachedFontCssPromise) {
    return cachedFontCssPromise;
  }

  cachedFontCssPromise = (async () => {
    try {
      const linkEl = document.querySelector<HTMLLinkElement>(
        'link[rel="stylesheet"][href*="fonts.googleapis.com"]'
      );
      const cssUrl = linkEl?.href || GOOGLE_FONTS_CSS_URL;
      const res = await fetch(cssUrl, { mode: 'cors' });
      if (!res.ok) return '';
      let cssText = await res.text();

      const matches = Array.from(
        new Set(cssText.match(/url\((["']?)(https?:\/\/[^)"']+)\1\)/g) ?? [])
      );
      await Promise.all(
        matches.map(async (rawMatch) => {
          const urlMatch = /url\((["']?)(https?:\/\/[^)"']+)\1\)/.exec(rawMatch);
          if (!urlMatch?.[2]) return;
          try {
            const fontRes = await fetch(urlMatch[2], { mode: 'cors' });
            if (!fontRes.ok) return;
            const dataUrl = await blobToDataUrl(await fontRes.blob());
            cssText = cssText.split(rawMatch).join(`url("${dataUrl}")`);
          } catch {
            // Skip unreachable font binary without triggering SecurityError
          }
        })
      );
      return cssText;
    } catch {
      return '';
    }
  })();

  return cachedFontCssPromise;
}

async function waitForNodeImages(node: HTMLElement): Promise<void> {
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    imgs.map(async (img) => {
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          setTimeout(done, 2500);
        });
      }
      if (typeof img.decode === 'function') {
        try {
          await img.decode();
        } catch {
          // Ignore decode error on fallback/already-decoded images
        }
      }
    })
  );
}

async function renderNodeToPng(node: HTMLElement): Promise<string> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  await waitForNodeImages(node);
  const fontEmbedCSS = await getEmbeddedFontCss();
  return toPng(node, {
    width: 794,
    height: 1123,
    pixelRatio: 2.4,
    cacheBust: true,
    backgroundColor: '#ffffff',
    fontEmbedCSS,
  });
}

export async function buildJournalPdfUint8Array(
  page1El: HTMLElement,
  page2El: HTMLElement
): Promise<Uint8Array> {
  const [img1, img2] = await Promise.all([
    renderNodeToPng(page1El),
    renderNodeToPng(page2El),
  ]);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(img1, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  pdf.addPage('a4', 'portrait');
  pdf.addImage(img2, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

  const ab = pdf.output('arraybuffer');
  return new Uint8Array(ab);
}

export async function exportFullPdf(
  page1El: HTMLElement,
  page2El: HTMLElement,
  studentName: string
): Promise<void> {
  const bytes = await buildJournalPdfUint8Array(page1El, page2El);
  const blob = new Blob([bytes.slice()], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `kiberone-journal-${sanitizeFilename(studentName)}.pdf`);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function exportGroupZipPdf(
  files: Array<{ filename: string; pdfBytes: Uint8Array }>,
  groupName: string
): Promise<void> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.filename, file.pdfBytes);
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  triggerDownload(
    url,
    `kiberone-group-${sanitizeFilename(groupName)}-journals.zip`
  );
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function exportSinglePagePdf(
  pageEl: HTMLElement,
  pageNumber: 1 | 2,
  studentName: string
): Promise<void> {
  const img = await renderNodeToPng(pageEl);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  pdf.addImage(img, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  pdf.save(
    `kiberone-journal-${sanitizeFilename(studentName)}-page-${pageNumber}.pdf`
  );
}

export async function exportPngPages(
  page1El: HTMLElement,
  page2El: HTMLElement,
  studentName: string
): Promise<void> {
  const [img1, img2] = await Promise.all([
    renderNodeToPng(page1El),
    renderNodeToPng(page2El),
  ]);

  const base = sanitizeFilename(studentName);
  triggerDownload(img1, `kiberone-journal-${base}-page-1.png`);
  setTimeout(() => {
    triggerDownload(img2, `kiberone-journal-${base}-page-2.png`);
  }, 250);
}

export async function exportHtmlEbook(
  page1El: HTMLElement,
  page2El: HTMLElement,
  studentName: string,
  period: string
): Promise<void> {
  const [img1, img2] = await Promise.all([
    renderNodeToPng(page1El),
    renderNodeToPng(page2El),
  ]);

  const safeTitle = escapeHtml(`KIBERone Student Journey — ${studentName}`);
  const safePeriod = escapeHtml(period);
  const safeStudent = escapeHtml(studentName);

  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeTitle}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #18181b; color: #f4f4f5; min-height: 100vh; display: flex; flex-direction: column; }
  header { padding: 14px 24px; background: #09090b; border-bottom: 1px solid #27272a; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .title { font-weight: 700; font-size: 15px; }
  .sub { font-size: 13px; color: #a1a1aa; margin-left: 10px; }
  .controls { display: flex; gap: 8px; align-items: center; }
  button { background: #27272a; color: #f4f4f5; border: 1px solid #3f3f46; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; }
  button.active { background: #0d9488; border-color: #0d9488; color: #ffffff; }
  main { flex: 1; display: flex; justify-content: center; align-items: flex-start; padding: 28px 16px; gap: 16px; overflow: auto; }
  .page { width: min(100%, 794px); background: #fff; border-radius: 6px; box-shadow: 0 20px 50px rgba(0,0,0,0.45); overflow: hidden; }
  .page img { width: 100%; height: auto; display: block; }
  .spread .page { width: min(48vw, 660px); }
  .hidden { display: none; }
  @media print {
    body { background: #fff; }
    header { display: none; }
    main { display: block; padding: 0; }
    .page { width: 210mm !important; box-shadow: none; border-radius: 0; page-break-after: always; display: block !important; }
    .page:last-child { page-break-after: auto; }
  }
</style>
</head>
<body>
<header>
  <div>
    <span class="title">KIBERone Student Journey — ${safeStudent}</span>
    <span class="sub">${safePeriod}</span>
  </div>
  <div class="controls">
    <button id="btn-spread" class="active" onclick="setMode('spread')">Разворот</button>
    <button id="btn-p1" onclick="setMode('p1')">Страница 1</button>
    <button id="btn-p2" onclick="setMode('p2')">Страница 2</button>
    <button onclick="window.print()">Печать</button>
  </div>
</header>
<main id="stage" class="spread">
  <div id="page1" class="page"><img src="${img1}" alt="Страница 1" /></div>
  <div id="page2" class="page"><img src="${img2}" alt="Страница 2" /></div>
</main>
<script>
  function setMode(mode) {
    var stage = document.getElementById('stage');
    var p1 = document.getElementById('page1');
    var p2 = document.getElementById('page2');
    document.getElementById('btn-spread').className = mode === 'spread' ? 'active' : '';
    document.getElementById('btn-p1').className = mode === 'p1' ? 'active' : '';
    document.getElementById('btn-p2').className = mode === 'p2' ? 'active' : '';
    stage.className = mode === 'spread' ? 'spread' : '';
    p1.className = mode === 'p2' ? 'page hidden' : 'page';
    p2.className = mode === 'p1' ? 'page hidden' : 'page';
  }
</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `kiberone-ebook-${sanitizeFilename(studentName)}.html`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
