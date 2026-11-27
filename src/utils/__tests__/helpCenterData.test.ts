import { describe, expect, it } from 'vitest';
import {
  BACKUP_DETAILED_LESSON,
  getHelpArticlesByCategory,
  HELP_ARTICLES,
  HELP_CATEGORIES,
  POPULAR_HELP_ARTICLE_IDS,
  searchHelpArticles,
} from '../../data/helpCenterData';

describe('Task 52: Help Center Data & Offline Search', () => {
  it('содержит ровно 6 тематических категорий и все 36 обязательных вопросов', () => {
    expect(HELP_CATEGORIES).toHaveLength(6);
    expect(getHelpArticlesByCategory('groups')).toHaveLength(5);
    expect(getHelpArticlesByCategory('journals')).toHaveLength(5);
    expect(getHelpArticlesByCategory('projects')).toHaveLength(5);
    expect(getHelpArticlesByCategory('design')).toHaveLength(7);
    expect(getHelpArticlesByCategory('preview')).toHaveLength(5);
    expect(getHelpArticlesByCategory('backup')).toHaveLength(9);
    expect(HELP_ARTICLES).toHaveLength(36);
  });

  it('каждая инструкция имеет шаги, ожидаемый результат и интерактивный мини-урок для OnboardingTourOverlay', () => {
    for (const article of HELP_ARTICLES) {
      expect(article.question.length).toBeGreaterThan(5);
      expect(article.steps.length).toBeGreaterThanOrEqual(2);
      expect(article.expectedResult.length).toBeGreaterThan(10);
      expect(article.miniTourSteps.length).toBeGreaterThanOrEqual(1);
      for (const step of article.miniTourSteps) {
        expect(step.targetSelector.length).toBeGreaterThan(3);
        expect(['home', 'modules', 'groupEditor', 'preview']).toContain(
          step.route
        );
      }
    }
    expect(POPULAR_HELP_ARTICLE_IDS.length).toBeGreaterThanOrEqual(4);
  });

  it('подробный урок по резервному копированию содержит все 10 пунктов и объяснение двух режимов', () => {
    expect(BACKUP_DETAILED_LESSON.sections).toHaveLength(10);
    const fullText = BACKUP_DETAILED_LESSON.sections
      .map((s) => `${s.title} ${s.body.join(' ')} ${s.tip ?? ''}`)
      .join(' ');
    expect(fullText).toContain('Перенести и объединить данные');
    expect(fullText).toContain('Полностью восстановить базу');
    expect(fullText).toContain('ZIP');
    expect(fullText).toContain('браузера');
  });

  it('локальный оффлайн-поиск корректно находит инструкции по ключевым словам', () => {
    const bearRes = searchHelpArticles('медведя');
    expect(bearRes[0]?.id).toBe('design-move-bear');

    const overflowRes = searchHelpArticles('переполнение А4');
    expect(overflowRes.some((a) => a.id === 'preview-overflow-warning')).toBe(
      true
    );

    const backupRes = searchHelpArticles('конфликты');
    expect(backupRes.some((a) => a.id === 'backup-conflicts')).toBe(true);

    const pdfRes = searchHelpArticles('PDF');
    expect(pdfRes.some((a) => a.id === 'preview-download-pdf')).toBe(true);

    expect(searchHelpArticles('   ')).toEqual([]);
  });
});
