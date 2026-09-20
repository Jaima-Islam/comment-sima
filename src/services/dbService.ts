import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PostItem, ChatMessage } from '../types';
import { initialPosts, initialChatMessages } from '../data/initialData';

const POSTS_COLLECTION = 'posts';
const CHATS_COLLECTION = 'chats';

const DEMO_POST_IDS = new Set([
  'post-1',
  'post-2',
  'post-3',
  'admin-comment-1',
  'admin-comment-2',
  'admin-comment-3',
]);

const DEMO_CHAT_IDS = new Set(['chat-1']);

// Subscribe to real-time posts from Firestore with auto-reconnection
export function subscribePosts(onData: (posts: PostItem[]) => void): () => void {
  let unsub: (() => void) | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  function connect() {
    if (isCancelled) return;
    try {
      const postsRef = collection(db, POSTS_COLLECTION);
      unsub = onSnapshot(
        postsRef,
        (snapshot) => {
          const seenIds = new Set<string>();
          const list: PostItem[] = [];
          snapshot.forEach((docSnap) => {
            if (DEMO_POST_IDS.has(docSnap.id) || docSnap.id.startsWith('demo-')) {
              // Permanently purge demo docs from Firestore
              deleteDoc(doc(db, POSTS_COLLECTION, docSnap.id)).catch(() => {});
              return;
            }
            if (seenIds.has(docSnap.id)) return;
            seenIds.add(docSnap.id);
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              title: data.title || '',
              content: data.content || '',
              authorName: data.authorName || 'এডমিন',
              authorRole: data.authorRole || 'admin',
              category: data.category || 'উক্তি',
              createdAt: data.createdAt || 'সম্প্রতি',
              likes: typeof data.likes === 'number' ? data.likes : 0,
              userLiked: false,
              pinned: Boolean(data.pinned),
              copiesCount: typeof data.copiesCount === 'number' ? data.copiesCount : 0,
              status: data.status === 'pending' ? 'pending' : 'active',
            });
          });

          // Sort pinned first, then preserve creation order
          list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
          onData(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, POSTS_COLLECTION);
          if (!isCancelled) {
            retryTimer = setTimeout(connect, 3000);
          }
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, POSTS_COLLECTION);
      if (!isCancelled) {
        retryTimer = setTimeout(connect, 3000);
      }
    }
  }

  connect();

  return () => {
    isCancelled = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

// Subscribe to real-time chat messages with auto-reconnection
export function subscribeChats(onData: (chats: ChatMessage[]) => void): () => void {
  let unsub: (() => void) | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  function connect() {
    if (isCancelled) return;
    try {
      const chatsRef = collection(db, CHATS_COLLECTION);
      unsub = onSnapshot(
        chatsRef,
        (snapshot) => {
          const seenIds = new Set<string>();
          const list: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            if (DEMO_CHAT_IDS.has(docSnap.id) || docSnap.id.startsWith('demo-')) {
              // Permanently purge demo chat docs from Firestore
              deleteDoc(doc(db, CHATS_COLLECTION, docSnap.id)).catch(() => {});
              return;
            }
            if (seenIds.has(docSnap.id)) return;
            seenIds.add(docSnap.id);
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              senderName: data.senderName || 'বেনামী',
              senderRole: data.senderRole || 'user',
              text: data.text || '',
              timestamp: data.timestamp || 'এখনই',
              status: data.status || 'sent',
              adminReply: data.adminReply || undefined,
            });
          });

          onData(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, CHATS_COLLECTION);
          if (!isCancelled) {
            retryTimer = setTimeout(connect, 3000);
          }
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, CHATS_COLLECTION);
      if (!isCancelled) {
        retryTimer = setTimeout(connect, 3000);
      }
    }
  }

  connect();

  return () => {
    isCancelled = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (unsub) unsub();
  };
}

// Add a new post / quote
export async function addPost(post: Omit<PostItem, 'id'>): Promise<string> {
  try {
    const payload = {
      ...post,
      status: post.status || 'active',
    };
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), payload);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, POSTS_COLLECTION);
    throw err;
  }
}

// Delete a post
export async function deletePost(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, POSTS_COLLECTION, postId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${POSTS_COLLECTION}/${postId}`);
    throw err;
  }
}

// Increment copy counter and mark as pending
export async function recordCopyAndSetPending(postId: string): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      copiesCount: increment(1),
      status: 'pending',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${POSTS_COLLECTION}/${postId}`);
  }
}

// Update post status (e.g. reactivate or set pending)
export async function updatePostStatus(postId: string, status: 'active' | 'pending'): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      status,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${POSTS_COLLECTION}/${postId}`);
    throw err;
  }
}

// Legacy recordCopy export for backward compatibility
export async function recordCopy(postId: string): Promise<void> {
  return recordCopyAndSetPending(postId);
}

// Add a new chat message
export async function addChatMessage(chat: Omit<ChatMessage, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), chat);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, CHATS_COLLECTION);
    throw err;
  }
}

// Reply to a chat message
export async function replyToChatMessage(
  chatId: string,
  replyText: string,
  adminName: string
): Promise<void> {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      status: 'replied',
      adminReply: {
        text: replyText,
        adminName,
        timestamp: 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      },
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${CHATS_COLLECTION}/${chatId}`);
    throw err;
  }
}

// Delete a chat message
export async function deleteChatMessage(chatId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CHATS_COLLECTION, chatId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${CHATS_COLLECTION}/${chatId}`);
    throw err;
  }
}
