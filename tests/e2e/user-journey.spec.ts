import { expect, test } from '@playwright/test';

const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

test.describe('Полный пользовательский путь KIBERone Student Journey', () => {
  test('создание группы -> добавление ученика -> общие модули -> редактор -> слово наставника -> проект -> разворот', async ({
    page,
  }) => {
    const groupName = 'E2E Автотест · Сб 14:00';
    const studentName = 'Даниил Тестов';
    const mentorNoteText =
      'Даниил блестяще справился со всеми заданиями и собрал рабочий игровой прототип!';

    await page.goto('/');

    // Шаг 1: Открыть приложение и создать новую группу
    await page.getByRole('button', { name: 'Создать группу' }).click();

    const createModal = page.locator('form', {
      hasText: 'Создать учебную группу',
    });
    await expect(createModal).toBeVisible();

    await createModal
      .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
      .fill(groupName);
    await createModal.locator('select').first().selectOption({ index: 1 });
    await createModal.locator('input[type="date"]').nth(0).fill('2026-09-01');
    await createModal.locator('input[type="date"]').nth(1).fill('2026-12-20');
    await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

    const groupCard = page.locator('article', { hasText: groupName });
    await expect(groupCard).toBeVisible();

    // Проверка, что кнопка «Выгрузить готовые (ZIP)» не выходит за границы карточки группы
    const zipBtn = groupCard.getByRole('button', {
      name: 'Выгрузить готовые (ZIP)',
    });
    await expect(zipBtn).toBeVisible();
    const cardBox = await groupCard.boundingBox();
    const zipBox = await zipBtn.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(zipBox).not.toBeNull();
    if (cardBox && zipBox) {
      expect(zipBox.x).toBeGreaterThanOrEqual(cardBox.x - 1);
      expect(zipBox.x + zipBox.width).toBeLessThanOrEqual(
        cardBox.x + cardBox.width + 1
      );
    }

    // Шаг 2: Добавить ученика в группу через кнопку «Добавить ученика»
    await groupCard.getByRole('button', { name: 'Добавить ученика' }).click();
    await groupCard
      .getByPlaceholder('Имя и фамилия ученика')
      .fill(studentName);
    await groupCard.getByPlaceholder('Возраст').fill('10');
    await groupCard.getByRole('button', { name: 'Добавить', exact: true }).click();

    await expect(
      groupCard.getByRole('button', { name: new RegExp(studentName) })
    ).toBeVisible();

    // Открыть редактор группы и перейти в «Общие данные группы»
    await groupCard
      .getByRole('button', { name: 'Открыть редактор группы' })
      .click();

    await expect(
      page.getByRole('button', { name: 'Общие данные группы' })
    ).toBeVisible();

    // Шаг 3: Перейти в Шаг 2 («Модули»), выбрать 3 модуля из модального окна и нажать «Применить ко всем»
    await page.getByRole('button', { name: /2\s+Модули/ }).click();
    await page.getByRole('button', { name: 'Выбрать модули', exact: true }).click();

    const modulesModal = page.locator('div.fixed', {
      hasText: 'Выбор модулей программы',
    });
    await expect(modulesModal).toBeVisible();

    const moduleCheckboxes = modulesModal.locator('input[type="checkbox"]');
    await expect(moduleCheckboxes.first()).toBeVisible();

    const selectedModuleTitles: string[] = [];
    for (let i = 0; i < 3; i++) {
      const label = modulesModal.locator('label').nth(i);
      const checkbox = label.locator('input[type="checkbox"]');
      if (!(await checkbox.isChecked())) {
        await checkbox.check();
      }
      const titleText = (await label.locator('div.font-bold').innerText()).trim();
      selectedModuleTitles.push(titleText);
    }

    await modulesModal
      .getByRole('button', { name: /^Добавить \(\d+\)$/ })
      .click();
    await expect(modulesModal).toBeHidden();

    // Нажать «Применить ко всем» и дождаться перехода в «Редактор учеников»
    await page
      .getByRole('button', { name: /Применить ко всем/ })
      .first()
      .click();

    // Шаг 4: Убедиться, что открыт «Редактор учеников» и модули видны на холсте А4
    const individualTabBtn = page.getByRole('button', {
      name: 'Редактор учеников',
      exact: true,
    });
    const pageOneCanvas = page.locator(
      'main article[aria-label="Страница 1: Мой путь в мире технологий"]'
    );
    await expect(pageOneCanvas).toBeVisible({ timeout: 15_000 });
    await expect(individualTabBtn).toBeVisible();
    await expect(pageOneCanvas).toContainText(studentName);
    await expect(pageOneCanvas.locator('h3')).toHaveCount(3);

    // Шаг 5: В правой панели (Шаг 2: Модули) проверить, что модули отображаются, object-contain активен и кадрирование обновляет А4
    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });
    await inspectorNav.getByRole('button', { name: /2\. Модули/ }).click();
    await expect(page.getByText('Модули (Мои открытия)')).toBeVisible();
    await expect(page.getByText(/Активно 3 из 3/)).toBeVisible();

    const firstModuleTitle = (await pageOneCanvas.locator('h3').first().innerText()).trim();
    const firstModuleA4Img = pageOneCanvas.locator(`img[alt="${firstModuleTitle}"]`).first();
    await expect(firstModuleA4Img).toHaveCSS('object-fit', 'contain');

    await page.getByRole('button', { name: 'Кадрирование' }).first().click();
    const rightScaleSlider = page
      .locator('label', { hasText: 'Масштаб' })
      .locator('input[type="range"]')
      .first();
    await rightScaleSlider.fill('1.35');
    await expect(firstModuleA4Img).toHaveAttribute(
      'style',
      /scale\(1\.35\)/
    );

    // Проверка автозаполнения «Рекомендуемые из модулей» и подтверждения в 1 клик
    const recommendedHeader = page.getByText(/Рекомендуемые из модулей/);
    await expect(recommendedHeader).toBeVisible();
    const firstRecBtn = recommendedHeader
      .locator('..')
      .locator('..')
      .locator('button')
      .filter({ hasNotText: 'Подтвердить все' })
      .first();
    const recSkillName = (await firstRecBtn.innerText()).trim();
    await firstRecBtn.click();
    await expect(pageOneCanvas).toContainText(recSkillName);

    // Шаг 6: Переключиться на Шаг 4 («Успехи»), проверить быстрые шаблоны для «Момента гордости»
    await inspectorNav.getByRole('button', { name: /4\. Успехи/ }).click();
    await expect(page.getByText('Быстрые шаблоны (по модулям):')).toBeVisible();
    const firstPrideChip = page
      .getByText('Быстрые шаблоны (по модулям):')
      .locator('..')
      .locator('button')
      .first();
    const prideTplText = (await firstPrideChip.innerText()).trim();
    await firstPrideChip.click();

    const prideTextarea = page.getByPlaceholder(
      'Чем ученик может гордиться по итогам периода?'
    );
    await expect(prideTextarea).toHaveValue(prideTplText);

    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );
    await expect(pageTwoCanvas).toContainText(prideTplText);

    // Переключиться на Шаг 5 («Слово наставника»), проверить объединённый блок «Письмо наставника», скрытый AI и позицию плавающего редактора
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();

    await expect(page.getByText('Письмо наставника', { exact: true })).toBeVisible();
    await expect(page.getByText('AI-генерация письма')).toHaveCount(0);
    await expect(page.getByText('Наблюдения наставника')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Сгенерировать тёплое письмо/i })
    ).toHaveCount(0);

    const mentorBodyInputs = page.getByPlaceholder('Личный отзыв наставника...');
    await expect(mentorBodyInputs).toHaveCount(1);
    await mentorBodyInputs.fill(mentorNoteText);

    await expect(pageTwoCanvas).toContainText(mentorNoteText);

    // Проверка отсутствия дублирования при клике по тексту письма на холсте (открывается верхний редактор ниже полосы шагов, нижний скрывается)
    await pageTwoCanvas.getByText(mentorNoteText).click();
    const floatingEditorHeader = page.getByText('Редактирование текста · Стр. 2');
    await expect(floatingEditorHeader).toBeVisible();

    const navBox = await inspectorNav.boundingBox();
    const editorHeaderBox = await floatingEditorHeader.boundingBox();
    expect(navBox).not.toBeNull();
    expect(editorHeaderBox).not.toBeNull();
    if (navBox && editorHeaderBox) {
      expect(editorHeaderBox.y).toBeGreaterThanOrEqual(
        navBox.y + navBox.height - 1
      );
    }

    await expect(page.getByPlaceholder('Личный отзыв наставника...')).toHaveCount(
      0
    );
    await page.getByRole('button', { name: 'Закрыть редактор текста' }).click();
    await expect(page.getByPlaceholder('Личный отзыв наставника...')).toHaveCount(
      1
    );

    // Шаг 7: Переключиться на Шаг 3 («Проекты»), проверить адаптивную сетку (2 колонки, переключение 3D-модель contain / cover, 1 и 3 проекта) и обновление прогресса
    const progressBeforeText = await page
      .locator('aside')
      .first()
      .getByText(/^\d+\/5$/)
      .first()
      .innerText();
    const progressBeforeNum = Number(progressBeforeText.split('/')[0]);

    await inspectorNav.getByRole('button', { name: /3\. Проекты/ }).click();
    const projectsGrid = pageOneCanvas.locator('[data-projects-count]');
    await expect(projectsGrid).toHaveAttribute('data-projects-count', '2');
    await expect(projectsGrid).toHaveClass(/grid-cols-2/);

    const firstFileInput = page
      .locator('input[type="file"][accept*="image/png"]')
      .first();
    await firstFileInput.setInputFiles({
      name: 'screenshot-1x1.png',
      mimeType: 'image/png',
      buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
    });

    await expect(page.getByText('Скриншот загружен').first()).toBeVisible();
    await page.getByRole('button', { name: '3D-модель (contain)' }).first().click();
    await expect(projectsGrid.locator('img').first()).toHaveCSS(
      'object-fit',
      'contain'
    );
    await page.getByRole('button', { name: 'Скриншот (cover)' }).first().click();
    await expect(projectsGrid.locator('img').first()).toHaveCSS(
      'object-fit',
      'cover'
    );

    // Добавить 3-й проект -> сетка становится 3-колоночной
    await page.getByRole('button', { name: 'Добавить проект' }).click();
    await expect(projectsGrid).toHaveAttribute('data-projects-count', '3');
    await expect(projectsGrid).toHaveClass(/grid-cols-3/);

    const progressAfterText = await page
      .locator('aside')
      .first()
      .getByText(/^\d+\/5$/)
      .first()
      .innerText();
    const progressAfterNum = Number(progressAfterText.split('/')[0]);
    expect(progressAfterNum).toBeGreaterThan(progressBeforeNum);

    // Шаг 8: Нажать кнопку «Разворот» (Preview) и убедиться, что открылся полноэкранный режим с двумя страницами
    await page.getByRole('button', { name: 'Разворот' }).first().click();

    await expect(
      page.getByRole('button', { name: 'Разворот (2 стр.)' })
    ).toBeVisible();
    await expect(
      page.locator(
        'main article[aria-label="Страница 1: Мой путь в мире технологий"]'
      )
    ).toBeVisible();
    await expect(
      page.locator('main article[aria-label="Страница 2: Мои достижения"]')
    ).toBeVisible();
  });

  test('перевод ученика в группу другой локации через сгруппированный список optgroup', async ({
    page,
  }) => {
    const groupA = 'E2E Локация А · Вт 17:00';
    const groupB = 'E2E Локация Б · Чт 18:00';
    const studentName = 'Алина Переводная';

    await page.goto('/');

    // Создаём группу А в первой локации
    await page.getByRole('button', { name: 'Создать группу' }).click();
    let createModal = page.locator('form', {
      hasText: 'Создать учебную группу',
    });
    await createModal
      .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
      .fill(groupA);
    const branchSelect = createModal.locator('select').first();
    const branchOptionCount = await branchSelect.locator('option').count();
    await branchSelect.selectOption({ index: 0 });
    await createModal.locator('input[type="date"]').nth(0).fill('2026-09-01');
    await createModal.locator('input[type="date"]').nth(1).fill('2026-12-20');
    await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

    // Создаём группу Б в другой локации (если доступно >1 локации)
    await page.getByRole('button', { name: 'Создать группу' }).click();
    createModal = page.locator('form', {
      hasText: 'Создать учебную группу',
    });
    await createModal
      .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
      .fill(groupB);
    await createModal
      .locator('select')
      .first()
      .selectOption({ index: branchOptionCount > 1 ? 1 : 0 });
    await createModal.locator('input[type="date"]').nth(0).fill('2026-09-01');
    await createModal.locator('input[type="date"]').nth(1).fill('2026-12-20');
    await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

    const cardA = page.locator('article', { hasText: groupA });
    const cardB = page.locator('article', { hasText: groupB });
    await expect(cardA).toBeVisible();
    await expect(cardB).toBeVisible();

    // Добавляем ученика в группу А
    await cardA.getByRole('button', { name: 'Добавить ученика' }).click();
    await cardA.getByPlaceholder('Имя и фамилия ученика').fill(studentName);
    await cardA.getByPlaceholder('Возраст').fill('11');
    await cardA.getByRole('button', { name: 'Добавить', exact: true }).click();
    await expect(
      cardA.getByRole('button', { name: new RegExp(studentName) })
    ).toBeVisible();

    // Открываем модалку «Перевести» и проверяем optgroup со всеми локациями
    await cardA.getByRole('button', { name: 'Перевести' }).click();
    const transferModal = page.locator('form', {
      hasText: 'Перевести ученика в другую группу',
    });
    await expect(transferModal).toBeVisible();

    const targetSelect = transferModal.locator('select').nth(1);
    const optgroups = targetSelect.locator('optgroup');
    const optgroupCount = await optgroups.count();
    expect(optgroupCount).toBeGreaterThanOrEqual(1);

    const targetOptionValue = await targetSelect
      .locator('option', { hasText: groupB })
      .getAttribute('value');
    expect(targetOptionValue).toBeTruthy();
    if (targetOptionValue) {
      await targetSelect.selectOption(targetOptionValue);
    }

    await transferModal.getByRole('button', { name: 'Перевести' }).click();
    await expect(transferModal).toBeHidden();

    // Убеждаемся, что ученик перешёл в группу Б и исчез из группы А
    await expect(
      cardB.getByRole('button', { name: new RegExp(studentName) })
    ).toBeVisible();
    await expect(
      cardA.getByRole('button', { name: new RegExp(studentName) })
    ).toHaveCount(0);
  });

  test('задача 38: панели 280/420px, auto-resize, лимит 180 символов и глобальное применение дизайна', async ({
    page,
  }) => {
    const groupName = 'E2E Задача 38 · Дизайн';
    const studentA = 'Первый Ученик';
    const studentB = 'Второй Ученик';

    await page.goto('/');

    // Создаём группу с двумя учениками
    await page.getByRole('button', { name: 'Создать группу' }).click();
    const createModal = page.locator('form', {
      hasText: 'Создать учебную группу',
    });
    await createModal
      .getByPlaceholder('Например: Python Start · Вт/Чт 16:00')
      .fill(groupName);
    await createModal.locator('select').first().selectOption({ index: 0 });
    await createModal.locator('input[type="date"]').nth(0).fill('2026-09-01');
    await createModal.locator('input[type="date"]').nth(1).fill('2026-12-20');
    await createModal.getByRole('button', { name: 'Сохранить группу' }).click();

    const groupCard = page.locator('article', { hasText: groupName });
    await expect(groupCard).toBeVisible();

    for (const [name, age] of [
      [studentA, '10'],
      [studentB, '11'],
    ] as const) {
      await groupCard.getByRole('button', { name: 'Добавить ученика' }).click();
      await groupCard.getByPlaceholder('Имя и фамилия ученика').fill(name);
      await groupCard.getByPlaceholder('Возраст').fill(age);
      await groupCard.getByRole('button', { name: 'Добавить', exact: true }).click();
      await expect(
        groupCard.getByRole('button', { name: new RegExp(name) })
      ).toBeVisible();
    }

    // Открываем редактор сразу на первом ученике
    await groupCard.getByRole('button', { name: new RegExp(studentA) }).click();

    const leftSidebar = page.locator('aside').first();
    const rightSidebar = page.locator('aside').last();
    await expect(leftSidebar).toBeVisible();
    await expect(rightSidebar).toBeVisible();

    // 1. Проверяем размеры панелей по умолчанию: левая 280px, правая 420px
    const leftBox = await leftSidebar.boundingBox();
    const rightBox = await rightSidebar.boundingBox();
    expect(leftBox).not.toBeNull();
    expect(rightBox).not.toBeNull();
    if (leftBox && rightBox) {
      expect(Math.round(leftBox.width)).toBe(280);
      expect(Math.round(rightBox.width)).toBe(420);
    }

    // 2. Проверяем авто-увеличение textarea в «Письме наставника» (Приветствие / Основной текст / Подпись)
    const inspectorNav = page.getByRole('navigation', {
      name: 'Разделы журнала ученика',
    });
    await inspectorNav.getByRole('button', { name: /5\. Письмо/ }).click();

    const greetingField = page.getByPlaceholder('Саша, ты отлично поработал!');
    await expect(greetingField).toHaveJSProperty('tagName', 'TEXTAREA');
    const greetingInitialBox = await greetingField.boundingBox();
    await greetingField.fill('Привет!\nСтрока 2\nСтрока 3\nСтрока 4');
    const greetingExpandedBox = await greetingField.boundingBox();
    expect(greetingInitialBox).not.toBeNull();
    expect(greetingExpandedBox).not.toBeNull();
    if (greetingInitialBox && greetingExpandedBox) {
      expect(greetingExpandedBox.height).toBeGreaterThan(
        greetingInitialBox.height + 15
      );
    }

    const signatureField = page.getByPlaceholder('Твой наставник...');
    await expect(signatureField).toHaveJSProperty('tagName', 'TEXTAREA');

    // 3. Проверяем увеличенного мишку на 2-й странице (~214x262px)
    const pageTwoCanvas = page.locator(
      'main article[aria-label="Страница 2: Мои достижения"]'
    );
    await expect(pageTwoCanvas).toBeVisible();
    const vrBearWrapper = pageTwoCanvas.locator('[data-snap-id="nextBear"]');
    await expect(vrBearWrapper).toBeVisible();
    await expect(vrBearWrapper).toHaveCSS('width', '218px');
    await expect(vrBearWrapper).toHaveCSS('height', '266px');

    // 4. Проверяем авто-ресайз и лимит 180 символов + красную рамку в «Сильных сторонах»
    await inspectorNav.getByRole('button', { name: /4\. Успехи/ }).click();
    await page.getByRole('button', { name: 'Креативность' }).click();

    const strengthTextarea = page.getByLabel(
      'Описание сильной стороны: Креативность'
    );
    await expect(strengthTextarea).toBeVisible();
    const overLimitText = 'Очень длинное описание сильной стороны ученика '.repeat(5);
    await strengthTextarea.fill(overLimitText);
    await expect(strengthTextarea).toHaveClass(/border-red-500/);
    await expect(
      page.getByText(/Превышен лимит в 180 символов/)
    ).toBeVisible();

    // Текст на карточке А4 не выходит за границы карточки по ширине
    const strengthCardOk = await pageTwoCanvas
      .locator('p', { hasText: 'Очень длинное описание' })
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 2);
    expect(strengthCardOk).toBe(true);

    // 5. Проверяем Global Design Scope во вкладке «Дизайн»
    await rightSidebar.getByRole('button', { name: 'Дизайн' }).click();
    const scopeGroup = page.getByRole('radiogroup', {
      name: 'Область применения дизайна',
    });
    await expect(scopeGroup).toBeVisible();

    const applyAllBtn = rightSidebar.getByRole('button', {
      name: /Применить текущий дизайн ко всем в выбранной области/,
    });
    await expect(applyAllBtn).toBeDisabled();

    // Включаем «Вся группа»
    await scopeGroup.getByRole('radio', { name: 'Вся группа' }).click();
    await expect(applyAllBtn).toBeEnabled();

    // Включаем сетку выравнивания на Стр. 2 в режиме «Вся группа» -> должно примениться и ко 2-му ученику
    const gridCheckbox = rightSidebar.getByLabel('Сетка выравнивания на А4');
    await gridCheckbox.check();

    // Нажимаем кнопку пакетного применения дизайна ко всей группе и подтверждаем в модальном окне
    await applyAllBtn.click();
    const bulkConfirmDialog = page.getByRole('dialog', {
      name: 'Подтверждение применения дизайна',
    });
    await expect(bulkConfirmDialog).toBeVisible();
    await expect(bulkConfirmDialog).toContainText(
      /Вы собираетесь применить изменения к 1 резидентам\. Продолжить\?/
    );
    await bulkConfirmDialog
      .getByRole('button', { name: 'Применить', exact: true })
      .click();
    await expect(
      page.getByText(/Дизайн применён к 1 журналу \(вся группа\)/)
    ).toBeVisible();

    // Переключаемся на второго ученика и проверяем, что сетка дизайна (grid) применилась на Стр. 2, а личное имя на Стр. 1 сохранилось!
    await leftSidebar.locator('button', { hasText: studentB }).first().click();
    await expect(rightSidebar.getByLabel('Сетка выравнивания на А4')).toBeChecked();
    await rightSidebar.getByRole('button', { name: 'Стр. 1', exact: true }).click();
    const pageOneCanvas = page.locator(
      'main article[aria-label="Страница 1: Мой путь в мире технологий"]'
    );
    await expect(pageOneCanvas).toContainText(studentB);
  });
});
