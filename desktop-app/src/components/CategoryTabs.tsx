import * as Tabs from '@radix-ui/react-tabs';
import type { SoftwareCategory } from '../types/software';
import { CATEGORY_ORDER } from '../data/softwareData';
import { useLanguage } from '../contexts/LanguageContext';
import type { TranslationKey } from '../i18n/translations';

interface CategoryTabsProps {
  activeCategory: SoftwareCategory;
  onCategoryChange: (category: SoftwareCategory) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const { t } = useLanguage();

  return (
    <Tabs.Root value={activeCategory} onValueChange={(v) => onCategoryChange(v as SoftwareCategory)}>
      <Tabs.List className="tabs-list" aria-label="Software categories">
        {CATEGORY_ORDER.map((cat) => (
          <Tabs.Trigger key={cat} value={cat} className="tab-trigger">
            {t(`downloads.tab.${cat}` as TranslationKey)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
