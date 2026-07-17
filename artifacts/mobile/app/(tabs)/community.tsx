import React, { useState, useEffect, useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Post {
  id: string; user_id: string; title: string; content: string;
  tags: string[]; likes: number; comments: number; pinned: boolean;
  created_at: string; author_name?: string;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function timeSince(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const loadPosts = useCallback(async () => {
    const { data } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setPosts(data as Post[]);
  }, []);

  useEffect(() => { loadPosts(); }, []);

  async function createPost() {
    if (!newTitle.trim() || !user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await supabase.from('community_posts').insert({
      id: uid(), user_id: user.id, title: newTitle.trim(), content: newContent.trim(), tags: [], pinned: false,
    });
    setNewTitle(''); setNewContent(''); setShowModal(false);
    await loadPosts();
  }

  async function toggleLike(postId: string) {
    if (!user) return;
    const { data: existing } = await supabase.from('community_likes').select('id').eq('post_id', postId).eq('user_id', user.id).single();
    if (existing) {
      await supabase.from('community_likes').delete().eq('id', existing.id);
      await supabase.rpc('decrement_post_likes', { post_id: postId });
    } else {
      await supabase.from('community_likes').insert({ id: uid(), post_id: postId, user_id: user.id });
      await supabase.rpc('increment_post_likes', { post_id: postId });
    }
    await loadPosts();
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#08081A', '#0F0F28']} style={[styles.header, { paddingTop: topPad + 14 }]}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={[colors.primary, colors.accent]} style={styles.headerAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Feather name="message-circle" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Developer Community</Text>
            <Text style={[styles.headerStatus, { color: colors.mutedForeground }]}>{posts.length} posts</Text>
          </View>
        </View>
        <Pressable
          onPress={() => setShowModal(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary + '33', borderColor: colors.primary + '55' }]}
        >
          <Feather name="plus" size={18} color={colors.primary} />
        </Pressable>
      </LinearGradient>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPosts().then(() => setRefreshing(false)); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 14 }}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={{ width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="message-circle" size={28} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No posts yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Be the first to share with the community</Text>
            <Pressable
              onPress={() => setShowModal(true)}
              style={({ pressed }) => [{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>Create Post</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 30).duration(350)}>
            <Pressable style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.postHeader}>
                <LinearGradient colors={[colors.primary, colors.accent]} style={styles.postAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'Inter_700Bold' }}>
                    {(item.author_name || item.user_id).slice(0, 2).toUpperCase()}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.postTitle, { color: colors.foreground }]}>{item.title}</Text>
                  <Text style={[styles.postMeta, { color: colors.mutedForeground }]}>
                    {item.author_name || 'Anonymous'} · {timeSince(item.created_at)}
                  </Text>
                </View>
              </View>
              {item.content ? <Text style={[styles.postContent, { color: colors.mutedForeground }]} numberOfLines={3}>{item.content}</Text> : null}
              <View style={styles.postActions}>
                <Pressable onPress={() => toggleLike(item.id)} style={styles.postAction}>
                  <Feather name="heart" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.postActionText, { color: colors.mutedForeground }]}>{item.likes}</Text>
                </Pressable>
                <View style={styles.postAction}>
                  <Feather name="message-square" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.postActionText, { color: colors.mutedForeground }]}>{item.comments}</Text>
                </View>
                <Feather name="more-horizontal" size={14} color={colors.mutedForeground} />
              </View>
            </Pressable>
          </Animated.View>
        )}
      />

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.background + 'EE' }]}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create Post</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Post title..."
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              style={[styles.modalArea, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={newContent}
              onChangeText={setNewContent}
              placeholder="Share something with the community..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable
                onPress={() => setShowModal(false)}
                style={({ pressed }) => [{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={createPost}
                disabled={!newTitle.trim()}
                style={({ pressed }) => [{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', opacity: !newTitle.trim() ? 0.4 : pressed ? 0.8 : 1 }]}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Post</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
  headerStatus: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  addBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  postCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10 },
  postHeader: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  postAvatar: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  postTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  postMeta: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  postContent: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 12 },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#636375', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 16 },
  modalInput: { borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Inter_400Regular', borderWidth: 1, marginBottom: 12 },
  modalArea: { borderRadius: 12, padding: 14, fontSize: 14, fontFamily: 'Inter_400Regular', borderWidth: 1, minHeight: 120, textAlignVertical: 'top' },
  modalBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
