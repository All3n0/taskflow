// components/KazistackLogo.tsx
import Image from 'next/image';
import { cn } from './utils';

interface KazistackLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function KazistackLogo({ className, size = 32, showText = true }: KazistackLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image 
        src="/kazistackLogo.png"  // Your PNG file
        alt="Kazistack" 
        width={size} 
        height={size}
        className="flex-shrink-0"
        priority
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-tight leading-none">KAZISTACK</span>
          <span className="text-[8px] text-muted-foreground tracking-widest">TASK MANAGEMENT</span>
        </div>
      )}
    </div>
  );
}