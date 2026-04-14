import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Icon } from './Icon';
import api from '../../api/axios';
import { GlassContainer } from './GlassContainer';

interface EditSectionModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'experience' | 'education' | 'project';
  onUpdate: () => void;
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({ visible, onClose, type, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleSave = async () => {
    if (type === 'experience' && !formData.company) return;
    if (type === 'education' && !formData.school) return;
    if (type === 'project' && !formData.title) return;

    setLoading(true);
    try {
      const endpointMap = {
        experience: '/profile/experience',
        education: '/profile/education',
        project: '/projects'
      };
      
      await api.post(endpointMap[type], formData);
      setFormData({});
      onUpdate();
      onClose();
    } catch (err) {
      console.error(`[Portfolio] Save Error (${type}):`, err);
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    experience: { title: 'Company', subtitle: 'Position', desc: 'Impact' },
    education: { title: 'Institution', subtitle: 'Degree', desc: 'GPA / Score' },
    project: { title: 'Project Title', subtitle: 'Tagline', desc: 'Description' }
  };

  const inputClass = "bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-medium mb-5";
  const labelClass = "text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2 ml-1";

  const renderFields = () => {
    const l = labels[type];
    return (
      <View>
        <Text className={labelClass}>{l.title}</Text>
        <TextInput 
          className={inputClass}
          value={formData.company || formData.school || formData.title || ''}
          onChangeText={v => setFormData({ ...formData, [type === 'experience' ? 'company' : type === 'education' ? 'school' : 'title']: v })}
          placeholder={`Enter ${l.title.toLowerCase()}...`}
          placeholderTextColor="#475569"
        />

        <Text className={labelClass}>{l.subtitle}</Text>
        <TextInput 
          className={inputClass}
          value={formData.position || formData.degree || formData.tagline || ''}
          onChangeText={v => setFormData({ ...formData, [type === 'experience' ? 'position' : type === 'education' ? 'degree' : 'tagline']: v })}
          placeholder={`Enter ${l.subtitle.toLowerCase()}...`}
          placeholderTextColor="#475569"
        />

        <View className="flex-row gap-4 mb-5">
           <View className="flex-1">
             <Text className={labelClass}>Start Date</Text>
             <TextInput 
                className="bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-medium"
                placeholder="2023-01-01"
                placeholderTextColor="#475569"
                value={formData.startDate}
                onChangeText={v => setFormData({ ...formData, startDate: v })}
             />
           </View>
           <View className="flex-1">
             <Text className={labelClass}>End Date</Text>
             <TextInput 
                className="bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white font-medium"
                placeholder="Present"
                placeholderTextColor="#475569"
                value={formData.endDate}
                onChangeText={v => setFormData({ ...formData, endDate: v })}
             />
           </View>
        </View>

        <Text className={labelClass}>{l.desc}</Text>
        <TextInput 
          className={`${inputClass} min-h-[100px] pt-4`}
          multiline
          value={formData.description}
          onChangeText={v => setFormData({ ...formData, description: v })}
          placeholder="Describe your achievements..."
          placeholderTextColor="#475569"
        />
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose}
        className="flex-1 bg-background/95 items-center justify-end"
      >
        <TouchableOpacity activeOpacity={1} className="w-full">
          <GlassContainer className="p-8 rounded-t-[3rem] border-t border-white/10 h-[80%]">
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-2xl font-black text-white italic uppercase tracking-tighter">Add {type}</Text>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Institutional Milestone</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2 bg-white/5 rounded-full">
                <Icon name="X" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {renderFields()}
              
              <TouchableOpacity 
                onPress={handleSave}
                disabled={loading}
                className={`py-5 mt-4 rounded-[2rem] items-center flex-row justify-center gap-3 ${loading ? 'bg-surface opacity-50' : 'bg-white shadow-2xl'}`}
              >
                {loading ? <ActivityIndicator color="#0f172a" /> : (
                  <>
                    <Text className="text-background font-black text-xs uppercase tracking-widest">Document Record</Text>
                    <Icon name="Save" size={16} color="#0f172a" />
                  </>
                )}
              </TouchableOpacity>
              
              <View className="h-40" />
            </ScrollView>
          </GlassContainer>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
