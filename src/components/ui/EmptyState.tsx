import { Croissant, SearchX, ShoppingBasket, WifiOff } from "lucide-react";

const presets = {
  empty: {
    icon: ShoppingBasket,
    title: "篮子里空空如也",
    subtitle: "先去挑几款喜欢的面包吧",
  },
  soldOut: {
    icon: SearchX,
    title: "今日已售罄",
    subtitle: "来晚了一步，明天早点来",
  },
  offline: {
    icon: WifiOff,
    title: "网络断了",
    subtitle: "检查一下网络，或者稍后再试",
  },
  generic: {
    icon: Croissant,
    title: "这里什么都没有",
    subtitle: "面团还在发酵中",
  },
};

type PresetKey = keyof typeof presets;

interface EmptyStateProps {
  preset?: PresetKey;
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ preset, icon: CustomIcon, title, subtitle, action }: EmptyStateProps) {
  const config = preset ? presets[preset] : null;
  const Icon = CustomIcon || config?.icon || presets.generic.icon;
  const displayTitle = title || config?.title || presets.generic.title;
  const displaySubtitle = subtitle || config?.subtitle || presets.generic.subtitle;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-ember/5 blur-xl" />
        <Icon className="relative h-12 w-12 text-clay" />
      </div>
      <p className="mt-5 font-brush text-xl text-kiln">{displayTitle}</p>
      <p className="mt-1.5 font-hand text-sm text-muted">{displaySubtitle}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-kiln px-5 py-2.5 text-sm font-medium text-ash shadow-soft active:scale-95 transition-transform"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
