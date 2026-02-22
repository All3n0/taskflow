// components/KazistackLogo.tsx
import { cn } from './utils';
import KazistackSvg from '../kazistack.svg'; // Adjust path as needed

interface KazistackLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function KazistackLogo({ className, size = 32, showText = true }: KazistackLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img 
        src={KazistackSvg.src} 
        alt="Kazistack" 
        width={size} 
        height={size}
        className="flex-shrink-0"
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-tight leading-none bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            KAZISTACK
          </span>
          <span className="text-[8px] text-muted-foreground tracking-widest">
            STACK YOUR WINS
          </span>
        </div>
      )}
    </div>
  );
}