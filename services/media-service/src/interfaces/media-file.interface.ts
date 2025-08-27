export interface MediaFile {
  id: string;
  url: string;
  thumbnailUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  userId: string;
  type: 'avatar' | 'cover' | 'post';
}