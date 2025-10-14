'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface ModelOption {
  value: string;
  label: string;
  icon: string;
  category: ModelCategory;
  isNew?: boolean;
  disabled?: boolean;
}

export type ModelCategory = 
  | 'text-to-image'
  | 'text-to-video'
  | 'image-to-video'
  | 'video-to-video'
  | 'video-to-audio'
  | 'audio'
  | 'avatar'
  | 'vision'
  | '3d'
  | 'training'
  | 'image-edit'
  | 'utility';

interface CategoryInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
}

const CATEGORY_INFO: Record<ModelCategory, CategoryInfo> = {
  'text-to-image': {
    label: 'Text to Image',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    emoji: '📸'
  },
  'text-to-video': {
    label: 'Text to Video',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    emoji: '🎬'
  },
  'image-to-video': {
    label: 'Image to Video',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    emoji: '🖼️'
  },
  'video-to-video': {
    label: 'Video to Video',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    emoji: '🎭'
  },
  'video-to-audio': {
    label: 'Video to Audio',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    emoji: '🎤'
  },
  'audio': {
    label: 'Audio / TTS',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emoji: '🔊'
  },
  'avatar': {
    label: 'Avatar / Lipsync',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    emoji: '🎭'
  },
  'vision': {
    label: 'Vision / Detection',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    emoji: '👁️'
  },
  '3d': {
    label: '3D Models',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    emoji: '🧊'
  },
  'training': {
    label: 'Training / LoRA',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    emoji: '🎓'
  },
  'image-edit': {
    label: 'Image Editing',
    color: 'text-fuchsia-700',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-200',
    emoji: '🎨'
  },
  'utility': {
    label: 'Utility',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    emoji: '🛠️'
  }
};

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  models: ModelOption[];
}

export function ModelSelector({ value, onValueChange, models }: ModelSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | 'all'>('all');

  // Get unique categories from models
  const categories = Array.from(new Set(models.map(m => m.category)));

  // Filter models by category
  const filteredModels = selectedCategory === 'all' 
    ? models 
    : models.filter(m => m.category === selectedCategory);

  // Group models by category for display
  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<ModelCategory, ModelOption[]>);

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Models
        </button>
        {categories.map((category) => {
          const info = CATEGORY_INFO[category];
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                selectedCategory === category
                  ? `${info.bgColor} ${info.color} ${info.borderColor} border-2`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="mr-1">{info.emoji}</span>
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Model Dropdown */}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {Object.entries(groupedModels).map(([category, categoryModels]) => {
            const info = CATEGORY_INFO[category as ModelCategory];
            return (
              <div key={category} className="py-1">
                {/* Category Header */}
                <div className={`px-2 py-1.5 text-xs font-semibold ${info.color} ${info.bgColor} border-l-2 ${info.borderColor} mb-1`}>
                  <span className="mr-1">{info.emoji}</span>
                  {info.label}
                </div>
                
                {/* Models in Category */}
                {categoryModels.map((model) => (
                  <SelectItem 
                    key={model.value} 
                    value={model.value}
                    disabled={model.disabled}
                    className={model.disabled ? 'opacity-50' : ''}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <img 
                        src={model.icon} 
                        alt={model.label} 
                        className={`w-4 h-4 ${model.disabled ? 'opacity-50' : ''}`} 
                      />
                      <span className="flex-1">{model.label}</span>
                      {model.isNew && (
                        <Badge className="bg-purple-500 text-white text-[10px] px-1.5 py-0">
                          NEW
                        </Badge>
                      )}
                      {model.disabled && (
                        <span className="text-[10px] text-gray-400">Disabled</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>

      {/* Selected Model Info */}
      {value && (() => {
        const selectedModel = models.find(m => m.value === value);
        if (!selectedModel) return null;
        const info = CATEGORY_INFO[selectedModel.category];
        return (
          <div className={`text-xs ${info.color} ${info.bgColor} border ${info.borderColor} rounded-lg px-3 py-2`}>
            <span className="font-medium">{info.emoji} {info.label}</span>
            {selectedModel.isNew && (
              <Badge className="ml-2 bg-purple-500 text-white text-[10px] px-1.5 py-0">
                NEW
              </Badge>
            )}
          </div>
        );
      })()}
    </div>
  );
}

