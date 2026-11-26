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

test.describe('Задача №43: Интерактивное обучение KIBERone Student Journey', () => {
  test('показывает приветственный экран при первом запуске, проводит через 8 шагов без создания демо-данных, запоминает прохождение и перезапускается через «?»', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Приветственный экран при первом запуске
    const welcome = page.getByTestId('onboarding-welcome-screen');
    await expect(welcome).toBeVisible();
    await expect(welcome.getByRole('heading', { name: 'Привет, Анна!' })).toBeVisible();
    await expect(
      welcome.getByText('Привет! Давай я покажу тебе, как здесь всё устроено')
    ).toBeVisible();

    const mascot = welcome.getByTestId('onboarding-mascot-image');
    await expect(mascot).toBeVisible();
    await expect(mascot).toHaveAttribute('src', /Bear_c58eb7c3\.png/);
    const mascotLoaded = await mascot.evaluate(
      (el: HTMLImageElement) => el.complete && el.naturalWidth > 0
    );
    expect(mascotLoaded).toBe(true);

    // Зафиксируем исходное количество записей в IndexedDB
    const countsBefore = await readDbCounts(page);

    // 2. Запуск 8-шаговой экскурсии
    await welcome.getByRole('button', { name: 'Начать знакомство' }).click();
    await expect(welcome).toBeHidden();

    const tourCard = page.getByTestId('onboarding-tour-card');
    await expect(tourCard).toBeVisible();

    // Шаг 1: Главная страница
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 1 из 8'
    );
    await expect(
      page.locator('[data-tour-id="header-nav"]')
    ).toBeVisible();

    // Шаг 2: Группы и резиденты
    await tourCard.getByRole('button', { name: 'Далее' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 2 из 8'
    );
    await expect(
      page.locator('[data-tour-id="home-group-card"]')
    ).toBeVisible();

    // Проверка кнопки «Назад»
    await tourCard.getByRole('button', { name: 'Назад' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 1 из 8'
    );
    await tourCard.getByRole('button', { name: 'Далее' }).click();

    // Шаг 3: Библиотека модулей
    await tourCard.getByRole('button', { name: 'Далее' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 3 из 8'
    );
    await expect(
      page.locator('[data-tour-id="modules-library-tabs"]')
    ).toBeVisible();

    // Шаг 4: Создание журнала (выбор резидента и отчётного периода)
    await tourCard.getByRole('button', { name: 'Далее' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 4 из 8'
    );
    await expect(
      page.locator('[data-tour-id="editor-period-section"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-tour-id="editor-students-sidebar"]')
    ).toBeVisible();

    // Шаг 5: Заполнение
    await tourCard.getByRole('button', { name: 'Далее' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 5 из 8'
    );
    await expect(
      page.locator('[data-tour-id="editor-content-inspector"]')
    ).toBeVisible();

    // Шаг 6: Дизайнер
    await tourCard.getByRole('button', { name: 'Далее' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 6 из 8'
    );
    await expect(
      page.locator('[data-tour-id="editor-design-inspector"]')
    ).toBeVisible();

    // Шаг 7: Предпросмотр
    await tourCard.getByRole('button', { name: 'Далее' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 7 из 8'
    );
    await expect(
      page.locator('[data-tour-id="preview-controls"]')
    ).toBeVisible();

    // Шаг 8: Экспорт
    await tourCard.getByRole('button', { name: 'Далее' }).click();
    await expect(page.getByTestId('onboarding-step-counter')).toHaveText(
      'Шаг 8 из 8'
    );
    await expect(
      page.locator('[data-tour-id="export-menu-button"]')
    ).toBeVisible();

    // Завершить тур
    await tourCard.getByRole('button', { name: 'Завершить' }).click();
    await expect(tourCard).toBeHidden();

    // Никакие демо-группы, ученики или журналы не создались
    const countsAfter = await readDbCounts(page);
    expect(countsAfter).toEqual(countsBefore);

    // Повторный запуск приложения не показывает приветственный экран
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Дашборд наставника' })).toBeVisible();
    await expect(page.getByTestId('onboarding-welcome-screen')).toHaveCount(0);

    // Перезапуск обучения через кнопку помощи «?»
    await page.locator('[data-tour-id="help-trigger"]').click();
    await page.getByRole('button', { name: 'Повторить тур с приветствия' }).click();
    await expect(page.getByTestId('onboarding-welcome-screen')).toBeVisible();
    await page.getByTestId('onboarding-welcome-screen').getByRole('button', { name: 'Пропустить' }).click();
    await expect(page.getByTestId('onboarding-welcome-screen')).toHaveCount(0);
  });
});
