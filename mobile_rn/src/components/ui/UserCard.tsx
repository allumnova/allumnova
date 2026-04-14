import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Icon } from './Icon';
import { GlassContainer } from './GlassContainer';
import { User } from '../../types';

interface UserCardProps {
  user: Partial<User>;
  onPress?: () => void;
  onAction?: () => void;
  actionIcon?: any;
  actionColor?: string;
  actionLabel?: string;
  secondaryAction?: () => void;
  secondaryIcon?: any;
  showActions?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onPress, 
  onAction, 
  actionIcon = 'UserPlus', 
  actionColor = '#6366f1',
  actionLabel,
  secondaryAction,
  secondaryIcon = 'X',
  showActions = true 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-4"
    >
      <GlassContainer className="p-5 flex-row items-center gap-4">
        {/* 🎭 Avatar Sphere */}
        <View className="w-16 h-16 rounded-luxury bg-surface border border-white/10 items-center justify-center overflow-hidden shadow-lg shadow-black/20">
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} className="w-full h-full object-cover" />
          ) : (
            <Text className="text-white text-xl font-black">{user.name?.charAt(0) || '?'}</Text>
          )}
        </View>

        {/* 📝 Identity Zone */}
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-2 mb-0.5">
            <Text className="text-white font-black text-sm uppercase tracking-tight truncate" numberOfLines={1}>
              {user.name}
            </Text>
            {user.tierLevel && (
              <View className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md">
                <Text className="text-blue-400 text-[8px] font-black uppercase tracking-tighter">{user.tierLevel}</Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center gap-3">
             <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
               {user.department || 'Institutional'}
             </Text>
             {user.reputationScore !== undefined && (
               <View className="flex-row items-center gap-1 group">
                 <Icon name="Sparkles" size={10} color="#fbbf24" strokeWidth={3} />
                 <Text className="text-amber-500 text-[10px] font-black">{user.reputationScore}</Text>
               </View>
             )}
          </View>
        </View>

        {/* ⚡ Action Hub */}
        {showActions && (
          <View className="flex-row gap-2">
            {secondaryAction && (
              <TouchableOpacity 
                onPress={secondaryAction}
                className="w-10 h-10 bg-white/5 rounded-xl items-center justify-center border border-white/5"
              >
                <Icon name={secondaryIcon} size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={onAction}
              style={{ backgroundColor: actionColor + '20' }}
              className="px-4 h-10 rounded-xl items-center justify-center flex-row gap-2 border border-white/10"
            >
              <Icon name={actionIcon} size={16} color={actionColor} />
              {actionLabel && (
                <Text style={{ color: actionColor }} className="text-[10px] font-black uppercase tracking-widest">
                  {actionLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </GlassContainer>
    </TouchableOpacity>
  );
};
