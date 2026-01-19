'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { REMINDER_TEMPLATES, type ReminderTemplate, type TemplateCategory } from '@/lib/types';
import { ArrowLeft, Droplet, Eye, Activity, Timer, Moon, Plus, Check } from 'lucide-react';
import { useMemo } from 'react';

interface ReminderTemplatesProps {
  onSelect: () => void;
  onBack: () => void;
}

const ICONS: Record<string, typeof Droplet> = {
  droplet: Droplet,
  eye: Eye,
  activity: Activity,
  timer: Timer,
  moon: Moon,
};

const CATEGORY_ORDER: TemplateCategory[] = ['Health', 'Productivity', 'Religious'];

export function ReminderTemplates({ onSelect, onBack }: ReminderTemplatesProps) {
  const { addReminder, getReminders, state } = useStore();
  const existingReminders = getReminders();

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped = new Map<TemplateCategory, ReminderTemplate[]>();
    CATEGORY_ORDER.forEach((cat) => grouped.set(cat, []));

    REMINDER_TEMPLATES.forEach((template) => {
      const list = grouped.get(template.category) ?? [];
      list.push(template);
      grouped.set(template.category, list);
    });

    return grouped;
  }, []);

  // Check if template is already enabled
  const isTemplateEnabled = (templateId: string) => {
    return existingReminders.some((r) => r.templateId === templateId);
  };

  const handleEnableTemplate = (template: ReminderTemplate) => {
    // Build config based on template type
    let config;
    switch (template.defaultConfig.type) {
      case 'interval':
        config = {
          type: 'interval' as const,
          intervalMinutes: template.defaultConfig.intervalMinutes,
        };
        break;
      case 'fixed-time':
        config = {
          type: 'fixed-time' as const,
          time: template.defaultConfig.time,
          days: template.defaultConfig.days ?? [],
        };
        break;
      case 'prayer':
        // Prayer times need location - for now create with all prayers
        config = {
          type: 'prayer' as const,
          prayers: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as ('Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha')[],
          minutesBefore: 0,
        };
        // Check if location is set
        if (!state.userLocation) {
          // Could show location picker here, for now just create anyway
        }
        break;
    }

    addReminder({
      title: template.name,
      message: template.description,
      config,
      enabled: true,
      scope: 'always',
      templateId: template.id,
    });

    onSelect();
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="-ml-2">
        <ArrowLeft className="mr-2 size-4" />
        Back
      </Button>

      {/* Templates by category */}
      {CATEGORY_ORDER.map((category) => {
        const templates = templatesByCategory.get(category) ?? [];
        if (templates.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {category}
            </h3>
            <div className="space-y-2">
              {templates.map((template) => {
                const IconComponent = ICONS[template.icon] ?? Timer;
                const enabled = isTemplateEnabled(template.id);

                return (
                  <div
                    key={template.id}
                    className="flex items-start gap-3 rounded-lg border p-4"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <IconComponent className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {template.description}
                      </p>
                    </div>
                    <Button
                      variant={enabled ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleEnableTemplate(template)}
                      disabled={enabled}
                      className="shrink-0"
                    >
                      {enabled ? (
                        <>
                          <Check className="mr-1 size-3" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <Plus className="mr-1 size-3" />
                          Enable
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
