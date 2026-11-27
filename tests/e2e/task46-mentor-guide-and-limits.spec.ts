import fs from 'fs';
import { expect, Page, test } from '@playwright/test';

async function setupGroupWithDaria(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Создать группу' }).click();
  const createModal = page.locator('form', {
    hasText: 'Создать учебную группу',
  });
  await expect(createModal).toBeVisible();
  await createModal
    .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
    .fill('T46 Нейтральные шаблоны · Чт 17:00');
  await createModal.locator('select').first().selectOption({ index: 1 });
  await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

  const groupCard = page.locator('article', {
    hasText: 'T46 Нейтральные шаблоны · Чт 17:00',
  });
  await expect(groupCard).toBeVisible();

  await groupCard.getByRole('button', { name: 'Добавить ученика' }).click();
  await groupCard
    .getByPlaceholder('Имя и фамилия ученика')
    .fill('Дарья Соколова');
  await groupCard.getByPlaceholder('Возраст').fill('11');
  await groupCard.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(
    groupCard.getByRole('button', { name: /Дарья Соколова/ })
  ).toBeVisible();

  await groupCard
    .getByRole('button', { name: 'Открыть редактор группы' })
    .click();
  await page
    .getByRole('button', { name: 'Редактор учеников', exact: true })
    .click();
  await page.getByRole('button', { name: 'Вписать', exact: true }).click();
}

test.describe('Задача №46: Счётчики/лимиты письма наставника и нейтральные шаблоны', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('kiberone_student_journey_onboarding_v1', '1');
    });
  });

  test('Нейтральные быстрые шаблоны для Дарьи, счётчики 60/280/50 без автообрезки, предупреждения и А4/PDF', async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);
    const runtimeErrors: string[] = [];
    page.on('pageerror', (err) => runtimeErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') runtimeErrors.push(msg.text());
    });

    await setupGroupWithDaria(page);

    const rightSidebar = page.locator('aside').nth(1);
    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });
    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );

    await page.getByRole('button', { name: 'Стр. 2', exact: true }).first().click();
    await expect(pageTwoCanvas).toBeVisible();

    // 1. Проверяем нейтральные шаблоны «Момента гордости» в шаге 4 (без скобок (а)/(ла))
    await inspectorNav.getByRole('button', { name: /4\. Успехи/ }).click();
    const prideBlock = rightSidebar.locator('[data-editor-page2-block="pride"]');
    await expect(prideBlock).toBeVisible();
    const prideButtons = prideBlock.locator('button');
    const prideCount = await prideButtons.count();
    expect(prideCount).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < prideCount; i++) {
      const label = (await prideButtons.nth(i).textContent()) || '';
      expect(label).not.toMatch(/\(а\)|\(ла\)/i);
    }

    // 2. Переходим в шаг 5 «Письмо наставника» и проверяем быстрый шаблон для Дарьи
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();
    const mentorEditor = rightSidebar.locator(
      '[data-editor-page2-block="mentorNote"]'
    );
    await expect(mentorEditor).toBeVisible();

    await mentorEditor
      .getByRole('button', { name: 'Тёплая поддержка инженера' })
      .click();

    const greetingCounter = mentorEditor.locator(
      '[data-mentor-counter="greeting"]'
    );
    const bodyCounter = mentorEditor.locator('[data-mentor-counter="body"]');
    const signatureCounter = mentorEditor.locator(
      '[data-mentor-counter="signature"]'
    );

    await expect(greetingCounter).toContainText('/60');
    await expect(bodyCounter).toContainText('/280');
    await expect(signatureCounter).toContainText('/50');

    const greetingVal = await mentorEditor
      .getByLabel(/Приветствие/)
      .inputValue();
    const bodyVal = await mentorEditor
      .getByLabel(/Основной текст/)
      .inputValue();
    expect(greetingVal).toContain('Дарья,');
    expect(greetingVal).not.toMatch(/поработал|проявил|создал|\(а\)|\(ла\)/i);
    expect(bodyVal).not.toMatch(/поработал|проявил|создал|\(а\)|\(ла\)/i);

    // 3. Проверяем превышение рекомендуемого объёма: появляются предупреждения, НО текст не обрезается
    const longGreeting = 'Дарья, '.padEnd(74, 'а');
    const longBody = 'На занятиях заметны внимание к деталям и интерес к коду. '.repeat(6);
    const longSignature =
      'Твой наставник Алексей Смирнов-Кузнецов, кибершкола KIBERone';

    expect(longGreeting.length).toBeGreaterThan(60);
    expect(longBody.length).toBeGreaterThan(280);
    expect(longSignature.length).toBeGreaterThan(50);

    await mentorEditor.getByLabel(/Приветствие/).fill(longGreeting);
    await mentorEditor.getByLabel(/Основной текст/).fill(longBody);
    await mentorEditor.getByLabel(/Подпись/).fill(longSignature);

    await expect(mentorEditor.getByLabel(/Приветствие/)).toHaveValue(
      longGreeting
    );
    await expect(mentorEditor.getByLabel(/Основной текст/)).toHaveValue(
      longBody
    );
    await expect(mentorEditor.getByLabel(/Подпись/)).toHaveValue(longSignature);

    await expect(
      mentorEditor.locator('[data-mentor-warning="greeting"]')
    ).toBeVisible();
    await expect(
      mentorEditor.locator('[data-mentor-warning="body"]')
    ).toBeVisible();
    await expect(
      mentorEditor.locator('[data-mentor-warning="signature"]')
    ).toBeVisible();

    await expect(greetingCounter).toHaveText(`${longGreeting.length}/60`);
    await expect(bodyCounter).toHaveText(`${longBody.length}/280`);
    await expect(signatureCounter).toHaveText(`${longSignature.length}/50`);

    // 4. Проверяем также счётчик/предупреждение во встроенном редакторе при клике по тексту на листе А4
    await pageTwoCanvas
      .locator('[data-page2-section="mentorNote"] p')
      .first()
      .click();
    await expect(
      rightSidebar.getByText('Слово наставника · Основной текст')
    ).toBeVisible();
    await expect(
      rightSidebar.getByText(`${longBody.length}/280`)
    ).toBeVisible();
    await rightSidebar.getByRole('button', { name: 'Закрыть редактор текста' }).click();

    // 5. Возвращаем безопасную длину и проверяем чистое размещение на А4 и PDF-экспорт
    await mentorEditor
      .getByRole('button', { name: 'Тёплая поддержка инженера' })
      .click();
    await expect(
      mentorEditor.locator('[data-mentor-warning="greeting"]')
    ).toHaveCount(0);
    await expect(
      mentorEditor.locator('[data-mentor-warning="body"]')
    ).toHaveCount(0);

    const bodyCheck = await pageTwoCanvas.evaluate((article) => {
      const body = article.querySelector<HTMLElement>('[data-a4-body="2"]');
      return {
        scrollH: body ? body.scrollHeight : 0,
        clientH: body ? body.clientHeight : 0,
      };
    });
    expect(bodyCheck.scrollH).toBeLessThanOrEqual(bodyCheck.clientH + 4);

    await page.getByRole('button', { name: 'Скачать' }).click();
    const pdfPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Полный PDF/ }).click();
    const download = await pdfPromise;
    const pdfPath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(pdfPath);
    const pdfBytes = fs.readFileSync(pdfPath);
    expect(pdfBytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(pdfBytes.length).toBeGreaterThan(5000);

    expect(runtimeErrors).toEqual([]);
  });
});
