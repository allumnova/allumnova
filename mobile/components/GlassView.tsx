import React from "react";
import { View, ViewProps } from "react-native";

interface GlassViewProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
}

export function GlassView({ children, className, ...props }: GlassViewProps) {
  return (
    <View
      className={`bg-white/10 border border-white/20 rounded-3xl overflow-hidden ${className}`}
      {...props}
    >
      <View className="p-6">{children}</View>
    </View>
  );
}
