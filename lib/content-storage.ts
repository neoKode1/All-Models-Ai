// Content Storage Manager for Local Storage
// Handles saving and loading generated content to/from localStorage

export interface StoredContent {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text' | 'screenplay';
  url: string;
  title: string;
  prompt?: string;
  timestamp: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    size?: number;
    seed?: number; // Add seed information for reproducibility
    seedDescription?: string; // Add seed description for user display
  };
  // For multiple images
  images?: string[];
  imageCount?: number;
  selectedImageIndex?: number;
  // For screenplay projects
  screenplayData?: ScreenplayProject;
  // Storage metadata
  savedAt: Date;
  version: string;
}

export interface ScreenplayProject {
  id: string;
  title: string;
  plot: string;
  enhancedPlot: string;
  genre: string;
  era: string;
  photoStyle: string;
  duration: number;
  script: string;
  characters: Array<{
    name: string;
    imageUrl?: string;
    analysis?: string;
  }>;
  minutes: Array<{
    script: string;
    shots: Array<{
      shotNumber: number;
      shotType: string;
      camera: string;
      action: string;
      lighting: string;
      characters: string[];
      imageUrl?: string;
      generatedBy?: string;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentStorageStats {
  totalItems: number;
  totalSize: number;
  byType: {
    image: number;
    video: number;
    audio: number;
    text: number;
    screenplay: number;
  };
  oldestItem?: Date;
  newestItem?: Date;
}

export class ContentStorageManager {
  private static instance: ContentStorageManager;
  private storageKey = 'allmodelsai-generated-content';
  private version = '1.0.0';
  private maxStorageSize = 50 * 1024 * 1024; // 50MB limit
  private maxItems = 1000; // Maximum number of items to store

  private constructor() {
    this.initializeStorage();
  }

  public static getInstance(): ContentStorageManager {
    if (!ContentStorageManager.instance) {
      ContentStorageManager.instance = new ContentStorageManager();
    }
    return ContentStorageManager.instance;
  }

  private initializeStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Check if storage exists, if not create it
      const existing = localStorage.getItem(this.storageKey);
      if (!existing) {
        this.saveContent([]);
        console.log('💾 [ContentStorage] Initialized empty storage');
      }
    } catch (error) {
      console.error('❌ [ContentStorage] Failed to initialize storage:', error);
    }
  }

  // Save content to localStorage
  public saveContent(content: StoredContent[]): void {
    if (typeof window === 'undefined') return;

    try {
      // Clean up old content if we're over the limit
      const cleanedContent = this.cleanupOldContent(content);
      
      const storageData = {
        content: cleanedContent,
        lastUpdated: new Date().toISOString(),
        version: this.version
      };

      localStorage.setItem(this.storageKey, JSON.stringify(storageData));
      console.log('💾 [ContentStorage] Saved content to localStorage:', {
        itemCount: cleanedContent.length,
        totalSize: this.calculateStorageSize(cleanedContent)
      });
    } catch (error) {
      console.error('❌ [ContentStorage] Failed to save content:', error);
      // If storage is full, try to clean up and save again
      this.handleStorageFull(content);
    }
  }

  // Load content from localStorage
  public loadContent(): StoredContent[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const data = JSON.parse(stored);
      
      // Handle version migration if needed
      if (data.version !== this.version) {
        console.log('🔄 [ContentStorage] Migrating from version:', data.version, 'to:', this.version);
        return this.migrateContent(data.content, data.version);
      }

      // Convert timestamps back to Date objects and validate content
      const content = data.content
        .map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          savedAt: new Date(item.savedAt)
        }))
        .filter((item: StoredContent) => {
          // Filter out invalid content (ghost entries)
          const isValid = this.validateContentItem(item);
          if (!isValid) {
            console.warn('🚫 [ContentStorage] Filtering out invalid content item:', {
              id: item.id,
              type: item.type,
              url: item.url,
              title: item.title
            });
          }
          return isValid;
        });

      // If we filtered out any invalid items, save the cleaned content
      if (content.length !== data.content.length) {
        console.log('🧹 [ContentStorage] Cleaned up invalid content items:', {
          original: data.content.length,
          cleaned: content.length,
          removed: data.content.length - content.length
        });
        this.saveContent(content);
      }

      console.log('📂 [ContentStorage] Loaded content from localStorage:', {
        itemCount: content.length,
        version: data.version
      });

      return content;
    } catch (error) {
      console.error('❌ [ContentStorage] Failed to load content:', error);
      return [];
    }
  }

  // Add new content
  public addContent(content: Omit<StoredContent, 'savedAt' | 'version'>): void {
    // Validate content before adding
    if (!this.validateContentItem(content as StoredContent)) {
      console.error('❌ [ContentStorage] Cannot add invalid content:', {
        id: content.id,
        type: content.type,
        url: content.url,
        title: content.title
      });
      return;
    }

    const existingContent = this.loadContent();
    
    // Check if content already exists (by ID)
    const existingIndex = existingContent.findIndex(item => item.id === content.id);
    
    const newContent: StoredContent = {
      ...content,
      savedAt: new Date(),
      version: this.version
    };

    if (existingIndex >= 0) {
      // Update existing content
      existingContent[existingIndex] = newContent;
      console.log('🔄 [ContentStorage] Updated existing content:', content.id);
    } else {
      // Add new content
      existingContent.unshift(newContent); // Add to beginning
      console.log('➕ [ContentStorage] Added new content:', content.id);
    }

    this.saveContent(existingContent);
  }

  // Remove content by ID
  public removeContent(contentId: string): void {
    const existingContent = this.loadContent();
    const filteredContent = existingContent.filter(item => item.id !== contentId);
    
    if (filteredContent.length < existingContent.length) {
      this.saveContent(filteredContent);
      console.log('🗑️ [ContentStorage] Removed content:', contentId);
    }
  }

  // Clear all content
  public clearAllContent(): void {
    this.saveContent([]);
    console.log('🧹 [ContentStorage] Cleared all content');
  }

  // Clean up ghost entries and invalid content
  public cleanupGhostEntries(): number {
    const content = this.loadContent();
    const originalCount = content.length;
    
    // The loadContent method already filters out invalid items and saves cleaned content
    // This method just returns the count of items that were cleaned up
    const cleanedContent = this.loadContent();
    const cleanedCount = cleanedContent.length;
    const removedCount = originalCount - cleanedCount;
    
    if (removedCount > 0) {
      console.log('🧹 [ContentStorage] Cleaned up ghost entries:', {
        original: originalCount,
        cleaned: cleanedCount,
        removed: removedCount
      });
    }
    
    return removedCount;
  }

  // Save screenplay project
  public saveScreenplayProject(project: ScreenplayProject): void {
    const screenplayContent: StoredContent = {
      id: project.id,
      type: 'screenplay',
      url: '', // No direct URL for screenplays
      title: project.title,
      prompt: project.plot,
      timestamp: project.createdAt,
      screenplayData: project,
      savedAt: new Date(),
      version: this.version
    };

    this.addContent(screenplayContent);
    console.log('🎬 [ContentStorage] Saved screenplay project:', project.title);
  }

  // Get all screenplay projects
  public getScreenplayProjects(): ScreenplayProject[] {
    const content = this.loadContent();
    return content
      .filter(item => item.type === 'screenplay' && item.screenplayData)
      .map(item => item.screenplayData!)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get screenplay project by ID
  public getScreenplayProject(id: string): ScreenplayProject | null {
    const content = this.loadContent();
    const item = content.find(item => item.type === 'screenplay' && item.id === id);
    return item?.screenplayData || null;
  }

  // Get storage statistics
  public getStorageStats(): ContentStorageStats {
    const content = this.loadContent();
    
    const byType = {
      image: content.filter(item => item.type === 'image').length,
      video: content.filter(item => item.type === 'video').length,
      audio: content.filter(item => item.type === 'audio').length,
      text: content.filter(item => item.type === 'text').length,
      screenplay: content.filter(item => item.type === 'screenplay').length
    };

    const timestamps = content.map(item => item.timestamp).filter(Boolean);
    const oldestItem = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : undefined;
    const newestItem = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : undefined;

    return {
      totalItems: content.length,
      totalSize: this.calculateStorageSize(content),
      byType,
      oldestItem,
      newestItem
    };
  }

  // Export content as JSON
  public exportContent(): string {
    const content = this.loadContent();
    const exportData = {
      content,
      exportedAt: new Date().toISOString(),
      version: this.version,
      stats: this.getStorageStats()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import content from JSON
  public importContent(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.content || !Array.isArray(data.content)) {
        throw new Error('Invalid import data: missing content array');
      }

      // Convert timestamps and validate content
      const importedContent = data.content.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        savedAt: new Date(item.savedAt || Date.now()),
        version: this.version
      }));

      // Merge with existing content, avoiding duplicates
      const existingContent = this.loadContent();
      const existingIds = new Set(existingContent.map((item: StoredContent) => item.id));
      
      const newContent = importedContent.filter((item: StoredContent) => !existingIds.has(item.id));
      const mergedContent = [...existingContent, ...newContent];

      this.saveContent(mergedContent);
      
      console.log('📥 [ContentStorage] Imported content:', {
        imported: newContent.length,
        total: mergedContent.length
      });

      return true;
    } catch (error) {
      console.error('❌ [ContentStorage] Failed to import content:', error);
      return false;
    }
  }

  // Private helper methods
  private calculateStorageSize(content: StoredContent[]): number {
    try {
      const jsonString = JSON.stringify(content);
      return new Blob([jsonString]).size;
    } catch {
      return 0;
    }
  }

  // Validate content item to filter out ghost entries
  private validateContentItem(item: StoredContent): boolean {
    // Check if item has required fields
    if (!item.id || !item.type || !item.title) {
      return false;
    }

    // Check if URL is valid (not empty, not just whitespace, not invalid format)
    if (!item.url || item.url.trim() === '' || item.url === 'undefined' || item.url === 'null') {
      return false;
    }

    // Check if URL is a valid format (starts with http/https or data:)
    if (!item.url.startsWith('http') && !item.url.startsWith('data:')) {
      return false;
    }

    // Check if timestamp is valid
    if (!item.timestamp || isNaN(item.timestamp.getTime())) {
      return false;
    }

    // Check if type is valid
    const validTypes = ['image', 'video', 'audio', 'text', 'screenplay'];
    if (!validTypes.includes(item.type)) {
      return false;
    }

    // For screenplays, check if screenplayData exists
    if (item.type === 'screenplay' && !item.screenplayData) {
      return false;
    }

    return true;
  }

  private cleanupOldContent(content: StoredContent[]): StoredContent[] {
    let cleanedContent = [...content];

    // Remove items if we're over the item limit
    if (cleanedContent.length > this.maxItems) {
      // Sort by timestamp (oldest first) and remove oldest items
      cleanedContent.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      cleanedContent = cleanedContent.slice(-this.maxItems);
      console.log('🧹 [ContentStorage] Cleaned up old content, kept newest', this.maxItems, 'items');
    }

    // Check storage size and remove items if needed
    const currentSize = this.calculateStorageSize(cleanedContent);
    if (currentSize > this.maxStorageSize) {
      // Remove oldest items until we're under the size limit
      while (cleanedContent.length > 0 && this.calculateStorageSize(cleanedContent) > this.maxStorageSize) {
        cleanedContent.shift(); // Remove oldest item
      }
      console.log('🧹 [ContentStorage] Cleaned up content to fit storage limit');
    }

    return cleanedContent;
  }

  private handleStorageFull(content: StoredContent[]): void {
    console.warn('⚠️ [ContentStorage] Storage is full, attempting cleanup');
    
    // Try to remove oldest items and save again
    const cleanedContent = content.slice(-Math.floor(content.length * 0.8)); // Keep 80% of newest items
    this.saveContent(cleanedContent);
  }

  private migrateContent(content: any[], oldVersion: string): StoredContent[] {
    // Handle version migrations here
    console.log('🔄 [ContentStorage] Migrating content from version:', oldVersion);
    
    // For now, just update the version and timestamps
    return content.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
      savedAt: new Date(item.savedAt || Date.now()),
      version: this.version
    }));
  }
}

// Export singleton instance
export const contentStorage = ContentStorageManager.getInstance();
