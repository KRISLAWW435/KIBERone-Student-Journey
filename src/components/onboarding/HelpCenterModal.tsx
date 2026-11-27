import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Eye,
  FilePlus2,
  FolderArchive,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  MousePointerClick,
  Palette,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  BACKUP_DETAILED_LESSON,
  getHelpArticlesByCategory,
  HELP_ARTICLES,
  HELP_CATEGORIES,
  HelpArticle,
  HelpCategoryId,
  POPULAR_HELP_ARTICLE_IDS,
  searchHelpArticles,
} from '../../data/helpCenterData';
import { OnboardingStepConfig } from '../../data/onboardingTour';
import { ASSETS } from '../../data/presets';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { HelpIllustration } from './HelpIllustrations';

export type HelpCenterLocation =
  | { kind: 'home' }
  | { kind: 'category'; categoryId: HelpCategoryId }
  | { kind: 'article'; articleId: string }
  | { kind: 'backup-lesson' };

interface HelpCenterModalProps {
  initialLocation?: HelpCenterLocation;
  onStartFullOnboarding: () => void;
  onStartMiniTour: (
    steps: OnboardingStepConfig[],
    returnLocation: HelpCenterLocation
  ) => void;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<HelpCategoryId, React.ReactNode> = {
  groups: <Users className="w-4 h-4 text-[#0D9488]" />,
  journals: <FilePlus2 className="w-4 h-4 text-[#0D9488]" />,
  projects: <ImageIcon className="w-4 h-4 text-[#0D9488]" />,
  design: <Palette className="w-4 h-4 text-[#0D9488]" />,
  preview: <Printer className="w-4 h-4 text-[#0D9488]" />,
  backup: <FolderArchive className="w-4 h-4 text-[#0D9488]" />,
};

export function HelpCenterModal({
  initialLocation = { kind: 'home' },
  onStartFullOnboarding,
  onStartMiniTour,
  onClose,
}: HelpCenterModalProps) {
  const [location, setLocation] = useState<HelpCenterLocation>(initialLocation);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const popularArticles = useMemo(
    () =>
      POPULAR_HELP_ARTICLE_IDS.map((id) =>
        HELP_ARTICLES.find((a) => a.id === id)
      ).filter((a): a is HelpArticle => Boolean(a)),
    []
  );

  const searchResults = useMemo(
    () => searchHelpArticles(searchQuery),
    [searchQuery]
  );

  const backupLessonMatchesSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false;
    return [
      'резерв',
      'копи',
      'бэкап',
      'zip',
      'перенос',
      'восстанов',
      'объедин',
      'браузер',
      'урок',
    ].some((kw) => q.includes(kw) || kw.includes(q));
  }, [searchQuery]);

  const activeCategory =
    location.kind === 'category'
      ? HELP_CATEGORIES.find((c) => c.id === location.categoryId) ?? null
      : null;

  const activeArticle =
    location.kind === 'article'
      ? HELP_ARTICLES.find((a) => a.id === location.articleId) ?? null
      : null;

  const activeArticleCategory = activeArticle
    ? HELP_CATEGORIES.find((c) => c.id === activeArticle.categoryId) ?? null
    : null;

  const categoryArticles = activeCategory
    ? getHelpArticlesByCategory(activeCategory.id)
    : [];

  const siblingArticles = activeArticle
    ? getHelpArticlesByCategory(activeArticle.categoryId)
    : [];
  const currentSiblingIdx = activeArticle
    ? siblingArticles.findIndex((a) => a.id === activeArticle.id)
    : -1;
  const prevArticle =
    currentSiblingIdx > 0 ? siblingArticles[currentSiblingIdx - 1] : null;
  const nextArticle =
    currentSiblingIdx >= 0 && currentSiblingIdx < siblingArticles.length - 1
      ? siblingArticles[currentSiblingIdx + 1]
      : null;

  const handleOpenArticle = (articleId: string) => {
    setSearchQuery('');
    setLocation({ kind: 'article', articleId });
  };

  const handleOpenCategory = (categoryId: HelpCategoryId) => {
    setSearchQuery('');
    setLocation({ kind: 'category', categoryId });
  };

  const handleOpenBackupLesson = () => {
    setSearchQuery('');
    setLocation({ kind: 'backup-lesson' });
  };

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-center-heading"
      data-testid="help-center-modal"
      className="fixed inset-0 z-[90] bg-zinc-900/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[#F6F6F3] border border-zinc-200 rounded-2xl shadow-[0_24px_60px_rgba(15,23,42,0.18)] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR */}
        <header className="bg-white border-b border-zinc-200 px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-[#0D9488]" />
            </div>
            <div className="min-w-0">
              <h2
                id="help-center-heading"
                className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight leading-tight"
              >
                Центр помощи
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Найдите ответ или узнайте, как выполнить нужное действие
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onStartFullOnboarding}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1]/80 border border-[#99F6E4] text-[#0F766E] text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Пройти обучение заново</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть центр помощи"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* SEARCH BAR */}
        <div className="bg-white/85 border-b border-zinc-200/80 px-5 sm:px-7 py-3 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по вопросам и инструкциям (например: группа, мишка, PDF, переполнение, бэкап)..."
              aria-label="Поиск по вопросам и инструкциям"
              className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-24 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15"
            />
            {hasSearch && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[11px] font-medium text-zinc-700"
              >
                Очистить
              </button>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 space-y-6">
          {hasSearch ? (
            /* LOCAL OFFLINE SEARCH RESULTS */
            <section
              aria-label="Результаты поиска"
              className="space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-zinc-900">
                  Найдено инструкций: {searchResults.length + (backupLessonMatchesSearch ? 1 : 0)}
                </h3>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-medium text-[#0D9488] hover:underline"
                >
                  Вернуться на главную справки
                </button>
              </div>

              {backupLessonMatchesSearch && (
                <div className="bg-white border-2 border-[#0D9488]/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0F766E]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Подробный урок</span>
                    </div>
                    <div className="text-sm font-bold text-zinc-900">
                      {BACKUP_DETAILED_LESSON.title}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {BACKUP_DETAILED_LESSON.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenBackupLesson}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Прочитать урок</span>
                    </button>
                  </div>
                </div>
              )}

              {searchResults.length === 0 && !backupLessonMatchesSearch ? (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-2">
                  <p className="text-sm font-bold text-zinc-900">
                    По запросу «{searchQuery}» ничего не найдено
                  </p>
                  <p className="text-xs text-zinc-500">
                    Попробуйте ввести другое слово (например: «группа», «модули», «скриншот», «мишка», «PDF», «бэкап») или выберите категорию ниже.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D9488] text-white text-xs font-semibold hover:bg-[#0F766E]"
                  >
                    Показать все категории
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {searchResults.map((article) => {
                    const cat = HELP_CATEGORIES.find(
                      (c) => c.id === article.categoryId
                    );
                    return (
                      <div
                        key={article.id}
                        className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          {cat && (
                            <div className="text-[11px] font-semibold text-[#0F766E]">
                              {cat.title}
                            </div>
                          )}
                          <div className="text-sm font-bold text-zinc-900">
                            {article.question}
                          </div>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {article.shortSummary}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenArticle(article.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#0D9488]" />
                            <span>Прочитать инструкцию</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onStartMiniTour(article.miniTourSteps, {
                                kind: 'article',
                                articleId: article.id,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold cursor-pointer"
                          >
                            <MousePointerClick className="w-3.5 h-3.5" />
                            <span>Показать на экране</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : location.kind === 'home' ? (
            /* HELP CENTER HOME */
            <>
              {/* Featured Backup Lesson Banner + Bear Mascot */}
              <section className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <img
                    src={resolveAssetUrl(ASSETS.bearTourWave)}
                    alt="Мишка KIBERone"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 select-none hidden sm:block"
                  />
                  <div className="space-y-1.5 min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0F766E]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Важный урок для управляющей</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">
                      {BACKUP_DETAILED_LESSON.title}
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl">
                      Как сохранять ZIP-копию, где её искать на компьютере, как безопасно переносить журналы на другой ПК и чем отличается объединение от полного восстановления.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleOpenBackupLesson}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Открыть подробный урок</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onStartMiniTour(BACKUP_DETAILED_LESSON.miniTourSteps, {
                        kind: 'backup-lesson',
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span>Показать на экране</span>
                  </button>
                </div>
              </section>

              {/* Popular Questions */}
              <section className="space-y-3" aria-label="Популярные вопросы">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0D9488]" />
                  <h3 className="text-sm font-bold text-zinc-900">
                    Популярные вопросы
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {popularArticles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white border border-zinc-200 hover:border-[#0D9488]/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => handleOpenArticle(article.id)}
                          className="text-left text-xs sm:text-[13px] font-bold text-zinc-900 hover:text-[#0D9488] leading-snug cursor-pointer"
                        >
                          {article.question}
                        </button>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          {article.shortSummary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenArticle(article.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[11px] font-semibold text-zinc-800 cursor-pointer"
                        >
                          <span>Прочитать</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onStartMiniTour(article.miniTourSteps, {
                              kind: 'article',
                              articleId: article.id,
                            })
                          }
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F0FDFA] hover:bg-[#CCFBF1]/70 border border-[#99F6E4] text-[#0F766E] text-[11px] font-semibold cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Показать</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Thematic Category Cards */}
              <section className="space-y-3" aria-label="Категории справки">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0D9488]" />
                  <h3 className="text-sm font-bold text-zinc-900">
                    Категории справки
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {HELP_CATEGORIES.map((category) => {
                    const catArticles = getHelpArticlesByCategory(category.id);
                    return (
                      <div
                        key={category.id}
                        data-testid={`help-category-card-${category.id}`}
                        className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between gap-3.5"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center shrink-0">
                                {CATEGORY_ICONS[category.id]}
                              </div>
                              <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                                {category.title}
                              </h4>
                            </div>
                            <span className="text-[11px] font-semibold text-zinc-500 tabular-nums shrink-0">
                              {catArticles.length} вопр.
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {category.description}
                          </p>
                          <ul className="space-y-1 pt-1 border-t border-zinc-100">
                            {catArticles.slice(0, 3).map((art) => (
                              <li key={art.id}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenArticle(art.id)}
                                  className="text-left text-xs text-zinc-700 hover:text-[#0D9488] font-medium truncate block w-full py-0.5 cursor-pointer"
                                >
                                  • {art.question}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenCategory(category.id)}
                          className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl border border-zinc-200 bg-[#F6F6F3] hover:bg-zinc-100 text-xs font-semibold text-zinc-900 transition-colors cursor-pointer"
                        >
                          <span>Открыть все вопросы ({catArticles.length})</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#0D9488]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : location.kind === 'category' && activeCategory ? (
            /* CATEGORY DETAIL VIEW */
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setLocation({ kind: 'home' })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Все категории справки</span>
              </button>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center shrink-0">
                    {CATEGORY_ICONS[activeCategory.id]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">
                      {activeCategory.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {activeCategory.description}
                    </p>
                  </div>
                </div>

                <HelpIllustration kind={activeCategory.illustration} />
              </div>

              {activeCategory.id === 'backup' && (
                <div className="bg-white border-2 border-[#0D9488]/45 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-semibold text-[#0F766E]">
                      Пошаговый разбор с иллюстрациями (10 пунктов)
                    </div>
                    <div className="text-sm font-bold text-zinc-900">
                      {BACKUP_DETAILED_LESSON.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenBackupLesson}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Открыть подробный урок</span>
                  </button>
                </div>
              )}

              <div className="space-y-2.5">
                {categoryArticles.map((article, idx) => (
                  <div
                    key={article.id}
                    className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-sm font-bold text-zinc-900">
                        {idx + 1}. {article.question}
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {article.shortSummary}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenArticle(article.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>Прочитать инструкцию</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onStartMiniTour(article.miniTourSteps, {
                            kind: 'article',
                            articleId: article.id,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold cursor-pointer"
                      >
                        <MousePointerClick className="w-3.5 h-3.5" />
                        <span>Показать на экране</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : location.kind === 'article' && activeArticle ? (
            /* INDIVIDUAL ARTICLE INSTRUCTION VIEW */
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setLocation({ kind: 'home' })}
                    className="inline-flex items-center gap-1 font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Центр помощи</span>
                  </button>
                  {activeArticleCategory && (
                    <>
                      <span className="text-zinc-300">/</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCategory(activeArticleCategory.id)
                        }
                        className="font-semibold text-[#0F766E] hover:underline cursor-pointer"
                      >
                        {activeArticleCategory.title}
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onStartMiniTour(activeArticle.miniTourSteps, {
                      kind: 'article',
                      articleId: activeArticle.id,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>Показать на экране</span>
                </button>
              </div>

              <article className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0F766E]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Пошаговая инструкция</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                    {activeArticle.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {activeArticle.shortSummary}
                  </p>
                </div>

                <HelpIllustration kind={activeArticle.illustration} />

                {activeArticle.reminder && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2.5 text-xs text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {activeArticle.reminder}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  {activeArticle.steps.map((step, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-zinc-200 bg-[#F6F6F3]/60 p-4 flex items-start gap-3.5"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#0D9488] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        {index + 1}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-zinc-900">
                            {step.title}
                          </span>
                          {step.buttonLabel && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-zinc-300 text-[11px] font-semibold text-zinc-800">
                              {step.buttonLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expected Result */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 leading-relaxed">
                    <strong className="font-bold">Ожидаемый результат:</strong>{' '}
                    {activeArticle.expectedResult}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {prevArticle && (
                      <button
                        type="button"
                        onClick={() => handleOpenArticle(prevArticle.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Предыдущий вопрос</span>
                      </button>
                    )}
                    {nextArticle && (
                      <button
                        type="button"
                        onClick={() => handleOpenArticle(nextArticle.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 cursor-pointer"
                      >
                        <span>Следующий вопрос</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onStartMiniTour(activeArticle.miniTourSteps, {
                        kind: 'article',
                        articleId: activeArticle.id,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Показать на экране</span>
                  </button>
                </div>
              </article>
            </div>
          ) : (
            /* DEDICATED DETAILED BACKUP LESSON */
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setLocation({ kind: 'home' })}
                    className="inline-flex items-center gap-1 font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Центр помощи</span>
                  </button>
                  <span className="text-zinc-300">/</span>
                  <button
                    type="button"
                    onClick={() => handleOpenCategory('backup')}
                    className="font-semibold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    6. Резервное копирование
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onStartMiniTour(BACKUP_DETAILED_LESSON.miniTourSteps, {
                      kind: 'backup-lesson',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>Показать на экране</span>
                </button>
              </div>

              <article
                data-testid="backup-detailed-lesson"
                className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0F766E]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Подробный урок для управляющей</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                    {BACKUP_DETAILED_LESSON.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {BACKUP_DETAILED_LESSON.subtitle}
                  </p>
                </div>

                <HelpIllustration kind="backup" />

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2.5 text-xs text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Главное правило перед восстановлением:</strong> всегда сначала скачайте свежую резервную копию текущих данных («Бэкап» → «Создать резервную копию»).
                  </span>
                </div>

                <div className="space-y-3.5">
                  {BACKUP_DETAILED_LESSON.sections.map((section) => (
                    <section
                      key={section.number}
                      className={`rounded-xl border p-4 space-y-2.5 ${
                        section.isWarning
                          ? 'border-red-200 bg-red-50/50'
                          : 'border-zinc-200 bg-[#F6F6F3]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 tabular-nums ${
                            section.isWarning
                              ? 'bg-red-600 text-white'
                              : 'bg-[#0D9488] text-white'
                          }`}
                        >
                          {section.number}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900">
                          {section.title}
                        </h4>
                      </div>

                      <div className="pl-8 space-y-1.5">
                        {section.body.map((paragraph, pIdx) => (
                          <p
                            key={pIdx}
                            className="text-xs text-zinc-700 leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ))}
                        {section.tip && (
                          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950">
                            <strong>Напоминание:</strong> {section.tip}
                          </div>
                        )}
                      </div>

                      {section.highlightComparison && (
                        <div className="pt-2">
                          <HelpIllustration kind="backup-compare" />
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              </article>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
