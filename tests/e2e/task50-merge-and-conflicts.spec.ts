import { expect, test } from '@playwright/test';

test.describe('Задача 50: Объединение данных и разрешение конфликтов', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('kiberone_student_journey_onboarding_v1', '1');
    });
  });

  test('3 режима, объединение новых записей с сохранением локальных, конфликт двух версий и выбор версии', async ({
    page,
  }, testInfo) => {
    const sharedGroup = 'E2E 50 · Общая группа';
    const sharedStudent = 'Егор Синхронов';
    const localOnlyGroup = 'E2E 50 · Только локальная';

    await page.goto('/');

    // 1. Создаём общую группу и ученика на ПК1
    await page.getByRole('button', { name: 'Создать группу' }).click();
    const createModal = page.locator('form', {
      hasText: 'Создать учебную группу',
    });
    await createModal
      .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
      .fill(sharedGroup);
    await createModal.locator('select').first().selectOption({ index: 0 });
    await createModal.locator('input[type="date"]').nth(0).fill('2026-09-01');
    await createModal.locator('input[type="date"]').nth(1).fill('2026-12-25');
    await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

    const sharedCard = page.locator('article', { hasText: sharedGroup });
    await expect(sharedCard).toBeVisible();

    await sharedCard.getByRole('button', { name: 'Добавить ученика' }).click();
    await sharedCard.getByPlaceholder('Имя и фамилия ученика').fill(sharedStudent);
    await sharedCard.getByPlaceholder('Возраст').fill('11');
    await sharedCard.getByRole('button', { name: 'Добавить', exact: true }).click();
    await expect(
      sharedCard.getByRole('button', { name: new RegExp(sharedStudent) })
    ).toBeVisible();

    // 2. Создаём бэкап №1 (снимок состояния до расхождения)
    await page.getByRole('button', { name: 'Бэкап', exact: true }).click();
    const backupDialog = page.getByRole('dialog', {
      name: 'Резервное копирование и перенос данных',
    });
    await expect(backupDialog).toBeVisible();

    // Проверяем упрощённый интерфейс (Задача 51): ровно 2 режима без "Импортировать обновления"
    await expect(
      backupDialog.getByRole('radio', { name: /Перенести и объединить данные/ })
    ).toBeVisible();
    await expect(
      backupDialog.getByRole('radio', { name: /Полностью восстановить базу/ })
    ).toBeVisible();
    await expect(backupDialog.getByText('Импортировать обновления')).toHaveCount(
      0
    );

    const dl1Promise = page.waitForEvent('download');
    await backupDialog
      .getByRole('button', { name: 'Создать резервную копию' })
      .click();
    const dl1 = await dl1Promise;
    const backup1Path = testInfo.outputPath('pc1-base.zip');
    await dl1.saveAs(backup1Path);

    await backupDialog
      .getByRole('button', { name: 'Закрыть окно резервного копирования' })
      .click();

    // 3. Имитируем изменения на ПК2: меняем письмо наставника и создаём архив ПК2
    await sharedCard
      .getByRole('button', { name: new RegExp(sharedStudent) })
      .click();
    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();
    await page
      .getByPlaceholder('Личный отзыв наставника...')
      .fill('Текст из архива второго компьютера');
    await page.getByRole('button', { name: 'К группам' }).click();

    await page.getByRole('button', { name: 'Бэкап', exact: true }).click();
    const dl2Promise = page.waitForEvent('download');
    await backupDialog
      .getByRole('button', { name: 'Создать резервную копию' })
      .click();
    const dl2 = await dl2Promise;
    const backup2Path = testInfo.outputPath('pc2-edited.zip');
    await dl2.saveAs(backup2Path);
    await backupDialog
      .getByRole('button', { name: 'Закрыть окно резервного копирования' })
      .click();

    // 4. Откатываемся на снимок ПК1 (через полное восстановление backup1Path) и делаем независимые правки на ПК1 + создаём локальную группу
    await page.getByRole('button', { name: 'Бэкап', exact: true }).click();
    await backupDialog
      .getByRole('radio', { name: /Полностью восстановить базу/ })
      .check();
    await backupDialog.locator('input[type="file"]').setInputFiles(backup1Path);
    await backupDialog
      .getByRole('button', { name: 'Подтвердить и восстановить' })
      .click();
    await expect(backupDialog).toBeHidden();

    // Редактируем тот же журнал на ПК1 (создаём конфликт!)
    await page
      .locator('article', { hasText: sharedGroup })
      .getByRole('button', { name: new RegExp(sharedStudent) })
      .click();
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();
    await page
      .getByPlaceholder('Личный отзыв наставника...')
      .fill('Локальный текст первого компьютера');
    await page.getByRole('button', { name: 'К группам' }).click();

    // Создаём локальную группу, которой нет в backup2Path
    await page.getByRole('button', { name: 'Создать группу' }).click();
    await createModal
      .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
      .fill(localOnlyGroup);
    await createModal.locator('select').first().selectOption({ index: 0 });
    await createModal.locator('input[type="date"]').nth(0).fill('2026-09-01');
    await createModal.locator('input[type="date"]').nth(1).fill('2026-12-25');
    await createModal.getByRole('button', { name: 'Сохранить группу' }).click();
    await expect(
      page.locator('article', { hasText: localOnlyGroup })
    ).toBeVisible();

    // 5. Открываем Бэкап в режиме «Перенести и объединить данные» и загружаем backup2Path
    await page.getByRole('button', { name: 'Бэкап', exact: true }).click();
    await backupDialog
      .getByRole('radio', { name: /Перенести и объединить данные/ })
      .check();
    await backupDialog.locator('input[type="file"]').setInputFiles(backup2Path);

    const previewRegion = backupDialog.getByRole('region', {
      name: 'Подтверждение восстановления из резервной копии',
    });
    await expect(previewRegion).toBeVisible();

    // В предпросмотре тоже доступны только 2 понятных действия
    await expect(
      previewRegion.getByRole('radio', { name: /Перенести и объединить данные/ })
    ).toBeVisible();
    await expect(
      previewRegion.getByRole('radio', { name: /Полностью восстановить базу/ })
    ).toBeVisible();
    await expect(previewRegion.getByText('Импортировать обновления')).toHaveCount(
      0
    );

    // Проверяем предварительный просмотр и обнаружение конфликта
    await expect(previewRegion).toContainText('Новые записи');
    await expect(previewRegion).toContainText('Обновления');
    await expect(previewRegion).toContainText('Без изменений');
    await expect(previewRegion).toContainText('Конфликты');
    await expect(
      previewRegion.getByText(/Найдены изменения на обоих компьютерах \(1\)/)
    ).toBeVisible();
    await expect(previewRegion).toContainText(`Журнал: ${sharedStudent}`);
    await expect(previewRegion).toContainText('Версия на этом компьютере');
    await expect(previewRegion).toContainText('Версия из загруженного файла');
    await expect(previewRegion).toContainText('Поступила с другого компьютера');

    // Кнопка подтверждения заблокирована до явного выбора версии
    const confirmBtn = previewRegion.getByRole('button', {
      name: 'Подтвердить и объединить',
    });
    await expect(confirmBtn).toBeDisabled();

    // Выбираем версию из файла и подтверждаем
    await previewRegion
      .getByRole('button', { name: /Версия из загруженного файла/ })
      .click();
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();
    await expect(backupDialog).toBeHidden();

    // 6. Проверяем: локальная группа сохранилась, дубликатов нет, выбранная версия применилась
    await expect(
      page.locator('article', { hasText: localOnlyGroup })
    ).toBeVisible();
    await expect(
      page.locator('article', { hasText: sharedGroup })
    ).toHaveCount(1);

    await page
      .locator('article', { hasText: sharedGroup })
      .getByRole('button', { name: new RegExp(sharedStudent) })
      .click();
    await page.getByRole('button', { name: 'Стр. 2', exact: true }).click();
    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );
    await expect(pageTwoCanvas).toContainText(
      'Текст из архива второго компьютера'
    );
    expect(await pageTwoCanvas.innerText()).not.toContain(
      'Локальный текст первого компьютера'
    );
  });
});
