import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function DynamicIcon({ name, className = '', size = 18 }: DynamicIconProps) {
  // Fallback map for common icons
  const IconComponent = (Icons as any)[name] || Icons.Folder;
  return <IconComponent className={className} size={size} />;
}
