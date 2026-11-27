import { expect, Page, test } from '@playwright/test';

async function readDbCounts(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{ groups: number; residents: number; journals: number }>(
        (resolve, reject) => {
          const req = indexedDB.open('kiberone_student_journey_db');
          req.onerror = () => reject(req.error);
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction(
              ['groups', 'residents', 'journals'],
              'readonly'
            );
            const gReq = tx.objectStore('groups').count();
            const rReq = tx.objectStore('residents').count();
            const jReq = tx.objectStore('journals').count();
            tx.oncomplete = () =>
              resolve({
                groups: gReq.result,
                residents: rReq.result,
                journals: jReq.result,
              });
            tx.onerror = () => reject(tx.error);
          };
        }
      )
  );
}

test.describe('Задача 52: Центр помощи KIBERone Student Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('kiberone_student_journey_onboarding_v1', '1');
    });
  });

  test('открывает категории, ищет без интернета, показывает подробный урок по бэкапу и запускает мини-туториалы с возвратом в справку', async ({
    page,
    context,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Дашборд наставника' })
    ).toBeVisible();

    const countsBefore = await readDbCounts(page);

    // Переходим в оффлайн-режим, чтобы убедиться в полной работе без интернета
    await context.setOffline(true);

    // 1. Открываем Центр помощи по кнопке «Помощь»
    await page.locator('[data-tour-id="help-trigger"]').click();
    const helpModal = page.getByTestId('help-center-modal');
    await expect(helpModal).toBeVisible();
    await expect(
      helpModal.getByRole('heading', { name: 'Центр помощи' })
    ).toBeVisible();
    await expect(
      helpModal.getByText(
        'Найдите ответ или узнайте, как выполнить нужное действие'
      )
    ).toBeVisible();
    await expect(
      helpModal.getByRole('button', { name: 'Пройти обучение заново' })
    ).toBeVisible();
    await expect(helpModal.getByText('Популярные вопросы')).toBeVisible();

    // 2. Проверяем открытие всех 6 категорий
    const categories = [
      { id: 'groups', sampleQuestion: 'Как создать группу?' },
      { id: 'journals', sampleQuestion: 'Как заполнить письмо наставника?' },
      { id: 'projects', sampleQuestion: 'Как загрузить скриншот работы?' },
      { id: 'design', sampleQuestion: 'Как переместить медведя?' },
      {
        id: 'preview',
        sampleQuestion: 'Что означает предупреждение о переполнении А4?',
      },
      {
        id: 'backup',
        sampleQuestion: 'Чем отличается объединение данных от полного восстановления?',
      },
    ];

    for (const cat of categories) {
      await helpModal
        .getByTestId(`help-category-card-${cat.id}`)
        .getByRole('button', { name: /Открыть все вопросы/ })
        .click();
      await expect(helpModal.getByText(cat.sampleQuestion)).toBeVisible();
      await helpModal
        .getByRole('button', { name: 'Все категории справки' })
        .click();
    }

    // 3. Проверяем подробный урок по резервному копированию
    await helpModal
      .getByRole('button', { name: 'Открыть подробный урок' })
      .click();
    const backupLesson = helpModal.getByTestId('backup-detailed-lesson');
    await expect(backupLesson).toBeVisible();
    await expect(backupLesson).toContainText('Перенести и объединить данные');
    await expect(backupLesson).toContainText('Полностью восстановить базу');
    await expect(backupLesson).toContainText(
      'Почему нельзя очищать данные браузера без резервной копии'
    );

    // 4. Проверяем локальный поиск без интернета
    const searchInput = helpModal.getByLabel('Поиск по вопросам и инструкциям');
    await searchInput.fill('облачко');
    await expect(
      helpModal.getByText('Как изменить положение облачка с текстом?')
    ).toBeVisible();
    await helpModal.getByRole('button', { name: 'Очистить' }).click();

    await searchInput.fill('переключать страницы');
    await expect(
      helpModal.getByText('Как переключать страницы?')
    ).toBeVisible();

    // 5. Открываем инструкцию «Прочитать инструкцию» и запускаем многошаговый мини-туториал «Показать на экране»
    await helpModal.getByRole('button', { name: 'Прочитать инструкцию' }).first().click();
    await expect(
      helpModal.getByRole('heading', { name: 'Как переключать страницы?' })
    ).toBeVisible();
    await expect(helpModal.getByText('Ожидаемый результат:')).toBeVisible();

    await helpModal
      .getByRole('button', { name: 'Показать на экране' })
      .first()
      .click();
    await expect(helpModal).toBeHidden();

    // Должен открыться существующий OnboardingTourOverlay ровно с шагами мини-урока (Шаг 1 из 2)
    const tourCard = page.getByTestId('onboarding-tour-card');
    await expect(tourCard).toBeVisible();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 1 из 2'
    );
    await expect(
      page.locator('[data-tour-id="editor-page-switcher"]')
    ).toBeVisible();

    await tourCard.getByRole('button', { name: 'Далее' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 2 из 2'
    );
    await expect(
      page.locator('[data-tour-id="preview-controls"]')
    ).toBeVisible();

    // Назад работает корректно
    await tourCard.getByRole('button', { name: 'Назад' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 1 из 2'
    );
    await tourCard.getByRole('button', { name: 'Далее' }).click();

    // Завершение мини-урока возвращает в Центр помощи к открытой инструкции
    await tourCard
      .getByRole('button', { name: 'Завершить и вернуться' })
      .click();
    await expect(tourCard).toBeHidden();
    await expect(helpModal).toBeVisible();
    await expect(
      helpModal.getByRole('heading', { name: 'Как переключать страницы?' })
    ).toBeVisible();

    // 6. Повторный запуск основного обучения с приветствия «Привет, Анна!»
    await helpModal
      .getByRole('button', { name: 'Пройти обучение заново' })
      .click();
    await expect(helpModal).toBeHidden();
    const welcome = page.getByTestId('onboarding-welcome-screen');
    await expect(welcome).toBeVisible();
    await expect(
      welcome.getByRole('heading', { name: 'Привет, Анна!' })
    ).toBeVisible();
    await welcome.getByRole('button', { name: 'Пропустить' }).click();
    await expect(welcome).toBeHidden();

    // 7. Никакие реальные данные не изменены и тестовые группы не созданы
    const countsAfter = await readDbCounts(page);
    expect(countsAfter).toEqual(countsBefore);

    await context.setOffline(false);
  });
});
