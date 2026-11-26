import fs from 'fs';
import { expect, Locator, Page, test } from '@playwright/test';

interface StoredJournalLayoutCheck {
  residentName: string;
  page1Modules: number;
  page1Projects: number;
  page2Layouts: Record<
    string,
    {
      x: number;
      y: number;
      width?: number;
      height?: number;
      rotation: number;
      preserveAspectRatio?: boolean;
    }
  >;
}

async function readJournalsLayoutState(
  page: Page
): Promise<StoredJournalLayoutCheck[]> {
  return page.evaluate(
    () =>
      new Promise<StoredJournalLayoutCheck[]>((resolve, reject) => {
        const req = indexedDB.open('kiberone_student_journey_db');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('journals', 'readonly');
          const store = tx.objectStore('journals');
          const getAll = store.getAll();
          getAll.onerror = () => reject(getAll.error);
          getAll.onsuccess = () => {
            const docs = (getAll.result || []) as Array<{
              resident: { fullName: string };
              page1: {
                modules: Array<{ hidden?: boolean }>;
                projects: Array<{ hidden?: boolean }>;
              };
              page2: {
                objectLayouts?: StoredJournalLayoutCheck['page2Layouts'];
              };
            }>;
            resolve(
              docs.map((d) => ({
                residentName: d.resident.fullName,
                page1Modules: d.page1.modules.filter((m) => !m.hidden).length,
                page1Projects: d.page1.projects.filter((p) => !p.hidden).length,
                page2Layouts: d.page2.objectLayouts ?? {},
              }))
            );
          };
        };
      })
  );
}

async function createGroupAndOpenEditor(
  page: Page,
  groupName: string,
  studentName: string
) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Создать группу' }).click();
  const createModal = page.locator('form', {
    hasText: 'Создать учебную группу',
  });
  await expect(createModal).toBeVisible();
  await createModal
    .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
    .fill(groupName);
  await createModal.locator('select').first().selectOption({ index: 1 });
  await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

  const groupCard = page.locator('article', { hasText: groupName });
  await expect(groupCard).toBeVisible();

  await groupCard.getByRole('button', { name: 'Добавить ученика' }).click();
  await groupCard.getByPlaceholder('Имя и фамилия ученика').fill(studentName);
  await groupCard.getByPlaceholder('Возраст').fill('11');
  await groupCard.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(
    groupCard.getByRole('button', { name: new RegExp(studentName) })
  ).toBeVisible();

  await groupCard
    .getByRole('button', { name: 'Открыть редактор группы' })
    .click();
}

async function dragHandle(
  page: Page,
  handleLocator: Locator,
  deltaX: number,
  deltaY: number
) {
  await expect(handleLocator).toBeVisible();
  const box = await handleLocator.boundingBox();
  if (!box) throw new Error('Resize handle has no boundingBox');
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX, startY + deltaY, { steps: 8 });
  await page.mouse.up();
}

