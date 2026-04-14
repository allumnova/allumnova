import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { GlassContainer } from './GlassContainer';

interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  description?: string;
  metadata?: string;
}

interface PortfolioSectionProps {
  title: string;
  icon: any;
  items: PortfolioItem[];
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  emptyMessage?: string;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ 
  title, 
  icon, 
  items, 
  onAdd, 
  onEdit,
  emptyMessage = "No documented records yet." 
}) => {
  return (
    <View className="mb-10">
      <View className="flex-row items-center justify-between mb-6 px-2">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
            <Icon name={icon} size={18} color="#6366f1" />
          </View>
          <Text className="text-white text-lg font-black uppercase tracking-tighter italic">{title}</Text>
        </View>
        
        {onAdd && (
          <TouchableOpacity 
            onPress={onAdd}
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/5"
          >
            <Icon name="Plus" size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {items.length > 0 ? (
        items.map((item, index) => (
          <GlassContainer key={item.id} className="mb-4 p-6">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-4">
                <Text className="text-white font-bold text-base">{item.title}</Text>
                <Text className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">{item.subtitle}</Text>
              </View>
              <Text className="text-slate-500 text-[10px] font-bold uppercase">{item.dateRange}</Text>
            </View>

            {item.description && (
              <Text className="text-slate-400 text-xs leading-5 mt-2 font-medium">
                {item.description}
              </Text>
            )}

            {item.metadata && (
              <View className="mt-4 pt-4 border-t border-white/5">
                <Text className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">
                  {item.metadata}
                </Text>
              </View>
            )}

            {onEdit && (
              <TouchableOpacity 
                onPress={() => onEdit(item.id)}
                className="absolute top-4 right-4 p-2"
              >
                <Icon name="Edit3" size={14} color="#475569" />
              </TouchableOpacity>
            )}
          </GlassContainer>
        ))
      ) : (
        <View className="py-8 items-center bg-white/5 rounded-3xl border border-dashed border-white/10 mx-2">
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
};
