
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Zap, Quote, Flame, Shield, ArrowUpRight, MessageSquare, 
  Handshake, Plus, X, Send, Sparkles, Filter, Heart, Trash2, 
  AlertCircle, UserPlus, UserCheck, Search, Scale, Brain, 
  Anchor, Gavel, ChevronLeft, Target, Check, Clock, Trophy, History 
} from 'lucide-react';
import SovereignAvatar from './SovereignAvatar';
import sql from '../db';

type ReactionType = 'wisdom' | 'courage' | 'temperance' | 'justice' | 'like';

interface ReactionData {
  wisdom: number;
  courage: number;
  temperance: number;
  justice: number;
  like: number;
}

interface SocialComment {
  id: string;
  user: {
    name: string;
    identity: string;
    avatar: string | null;
  };
  content: string;
  time: string;
}

interface SocialPost {
  id: string;
  user: {
    name: string;
    identity: string;
    avatar: string | null;
  };
  type: 'achievement' | 'reflection' | 'intention';
  content: string;
  metric?: string;
  nods: number;
  reactions: ReactionData;
  userReaction?: ReactionType | null;
  comments: SocialComment[];
  time: string;
}

interface Follower {
  id: string;
  name: string;
  identity: string;
  avatar: string | null;
  consistency: number;
  isMutual: boolean;
  streak?: number;
  focusHours?: number;
}

interface SocialProps {
  user_uid: string;
  onFollowChange?: (delta: number) => void;
  currentFollowingCount?: number;
  currentUserName: string;
  currentUserAvatar: string | null;
  currentUserIdentity: string;
}

