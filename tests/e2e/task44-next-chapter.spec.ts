import fs from 'fs';
import { expect, Page, test } from '@playwright/test';

async function setupGroupWithTwoStudents(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Создать группу' }).click();
  const createModal = page.locator('form', {
    hasText: 'Создать учебную группу',
  });
  await expect(createModal).toBeVisible();
  await createModal
    .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
    .fill('T44 Маршрут · Ср 17:00');
  await createModal.locator('select').first().selectOption({ index: 1 });
  await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

  const groupCard = page.locator('article', {
    hasText: 'T44 Маршрут · Ср 17:00',
  });
  await expect(groupCard).toBeVisible();

  await groupCard.getByRole('button', { name: 'Добавить ученика' }).click();
  await groupCard
    .getByPlaceholder('Имя и фамилия ученика')
    .fill('Артём Навигатор');
  await groupCard.getByPlaceholder('Возраст').fill('11');
  await groupCard.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(
    groupCard.getByRole('button', { name: /Артём Навигатор/ })
  ).toBeVisible();

  await groupCard.getByRole('button', { name: 'Добавить ученика' }).click();
  await groupCard
    .getByPlaceholder('Имя и фамилия ученика')
    .fill('София Второй');
  await groupCard.getByPlaceholder('Возраст').fill('11');
  await groupCard.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(
    groupCard.getByRole('button', { name: /София Второй/ })
  ).toBeVisible();

  await groupCard
    .getByRole('button', { name: 'Открыть редактор группы' })
    .click();
}

async function inspectNextChapterGeometry(page: Page, expectedCount: number) {
  const pageTwoCanvas = page.locator(
    'main article[aria-label="Страница 2: Мои достижения"]'
  );
  const section = pageTwoCanvas.locator('[data-page2-section="nextChapter"]');
  await expect(section).toBeVisible();
  await expect(section.locator('[data-next-station]')).toHaveCount(
    expectedCount
  );

  const metrics = await pageTwoCanvas.evaluate((article) => {
    const body = article.querySelector<HTMLElement>('[data-a4-body="2"]');
    const nextSec = article.querySelector<HTMLElement>(
      '[data-page2-section="nextChapter"]'
    );
    if (!nextSec) throw new Error('Missing nextChapter section');

    const stations = Array.from(
      nextSec.querySelectorAll<HTMLElement>('[data-next-station]')
    );
    const heading = nextSec.querySelector<HTMLElement>('h3');
    const bear = nextSec.querySelector<HTMLElement>(
      '[data-snap-id="nextBear"]'
    );

    const headingRect = heading?.getBoundingClientRect() ?? null;
    const bearRect = bear?.getBoundingClientRect() ?? null;
    const secRect = nextSec.getBoundingClientRect();

    const stationInfo = stations.map((st) => {
      const svgs = st.querySelectorAll('svg');
      const pinSvg = svgs[0] as SVGSVGElement | undefined;
      const labelBox = st.querySelector<HTMLElement>('div.rounded-xl');
      const span = st.querySelector<HTMLElement>('span');
      const pinRect = pinSvg?.getBoundingClientRect() ?? null;
      const labelRect = labelBox?.getBoundingClientRect() ?? null;
      const stRect = st.getBoundingClientRect();
      return {
        id: st.getAttribute('data-next-station'),
        color: st.getAttribute('data-pin-color'),
        title: span?.textContent?.trim() ?? '',
        hasPinSvg: Boolean(pinSvg),
        pinCenterX: pinRect ? pinRect.left + pinRect.width / 2 : 0,
        pinBottom: pinRect ? pinRect.bottom : 0,
        labelCenterX: labelRect ? labelRect.left + labelRect.width / 2 : 0,
        labelTop: labelRect ? labelRect.top : 0,
        labelRect: labelRect
          ? {
              left: labelRect.left,
              right: labelRect.right,
              top: labelRect.top,
              bottom: labelRect.bottom,
            }
          : null,
        stRect: {
          left: stRect.left,
          right: stRect.right,
          top: stRect.top,
          bottom: stRect.bottom,
        },
        textOverflow:
          span && span.clientWidth > 0
            ? span.scrollWidth > span.clientWidth + 3
            : false,
      };
    });

    const overlaps = (
      a: { left: number; right: number; top: number; bottom: number } | null,
      b: { left: number; right: number; top: number; bottom: number } | null
    ) => {
      if (!a || !b) return false;
      const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return ix > 3 && iy > 3;
    };

    let stationOverlap = false;
    for (let i = 0; i < stationInfo.length; i++) {
      for (let j = i + 1; j < stationInfo.length; j++) {
        if (overlaps(stationInfo[i].labelRect, stationInfo[j].labelRect)) {
          stationOverlap = true;
        }
      }
    }

    const headingOverlap = headingRect
      ? stationInfo.some((s) => overlaps(s.stRect, headingRect))
      : false;

    const bearOverlap = bearRect
      ? stationInfo.some((s) => overlaps(s.labelRect, bearRect))
      : false;

    const dashedPathCount = nextSec.querySelectorAll(
      'svg path[stroke-dasharray]'
    ).length;

    const decorSparklesCount = nextSec.querySelectorAll(
      'svg polygon, svg path[stroke-linejoin="round"][stroke-width="1.1"]'
    ).length;

    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const hasEmoji = emojiRegex.test(nextSec.textContent || '');

    return {
      stationCount: stations.length,
      stationInfo,
      stationOverlap,
      headingOverlap,
      bearOverlap,
      dashedPathCount,
      decorSparklesCount,
      hasEmoji,
      secLeft: secRect.left,
      secRight: secRect.right,
      bodyScrollH: body ? body.scrollHeight : 0,
      bodyClientH: body ? body.clientHeight : 0,
    };
  });

  expect(metrics.stationCount).toBe(expectedCount);
  expect(metrics.hasEmoji).toBe(false);
  expect(metrics.dashedPathCount).toBeGreaterThanOrEqual(1);
  expect(metrics.decorSparklesCount).toBeGreaterThanOrEqual(2);
  expect(metrics.stationOverlap).toBe(false);
  expect(metrics.headingOverlap).toBe(false);
  expect(metrics.bearOverlap).toBe(false);
  expect(metrics.bodyScrollH).toBeLessThanOrEqual(metrics.bodyClientH + 4);

  for (const s of metrics.stationInfo) {
    expect(s.hasPinSvg).toBe(true);
    expect(s.textOverflow).toBe(false);
    expect(s.labelTop).toBeGreaterThanOrEqual(s.pinBottom - 1);
    expect(Math.abs(s.labelCenterX - s.pinCenterX)).toBeLessThan(3);
  }

  return metrics;
}