test.describe('Задача №40: Аудит изменения размеров, порядка стр. 2, адаптивных сеток 1–6 и PDF', () => {
  test('1. Панельный ресайз (пропорциональный и свободный), вертикальное перемещение блоков, 2D-перемещение мишки, отсутствие ручек на холсте и сохранение', async ({
    page,
  }) => {
    page.setDefaultTimeout(10_000);
    await createGroupAndOpenEditor(
      page,
      'T40 Ресайз · Пн 17:00',
      'Михаил Размеров'
    );

    await page
      .getByRole('button', { name: 'Редактор учеников', exact: true })
      .click();
    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();

    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );
    await expect(pageTwoCanvas).toBeVisible();

    const rightSidebar = page.locator('aside').nth(1);
    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();

    // Используем масштаб «Вписать», чтобы вся страница А4 целиком помещалась на экране без перекрытия тулбаром
    await page.getByRole('button', { name: 'Вписать', exact: true }).click();

    // --- А) Карточка «Мой момент гордости» (структурный блок: только вертикальное смещение, без поворота и без ручек на холсте) ---
    const prideBlock = pageTwoCanvas.locator('[data-snap-id="pride"]');
    await prideBlock.locator('h4').click();
    const prideFrame = pageTwoCanvas.locator('[data-resize-frame="pride"]');
    await expect(prideFrame).toBeVisible();
    await expect(prideFrame.locator('[data-handle]')).toHaveCount(0);

    // Дублирующего слайдера «Масштаб» и поля «Поворот (°)» / «Смещение X (px)» для структурных блоков нет
    await expect(rightSidebar.getByLabel(/Масштаб/)).toHaveCount(0);
    await expect(rightSidebar.getByLabel('Смещение X (px)')).toHaveCount(0);
    await expect(rightSidebar.getByLabel('Поворот (°)')).toHaveCount(0);

    // Перетаскивание структурного блока по диагонали на холсте меняет только Y, а X остаётся 0
    await dragHandle(page, prideBlock.locator('h4'), 70, 28);

    // Пропорциональное изменение ширины через правую панель автоматически меняет высоту
    const aspectCheckbox = rightSidebar.getByLabel('Сохранять пропорции');
    await expect(aspectCheckbox).toBeChecked();
    const heightBeforeAspect = Number(
      await rightSidebar.getByLabel('Высота (px)').inputValue()
    );
    await rightSidebar.getByLabel('Ширина (px)').fill('400');
    const heightAfterAspect = Number(
      await rightSidebar.getByLabel('Высота (px)').inputValue()
    );
    expect(heightAfterAspect).toBeGreaterThan(heightBeforeAspect);

    // Отключаем сохранение пропорций -> независимое изменение ширины и высоты
    await aspectCheckbox.uncheck();
    await rightSidebar.getByLabel('Ширина (px)').fill('382');
    await rightSidebar.getByLabel('Высота (px)').fill('375');
    await expect(prideBlock).toHaveCSS('width', '382px');

    // --- Б) Записка наставника (mentorNote): пропорции вкл vs выкл ---
    const mentorBlock = pageTwoCanvas.locator('[data-snap-id="mentorNote"]');
    await mentorBlock.locator('h3').click();
    const mentorFrame = pageTwoCanvas.locator(
      '[data-resize-frame="mentorNote"]'
    );
    await expect(mentorFrame).toBeVisible();
    await expect(mentorFrame.locator('[data-handle]')).toHaveCount(0);

    const mentorStartRatio = await mentorBlock.evaluate(
      (el: HTMLElement) => el.offsetWidth / el.offsetHeight
    );
    await rightSidebar.getByLabel('Ширина (px)').fill('390');
    const mentorAfterProportional = await mentorBlock.evaluate((el: HTMLElement) => ({
      ratio: el.offsetWidth / el.offsetHeight,
    }));
    expect(
      Math.abs(mentorAfterProportional.ratio - mentorStartRatio)
    ).toBeLessThan(0.12);

    await rightSidebar.getByLabel('Сохранять пропорции').uncheck();
    await rightSidebar.getByLabel('Высота (px)').fill('360');

    // --- В) Медведь (prideBear): 2D-перемещение на холсте, числовой поворот и панельный ресайз ---
    const bearBlock = pageTwoCanvas.locator('[data-snap-id="prideBear"]');
    await bearBlock.click();
    const bearFrame = pageTwoCanvas.locator('[data-resize-frame="prideBear"]');
    await expect(bearFrame).toBeVisible();
    await expect(bearFrame.locator('[data-handle]')).toHaveCount(0);

    // 2D-перемещение мишки мышью работает по X и Y в пределах А4
    await dragHandle(page, bearBlock, -24, -16);
    await expect(rightSidebar.getByLabel('Смещение X (px)')).toBeVisible();
    await expect(rightSidebar.getByLabel('Поворот (°)')).toHaveValue('0');

    // Сброс размера у медведя и независимое редактирование через инпуты
    await rightSidebar.getByRole('button', { name: 'Сбросить размер' }).click();
    await rightSidebar.getByLabel('Сохранять пропорции').uncheck();
    await rightSidebar.getByLabel('Ширина (px)').fill('255');
    await rightSidebar.getByLabel('Высота (px)').fill('195');
    await expect(rightSidebar.getByLabel('Поворот (°)')).toHaveValue('0');

    // Проверка сохранения в IndexedDB и после перезагрузки
    await expect
      .poll(async () => {
        const list = await readJournalsLayoutState(page);
        const doc = list.find((j) => j.residentName === 'Михаил Размеров');
        return {
          prideX: doc?.page2Layouts.pride?.x,
          prideYNonZero: (doc?.page2Layouts.pride?.y ?? 0) !== 0,
          prideW: doc?.page2Layouts.pride?.width,
          prideH: doc?.page2Layouts.pride?.height,
          prideRot: doc?.page2Layouts.pride?.rotation,
          bearXNonZero: (doc?.page2Layouts.prideBear?.x ?? 0) !== 0,
          bearYNonZero: (doc?.page2Layouts.prideBear?.y ?? 0) !== 0,
          bearW: doc?.page2Layouts.prideBear?.width,
          bearH: doc?.page2Layouts.prideBear?.height,
          bearRot: doc?.page2Layouts.prideBear?.rotation,
          mentorKeepAspect: doc?.page2Layouts.mentorNote?.preserveAspectRatio,
          mentorRot: doc?.page2Layouts.mentorNote?.rotation,
        };
      })
      .toEqual({
        prideX: 0,
        prideYNonZero: true,
        prideW: 382,
        prideH: 375,
        prideRot: 0,
        bearXNonZero: true,
        bearYNonZero: true,
        bearW: 255,
        bearH: 195,
        bearRot: 0,
        mentorKeepAspect: false,
        mentorRot: 0,
      });

    // Закрепим дизайн только за текущим резидентом перед reload
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
      .locator('article', { hasText: 'T40 Ресайз · Пн 17:00' })
      .getByRole('button', { name: 'Открыть редактор группы' })
      .click();
    await page
      .getByRole('button', { name: 'Редактор учеников', exact: true })
      .click();
    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();

    await expect
      .poll(async () => {
        const list = await readJournalsLayoutState(page);
        const doc = list.find((j) => j.residentName === 'Михаил Размеров');
        return {
          prideW: doc?.page2Layouts.pride?.width,
          prideH: doc?.page2Layouts.pride?.height,
          bearW: doc?.page2Layouts.prideBear?.width,
          bearH: doc?.page2Layouts.prideBear?.height,
        };
      })
      .toEqual({
        prideW: 382,
        prideH: 375,
        bearW: 255,
        bearH: 195,
      });

    // Повторное редактирование после reload работает на тех же объектах
    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();
    await pageTwoCanvas.locator('[data-snap-id="pride"] > section > h3').click();
    await rightSidebar.getByLabel('Ширина (px)').fill('345');
    await expect(pageTwoCanvas.locator('[data-snap-id="pride"]')).toHaveCSS(
      'width',
      '345px'
    );
  });

  test('2. Строгий порядок блоков 2-й страницы в редакторе и на А4, адаптивные сетки 1–6 (модули и проекты), лимит 6, переполнение с именем элемента и PDF', async ({
    page,
  }, testInfo) => {
    await createGroupAndOpenEditor(
      page,
      'T40 Сетки 6x6 · Вт 18:00',
      'Алина Максимова'
    );

    // --- А) Проверка лимита 6 модулей в модалке «Общие данные группы» ---
    await page.getByRole('button', { name: /2\s+Модули/ }).click();
    await page
      .getByRole('button', { name: 'Выбрать модули', exact: true })
      .click();

    const modulesModal = page.locator('div.fixed', {
      hasText: 'Выбор модулей программы',
    });
    await expect(modulesModal).toBeVisible();
    await modulesModal
      .getByRole('button', { name: 'Все возрасты', exact: true })
      .click();

    const checkboxes = modulesModal.locator('input[type="checkbox"]');
    for (let i = 0; i < 6; i++) {
      await checkboxes.nth(i).check();
    }
    // Пытаемся выбрать 7-й модуль — должно остаться 6 и появиться предупреждение
    await checkboxes.nth(6).click();
    await expect(modulesModal).toContainText(
      'Достигнуто максимальное количество карточек для этой страницы'
    );
    await expect(checkboxes.nth(6)).not.toBeChecked();

    await modulesModal.getByRole('button', { name: 'Добавить (6)' }).click();
    await page
      .getByRole('button', { name: /Применить ко всем/ })
      .first()
      .click();

    const pageOneCanvas = page.locator(
      'main article[aria-label="Страница 1: Мой путь в мире технологий"]'
    );
    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );
    await expect(pageOneCanvas).toBeVisible({ timeout: 15_000 });

    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });
    const rightSidebar = page.locator('aside').nth(1);

    // --- Б) Проверка порядка блоков Страницы 2 в редакторе и на холсте А4 ---
    await inspectorNav.getByRole('button', { name: /4\. Успехи/ }).click();
    const step4Order = await rightSidebar
      .locator('[data-editor-page2-block]')
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute('data-editor-page2-block'))
      );
    expect(step4Order).toEqual(['strengths', 'pride']);

    // Включим сильную сторону, чтобы все 4 секции Стр. 2 отображались на холсте А4
    await rightSidebar.getByRole('button', { name: 'Креативность' }).click();

    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();
    const step5Order = await rightSidebar
      .locator('[data-editor-page2-block]')
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute('data-editor-page2-block'))
      );
    expect(step5Order).toEqual(['mentorNote', 'nextChapter']);

    // На холсте А4 порядок рендера строго: strengths -> pride -> mentorNote -> nextChapter
    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();
    const canvasPage2Order = await pageTwoCanvas
      .locator('[data-page2-section]')
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute('data-page2-section'))
      );
    expect(canvasPage2Order).toEqual([
      'strengths',
      'pride',
      'mentorNote',
      'nextChapter',
    ]);

    // Визуальная проверка вертикальных координат: strengths выше pride/mentorNote, они выше nextChapter
    const sectionPositions = await pageTwoCanvas.evaluate((article) => {
      const aRect = article.getBoundingClientRect();
      const getTop = (sel: string) => {
        const el = article.querySelector<HTMLElement>(sel);
        return el ? el.getBoundingClientRect().top - aRect.top : -1;
      };
      return {
        strengthsTop: getTop('[data-page2-section="strengths"]'),
        prideTop: getTop('[data-page2-section="pride"]'),
        mentorTop: getTop('[data-page2-section="mentorNote"]'),
        nextTop: getTop('[data-page2-section="nextChapter"]'),
      };
    });
    expect(sectionPositions.strengthsTop).toBeGreaterThanOrEqual(0);
    expect(sectionPositions.strengthsTop).toBeLessThan(
      sectionPositions.prideTop
    );
    expect(sectionPositions.prideTop).toBeLessThan(sectionPositions.nextTop);
    expect(sectionPositions.mentorTop).toBeLessThan(sectionPositions.nextTop);

    // Скриншот Страницы 2 для визуальной проверки порядка
    await page.getByRole('button', { name: 'Вписать', exact: true }).click();
    await page.screenshot({ path: '/tmp/task40-page2-order.png' });

    // --- В) Проверка сеток Page 1 для 1..6 модулей и 1..6 проектов ---
    await page.getByRole('button', { name: 'Стр. 1', exact: true }).first().click();

    const checkPage1FitAndNoOverlap = async (label: string) => {
      await page.waitForTimeout(120);
      const metrics = await pageOneCanvas.evaluate((article) => {
        const body = article.querySelector<HTMLElement>('[data-a4-body="1"]');
        const aRect = article.getBoundingClientRect();
        const modGrid = article.querySelector<HTMLElement>(
          '[data-modules-count]'
        );
        const projGrid = article.querySelector<HTMLElement>(
          '[data-projects-count]'
        );

        const modCards = modGrid
          ? Array.from(
              modGrid.querySelectorAll<HTMLElement>('[data-snap-id^="module-"]')
            )
          : [];
        const projCards = projGrid
          ? Array.from(
              projGrid.querySelectorAll<HTMLElement>(
                '[data-snap-id^="project-"]'
              )
            )
          : [];

        const hasOverlap = (els: HTMLElement[]) => {
          const rects = els.map((e) => e.getBoundingClientRect());
          for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
              const r1 = rects[i];
              const r2 = rects[j];
              const ix = Math.max(
                0,
                Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left)
              );
              const iy = Math.max(
                0,
                Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top)
              );
              if (ix > 4 && iy > 4) return true;
            }
          }
          return false;
        };

        const textOverflows = Array.from(
          article.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4')
        )
          .filter(
            (el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 3
          )
          .map((el) => el.textContent?.slice(0, 30));

        const projImageH =
          projCards[0]
            ?.querySelector<HTMLElement>('div.border-b.bg-zinc-100, div.border-b.bg-zinc-50')
            ?.getBoundingClientRect().height ?? 0;

        return {
          bodyScrollH: body ? body.scrollHeight : 0,
          bodyClientH: body ? body.clientHeight : 0,
          articleBottomOverflow:
            body && aRect.height > 0
              ? body.getBoundingClientRect().bottom - aRect.bottom
              : 0,
          modOverlap: hasOverlap(modCards),
          projOverlap: hasOverlap(projCards),
          textOverflows,
          modCount: modCards.length,
          projCount: projCards.length,
          projImageH,
        };
      });

      expect(metrics.modOverlap, `${label}: overlap modules`).toBe(false);
      expect(metrics.projOverlap, `${label}: overlap projects`).toBe(false);
      expect(metrics.textOverflows, `${label}: text overflow`).toEqual([]);
      expect(
        metrics.bodyScrollH,
        `${label}: Page 1 body overflow (${metrics.bodyScrollH} > ${metrics.bodyClientH})`
      ).toBeLessThanOrEqual(metrics.bodyClientH + 4);
      return metrics;
    };

    // Проверим все комбинации количества проектов 1..6 при 6 модулях
    await inspectorNav.getByRole('button', { name: /3\. Проекты/ }).click();

    // По умолчанию стартовых проектов 2 -> проверим сначала 2 проекта (увеличенные)
    const twoProjMetrics = await checkPage1FitAndNoOverlap('6 modules + 2 projects');
    expect(twoProjMetrics.projCount).toBe(2);

    // Добавим проекты до 3, 4, 5, 6 и каждый раз проверим сетку без переполнения и перекрытий
    for (let targetProj = 3; targetProj <= 6; targetProj++) {
      await rightSidebar.getByRole('button', { name: 'Добавить проект' }).click();
      const m = await checkPage1FitAndNoOverlap(`6 modules + ${targetProj} projects`);
      expect(m.projCount).toBe(targetProj);
      if (targetProj === 3) {
        // При 2 проектах изображение карточки заметно больше, чем при 3+
        expect(twoProjMetrics.projImageH).toBeGreaterThan(m.projImageH);
      }
    }

    // Попытка добавить 7-й проект заблокирована с предупреждением
    await rightSidebar
      .getByRole('button', { name: /Лимит проектов \(6\/6\)/ })
      .click();
    await expect(rightSidebar).toContainText(
      'Достигнуто максимальное количество карточек для этой страницы'
    );
    await expect(
      pageOneCanvas.locator('[data-projects-count="6"]')
    ).toBeVisible();

    // Скриншот 1-й страницы в максимальном заполнении (6 модулей + 6 проектов)
    await page.screenshot({ path: '/tmp/task40-page1-6x6.png' });

    // Проверка сетки для 1..5 модулей (отключаем и возвращаем чекбоксы модулей на вкладке 2. Модули)
    await inspectorNav.getByRole('button', { name: /2\. Модули/ }).click();
    const modCheckboxes = rightSidebar
      .locator('div.bg-white', { hasText: 'Модули (Мои открытия)' })
      .first()
      .locator('input[type="checkbox"]');

    // Снимаем по одному модулю от 5 down to 1, проверяя 5, 4, 3, 2, 1
    for (let hideIdx = 5; hideIdx >= 1; hideIdx--) {
      await modCheckboxes.nth(hideIdx).uncheck();
      const m = await checkPage1FitAndNoOverlap(`${hideIdx} modules + 6 projects`);
      expect(m.modCount).toBe(hideIdx);
    }

    // Проверка grid 1 проекта
    await inspectorNav.getByRole('button', { name: /3\. Проекты/ }).click();
    while ((await pageOneCanvas.locator('[data-snap-id^="project-"]').count()) > 1) {
      await rightSidebar.getByTitle('Удалить проект').first().click();
      await rightSidebar.getByRole('button', { name: 'Да', exact: true }).click();
    }
    const oneProjMetrics = await checkPage1FitAndNoOverlap('1 module + 1 project');
    expect(oneProjMetrics.projCount).toBe(1);

    // Вернём обратно 6 модулей + 6 проектов для проверки PDF-экспорта при максимальном заполнении
    await inspectorNav.getByRole('button', { name: /2\. Модули/ }).click();
    for (let showIdx = 1; showIdx <= 5; showIdx++) {
      await modCheckboxes.nth(showIdx).check();
    }
    await inspectorNav.getByRole('button', { name: /3\. Проекты/ }).click();
    for (let k = 2; k <= 6; k++) {
      await rightSidebar.getByRole('button', { name: 'Добавить проект' }).click();
    }
    await expect(
      pageOneCanvas.locator('[data-modules-count="6"]')
    ).toBeVisible();
    await expect(
      pageOneCanvas.locator('[data-projects-count="6"]')
    ).toBeVisible();

    // На 1-й странице с 6+6 не должно быть баннера переполнения при обычных текстах
    await expect(page.getByRole('alert')).toBeHidden();

    // --- Г) Заполним полностью Стр. 2 и проверим PDF экспорт при максимальном заполнении ---
    await inspectorNav.getByRole('button', { name: /4\. Успехи/ }).click();
    await rightSidebar.getByRole('button', { name: 'Любознательность' }).click();
    await rightSidebar.getByRole('button', { name: 'Логика' }).click();
    await rightSidebar
      .getByPlaceholder('Чем ученик может гордиться по итогам периода?')
      .fill('Собрала все 6 модулей и защитила 6 проектов на отлично!');
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();
    await rightSidebar
      .getByPlaceholder('Личный отзыв наставника...')
      .fill('Алина показала выдающуюся системность и уверенность во всех проектах модуля.');

    await page.getByRole('button', { name: 'Скачать' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Полный PDF/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

    const pdfPath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(pdfPath);
    const pdfBuf = fs.readFileSync(pdfPath);
    expect(pdfBuf.byteLength).toBeGreaterThan(5000);
    expect(pdfBuf.subarray(0, 5).toString('utf8')).toBe('%PDF-');

    // --- Д) Предупреждение при переполнении с указанием конкретного проблемного элемента ---
    const hugeMentorText = Array.from(
      { length: 24 },
      (_, idx) => `Строка ${idx + 1}: Очень длинный текст письма наставника для проверки предупреждения.`
    ).join('\n');
    await rightSidebar
      .getByPlaceholder('Личный отзыв наставника...')
      .fill(hugeMentorText);
    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();

    const overflowAlert = page.getByRole('alert');
    await expect(overflowAlert).toBeVisible();
    await expect(overflowAlert).toContainText(
      /Текст или блоки выходят за пределы листа А4/
    );
    await expect(overflowAlert).toContainText(
      /(Слово наставника|Что интересного впереди\?)/
    );
  });
});
