// Core entity types
export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
  coverImage?: string;
  subscriptionTier: 'basic' | 'premium' | 'ultimate';
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  genre: string;
  publicationDate?: Date;
  pageCount?: number;
  language: string;
  coverImageUrl?: string;
  fileUrl: string;
  fileSize?: number;
  fileFormat: string;
  rating: number;
  downloadCount: number;
  viewCount: number;
  isFeatured: boolean;
  metadataComplete: boolean;
  publisher?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookCategory {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages?: number;
  timeSpentMinutes: number;
  lastReadAt: Date;
  isCompleted: boolean;
  completionDate?: Date;
  deviceInfo?: Record<string, any>;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  pageNumber: number;
  note?: string;
  createdAt: Date;
}

export interface UserBookList {
  id: string;
  userId: string;
  bookId: string;
  listType: 'favorites' | 'want_to_read' | 'completed' | 'currently_reading';
  addedAt: Date;
}

// UI Component types
export interface CarouselProps {
  title: string;
  books: Book[];
  category?: string;
  showArrows?: boolean;
  expandOnHover?: boolean;
  className?: string;
}

export interface FeaturedCardProps {
  book: Book;
  isExpanded: boolean;
  onExpand: (bookId: string) => void;
  onCollapse: () => void;
  position: 'left' | 'center' | 'right';
  className?: string;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  timeSpent: number;
  lastReadAt: Date;
  percentage: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookFilters {
  category?: string;
  search?: string;
  author?: string;
  genre?: string;
  language?: string;
  sortBy?: 'title' | 'author' | 'rating' | 'recent' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

// Animation and UI state types
export interface CarouselState {
  currentIndex: number;
  isScrolling: boolean;
  expandedCard: string | null;
  visibleRange: [number, number];
}

export interface CardAnimationState {
  scale: number;
  zIndex: number;
  translateX: number;
  translateY: number;
  opacity: number;
}