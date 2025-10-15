'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles } from 'lucide-react';

interface ModelOption {
  value: string;
  label: string;
  icon: string;
  isNew?: boolean;
  disabled?: boolean;
}

interface CategoryInfo {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  count: number;
}

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'text-to-image',
    label: 'Text to Image',
    emoji: '📸',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-300 dark:border-blue-600',
    description: 'Generate images from text descriptions',
    count: 16
  },
  {
    id: 'text-to-video',
    label: 'Text to Video',
    emoji: '🎬',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-300 dark:border-purple-600',
    description: 'Create videos from text prompts',
    count: 11
  },
  {
    id: 'image-to-video',
    label: 'Image to Video',
    emoji: '🖼️',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-300 dark:border-green-600',
    description: 'Animate images into videos',
    count: 24
  },
  {
    id: 'video-to-video',
    label: 'Video to Video',
    emoji: '🎭',
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-300 dark:border-yellow-600',
    description: 'Transform and edit videos',
    count: 6
  },
  {
    id: 'audio',
    label: 'Audio / Music',
    emoji: '🔊',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-300 dark:border-red-600',
    description: 'Generate audio and music',
    count: 2
  },
  {
    id: '3d',
    label: '3D Models',
    emoji: '🧊',
    color: 'text-indigo-700 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    borderColor: 'border-indigo-300 dark:border-indigo-600',
    description: 'Create 3D assets',
    count: 1
  }
];

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: string;
  onModelSelect: (model: string) => void;
  models: Record<string, ModelOption[]>;
}

export const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({
  isOpen,
  onClose,
  currentModel,
  onModelSelect,
  models
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModelsModal, setShowModelsModal] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowModelsModal(true);
  };

  const handleModelSelect = (modelValue: string) => {
    onModelSelect(modelValue);
    setShowModelsModal(false);
    onClose();
  };

  const handleBackToCategories = () => {
    setShowModelsModal(false);
    setSelectedCategory(null);
  };

  const getCurrentModelLabel = () => {
    for (const category in models) {
      const model = models[category]?.find(m => m.value === currentModel);
      if (model) return model.label;
    }
    return 'Select a model';
  };

  const categoryModels = selectedCategory ? models[selectedCategory] || [] : [];

  return (
    <>
      {/* Category Selection Modal */}
      <Dialog open={isOpen && !showModelsModal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Sparkles className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                  Select Model Category
                </DialogTitle>
                <DialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
                  Choose a category to see available AI models
                </DialogDescription>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {CATEGORIES.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${category.borderColor} ${category.bgColor} hover:scale-105`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`text-5xl`}>
                      {category.emoji}
                    </div>
                    <h3 className={`text-lg font-bold ${category.color}`}>
                      {category.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                    <Badge className={`${category.bgColor} ${category.color} border ${category.borderColor}`}>
                      {category.count} models
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Models Selection Modal */}
      <Dialog open={showModelsModal} onOpenChange={handleBackToCategories}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.emoji}
                  {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Select a model to use for generation
                </DialogDescription>
              </div>
              <button
                onClick={handleBackToCategories}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="mt-4">
            <button
              onClick={handleBackToCategories}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-4 flex items-center gap-1"
            >
              ← Back to Categories
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryModels.map((model) => (
                <Card
                  key={model.value}
                  className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                    currentModel === model.value
                      ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-950 dark:border-purple-400'
                      : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${model.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !model.disabled && handleModelSelect(model.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={model.icon}
                        alt={model.label}
                        className={`w-8 h-8 ${model.disabled ? 'opacity-50' : ''}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm ${
                            currentModel === model.value ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {model.label}
                          </span>
                          {model.isNew && (
                            <Badge className="bg-purple-500 text-white text-[10px] px-1.5 py-0">
                              NEW
                            </Badge>
                          )}
                        </div>
                        {model.disabled && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Disabled</span>
                        )}
                        {currentModel === model.value && (
                          <span className="text-xs text-purple-600 dark:text-purple-400">✓ Selected</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

