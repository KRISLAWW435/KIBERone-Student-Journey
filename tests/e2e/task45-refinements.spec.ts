import fs from 'fs';
import { expect, Page, test } from '@playwright/test';

async function setupGroupWithStudent(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Создать группу' }).click();
  const createModal = page.locator('form', {
    hasText: 'Создать учебную группу',
  });
  await expect(createModal).toBeVisible();
  await createModal
    .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
    .fill('T45 Доработка · Ср 18:00');
  await createModal.locator('select').first().selectOption({ index: 1 });
  await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

  const groupCard = page.locator('article', {
    hasText: 'T45 Доработка · Ср 18:00',
  });
  await expect(groupCard).toBeVisible();

  await groupCard.getByRole('button', { name: 'Добавить ученика' }).click();
  await groupCard
    .getByPlaceholder('Имя и фамилия ученика')
    .fill('Мирон Кодер');
  await groupCard.getByPlaceholder('Возраст').fill('11');
  await groupCard.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(
    groupCard.getByRole('button', { name: /Мирон Кодер/ })
  ).toBeVisible();

  await groupCard
    .getByRole('button', { name: 'Открыть редактор группы' })
    .click();
  await page
    .getByRole('button', { name: 'Редактор учеников', exact: true })
    .click();
  await page.getByRole('button', { name: 'Вписать', exact: true }).click();
}

async function inspectStationLabelTypography(
  page: Page,
  expectedCount: number
) {
  const pageTwoCanvas = page.locator(
    'main article[aria-label="Страница 2: Мои достижения"]'
  );
  const nextSection = pageTwoCanvas.locator(
    '[data-page2-section="nextChapter"]'
  );
  await expect(nextSection.locator('[data-next-station]')).toHaveCount(
    expectedCount
  );

  return pageTwoCanvas.evaluate((article) => {
    const nextSec = article.querySelector<HTMLElement>(
      '[data-page2-section="nextChapter"]'
    );
    if (!nextSec) throw new Error('Missing nextChapter');
    const secRect = nextSec.getBoundingClientRect();
    const h3 = nextSec.querySelector<HTMLElement>('h3');
    const h3Rect = h3?.getBoundingClientRect() ?? null;

    const stations = Array.from(
      nextSec.querySelectorAll<HTMLElement>('[data-next-station]')
    ).map((st) => {
      const span = st.querySelector<HTMLElement>('span');
      const pinSvg = st.querySelector<SVGSVGElement>('svg');
      const labelBox = st.querySelector<HTMLElement>('div.rounded-xl');
      const spanStyle = span ? getComputedStyle(span) : null;
      const lineHeight = spanStyle ? parseFloat(spanStyle.lineHeight) : 0;
      const fontSize = spanStyle ? parseFloat(spanStyle.fontSize) : 0;
      const spanRect = span?.getBoundingClientRect() ?? null;
      const pinRect = pinSvg?.getBoundingClientRect() ?? null;
      const labelRect = labelBox?.getBoundingClientRect() ?? null;
      const text = (span?.textContent || '').trim();

      // Check every word token individually using Range to verify no mid-word break occurs
      let hasMidWordSplit = false;
      if (
        span &&
        span.firstChild &&
        span.firstChild.nodeType === Node.TEXT_NODE
      ) {
        const textNode = span.firstChild;
        const fullText = textNode.textContent || '';
        const wordRegex = /\S+/g;
        let match: RegExpExecArray | null;
        while ((match = wordRegex.exec(fullText)) !== null) {
          const range = document.createRange();
          range.setStart(textNode, match.index);
          range.setEnd(textNode, match.index + match[0].length);
          const rects = Array.from(range.getClientRects()).filter(
            (r) => r.width > 0.5 && r.height > 0.5
          );
          const distinctTops: number[] = [];
          for (const r of rects) {
            if (!distinctTops.some((t) => Math.abs(t - r.top) < 3)) {
              distinctTops.push(r.top);
            }
          }
          if (distinctTops.length > 1) {
            hasMidWordSplit = true;
          }
        }
      }

      const estimatedLines =
        spanRect && lineHeight > 0 ? spanRect.height / lineHeight : 1;

      return {
        id: st.getAttribute('data-next-station'),
        text,
        overflowWrap: spanStyle?.overflowWrap ?? '',
        wordBreak: spanStyle?.wordBreak ?? '',
        textOverflowCss: spanStyle?.textOverflow ?? '',
        fontSize,
        lineHeight,
        estimatedLines,
        hasEllipsisText: text.includes('...') || text.includes('…'),
        hasMidWordSplit,
        scrollWidth: span ? span.scrollWidth : 0,
        clientWidth: span ? span.clientWidth : 0,
        pinTopRel: pinRect ? pinRect.top - secRect.top : 0,
        pinBottomRel: pinRect ? pinRect.bottom - secRect.top : 0,
        labelRectRel: labelRect
          ? {
              left: labelRect.left - secRect.left,
              right: labelRect.right - secRect.left,
              top: labelRect.top - secRect.top,
              bottom: labelRect.bottom - secRect.top,
            }
          : null,
      };
    });

    return {
      secRect: {
        left: secRect.left,
        top: secRect.top,
        width: secRect.width,
        height: secRect.height,
      },
      h3RectRel: h3Rect
        ? {
            left: h3Rect.left - secRect.left,
            top: h3Rect.top - secRect.top,
            width: h3Rect.width,
            height: h3Rect.height,
          }
        : null,
      stations,
    };
  });
}

