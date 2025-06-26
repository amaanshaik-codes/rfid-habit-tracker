import { Button } from "@/components/ui/button";

interface CardManagerItemProps {
  card: {
    id: number;
    cardId: string;
    habitName: string;
    habitIcon: string;
    habitColor: string;
  };
  onDelete: () => void;
}

export default function CardManagerItem({ card, onDelete }: CardManagerItemProps) {
  return (
    <div className="flex items-center justify-between p-3 glass rounded-xl">
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${card.habitColor}20` }}
        >
          <i 
            className={`${card.habitIcon} text-sm`}
            style={{ color: card.habitColor }}
          />
        </div>
        <div>
          <h4 className="font-medium text-sm">{card.habitName}</h4>
          <p className="text-xs text-white/50">Card ID: {card.cardId}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="ghost"
          className="w-8 h-8 p-0 rounded-full bg-white/10 hover:bg-white/20"
        >
          <i className="fas fa-edit text-xs" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="w-8 h-8 p-0 rounded-full bg-error/20 hover:bg-error/30 text-error"
        >
          <i className="fas fa-trash text-xs" />
        </Button>
      </div>
    </div>
  );
}
