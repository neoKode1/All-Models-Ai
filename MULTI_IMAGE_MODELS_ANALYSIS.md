# Multi-Image Capable Models Analysis

## 🎯 Models That Support Multiple Images

### 1. **Image Editing Models** (Character Addition, Scene Editing, Image Remixing)
- **`fal-ai/reve/remix`** ✨ NEW
  - **Input**: `image_urls: string[]` (1-4 images required)
  - **Purpose**: Combine/transform multiple reference images via text prompts
  - **Parameters**: `prompt` (required), `aspect_ratio` (optional: `16:9`, `9:16`, `3:2`, `2:3`, `4:3`, `3:4`, `1:1`), `output_format` (`png`, `jpeg`, `webp`), `sync_mode` (boolean)
  - **Constraints**: 
    - Each image must be less than 1.5 MB
    - Supports PNG, JPEG, WebP, AVIF, and HEIF formats
    - Can use XML img tags like `<img>0</img>` to refer to specific images by index
  - **Use Case**: Remixing multiple images, combining clothing/styles, adding objects, changing backgrounds
  - **API Route**: `/api/generate/reve-remix`

- **`fal-ai/nano-banana/edit`**
  - **Input**: `image_urls: string[]`
  - **Purpose**: Character addition, scene editing
  - **Parameters**: `aspect_ratio`, `ratio`
  - **Use Case**: Adding characters to scenes, editing multiple elements

- **`fal-ai/bytedance/seedream/v4/edit`**
  - **Input**: `image_urls: string[]`
  - **Purpose**: Professional image modification
  - **Parameters**: `image_size` (enum: `landscape_16_9`, `portrait_16_9`, `square_hd`, `auto`)
  - **Use Case**: Professional scene editing, multi-image composition

- **`fal-ai/wan-25-preview/image-to-image`**
  - **Input**: `image_urls: string[]` (up to 2 images)
  - **Purpose**: Multi-reference generation, subject-consistent editing
  - **Parameters**: `image_size`, `num_images`
  - **Use Case**: Multi-image fusion, combining elements from multiple images

### 2. **Video Generation Models** (Start/End Frame)
- **`fal-ai/veo3.1/first-last-frame-to-video`**
  - **Input**: `first_frame_url: string`, `last_frame_url: string`
  - **Purpose**: EndFrame transitions between start and end frames
  - **Parameters**: `duration` (with 's' suffix), `resolution`
  - **Use Case**: Creating smooth transitions between two frames

- **`fal-ai/veo3.1/fast/first-last-frame-to-video`**
  - **Input**: `first_frame_url: string`, `last_frame_url: string`
  - **Purpose**: Fast EndFrame transitions
  - **Parameters**: `duration` (with 's' suffix), `resolution`
  - **Use Case**: Quick transitions between frames

### 3. **Reference-Based Video Models**
- **`fal-ai/veo3.1/reference-to-video`**
  - **Input**: `image_urls: string[]` (multiple reference images)
  - **Purpose**: Video generation from multiple reference images
  - **Parameters**: `duration`, `resolution`, `generate_audio`
  - **Use Case**: Creating videos with consistent subject appearance

### 4. **Multi-Context Models**
- **`fal-ai/flux-pro/kontext/max/multi`**
  - **Input**: `image_urls: string[]`
  - **Purpose**: Multi-context image generation
  - **Parameters**: `aspect_ratio`, `num_images`
  - **Use Case**: Multi-context understanding and generation

- **`fal-ai/flux-pro/kontext/multi`**
  - **Input**: `image_urls: string[]`
  - **Purpose**: Enhanced multi-context support
  - **Parameters**: `aspect_ratio`, `num_images`
  - **Use Case**: Multi-context image generation

## 🚨 Current Issues

### 1. **Parameter Inconsistency**
- Some models use `image_urls` (array)
- Some models use `first_frame_url` + `last_frame_url` (separate parameters)
- Some models use `image_size` instead of `aspect_ratio`

### 2. **Intent Detection Mismatch**
- EndFrame intent routes to `endframe/minimax-hailuo-02` (wrong model)
- Should route to `fal-ai/veo3.1/first-last-frame-to-video`

### 3. **Model Capability Confusion**
- Minimax Hailuo 02 is image-to-video (single image), not EndFrame
- EndFrame functionality needs proper start/end frame models

## 💡 Recommended Solutions

### 1. **Standardize Multi-Image Handling**
```typescript
interface MultiImageModel {
  modelId: string;
  inputType: 'image_urls' | 'first_last_frames' | 'reference_images';
  maxImages: number;
  parameters: string[];
  useCase: string;
}
```

### 2. **Update Intent Detection**
- EndFrame → `fal-ai/veo3.1/first-last-frame-to-video`
- Image Remix/Combine → `fal-ai/reve/remix` ✨
- Character Addition → `fal-ai/nano-banana/edit`
- Scene Editing → `fal-ai/bytedance/seedream/v4/edit`
- Multi-Composition → `fal-ai/wan-25-preview/image-to-image`

### 3. **Create Model-Specific Handlers**
- Separate handlers for each input type
- Proper parameter mapping for each model
- Validation based on model capabilities