test.describe('Задача №44: Геометки маршрута в блоке «Что интересного впереди?»', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('kiberone_student_journey_onboarding_v1', '1');
    });
  });

  test('Рендер 2/3/4 геометок, редактирование в Контенте и Дизайне, сохранность между резидентами, reload и экспорт PDF/PNG', async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);
    const runtimeErrors: string[] = [];
    page.on('pageerror', (err) => runtimeErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        runtimeErrors.push(msg.text());
      }
    });

    await setupGroupWithTwoStudents(page);

    // Переходим к индивидуальному редактору на Стр. 2, раздел 5. Письмо
    await page
      .getByRole('button', { name: 'Редактор учеников', exact: true })
      .click();
    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();
    await page.getByRole('button', { name: 'Вписать', exact: true }).click();

    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });
    const rightSidebar = page.locator('aside').nth(1);
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();

    const nextBlockEditor = rightSidebar.locator(
      '[data-editor-page2-block="nextChapter"]'
    );
    await expect(nextBlockEditor).toBeVisible();

    // 1. Проверяем 3 направления по умолчанию
    const initialMetrics = await inspectNextChapterGeometry(page, 3);
    const initialColors = new Set(initialMetrics.stationInfo.map((s) => s.color));
    expect(initialColors.size).toBe(3);

    // 2. Редактируем названия, цвета и добавляем 4-е направление
    await nextBlockEditor
      .getByLabel('Название направления 1')
      .fill('Разработка 3D-игр');
    await nextBlockEditor
      .getByLabel('Название направления 2')
      .fill('Продвинутый Python');
    await nextBlockEditor
      .getByLabel('Название направления 3')
      .fill('3D-моделирование');

    // Меняем цвета на 5 палитр (проверяем коралловый и фиолетовый на 1 и 2)
    await nextBlockEditor
      .getByRole('button', { name: 'Коралловый для Разработка 3D-игр' })
      .click();
    await nextBlockEditor
      .getByRole('button', { name: 'Фиолетовый для Продвинутый Python' })
      .click();
    await nextBlockEditor
      .getByRole('button', { name: 'Голубой для 3D-моделирование' })
      .click();

    // Добавляем 4-е направление
    await nextBlockEditor
      .getByRole('button', { name: 'Добавить направление' })
      .click();
    await nextBlockEditor
      .getByLabel('Название направления 4')
      .fill('Основы ИИ');
    await nextBlockEditor
      .getByRole('button', { name: 'Жёлтый для Основы ИИ' })
      .click();

    // Проверяем геометрию с 4 направлениями
    const fourMetrics = await inspectNextChapterGeometry(page, 4);
    expect(fourMetrics.stationInfo.map((s) => s.title)).toEqual([
      'Разработка 3D-игр',
      'Продвинутый Python',
      '3D-моделирование',
      'Основы ИИ',
    ]);
    expect(fourMetrics.stationInfo.map((s) => s.color)).toEqual([
      '#FB7185',
      '#8B5CF6',
      '#38BDF8',
      '#FACC15',
    ]);
    await page.screenshot({ path: '/tmp/task44-4pins.png' });

    // 3. Проверяем изменение порядка и удаление до 2 направлений
    await nextBlockEditor
      .getByRole('button', { name: 'Переместить выше: Продвинутый Python' })
      .click();
    let reorderedTitles = await page
      .locator(
        'main article[aria-label="Страница 2: Мои достижения"] [data-next-station] span'
      )
      .allTextContents();
    expect(reorderedTitles.map((t) => t.trim())).toEqual([
      'Продвинутый Python',
      'Разработка 3D-игр',
      '3D-моделирование',
      'Основы ИИ',
    ]);

    // Удаляем 2 направления -> остаётся 2 направления
    await nextBlockEditor
      .getByRole('button', { name: 'Удалить направление: Основы ИИ' })
      .click();
    await nextBlockEditor
      .getByRole('button', { name: 'Удалить направление: 3D-моделирование' })
      .click();

    const twoMetrics = await inspectNextChapterGeometry(page, 2);
    expect(twoMetrics.stationInfo.map((s) => s.title)).toEqual([
      'Продвинутый Python',
      'Разработка 3D-игр',
    ]);
    await page.screenshot({ path: '/tmp/task44-2pins.png' });

    // Возвращаем 3-е направление через кнопку и выбираем бирюзовый цвет
    await nextBlockEditor
      .getByRole('button', { name: 'Добавить направление' })
      .click();
    await nextBlockEditor
      .getByLabel('Название направления 3')
      .fill('3D-моделирование');
    await nextBlockEditor
      .getByRole('button', { name: 'Бирюзовый для 3D-моделирование' })
      .click();

    const threeMetrics = await inspectNextChapterGeometry(page, 3);
    expect(threeMetrics.stationInfo.map((s) => s.color)).toEqual([
      '#8B5CF6',
      '#FB7185',
      '#14B8A6',
    ]);
    await page.screenshot({ path: '/tmp/task44-3pins.png' });

    // 4. Проверяем режим Дизайн: фон, декор, линия маршрута, размер и положение
    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();
    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );
    const nextSection = pageTwoCanvas.locator(
      '[data-page2-section="nextChapter"]'
    );
    await nextSection.click({ position: { x: 200, y: 120 } });

    // Переключаем декор и пунктирную линию
    const decorToggle = rightSidebar.getByLabel('Декоративное оформление');
    const routeToggle = rightSidebar.getByLabel('Пунктирная линия маршрута');
    await expect(decorToggle).toBeChecked();
    await expect(routeToggle).toBeChecked();

    await decorToggle.uncheck();
    await expect(
      nextSection.locator(
        'svg polygon, svg path[stroke-linejoin="round"][stroke-width="1.1"]'
      )
    ).toHaveCount(0);
    await decorToggle.check();

    await routeToggle.uncheck();
    await expect(
      nextSection.locator('svg path[stroke-dasharray]')
    ).toHaveCount(0);
    await routeToggle.check();

    // Меняем цвет фона маршрута
    await rightSidebar.getByRole('button', { name: '#EDE9FE' }).click();

    // Изменяем размер и смещение Y, проверяем что геометки и названия остаются выровненными
    await rightSidebar.getByLabel('Сохранять пропорции').uncheck();
    await rightSidebar.getByLabel('Ширина (px)').fill('760');
    await rightSidebar.getByLabel('Высота (px)').fill('256');
    await rightSidebar.getByLabel('Смещение по вертикали Y (px)').fill('-6');

    // Снимаем выделение рамки дизайна перед проверкой A4 scrollHeight (у рамки есть служебный badge -bottom-[22px])
    await rightSidebar.getByRole('button', { name: 'Контент' }).click();
    await inspectNextChapterGeometry(page, 3);

    // 5. Переключаемся на второго резидента и проверяем, что его данные и библиотека не изменились
    await page
      .locator('aside')
      .first()
      .locator('button', { hasText: 'София Второй' })
      .first()
      .click();
    const sophiaTitles = await page
      .locator(
        'main article[aria-label="Страница 2: Мои достижения"] [data-next-station] span'
      )
      .allTextContents();
    expect(sophiaTitles.map((t) => t.trim())).not.toContain(
      'Разработка 3D-игр'
    );

    // Возвращаемся к Артёму и делаем reload
    await page
      .locator('aside')
      .first()
      .locator('button', { hasText: 'Артём Навигатор' })
      .first()
      .click();

    // Закрепляем дизайн за текущим резидентом, если баннер показан
    const designBar = page.getByRole('status', {
      name: 'Уведомление об изменении дизайна',
    });
    if (await designBar.isVisible()) {
      await designBar
        .getByRole('button', { name: 'Только текущий резидент' })
        .click();
    }

    await page.reload();
    await page
      .locator('article', { hasText: 'T44 Маршрут · Ср 17:00' })
      .getByRole('button', { name: 'Открыть редактор группы' })
      .click();
    await page
      .getByRole('button', { name: 'Редактор учеников', exact: true })
      .click();
    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();

    const afterReload = await inspectNextChapterGeometry(page, 3);
    expect(afterReload.stationInfo.map((s) => s.title)).toEqual([
      'Продвинутый Python',
      'Разработка 3D-игр',
      '3D-моделирование',
    ]);
    expect(afterReload.stationInfo.map((s) => s.color)).toEqual([
      '#8B5CF6',
      '#FB7185',
      '#14B8A6',
    ]);

    // 6. Проверяем экспорт PDF и PNG
    await page.getByRole('button', { name: 'Скачать' }).click();
    const pdfDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Полный PDF/ }).click();
    const pdfDownload = await pdfDownloadPromise;
    expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/i);
    const pdfPath = testInfo.outputPath(pdfDownload.suggestedFilename());
    await pdfDownload.saveAs(pdfPath);
    const pdfBuf = fs.readFileSync(pdfPath);
    expect(pdfBuf.byteLength).toBeGreaterThan(5000);
    expect(pdfBuf.subarray(0, 5).toString('utf8')).toBe('%PDF-');

    const pngDownloads: Array<import('@playwright/test').Download> = [];
    page.on('download', (d) => {
      if (d.suggestedFilename().endsWith('.png')) {
        pngDownloads.push(d);
      }
    });
    await page.getByRole('button', { name: 'Скачать' }).click();
    await page.getByRole('button', { name: /Страницы PNG/ }).click();
    await expect.poll(() => pngDownloads.length).toBe(2);

    for (const d of pngDownloads) {
      const p = testInfo.outputPath(d.suggestedFilename());
      await d.saveAs(p);
      const buf = fs.readFileSync(p);
      expect(buf.byteLength).toBeGreaterThan(5000);
      expect(buf.subarray(0, 4).toString('hex')).toBe('89504e47');
    }

    expect(runtimeErrors).toEqual([]);
  });
});
