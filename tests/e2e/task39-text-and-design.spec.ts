import fs from 'fs';
import { expect, Page, test } from '@playwright/test';

interface StoredJournalSummary {
  id: string;
  groupId?: string;
  residentName: string;
  prideText: string;
  mentorBody: string;
  p1DecorWidths: number[];
  p1Grid: boolean;
}

async function readJournalsFromIndexedDB(
  page: Page
): Promise<StoredJournalSummary[]> {
  return page.evaluate(
    () =>
      new Promise<StoredJournalSummary[]>((resolve, reject) => {
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
              id: string;
              groupId?: string;
              resident: { fullName: string };
              page1: {
                background?: { showGrid?: boolean };
                decorElements?: Array<{ width: number }>;
              };
              page2: {
                prideText: string;
                mentorNote: { body: string };
              };
            }>;
            resolve(
              docs.map((d) => ({
                id: d.id,
                groupId: d.groupId,
                residentName: d.resident.fullName,
                prideText: d.page2.prideText,
                mentorBody: d.page2.mentorNote.body,
                p1DecorWidths: (d.page1.decorElements ?? []).map((el) =>
                  Math.round(el.width)
                ),
                p1Grid: Boolean(d.page1.background?.showGrid),
              }))
            );
          };
        };
      })
  );
}

async function createGroupWithStudent(
  page: Page,
  options: {
    groupName: string;
    branchIndex: number;
    studentName: string;
    studentAge?: string;
  }
) {
  await page.getByRole('button', { name: 'Создать группу' }).click();
  const createModal = page.locator('form', {
    hasText: 'Создать учебную группу',
  });
  await expect(createModal).toBeVisible();
  await createModal
    .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
    .fill(options.groupName);
  await createModal
    .locator('select')
    .first()
    .selectOption({ index: options.branchIndex });
  await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

  const groupCard = page.locator('article', { hasText: options.groupName });
  await expect(groupCard).toBeVisible();

  await groupCard.getByRole('button', { name: 'Добавить ученика' }).click();
  await groupCard
    .getByPlaceholder('Имя и фамилия ученика')
    .fill(options.studentName);
  await groupCard.getByPlaceholder('Возраст').fill(options.studentAge ?? '10');
  await groupCard.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(
    groupCard.getByRole('button', { name: new RegExp(options.studentName) })
  ).toBeVisible();

  return groupCard;
}