test.describe('Задача №45: Доработка геометок, переноса подписей, coverBubble X/Y и nextChapterTitle', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('kiberone_student_journey_onboarding_v1', '1');
    });
  });

  test('Поднятый маршрут, отсутствие разрыва длинных слов, 2D coverBubble и независимый nextChapterTitle с A4 clamp и reload/PDF', async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);
    const runtimeErrors: string[] = [];
    page.on('pageerror', (err) => runtimeErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') runtimeErrors.push(msg.text());
    });

    await setupGroupWithStudent(page);

    const rightSidebar = page.locator('aside').nth(1);
    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });
    const pageOneCanvas = page.locator(
      'main article[aria-label="Страница 1: Мой путь в мире технологий"]'
    );
    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );

    // 1. Проверяем coverBubble на Странице 1 в режиме Дизайн: 2D (X и Y) + drag + clamp в A4
    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();
    const coverBubble = pageOneCanvas.locator('[data-snap-id="coverBubble"]');
    await expect(coverBubble).toBeVisible();
    await coverBubble.click();

    const bubbleXInput = rightSidebar.getByLabel('Смещение X (px)');
    const bubbleYInput = rightSidebar.getByLabel(
      'Смещение по вертикали Y (px)'
    );
    await expect(bubbleXInput).toBeVisible();
    await expect(bubbleYInput).toBeVisible();
    await expect(bubbleXInput).toHaveValue('0');
    await expect(bubbleYInput).toHaveValue('0');

    // Drag coverBubble по двум осям (X и Y) на холсте
    const bubbleBeforeDrag = await coverBubble.boundingBox();
    expect(bubbleBeforeDrag).not.toBeNull();
    await page.mouse.move(
      bubbleBeforeDrag!.x + bubbleBeforeDrag!.width / 2,
      bubbleBeforeDrag!.y + bubbleBeforeDrag!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      bubbleBeforeDrag!.x + bubbleBeforeDrag!.width / 2 + 28,
      bubbleBeforeDrag!.y + bubbleBeforeDrag!.height / 2 + 18,
      { steps: 5 }
    );
    await page.mouse.up();

    const dragXVal = Number(await bubbleXInput.inputValue());
    const dragYVal = Number(await bubbleYInput.inputValue());
    expect(dragXVal).toBeGreaterThan(10);
    expect(dragYVal).toBeGreaterThan(5);

    // Изменяем X и Y через правую панель, проверяем крайние значения (clamp внутри A4 794x1123)
    await bubbleXInput.fill('999');
    await bubbleYInput.fill('999');
    const clampedBubbleBounds = await pageOneCanvas.evaluate((article) => {
      const a4Rect = article.getBoundingClientRect();
      const b = article.querySelector<HTMLElement>(
        '[data-snap-id="coverBubble"]'
      );
      if (!b) throw new Error('Missing coverBubble');
      const r = b.getBoundingClientRect();
      const scale = a4Rect.width / 794;
      return {
        left: (r.left - a4Rect.left) / scale,
        right: (r.right - a4Rect.left) / scale,
        top: (r.top - a4Rect.top) / scale,
        bottom: (r.bottom - a4Rect.top) / scale,
      };
    });
    expect(clampedBubbleBounds.left).toBeGreaterThanOrEqual(-1);
    expect(clampedBubbleBounds.right).toBeLessThanOrEqual(795);
    expect(clampedBubbleBounds.top).toBeGreaterThanOrEqual(-1);
    expect(clampedBubbleBounds.bottom).toBeLessThanOrEqual(1124);

    // Ставим аккуратное смещение для проверки persistence
    await bubbleXInput.fill('32');
    await bubbleYInput.fill('-14');
    await expect(bubbleXInput).toHaveValue('32');
    await expect(bubbleYInput).toHaveValue('-14');

    // 2. Переходим на Страницу 2: проверяем длинные и короткие названия геометок (3 и 4 станции)
    await rightSidebar.getByRole('button', { name: 'Контент' }).click();
    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();
    await expect(pageTwoCanvas).toBeVisible();
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();

    const nextBlockEditor = rightSidebar.locator(
      '[data-editor-page2-block="nextChapter"]'
    );
    await expect(nextBlockEditor).toBeVisible();

    // На 3 станциях тестируем длинные и короткие названия
    await nextBlockEditor
      .getByLabel('Название направления 1')
      .fill('Олимпиадное программирование');
    await nextBlockEditor.getByLabel('Название направления 2').fill('Python');
    await nextBlockEditor
      .getByLabel('Название направления 3')
      .fill('Основы искусственного интеллекта');

    const threeStationGeo = await inspectStationLabelTypography(page, 3);
    // Проверяем, что маршрут и пины подняты (pinTip раньше был 180/152/126 -> теперь ~166/138/113)
    expect(threeStationGeo.stations[0].pinBottomRel).toBeLessThanOrEqual(170);
    expect(threeStationGeo.stations[1].pinBottomRel).toBeLessThanOrEqual(142);
    expect(threeStationGeo.stations[2].pinBottomRel).toBeLessThanOrEqual(117);

    for (const st of threeStationGeo.stations) {
      expect(st.overflowWrap).toBe('normal');
      expect(st.wordBreak).toBe('normal');
      expect(st.hasEllipsisText).toBe(false);
      expect(st.hasMidWordSplit).toBe(false);
      expect(st.scrollWidth).toBeLessThanOrEqual(st.clientWidth + 1);
      expect(st.estimatedLines).toBeLessThanOrEqual(2.35);
    }

    // Добавляем 4-ю станцию и проверяем длинные названия при 4 геометках
    await nextBlockEditor
      .getByRole('button', { name: 'Добавить направление' })
      .click();
    await nextBlockEditor
      .getByLabel('Название направления 4')
      .fill('3D-моделирование');

    const fourStationGeo = await inspectStationLabelTypography(page, 4);
    expect(fourStationGeo.stations[0].text).toBe(
      'Олимпиадное программирование'
    );
    for (const st of fourStationGeo.stations) {
      expect(st.overflowWrap).toBe('normal');
      expect(st.wordBreak).toBe('normal');
      expect(st.hasEllipsisText).toBe(false);
      expect(st.hasMidWordSplit).toBe(false);
      expect(st.scrollWidth).toBeLessThanOrEqual(st.clientWidth + 1);
      expect(st.estimatedLines).toBeLessThanOrEqual(2.25);
    }

    // Проверяем, что подпись остаётся редактируемой и прямо на странице (в Контенте)
    const firstPinLabel = pageTwoCanvas
      .locator('[data-page2-section="nextChapter"] [data-next-station]')
      .first()
      .locator('span');
    await firstPinLabel.click();
    await expect(
      rightSidebar.getByText('Карта будущего · Название темы')
    ).toBeVisible();
    await page.screenshot({ path: '/tmp/task45-long-labels.png' });

    // 3. Проверяем независимый объект nextChapterTitle в режиме Дизайн
    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();
    const nextSection = pageTwoCanvas.locator(
      '[data-page2-section="nextChapter"]'
    );
    const titleObj = nextSection.locator('[data-snap-id="nextChapterTitle"]');
    await expect(titleObj).toBeVisible();

    // Фиксируем координаты маршрута до перемещения заголовка
    const stationsBeforeTitleMove = await inspectStationLabelTypography(page, 4);

    // Кликаем именно по заголовку "Что интересного впереди?"
    await titleObj.locator('h3').click();

    const titleXInput = rightSidebar.getByLabel('Смещение X (px)');
    const titleYInput = rightSidebar.getByLabel(
      'Смещение по вертикали Y (px)'
    );
    const titleWInput = rightSidebar.getByLabel('Ширина (px)');
    const titleHInput = rightSidebar.getByLabel('Высота (px)');

    await expect(titleXInput).toBeVisible();
    await expect(titleYInput).toBeVisible();
    await expect(titleWInput).toBeVisible();
    await expect(titleHInput).toBeVisible();

    // Перетаскиваем заголовок по X и Y мышью в режиме дизайна
    const titleBoxBefore = await titleObj.boundingBox();
    expect(titleBoxBefore).not.toBeNull();
    await page.mouse.move(
      titleBoxBefore!.x + titleBoxBefore!.width / 2,
      titleBoxBefore!.y + titleBoxBefore!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      titleBoxBefore!.x + titleBoxBefore!.width / 2 + 24,
      titleBoxBefore!.y + titleBoxBefore!.height / 2 + 12,
      { steps: 5 }
    );
    await page.mouse.up();

    expect(Number(await titleXInput.inputValue())).toBeGreaterThan(10);
    expect(Number(await titleYInput.inputValue())).toBeGreaterThan(4);

    // Изменяем X, Y, ширину и высоту через правую панель
    await rightSidebar.getByLabel('Сохранять пропорции').uncheck();
    await titleXInput.fill('36');
    await titleYInput.fill('-8');
    await titleWInput.fill('380');
    await titleHInput.fill('62');

    // Убеждаемся, что станции маршрута (X/Y) НЕ сместились при движении заголовка
    const stationsAfterTitleMove = await inspectStationLabelTypography(page, 4);
    expect(stationsAfterTitleMove.stations.map((s) => s.labelRectRel)).toEqual(
      stationsBeforeTitleMove.stations.map((s) => s.labelRectRel)
    );
    expect(stationsAfterTitleMove.stations.map((s) => s.pinBottomRel)).toEqual(
      stationsBeforeTitleMove.stations.map((s) => s.pinBottomRel)
    );

    // Проверяем, что сам блок nextChapter остался с Y = 0 (кликаем свободную зону слева, выше нижней панели)
    await nextSection.click({ position: { x: 24, y: 70 } });
    await expect(
      rightSidebar.getByLabel('Смещение по вертикали Y (px)')
    ).toHaveValue('0');

    // Проверяем, что при переключении страниц 1 <-> 2 и после reload всё сохраняется
    await page.getByRole('button', { name: 'Стр. 1', exact: true }).first().click();
    await expect(pageOneCanvas).toBeVisible();
    await coverBubble.click();
    await expect(rightSidebar.getByLabel('Смещение X (px)')).toHaveValue('32');
    await expect(
      rightSidebar.getByLabel('Смещение по вертикали Y (px)')
    ).toHaveValue('-14');

    await page.reload();
    await page
      .locator('article', { hasText: 'T45 Доработка · Ср 18:00' })
      .getByRole('button', { name: 'Открыть редактор группы' })
      .click();
    await page
      .getByRole('button', { name: 'Редактор учеников', exact: true })
      .click();
    await page.getByRole('button', { name: 'Вписать', exact: true }).click();
    await expect(pageOneCanvas).toBeVisible();

    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();
    await pageOneCanvas.locator('[data-snap-id="coverBubble"]').click();
    await expect(rightSidebar.getByLabel('Смещение X (px)')).toHaveValue('32');
    await expect(
      rightSidebar.getByLabel('Смещение по вертикали Y (px)')
    ).toHaveValue('-14');

    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();
    await expect(pageTwoCanvas).toBeVisible();
    const reloadedTitle = pageTwoCanvas.locator(
      '[data-page2-section="nextChapter"] [data-snap-id="nextChapterTitle"]'
    );
    await reloadedTitle.locator('h3').click();
    await expect(rightSidebar.getByLabel('Смещение X (px)')).toHaveValue('36');
    await expect(
      rightSidebar.getByLabel('Смещение по вертикали Y (px)')
    ).toHaveValue('-8');
    await expect(rightSidebar.getByLabel('Ширина (px)')).toHaveValue('380');
    await expect(rightSidebar.getByLabel('Высота (px)')).toHaveValue('62');

    // Снимаем выделение и проверяем PDF экспорт
    await rightSidebar.getByRole('button', { name: 'Контент' }).click();
    await page.getByRole('button', { name: 'Скачать' }).click();
    const pdfDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Полный PDF/ }).click();
    const pdfDownload = await pdfDownloadPromise;
    expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/i);
    const pdfPath = testInfo.outputPath(pdfDownload.suggestedFilename());
    await pdfDownload.saveAs(pdfPath);
    const pdfBytes = fs.readFileSync(pdfPath);
    expect(pdfBytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(pdfBytes.length).toBeGreaterThan(5000);

    expect(runtimeErrors).toEqual([]);
  });
});