const REACTION_CONFIG: Record<ReactionType, { icon: React.ReactNode, label: string, color: string, bg: string }> = {
  wisdom: { icon: <Brain size={14} />, label: 'Wisdom', color: 'text-amber-600', bg: 'bg-amber-50' },
  courage: { icon: <Flame size={14} />, label: 'Courage', color: 'text-orange-600', bg: 'bg-orange-50' },
  temperance: { icon: <Anchor size={14} />, label: 'Temperance', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  justice: { icon: <Gavel size={14} />, label: 'Justice', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  like: { icon: <Heart size={14} />, label: 'Appreciate', color: 'text-rose-600', bg: 'bg-rose-50' }
};

const Social: React.FC<SocialProps> = ({ 
  user_uid,
  onFollowChange, 
  currentFollowingCount, 
  currentUserName, 
  currentUserAvatar,
  currentUserIdentity 
}) => {
  const [viewMode, setViewMode] = useState<'feed' | 'followers'>('feed');
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'achievement' | 'reflection' | 'intention'>('intention');
  const [newPostMetric, setNewPostMetric] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'achievement' | 'reflection' | 'intention' | 'following'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set(['Seneca']));
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  
  const [selectedProfile, setSelectedProfile] = useState<Follower | null>(null);

  const [posts, setPosts] = useState<SocialPost[]>([]);

  // Fetch Posts with reactions and comments
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await sql`
          SELECT p.*, u.name as user_name, u.identity as user_identity, u.avatar as user_avatar
          FROM social_posts p
          JOIN users u ON p.user_uid = u.uid
          ORDER BY p.created_at DESC
        `;

        const allReactions = await sql`SELECT * FROM social_reactions`;
        const allComments = await sql`
          SELECT c.*, u.name as user_name, u.avatar as user_avatar, u.identity as user_identity
          FROM social_comments c
          JOIN users u ON c.user_uid = u.uid
          ORDER BY c.created_at ASC
        `;

        setPosts(postsData.map(p => {
          const postReactions = allReactions.filter(r => r.post_id === p.id);
          const postComments = allComments.filter(c => c.post_id === p.id);
          
          const reactionCounts: Record<string, number> = {
            wisdom: postReactions.filter(r => r.type === 'wisdom').length,
            courage: postReactions.filter(r => r.type === 'courage').length,
            temperance: postReactions.filter(r => r.type === 'temperance').length,
            justice: postReactions.filter(r => r.type === 'justice').length,
            like: postReactions.filter(r => r.type === 'like').length,
          };

          const userReaction = postReactions.find(r => r.user_uid === user_uid)?.type as ReactionType | undefined;

          return {
            id: p.id,
            user: { name: p.user_name, identity: p.user_identity, avatar: p.user_avatar },
            type: p.type as any,
            content: p.content,
            metric: p.metric,
            nods: p.nods || 0,
            reactions: reactionCounts as any,
            userReaction,
            comments: postComments.map(c => ({
              id: c.id,
              user: { name: c.user_name, identity: c.user_identity, avatar: c.user_avatar },
              content: c.content,
              time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })),
            time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }));
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
    fetchPosts();
    const agoraChannel = new BroadcastChannel('agora_commune');
    agoraChannel.onmessage = (event) => {
      if (['NEW_PROCLAMATION', 'UPDATE_REACTIONS', 'NEW_COMMENT', 'UPDATE_NODS'].includes(event.data.action)) {
        fetchPosts();
      }
    };
    return () => agoraChannel.close();
  }, [user_uid]);

  const [followers, setFollowers] = useState<Follower[]>([
    { id: 'f1', name: 'Zeno', identity: 'Founding Stoic', avatar: null, consistency: 98, isMutual: true, streak: 88, focusHours: 380 },
    { id: 'f2', name: 'Epictetus', identity: 'Will Unbound', avatar: null, consistency: 94, isMutual: true, streak: 74, focusHours: 310 },
    { id: 'f3', name: 'Cleanthes', identity: 'Patient Laborer', avatar: null, consistency: 89, isMutual: false, streak: 45, focusHours: 210 },
    { id: 'f4', name: 'Musonius', identity: 'Practical Disciple', avatar: null, consistency: 91, isMutual: false, streak: 65, focusHours: 290 },
    { id: 'f5', name: 'Aristo', identity: 'The Minimalist', avatar: null, consistency: 82, isMutual: false, streak: 31, focusHours: 155 },
    { id: 'f6', name: 'Porcia', identity: 'Iron Resolve', avatar: null, consistency: 95, isMutual: true, streak: 52, focusHours: 412 },
    { id: 'f7', name: 'Seneca', identity: 'Morning Ritualist', avatar: null, consistency: 96, isMutual: true, streak: 142, focusHours: 420 },
    { id: 'f8', name: 'Hypatia', identity: 'Deep Work Scholar', avatar: null, consistency: 97, isMutual: false, streak: 92, focusHours: 512 },
    { id: 'f9', name: 'Cato', identity: 'Radical Owner', avatar: null, consistency: 90, isMutual: false, streak: 41, focusHours: 440 },
  ]);

  const agoraChannel = useMemo(() => new BroadcastChannel('agora_commune'), []);


  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user_uid) return;

    const newId = Math.random().toString(36).substr(2, 9);
    const post: SocialPost = {
      id: newId,
      user: { name: currentUserName, identity: currentUserIdentity, avatar: currentUserAvatar },
      type: newPostType,
      content: newPostContent,
      metric: newPostMetric || undefined,
      nods: 0,
      reactions: { wisdom: 0, courage: 0, temperance: 0, justice: 0, like: 0 },
      comments: [],
      time: 'Just Now'
    };

    setPosts([post, ...posts]);
    
    try {
      await sql`
        INSERT INTO social_posts (id, user_uid, type, content, metric)
        VALUES (${newId}, ${user_uid}, ${newPostType}, ${newPostContent}, ${newPostMetric || null})
      `;
    } catch (error) {
      console.error("Failed to sync post:", error);
    }

    agoraChannel.postMessage({ action: 'NEW_PROCLAMATION', data: { post } });
    setNewPostContent('');
    setNewPostMetric('');
    setShowPostForm(false);
  };

  const handleReact = async (postId: string, reactionType: ReactionType) => {
    if (!user_uid) return;
    try {
      const existing = await sql`SELECT * FROM social_reactions WHERE post_id = ${postId} AND user_uid = ${user_uid}`;
      if (existing.length > 0) {
        if (existing[0].type === reactionType) {
          await sql`DELETE FROM social_reactions WHERE id = ${existing[0].id}`;
        } else {
          await sql`UPDATE social_reactions SET type = ${reactionType} WHERE id = ${existing[0].id}`;
        }
      } else {
        const newId = crypto.randomUUID();
        await sql`INSERT INTO social_reactions (id, post_id, user_uid, type) VALUES (${newId}, ${postId}, ${user_uid}, ${reactionType})`;
      }
      agoraChannel.postMessage({ action: 'UPDATE_REACTIONS', postId });
      // Re-fetch handled by BroadcastChannel listener
    } catch (error) {
      console.error("Failed to sync reaction:", error);
    }
    setActiveReactionPicker(null);
  };

  const handleNod = async (postId: string) => {
    try {
      await sql`UPDATE social_posts SET nods = nods + 1 WHERE id = ${postId}`;
      agoraChannel.postMessage({ action: 'UPDATE_NODS', postId });
    } catch (error) {
      console.error("Failed to nod:", error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim() || !user_uid) return;

    try {
      const newId = crypto.randomUUID();
      await sql`INSERT INTO social_comments (id, post_id, user_uid, content) VALUES (${newId}, ${postId}, ${user_uid}, ${text})`;
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      agoraChannel.postMessage({ action: 'NEW_COMMENT', postId });
    } catch (error) {
      console.error("Failed to sync comment:", error);
    }
  };

  const handleToggleFollow = (userName: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      const isNowFollowing = !next.has(userName);
      if (isNowFollowing) next.add(userName);
      else next.delete(userName);
      if (onFollowChange) onFollowChange(isNowFollowing ? 1 : -1);
      return next;
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesType = filterType === 'all' 
      ? true 
      : filterType === 'following' 
        ? followedUsers.has(post.user.name) || post.user.name === currentUserName
        : post.type === filterType;
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredFollowers = followers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.identity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      {/* Profile Detail Overlay */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center z-[200] p-6" onClick={() => setSelectedProfile(null)}>
          <div className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-500 border border-white/20 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <button onClick={() => setSelectedProfile(null)} className="flex items-center gap-2 p-3 hover:bg-white hover:shadow-sm rounded-2xl transition-all text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px]">
                <ChevronLeft size={20} /> Close Agora View
              </button>
              <div className="flex items-center gap-2 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span className="text-[10px] font-black uppercase tracking-widest">Synchronized</span></div>
            </div>
            <div className="flex-1 overflow-auto p-12 space-y-12 custom-scrollbar">
              <div className="flex flex-col items-center text-center space-y-6">
                <SovereignAvatar name={selectedProfile.name} avatar={selectedProfile.avatar} size="xl" />
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedProfile.name}</h2>
                  <p className="text-lg font-bold text-indigo-600 uppercase tracking-widest">{selectedProfile.identity}</p>
                </div>
                <button onClick={() => handleToggleFollow(selectedProfile.name)} className={`px-8 py-4 rounded-3xl font-bold text-sm transition-all shadow-xl ${followedUsers.has(selectedProfile.name) ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white'}`}>
                  {followedUsers.has(selectedProfile.name) ? 'Recognized Spirit' : 'Recognize Spirit'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-[2.5rem] p-8 text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Integrity</p><p className="text-3xl font-black text-slate-900">{selectedProfile.consistency}%</p></div>
                <div className="bg-slate-50 rounded-[2.5rem] p-8 text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Streak</p><p className="text-3xl font-black text-slate-900">{selectedProfile.streak}d</p></div>
                <div className="bg-slate-50 rounded-[2.5rem] p-8 text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Focus</p><p className="text-3xl font-black text-slate-900">{selectedProfile.focusHours}h</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-400"><Users size={18} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Collective Sovereignty</span></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">The Agora</h1>
          <p className="text-slate-500 font-light italic max-w-md">"We are made for cooperation, like feet, like hands, like eyelids."</p>
        </div>
        <div className="flex flex-col gap-4 items-end w-full md:w-auto">
          <div className="flex items-center gap-3 w-full">
            <button onClick={() => setViewMode(viewMode === 'feed' ? 'followers' : 'feed')} className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${viewMode === 'followers' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-900'}`}>
              <Users size={18} /> {viewMode === 'followers' ? 'Feed' : 'Disciples'}
            </button>
            <button onClick={() => setShowPostForm(!showPostForm)} className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl ${showPostForm ? 'bg-rose-50 text-rose-600' : 'bg-slate-900 text-white'}`}>
              {showPostForm ? <X size={18} /> : <Plus size={18} />} {showPostForm ? 'Discard' : 'New Proclamation'}
            </button>
          </div>
          <div className="relative w-full group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <input type="text" placeholder="Search Agora..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-50 transition-all" />
          </div>
        </div>
      </header>

      {viewMode === 'feed' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {showPostForm && (
              <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-2xl animate-in slide-in-from-top-8 duration-500">
                <form onSubmit={handleCreatePost} className="space-y-8">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mode</label>
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                      {['intention', 'reflection', 'achievement'].map(t => (
                        <button key={t} type="button" onClick={() => setNewPostType(t as any)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${newPostType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Proclaim your truth..." className="w-full h-32 bg-slate-50 border-none rounded-[2rem] p-8 focus:ring-4 focus:ring-slate-100 transition-all text-slate-700 italic resize-none" />
                  <div className="flex justify-between items-end gap-6">
                    <input type="text" value={newPostMetric} onChange={e => setNewPostMetric(e.target.value)} placeholder="Metric (optional)" className="flex-1 bg-slate-50 border-none rounded-xl px-6 py-4 text-sm font-bold" />
                    <button type="submit" disabled={!newPostContent.trim()} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center gap-3"><Send size={18} /> Proclaim</button>
                  </div>
                </form>
              </div>
            )}
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <SovereignAvatar name={post.user.name} avatar={post.user.avatar} onClick={() => setSelectedProfile({ id: post.id, name: post.user.name, identity: post.user.identity, avatar: post.user.avatar, consistency: 90, isMutual: false, streak: 10, focusHours: 50 })} />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 leading-tight">{post.user.name}</span>
                        {post.user.name !== currentUserName && <button onClick={() => handleToggleFollow(post.user.name)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${followedUsers.has(post.user.name) ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white'}`}>{followedUsers.has(post.user.name) ? 'Following' : 'Follow'}</button>}
                      </div>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{post.user.identity}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{post.time}</span>
                </div>
                <div className="space-y-4 mb-8">
                  <p className={`text-lg leading-relaxed ${post.type === 'reflection' ? 'italic text-slate-500' : 'text-slate-700 font-medium'}`}>{post.content}</p>
                  {post.metric && <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl"><Zap size={14} className="text-amber-500" /><span className="text-xs font-black uppercase tracking-tighter">{post.metric}</span></div>}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Object.entries(post.reactions) as [ReactionType, number][]).map(([type, count]) => count > 0 && <button key={type} onClick={() => handleReact(post.id, type)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${post.userReaction === type ? `${REACTION_CONFIG[type].bg} ${REACTION_CONFIG[type].color} border-current ring-2 ring-current ring-opacity-10 scale-105` : 'text-slate-400 bg-white border-slate-100 hover:border-slate-300'}`}>{REACTION_CONFIG[type].icon} <span>{count}</span></button>)}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-6">
                    <button onClick={() => setActiveReactionPicker(activeReactionPicker === post.id ? null : post.id)} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-tight transition-all ${post.userReaction ? REACTION_CONFIG[post.userReaction].color : 'text-slate-400 hover:text-slate-900'}`}>{post.userReaction ? REACTION_CONFIG[post.userReaction].icon : <Heart size={18} />} {post.userReaction ? REACTION_CONFIG[post.userReaction].label : 'Stoic Reaction'}</button>
                    {activeReactionPicker === post.id && (
                      <div className="absolute bottom-full left-0 mb-4 flex gap-2 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-2xl z-50">
                        {(Object.entries(REACTION_CONFIG) as [ReactionType, any][]).map(([type, config]) => <button key={type} onClick={() => handleReact(post.id, type)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-125 ${post.userReaction === type ? config.bg + ' ' + config.color : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>{config.icon}</button>)}
                      </div>
                    )}
                    <button onClick={() => handleNod(post.id)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all"><Handshake size={18} /><span className="text-xs font-bold">{post.nods} Nods</span></button>
                    <button onClick={() => setExpandedComments(p => ({ ...p, [post.id]: !p[post.id] }))} className={`flex items-center gap-2 transition-all ${expandedComments[post.id] ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}><MessageSquare size={18} /><span className="text-xs font-bold">{post.comments.length} Inquiry</span></button>
                  </div>
                </div>
                {expandedComments[post.id] && (
                  <div className="mt-8 pt-8 border-t border-slate-50 space-y-6">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="flex gap-4">
                        <SovereignAvatar name={comment.user.name} avatar={comment.user.avatar} size="sm" />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-900">{comment.user.name}</span><span className="text-[9px] font-bold text-slate-300 uppercase">{comment.time}</span></div>
                          <p className="text-sm text-slate-600 italic font-light leading-relaxed">"{comment.content}"</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-4 items-center">
                      <SovereignAvatar name={currentUserName} avatar={currentUserAvatar} size="sm" />
                      <div className="relative flex-1">
                        <input type="text" value={commentInputs[post.id] || ''} onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)} placeholder="Offer perspective..." className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-slate-100 transition-all italic" />
                        <button onClick={() => handleAddComment(post.id)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"><Send size={14} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-8">
            <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Shield size={120} /></div>
              <div className="flex items-center gap-3 opacity-60 mb-8"><Flame size={18} /><h2 className="text-[10px] font-black uppercase tracking-[0.3em]">The Council Streaks</h2></div>
              <div className="space-y-6">
                {[
                  { name: 'Seneca', streak: '142d', rank: 1, avatar: null }, 
                  { name: 'Zeno', streak: '88d', rank: 2, avatar: null }
                ].map(user => (
                  <div key={user.name} className="flex items-center justify-between group cursor-pointer" onClick={() => setSelectedProfile({ id: user.name, name: user.name, identity: 'Council Member', avatar: user.avatar, consistency: 99, isMutual: true, streak: 142, focusHours: 420 })}>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black opacity-30 group-hover:opacity-100">0{user.rank}</span>
                      <SovereignAvatar name={user.name} avatar={user.avatar} size="sm" />
                      <span className="font-bold tracking-tight group-hover:text-indigo-400 transition-colors">{user.name}</span>
                    </div>
                    <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full">{user.streak}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Live Pulse</h3>
              <div className="flex items-center justify-between"><span className="text-xs text-slate-400 font-bold">Focusing Now</span><span className="flex items-center gap-1.5 text-xs font-black text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>412</span></div>
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between"><span className="text-xs text-slate-400 font-bold">Your Influence</span><span className="text-xs font-black text-indigo-600">{currentFollowingCount} Recognized</span></div>
            </section>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10 space-y-1"><h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Disciples</h2><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{followers.length} Souls Seeking Alignment</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFollowers.map(follower => (
              <div key={follower.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-center justify-between mb-6">
                  <SovereignAvatar name={follower.name} avatar={follower.avatar} size="lg" onClick={() => setSelectedProfile(follower)} />
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{follower.consistency}% Integrity</p>
                    <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 ml-auto"><div className="h-full bg-emerald-500" style={{ width: `${follower.consistency}%` }}></div></div>
                  </div>
                </div>
                <div className="space-y-1 mb-8">
                  <span className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors block cursor-pointer" onClick={() => setSelectedProfile(follower)}>{follower.name}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{follower.identity}</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">?</div>
                  <button onClick={() => handleToggleFollow(follower.name)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${followedUsers.has(follower.name) ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-900 text-white'}`}>
                    {followedUsers.has(follower.name) ? <UserCheck size={12} /> : <UserPlus size={12} />} {followedUsers.has(follower.name) ? 'Recognized' : 'Recognize'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;
