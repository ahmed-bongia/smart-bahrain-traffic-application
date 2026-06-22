interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-xs text-text-tertiary -mt-0.5">{subtitle}</p>
        )}
      </div>
    </header>
  );
}

