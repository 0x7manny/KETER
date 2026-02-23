'use client';

interface CardData {
  icon?: string;
  title: string;
  subtitle?: string;
  description: string;
  tags?: string[];
}

interface CardGridProps {
  cards: CardData[];
  columns?: 2 | 3;
}

export default function CardGrid({ cards, columns = 3 }: CardGridProps) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-5 mb-6`}>
      {cards.map((card) => (
        <div key={card.title} className="bg-white border border-keter-border-light rounded-xl p-6 hover:shadow-card-hover transition-shadow">
          {card.icon && (
            <span className="text-2xl mb-3 block">{card.icon}</span>
          )}
          <h3 className="font-serif text-lg text-keter-text mb-1">{card.title}</h3>
          {card.subtitle && (
            <p className="text-xs text-keter-text-muted font-mono mb-3">{card.subtitle}</p>
          )}
          <p className="text-sm text-keter-text-secondary leading-relaxed">{card.description}</p>
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {card.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono px-2 py-0.5 bg-keter-secondary text-keter-text-secondary rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
