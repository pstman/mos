/**
 * Cloudflare Workers KV Database Service for PardehNegar
 * Optimized for serverless edge execution with global replication and zero-latency caching.
 */

import { BlogPost, PodcastEpisode } from './types';
import { SEED_BLOG_POSTS, SEED_PODCAST_EPISODES } from './seedData';

export const KV_BLOG_POSTS_KEY = 'blog_posts';
export const KV_POST_PREFIX = 'post:';

// In-memory fallback cache for development or when KV binding is initializing
let inMemoryPostsCache: BlogPost[] | null = null;

export class BlogKvDatabase {
  private kv?: any;

  constructor(kvNamespace?: any) {
    this.kv = kvNamespace;
  }

  /**
   * Reads all blog posts from Cloudflare KV.
   * Auto-initializes with high-fidelity seed posts if KV is empty.
   */
  async getAllPosts(): Promise<BlogPost[]> {
    if (!this.kv) {
      if (!inMemoryPostsCache) {
        inMemoryPostsCache = [...SEED_BLOG_POSTS];
      }
      return inMemoryPostsCache;
    }

    try {
      const data = await this.kv.get(KV_BLOG_POSTS_KEY, 'json');
      if (Array.isArray(data) && data.length > 0) {
        return data as BlogPost[];
      }
    } catch (err) {
      console.error('[BlogKvDatabase] Error reading from KV, falling back:', err);
    }

    // Auto-seed KV with reference articles on first run
    try {
      await this.kv.put(KV_BLOG_POSTS_KEY, JSON.stringify(SEED_BLOG_POSTS));
      for (const post of SEED_BLOG_POSTS) {
        await this.kv.put(`${KV_POST_PREFIX}${post.id}`, JSON.stringify(post));
      }
    } catch (err) {
      console.error('[BlogKvDatabase] Error seeding KV:', err);
    }

    return SEED_BLOG_POSTS;
  }

  /**
   * Retrieves a single post by ID.
   * Checks direct post key first (O(1)), then falls back to full list.
   */
  async getPostById(id: string): Promise<BlogPost | null> {
    if (!id) return null;

    if (this.kv) {
      try {
        const direct = await this.kv.get(`${KV_POST_PREFIX}${id}`, 'json');
        if (direct) {
          return direct as BlogPost;
        }
      } catch (err) {
        console.warn(`[BlogKvDatabase] Direct lookup for ${id} failed:`, err);
      }
    }

    const all = await this.getAllPosts();
    return all.find(p => p.id === id) || null;
  }

