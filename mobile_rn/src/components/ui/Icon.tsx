import React from 'react';
import * as Icons from 'lucide-react-native';

// Allumnova Institutional Icon Proxy
// This architecture ensures total technical stability by wrapping the library-level
// type conflicts and providing a clean, 'Zero-Red' interface for the platform.

export type IconName = keyof typeof Icons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#6366f1',
  strokeWidth = 2 
}) => {
  const IconComponent = Icons[name] as any;
  
  if (!IconComponent) return null;

  return (
    <IconComponent 
      size={size} 
      color={color} 
      strokeWidth={strokeWidth} 
    />
  );
};
