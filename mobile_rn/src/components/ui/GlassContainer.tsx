import React from 'react';
import { View, ViewProps } from 'react-native';

interface GlassContainerProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <View 
      className={`bg-surface/50 border border-white/5 rounded-3xl overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