  /**
   * Creates a new blog post and commits atomically to KV.
   */
  async createPost(postInput: Partial<BlogPost>): Promise<BlogPost> {
    const title = postInput.title?.trim() || 'بدون عنوان';
    const now = new Date();

    const newPost: BlogPost = {
      id: `post_${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[\s\-_]+/g, '-').slice(0, 50),
      summary: postInput.summary?.trim() || title,
      content: postInput.content?.trim() || '',
      author: postInput.author?.trim() || 'ایمان برزجان',
      authorRole: postInput.authorRole?.trim() || 'پژوهشگر موسیقی و استودیو اینامیکس',
      date: postInput.date || now.toLocaleDateString('fa-IR'),
      category: postInput.category || 'acoustics',
      categoryLabelFa: postInput.categoryLabelFa || 'پژوهش موسیقی',
      tags: Array.isArray(postInput.tags)
        ? postInput.tags
        : typeof postInput.tags === 'string'
        ? (postInput.tags as string).split(',').map(t => t.trim()).filter(Boolean)
        : [],
      coverImageUrl: postInput.coverImageUrl?.trim() || undefined,
      audioUrl: postInput.audioUrl?.trim() || undefined,
      audioTitle: postInput.audioTitle?.trim() || undefined,
      videoUrl: postInput.videoUrl?.trim() || postInput.youtubeUrl?.trim() || undefined,
      youtubeUrl: postInput.youtubeUrl?.trim() || postInput.videoUrl?.trim() || undefined,
      readingTimeMinutes: Number(postInput.readingTimeMinutes) || 5,
      likesCount: postInput.likesCount ?? 1,
      createdAt: now.toISOString(),
    };

    const currentPosts = await this.getAllPosts();
    const updated = [newPost, ...currentPosts.filter(p => p.id !== newPost.id)];

    if (this.kv) {
      await this.kv.put(KV_BLOG_POSTS_KEY, JSON.stringify(updated));
      await this.kv.put(`${KV_POST_PREFIX}${newPost.id}`, JSON.stringify(newPost));
    } else {
      inMemoryPostsCache = updated;
    }

    return newPost;
  }

  /**
   * Updates an existing blog post in KV.
   */
  async updatePost(id: string, postInput: Partial<BlogPost>): Promise<BlogPost | null> {
    const currentPosts = await this.getAllPosts();
    const index = currentPosts.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }

    const existing = currentPosts[index];
    const updated: BlogPost = {
      ...existing,
      ...postInput,
      id: existing.id, // Immutable ID
      updatedAt: new Date().toISOString()
    };

    currentPosts[index] = updated;

    if (this.kv) {
      await this.kv.put(KV_BLOG_POSTS_KEY, JSON.stringify(currentPosts));
      await this.kv.put(`${KV_POST_PREFIX}${id}`, JSON.stringify(updated));
    } else {
      inMemoryPostsCache = currentPosts;
    }

    return updated;
  }

  /**
   * Deletes a blog post by ID from KV.
   */
  async deletePost(id: string): Promise<boolean> {
    const currentPosts = await this.getAllPosts();
    const filtered = currentPosts.filter(p => p.id !== id);
    if (filtered.length === currentPosts.length) {
      return false;
    }

    if (this.kv) {
      await this.kv.put(KV_BLOG_POSTS_KEY, JSON.stringify(filtered));
      try {
        await this.kv.delete(`${KV_POST_PREFIX}${id}`);
      } catch (err) {
        console.warn(`[BlogKvDatabase] Could not delete key ${KV_POST_PREFIX}${id}:`, err);
      }
    } else {
      inMemoryPostsCache = filtered;
    }

    return true;
  }

  /**
   * Resets KV database back to reference articles.
   */
  async resetToSeed(): Promise<BlogPost[]> {
    if (this.kv) {
      await this.kv.put(KV_BLOG_POSTS_KEY, JSON.stringify(SEED_BLOG_POSTS));
      for (const post of SEED_BLOG_POSTS) {
        await this.kv.put(`${KV_POST_PREFIX}${post.id}`, JSON.stringify(post));
      }
    }
    inMemoryPostsCache = [...SEED_BLOG_POSTS];
    return inMemoryPostsCache;
  }

  // ==================== PODCAST EPISODES (Dynamic Audio) ====================

  async getAllPodcasts(): Promise<PodcastEpisode[]> {
    if (!this.kv) {
      if (!inMemoryPodcastsCache) {
        inMemoryPodcastsCache = [...SEED_PODCAST_EPISODES];
      }
      return inMemoryPodcastsCache || [];
    }

    try {
      const data = await this.kv.get(KV_PODCASTS_KEY, 'json');
      if (Array.isArray(data) && data.length > 0) {
        return data as PodcastEpisode[];
      }
    } catch (err) {
      console.error('[BlogKvDatabase] Error reading podcasts from KV:', err);
    }

    try {
      await this.kv.put(KV_PODCASTS_KEY, JSON.stringify(SEED_PODCAST_EPISODES));
      for (const ep of SEED_PODCAST_EPISODES) {
        await this.kv.put(`${KV_PODCAST_PREFIX}${ep.id}`, JSON.stringify(ep));
      }
    } catch (err) {
      console.error('[BlogKvDatabase] Error seeding podcasts to KV:', err);
    }

    return SEED_PODCAST_EPISODES;
  }

  async getPodcastById(id: string): Promise<PodcastEpisode | null> {
    if (!id) return null;
    const podcasts = await this.getAllPodcasts();
    return podcasts.find(p => p.id === id) || null;
  }

  async createPodcast(data: Partial<PodcastEpisode>): Promise<PodcastEpisode> {
    const podcasts = await this.getAllPodcasts();
    const id = data.id || `pod_${Date.now()}`;
    const newEp: PodcastEpisode = {
      id,
      title: data.title || 'قطعه صوتی جدید',
      description: data.description || '',
      audioUrl: data.audioUrl || '',
      durationSeconds: data.durationSeconds || 180,
      durationFormatted: data.durationFormatted || '۰۳:۰۰',
      fileSizeMb: data.fileSizeMb || 3.5,
      chapterId: data.chapterId,
      chapterTitle: data.chapterTitle,
      speaker: data.speaker || 'ایمان برزجان',
      recordedDate: data.recordedDate || new Date().toLocaleDateString('fa-IR'),
      isPublished: data.isPublished !== false,
      stationRegion: data.stationRegion || 'iran_plateau',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    podcasts.unshift(newEp);

    if (this.kv) {
      await this.kv.put(KV_PODCASTS_KEY, JSON.stringify(podcasts));
      await this.kv.put(`${KV_PODCAST_PREFIX}${id}`, JSON.stringify(newEp));
    } else {
      inMemoryPodcastsCache = podcasts;
    }

    return newEp;
  }

  async updatePodcast(id: string, updates: Partial<PodcastEpisode>): Promise<PodcastEpisode | null> {
    const podcasts = await this.getAllPodcasts();
    const index = podcasts.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated: PodcastEpisode = {
      ...podcasts[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    podcasts[index] = updated;

    if (this.kv) {
      await this.kv.put(KV_PODCASTS_KEY, JSON.stringify(podcasts));
      await this.kv.put(`${KV_PODCAST_PREFIX}${id}`, JSON.stringify(updated));
    } else {
      inMemoryPodcastsCache = podcasts;
    }

    return updated;
  }

  async deletePodcast(id: string): Promise<boolean> {
    const podcasts = await this.getAllPodcasts();
    const filtered = podcasts.filter(p => p.id !== id);
    if (filtered.length === podcasts.length) return false;

    if (this.kv) {
      await this.kv.put(KV_PODCASTS_KEY, JSON.stringify(filtered));
      try {
        await this.kv.delete(`${KV_PODCAST_PREFIX}${id}`);
      } catch (err) {
        console.warn(`[BlogKvDatabase] Could not delete podcast key ${id}:`, err);
      }
    } else {
      inMemoryPodcastsCache = filtered;
    }

    return true;
  }

  async resetPodcastsToSeed(): Promise<PodcastEpisode[]> {
    if (this.kv) {
      await this.kv.put(KV_PODCASTS_KEY, JSON.stringify(SEED_PODCAST_EPISODES));
      for (const ep of SEED_PODCAST_EPISODES) {
        await this.kv.put(`${KV_PODCAST_PREFIX}${ep.id}`, JSON.stringify(ep));
      }
    }
    inMemoryPodcastsCache = [...SEED_PODCAST_EPISODES];
    return inMemoryPodcastsCache || [];
  }
}

export const KV_PODCASTS_KEY = 'podcasts_list';
export const KV_PODCAST_PREFIX = 'podcast:';
let inMemoryPodcastsCache: PodcastEpisode[] | null = null;

