import fs from 'fs';
import JSZip from 'jszip';
import { expect, test } from '@playwright/test';

const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

test.describe('Задача 47: Резервное копирование (ZIP) и восстановление Web -> Electron', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('kiberone_student_journey_onboarding_v1', '1');
    });
  });

  test('полный цикл: группа -> резидент -> журнал -> изображение -> ZIP бэкап -> очистка -> восстановление', async ({
    page,
  }, testInfo) => {
    const groupName = 'E2E Задача 47 · Резервная копия';
    const studentName = 'Тимур Бэкапов';
    const customGreeting = 'Тимур, отличная проверка резервного копирования!';

    await page.goto('/');

    // 1. Загружаем изображение в Медиатеку
    await page.getByRole('button', { name: 'Медиатека' }).click();
    const mediaDialog = page.locator('div.fixed', {
      hasText: 'Медиатека KIBERone',
    });
    await expect(mediaDialog).toBeVisible();
    await mediaDialog
      .locator('input[type="file"][accept*="image/png"]')
      .setInputFiles({
        name: 'backup-media-47.png',
        mimeType: 'image/png',
        buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
      });
    await expect(mediaDialog.getByText('backup-media-47')).toBeVisible();
    await mediaDialog
      .getByRole('button', { name: 'Закрыть медиатеку' })
      .click();
    await expect(mediaDialog).toBeHidden();

    // 2. Создаём тестовую группу
    await page.getByRole('button', { name: 'Создать группу' }).click();
    const createModal = page.locator('form', {
      hasText: 'Создать учебную группу',
    });
    await createModal
      .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
      .fill(groupName);
    await createModal.locator('select').first().selectOption({ index: 0 });
    await createModal.locator('input[type="date"]').nth(0).fill('2026-09-01');
    await createModal.locator('input[type="date"]').nth(1).fill('2026-12-25');
    await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

    const groupCard = page.locator('article', { hasText: groupName });
    await expect(groupCard).toBeVisible();

    // 3. Добавляем тестового резидента (журнал создаётся автоматически)
    await groupCard.getByRole('button', { name: 'Добавить ученика' }).click();
    await groupCard.getByPlaceholder('Имя и фамилия ученика').fill(studentName);
    await groupCard.getByPlaceholder('Возраст').fill('11');
    await groupCard
      .getByRole('button', { name: 'Добавить', exact: true })
      .click();

    const studentBtn = groupCard.getByRole('button', {
      name: new RegExp(studentName),
    });
    await expect(studentBtn).toBeVisible();

    // 4. Открываем журнал резидента, загружаем скриншот проекта и меняем письмо наставника
    await studentBtn.click();
    const pageOneCanvas = page.locator(
      'main article[aria-label="Страница 1: Мой путь в мире технологий"]'
    );
    await expect(pageOneCanvas).toBeVisible({ timeout: 15_000 });

    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });
    await inspectorNav.getByRole('button', { name: /3\. Проекты/ }).click();

    await page
      .locator('input[type="file"][accept*="image/png"]')
      .first()
      .setInputFiles({
        name: 'project-shot-47.png',
        mimeType: 'image/png',
        buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
      });
    await expect(page.getByText('Скриншот загружен').first()).toBeVisible();

    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();
    await page
      .getByPlaceholder('Дарья, отличный результат за этот период!')
      .fill(customGreeting);

    // Возвращаемся на главную
    await page.getByRole('button', { name: 'К группам' }).click();
    await expect(page.locator('article', { hasText: groupName })).toBeVisible();

    // 5. Открываем модалку Бэкап, проверяем статус хранилища и скачиваем ZIP
    await page.getByRole('button', { name: 'Бэкап', exact: true }).click();
    const backupDialog = page.getByRole('dialog', {
      name: 'Резервное копирование и перенос данных',
    });
    await expect(backupDialog).toBeVisible();
    await expect(backupDialog.getByText('Хранилище браузера')).toBeVisible();
    await expect(backupDialog.getByText(/Занято:/)).toBeVisible();
    await expect(backupDialog.getByText(/Доступно:/)).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await backupDialog
      .getByRole('button', { name: 'Создать резервную копию' })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^kiberone-student-journey-backup-.*\.zip$/
    );

    const zipFilePath = testInfo.outputPath('backup-47.zip');
    await download.saveAs(zipFilePath);
    const zipBuffer = fs.readFileSync(zipFilePath);

    // Проверяем содержимое ZIP-архива
    const zip = await JSZip.loadAsync(zipBuffer);
    const manifestJson = JSON.parse(
      await zip.file('manifest.json')!.async('string')
    );
    expect(manifestJson.format).toBe('kiberone-journey-backup');
    expect(manifestJson.backupVersion).toBe(1);
    expect(manifestJson.schemaVersion).toBe(7);
    expect(manifestJson.counts.extractedImages).toBeGreaterThanOrEqual(1);
    expect(zip.file('data/settings.json')).not.toBeNull();
    const imageFiles = Object.keys(zip.files).filter(
      (k) => k.startsWith('assets/images/') && !zip.files[k].dir
    );
    expect(imageFiles.length).toBeGreaterThanOrEqual(1);

    await backupDialog
      .getByRole('button', { name: 'Закрыть окно резервного копирования' })
      .click();

    // 6. Очищаем IndexedDB и перезагружаем страницу
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase('kiberone_student_journey_db');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => resolve();
      });
    });

    await page.reload();
    await expect(page.getByText('Дашборд наставника')).toBeVisible();
    await expect(
      page.locator('article', { hasText: groupName })
    ).toHaveCount(0);

    // 7. Выбираем полное восстановление из ZIP-архива с проверкой и подтверждением
    await page.getByRole('button', { name: 'Бэкап', exact: true }).click();
    await expect(backupDialog).toBeVisible();
    await backupDialog
      .getByRole('radio', { name: /Полностью восстановить базу/ })
      .check();

    await backupDialog
      .locator('input[type="file"]')
      .setInputFiles(zipFilePath);

    const confirmSection = backupDialog.getByRole('region', {
      name: 'Подтверждение восстановления из резервной копии',
    });
    await expect(confirmSection).toBeVisible();
    await expect(confirmSection).toContainText('ZIP-архив v1');

    // Убеждаемся, что до подтверждения данные ещё не заменены
    await expect(
      page.locator('article', { hasText: groupName })
    ).toHaveCount(0);

    await confirmSection
      .getByRole('button', { name: 'Подтвердить и восстановить' })
      .click();

    await expect(backupDialog).toBeHidden();

    // 8. Проверяем восстановление группы, резидента, журнала и загруженного изображения
    const restoredCard = page.locator('article', { hasText: groupName });
    await expect(restoredCard).toBeVisible();
    const restoredStudentBtn = restoredCard.getByRole('button', {
      name: new RegExp(studentName),
    });
    await expect(restoredStudentBtn).toBeVisible();

    // Проверяем медиатеку
    await page.getByRole('button', { name: 'Медиатека' }).click();
    await expect(
      page.locator('div.fixed', { hasText: 'Медиатека KIBERone' }).getByText('backup-media-47')
    ).toBeVisible();
    await page.getByRole('button', { name: 'Закрыть медиатеку' }).click();

    // Открываем журнал и проверяем загруженный скриншот + письмо наставника
    await restoredStudentBtn.click();
    await expect(pageOneCanvas).toBeVisible({ timeout: 15_000 });
    await expect(pageOneCanvas.locator('img[src^="data:image/png"]').first()).toBeVisible();

    await page.getByRole('button', { name: 'Стр. 2', exact: true }).click();
    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );
    await expect(pageTwoCanvas).toContainText(customGreeting);
  });
});
