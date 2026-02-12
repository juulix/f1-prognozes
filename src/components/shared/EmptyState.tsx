interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
}

export function EmptyState({ emoji = "🏎️", title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-3">{emoji}</span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
    </div>
  );
}
