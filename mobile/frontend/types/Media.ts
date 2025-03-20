export interface Media {
    id: number;
    url: string;
    type: MediaType;
    mimeType?: string;
    extension?: FileExtension;
    filename?: string;
    size?: number;
    width?: number;
    height?: number;
    duration?: number;
  }
  
  export enum MediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT",
    OTHER = "OTHER"
  }
  
  export enum FileExtension {
    JPG = "JPG",
    JPEG = "JPEG",
    PNG = "PNG",
    GIF = "GIF",
    SVG = "SVG",
    PDF = "PDF",
    DOC = "DOC",
    DOCX = "DOCX",
    XLS = "XLS",
    XLSX = "XLSX",
    MP4 = "MP4",
    MOV = "MOV",
    AVI = "AVI",
    MP3 = "MP3",
    WAV = "WAV",
    OTHER = "OTHER"
  }
  
  