export interface CommentItem {
  id: string;
  postId: string;
  authorName: string;
  authorRole: 'user' | 'admin';
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
}

export interface PostItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: 'admin';
  category?: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
  pinned?: boolean;
  copiesCount?: number;
  status?: 'active' | 'pending';
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  text: string;
  timestamp: string;
  status: 'sent' | 'replied';
  adminReply?: {
    text: string;
    adminName: string;
    timestamp: string;
  };
}