test.describe('Задача №39: Перенос текста на А4, автосохранение и глобальный дизайн', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('kiberone_student_journey_onboarding_v1', '1');
    });
  });

  test('переносит длинный текст без пробелов на А4, предупреждает при выходе за лист, сохраняет в предпросмотре и PDF', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    const groupCard = await createGroupWithStudent(page, {
      groupName: 'T39 Текст · Ср 18:00',
      branchIndex: 1,
      studentName: 'Иван Длиннотекстов',
    });

    await groupCard
      .getByRole('button', { name: 'Открыть редактор группы' })
      .click();

    // Добавим 1 общий модуль и применим ко всем
    await page.getByRole('button', { name: /2\s+Модули/ }).click();
    await page.getByRole('button', { name: 'Выбрать модули', exact: true }).click();
    const modulesModal = page.locator('div.fixed', {
      hasText: 'Выбор модулей программы',
    });
    await expect(modulesModal).toBeVisible();
    await modulesModal.locator('input[type="checkbox"]').first().check();
    await modulesModal.getByRole('button', { name: /^Добавить \(\d+\)$/ }).click();
    await page.getByRole('button', { name: /Применить ко всем/ }).first().click();

    const pageOneCanvas = page.locator(
      'main article[aria-label="Страница 1: Мой путь в мире технологий"]'
    );
    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );
    await expect(pageOneCanvas).toBeVisible({ timeout: 15_000 });

    const rightSidebar = page.locator('aside').nth(1);
    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });

    // 1. Описание учебного модуля: длинная строка без пробелов + кириллица + латиница + символы (не обрезается)
    const longModuleDesc =
      'SuperLongUnspacedModuleToken1234567890_КириллицаБезПробелов_@#$%&_EndOfModuleDesc';
    const firstModDescOnCanvas = pageOneCanvas
      .locator('[data-snap-id^="module-"] p')
      .last();
    await firstModDescOnCanvas.click();
    const floatingTextarea = rightSidebar.getByPlaceholder(
      'Введите текст — изменения сразу появятся на листе А4…'
    );
    await expect(floatingTextarea).toBeVisible();
    await floatingTextarea.fill(longModuleDesc);
    await expect(pageOneCanvas).toContainText('EndOfModuleDesc');

    const modNoOverflow = await firstModDescOnCanvas.evaluate(
      (el) => el.scrollWidth <= el.clientWidth + 2
    );
    expect(modNoOverflow).toBe(true);

    // 2. Описание проекта на странице 1
    await inspectorNav.getByRole('button', { name: /3\. Проекты/ }).click();
    const longProjectCaption =
      'UnspacedProjectCaption_ОченьДлиннаяПодписьПроектаБезПробелов_!@#_FinishProj';
    const longProjectDesc =
      'ProjectDetailUnspaced_ПодробноеОписаниеПроектаНаХолстеА4БезОбрезки_987654321';
    await rightSidebar
      .getByPlaceholder('Подпись (например: Игра в Kodu)')
      .first()
      .fill(longProjectCaption);
    await rightSidebar
      .getByPlaceholder('Короткое описание...')
      .first()
      .fill(longProjectDesc);
    await expect(pageOneCanvas).toContainText('FinishProj');
    await expect(pageOneCanvas).toContainText('987654321');

    const projNoOverflow = await pageOneCanvas
      .getByText(longProjectCaption)
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 2);
    expect(projNoOverflow).toBe(true);

    // 3. Страница 2: Момент гордости + Сильная сторона + Следующий шаг
    await inspectorNav.getByRole('button', { name: /4\. Успехи/ }).click();
    await expect(pageTwoCanvas).toBeVisible();

    const longPride =
      'ОченьДлинныйМоментГордостиБезПробелов1234567890_CyberQuest_!@#_ФиналГордости';
    await rightSidebar
      .getByPlaceholder('Чем ученик может гордиться по итогам периода?')
      .fill(longPride);
    await expect(pageTwoCanvas).toContainText('ФиналГордости');

    const prideNoOverflow = await pageTwoCanvas
      .getByText(longPride)
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 2);
    expect(prideNoOverflow).toBe(true);

    await rightSidebar.getByRole('button', { name: 'Креативность' }).click();
    const longStrength =
      'СильнаяСторонаБезПробелов1234567890_CreativeCoding_КириллицаИЛатиница_EndStr';
    await rightSidebar
      .getByLabel('Описание сильной стороны: Креативность')
      .fill(longStrength);
    await expect(pageTwoCanvas).toContainText('EndStr');

    const strengthNoOverflow = await pageTwoCanvas
      .getByText(longStrength)
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 2);
    expect(strengthNoOverflow).toBe(true);

    // 4. Письмо наставника: длинные строки вызывают адаптацию и предупреждение о выходе за пределы А4 без скрытия текста
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();
    const veryLongMentorBody =
      'ОченьДлинноеПисьмоНаставникаБезПробелов_1234567890_ABCDEFGHIJKLMNOPQRSTUVWXYZ_Начало!\n' +
      Array.from(
        { length: 16 },
        (_, i) =>
          `Строка ${i + 1}: Детальная обратная связь без обрезки текста на холсте А4.`
      ).join('\n') +
      '\nКонецДлинногоПисьмаБезСкрытия!';
    await rightSidebar
      .getByPlaceholder('Личный отзыв наставника...')
      .fill(veryLongMentorBody);

    await expect(pageTwoCanvas).toContainText('КонецДлинногоПисьмаБезСкрытия!');
    const mentorNoHorizontalOverflow = await pageTwoCanvas
      .getByText('КонецДлинногоПисьмаБезСкрытия!')
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 2);
    expect(mentorNoHorizontalOverflow).toBe(true);

    const overflowAlert = page.getByRole('alert');
    await expect(overflowAlert).toBeVisible();
    await expect(overflowAlert).toContainText(
      /Текст или блоки выходят за пределы листа А4/
    );
    await page.screenshot({
      path: '/tmp/task39-a4-text-wrap-overflow.png',
    });

    // 5. Предпросмотр: текст не обрезается и не выходит за границы по ширине
    await page.getByRole('banner').getByRole('button', { name: 'Разворот' }).click();
    const previewP1 = page.locator(
      'main article[aria-label="Страница 1: Мой путь в мире технологий"]'
    );
    const previewP2 = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );
    await expect(previewP1).toContainText('EndOfModuleDesc');
    await expect(previewP2).toContainText('ФиналГордости');
    await expect(previewP2).toContainText('КонецДлинногоПисьмаБезСкрытия!');

    for (const canvas of [previewP1, previewP2]) {
      const overflowingParagraphs = await canvas
        .locator('p, h1, h2, h3, h4')
        .evaluateAll((els) =>
          els
            .filter(
              (el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 3
            )
            .map((el) => el.textContent?.slice(0, 40) || '')
        );
      expect(overflowingParagraphs).toEqual([]);
    }

    // 6. PDF экспорт: файл реально скачивается и имеет сигнатуру %PDF-
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
  });

  test('сохраняет дизайн в IndexedDB, показывает панель «Дизайн изменён», подтверждает применение на группу/все локации, откатывает и сохраняет шаблон', async ({
    page,
  }) => {
    await page.goto('/');

    // Создаём группу 1 в Локации 1 с двумя учениками
    const group1Card = await createGroupWithStudent(page, {
      groupName: 'T39 Группа Альфа',
      branchIndex: 0,
      studentName: 'Алиса Первая',
    });
    await group1Card.getByRole('button', { name: 'Добавить ученика' }).click();
    await group1Card.getByPlaceholder('Имя и фамилия ученика').fill('Борис Второй');
    await group1Card.getByPlaceholder('Возраст').fill('11');
    await group1Card.getByRole('button', { name: 'Добавить', exact: true }).click();
    await expect(
      group1Card.getByRole('button', { name: /Борис Второй/ })
    ).toBeVisible();

    // Создаём группу 2 в Локации 2 с одним учеником
    const group2Card = await createGroupWithStudent(page, {
      groupName: 'T39 Группа Бета',
      branchIndex: 1,
      studentName: 'Виктор Третий',
    });
    await expect(group2Card).toBeVisible();

    // Открываем Группу Альфа -> задаём личный текст Борису и Алисе
    await group1Card
      .getByRole('button', { name: 'Открыть редактор группы' })
      .click();
    await page.getByRole('button', { name: 'Редактор учеников', exact: true }).click();

    const leftSidebar = page.locator('aside').first();
    const rightSidebar = page.locator('aside').nth(1);
    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });

    await leftSidebar.locator('button', { hasText: 'Борис Второй' }).first().click();
    await inspectorNav.getByRole('button', { name: /4\. Успехи/ }).click();
    await rightSidebar
      .getByPlaceholder('Чем ученик может гордиться по итогам периода?')
      .fill('Уникальный успех Бориса');
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();
    await rightSidebar
      .getByPlaceholder('Личный отзыв наставника...')
      .fill('Личное письмо для Бориса');

    // Возвращаемся к Алисе и добавляем/изменяем размер стикера
    await leftSidebar.locator('button', { hasText: 'Алиса Первая' }).first().click();
    await page.getByRole('button', { name: 'Стр. 1', exact: true }).first().click();
    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();
    await rightSidebar.getByRole('button', { name: '+ Стикер' }).click();
    await rightSidebar.getByTitle('WOW!').click();

    const widthInput = rightSidebar.getByLabel('Ширина (px)');
    await expect(widthInput).toBeVisible();
    await widthInput.fill('168');

    // Проверяем верхнюю постоянную панель «Дизайн изменён» и все 4 действия
    const designBar = page.getByRole('status', {
      name: 'Уведомление об изменении дизайна',
    });
    await expect(designBar).toBeVisible();
    await expect(designBar).toContainText('Дизайн изменён');
    await expect(designBar).toContainText(
      'Применить этот дизайн к другим журналам?'
    );
    await expect(
      designBar.getByRole('button', { name: 'Только текущий резидент' })
    ).toBeVisible();
    await expect(
      designBar.getByRole('button', { name: 'Применить ко всей группе' })
    ).toBeVisible();
    await expect(
      designBar.getByRole('button', {
        name: 'Применить ко всем группам во всех локациях',
      })
    ).toBeVisible();
    await expect(
      designBar.getByRole('button', { name: 'Сохранить как шаблон' })
    ).toBeVisible();

    await expect(page.getByRole('alert')).toBeHidden();

    await page.screenshot({
      path: '/tmp/task39-design-changed-bar.png',
    });

    // Переключаем вкладки и страницы — панель остаётся видимой
    await rightSidebar.getByRole('button', { name: 'Контент' }).click();
    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();
    await expect(designBar).toBeVisible();

    // Проверяем немедленное сохранение в IndexedDB для Алисы
    await expect
      .poll(async () => {
        const list = await readJournalsFromIndexedDB(page);
        const alice = list.find((j) => j.residentName === 'Алиса Первая');
        return alice?.p1DecorWidths.includes(168) ?? false;
      })
      .toBe(true);

    // Фиксируем «Только текущий резидент» и перезагружаем страницу
    await designBar
      .getByRole('button', { name: 'Только текущий резидент' })
      .click();
    await expect(designBar).toBeHidden();

    await page.reload();
    await page
      .locator('article', { hasText: 'T39 Группа Альфа' })
      .getByRole('button', { name: 'Открыть редактор группы' })
      .click();
    await page.getByRole('button', { name: 'Редактор учеников', exact: true }).click();

    await expect
      .poll(async () => {
        const list = await readJournalsFromIndexedDB(page);
        const alice = list.find((j) => j.residentName === 'Алиса Первая');
        const boris = list.find((j) => j.residentName === 'Борис Второй');
        return {
          aliceHas168: alice?.p1DecorWidths.includes(168) ?? false,
          borisHas168: boris?.p1DecorWidths.includes(168) ?? false,
        };
      })
      .toEqual({ aliceHas168: true, borisHas168: false });

    // Второе изменение дизайна (включаем сетку на Стр. 1 + делаем групповое применение)
    await leftSidebar.locator('button', { hasText: 'Алиса Первая' }).first().click();
    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();
    await rightSidebar.getByLabel('Сетка выравнивания на А4').check();
    await expect(designBar).toBeVisible();

    await designBar
      .getByRole('button', { name: 'Применить ко всей группе' })
      .click();
    const confirmDialog = page.getByRole('dialog', {
      name: 'Подтверждение применения дизайна',
    });
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog).toContainText(
      /Вы собираетесь применить изменения к 1 резидентам\. Продолжить\?/
    );
    await confirmDialog.getByRole('button', { name: 'Применить', exact: true }).click();

    const undoBulkBtn = page.getByRole('button', {
      name: 'Отменить последнее массовое применение',
    });
    await expect(undoBulkBtn).toBeVisible();
    await page.screenshot({
      path: '/tmp/task39-group-applied.png',
    });

    // Проверяем в IndexedDB: у Бориса дизайн применился, а личный текст сохранился; Виктор (другая группа) не затронут
    await expect
      .poll(async () => {
        const list = await readJournalsFromIndexedDB(page);
        const boris = list.find((j) => j.residentName === 'Борис Второй');
        const viktor = list.find((j) => j.residentName === 'Виктор Третий');
        return {
          borisGrid: boris?.p1Grid,
          borisHas168: boris?.p1DecorWidths.includes(168) ?? false,
          borisPride: boris?.prideText,
          borisMentor: boris?.mentorBody,
          viktorGrid: viktor?.p1Grid,
          viktorHas168: viktor?.p1DecorWidths.includes(168) ?? false,
        };
      })
      .toEqual({
        borisGrid: true,
        borisHas168: true,
        borisPride: 'Уникальный успех Бориса',
        borisMentor: 'Личное письмо для Бориса',
        viktorGrid: false,
        viktorHas168: false,
      });

    // Откатываем массовое применение
    await undoBulkBtn.click();
    await expect(undoBulkBtn).toBeHidden();

    await expect
      .poll(async () => {
        const list = await readJournalsFromIndexedDB(page);
        const boris = list.find((j) => j.residentName === 'Борис Второй');
        return {
          borisGrid: boris?.p1Grid,
          borisHas168: boris?.p1DecorWidths.includes(168) ?? false,
        };
      })
      .toEqual({ borisGrid: false, borisHas168: false });

    // Триггерим изменение (сетка выкл -> вкл), чтобы снова показать панель и применить ко всем локациям
    await rightSidebar.getByLabel('Сетка выравнивания на А4').uncheck();
    await rightSidebar.getByLabel('Сетка выравнивания на А4').check();
    await expect(designBar).toBeVisible();

    await designBar
      .getByRole('button', { name: 'Применить ко всем группам во всех локациях' })
      .click();
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog).toContainText(
      /Вы собираетесь применить изменения к \d+ резидентам\. Продолжить\?/
    );
    await confirmDialog.getByRole('button', { name: 'Применить', exact: true }).click();

    await expect
      .poll(async () => {
        const list = await readJournalsFromIndexedDB(page);
        const boris = list.find((j) => j.residentName === 'Борис Второй');
        const viktor = list.find((j) => j.residentName === 'Виктор Третий');
        return {
          borisGrid: boris?.p1Grid,
          viktorGrid: viktor?.p1Grid,
          viktorHas168: viktor?.p1DecorWidths.includes(168) ?? false,
        };
      })
      .toEqual({
        borisGrid: true,
        viktorGrid: true,
        viktorHas168: true,
      });

    // Перезагрузка и проверка сохранения шаблона
    await page.reload();
    await expect
      .poll(async () => {
        const list = await readJournalsFromIndexedDB(page);
        const viktor = list.find((j) => j.residentName === 'Виктор Третий');
        return viktor?.p1Grid ?? false;
      })
      .toBe(true);

    await page
      .locator('article', { hasText: 'T39 Группа Альфа' })
      .getByRole('button', { name: 'Открыть редактор группы' })
      .click();
    await page.getByRole('button', { name: 'Редактор учеников', exact: true }).click();
    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();
    await rightSidebar.getByLabel('Сетка выравнивания на А4').uncheck();
    await expect(designBar).toBeVisible();
    await designBar.getByRole('button', { name: 'Сохранить как шаблон' }).click();
    const tplModal = page.getByRole('dialog', {
      name: 'Сохранить дизайн как шаблон',
    });
    await expect(tplModal).toBeVisible();
    await tplModal.locator('input[type="text"]').fill('Шаблон Задача 39');
    await tplModal.getByRole('button', { name: 'Сохранить шаблон' }).click();

    await page.getByRole('button', { name: 'К группам' }).click();
    await page.getByRole('button', { name: 'Шаблоны' }).click();
    await expect(page.getByText('Шаблон Задача 39')).toBeVisible();
  });
});
