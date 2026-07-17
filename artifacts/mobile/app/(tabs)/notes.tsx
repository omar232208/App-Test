import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { useData, Note } from '@/context/DataContext';
import * as Haptics from 'expo-haptics';

const NOTE_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B',
  '#22C55E', '#3B82F6', '#EF4444', '#14B8A6',
];

function timeSince(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function NoteModal({
  visible,
  note,
  onClose,
}: {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
}) {
  const colors = useColors();
  const { addNote, updateNote } = useData();
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color, setColor] = useState(note?.color ?? NOTE_COLORS[0]);
  const [titleFocus, setTitleFocus] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setTitle(note?.title ?? '');
      setContent(note?.content ?? '');
      setColor(note?.color ?? NOTE_COLORS[0]);
    }
  }, [visible, note]);

  function save() {
    if (!title.trim()) return;
    if (note) {
      updateNote(note.id, { title: title.trim(), content: content.trim(), color });
    } else {
      addNote({ title: title.trim(), content: content.trim(), color, pinned: false, tags: [] });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

        {/* Modal header with color strip */}
        <LinearGradient colors={[color, color + '88']} style={styles.modalStripe} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} style={[styles.modalClose, { backgroundColor: colors.muted }]}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            {note ? 'Edit Note' : 'New Note'}
          </Text>
          <Pressable onPress={save} disabled={!title.trim()} style={({ pressed }) => [
            styles.saveBtn, { backgroundColor: color, opacity: pressed || !title.trim() ? 0.7 : 1 }
          ]}>
            <Feather name="check" size={16} color="#fff" />
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          {/* Color picker */}
          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Color</Text>
            <View style={styles.colorRow}>
              {NOTE_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorSwatch, { backgroundColor: c, borderWidth: c === color ? 2 : 0, borderColor: '#fff' }]}
                >
                  {c === color && <Feather name="check" size={12} color="#fff" />}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Title */}
          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Title *</Text>
            <View style={[styles.fieldWrap, {
              borderColor: titleFocus ? color : colors.border,
              backgroundColor: colors.card,
            }]}>
              <Feather name="file-text" size={15} color={titleFocus ? color : colors.mutedForeground} />
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Note title..."
                placeholderTextColor={colors.mutedForeground}
                autoFocus={!note}
                onFocus={() => setTitleFocus(true)}
                onBlur={() => setTitleFocus(false)}
              />
            </View>
          </View>

          {/* Content */}
          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Content</Text>
            <TextInput
              style={[styles.contentArea, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your note here..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </View>

          <View style={[styles.tip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="info" size={13} color={colors.mutedForeground} />
            <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
              Markdown formatting is supported: **bold**, *italic*, `code`
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function NoteCard({ note, onEdit, delay }: { note: Note; onEdit: () => void; delay: number }) {
  const colors = useColors();
  const { deleteNote, updateNote } = useData();

  function confirmDelete() {
    Alert.alert('Delete Note', `Delete "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { deleteNote(note.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); },
      },
    ]);
  }

  function togglePin() {
    updateNote(note.id, { pinned: !note.pinned });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
      >
        {/* Color accent left bar */}
        <View style={[styles.cardAccent, { backgroundColor: note.color }]} />

        <View style={{ flex: 1, paddingLeft: 14, paddingRight: 8, paddingVertical: 14 }}>
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: note.color + '22' }]}>
              <Feather name="file-text" size={13} color={note.color} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>{note.title}</Text>
            <View style={styles.cardActions}>
              <Pressable onPress={togglePin} hitSlop={8}>
                <Feather name={note.pinned ? 'bookmark' : 'bookmark'} size={14} color={note.pinned ? note.color : colors.mutedForeground} />
              </Pressable>
              <Pressable onPress={confirmDelete} hitSlop={8}>
                <Feather name="trash-2" size={14} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          {/* Content preview */}
          {note.content ? (
            <Text style={[styles.cardContent, { color: colors.mutedForeground }]} numberOfLines={3}>
              {note.content}
            </Text>
          ) : (
            <Text style={[styles.cardEmpty, { color: colors.mutedForeground }]}>No content</Text>
          )}

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={[styles.colorDot, { backgroundColor: note.color }]} />
            <Text style={[styles.cardTime, { color: colors.mutedForeground }]}>
              {note.pinned ? '📌 ' : ''}{timeSince(note.updatedAt)}
            </Text>
            {note.content && (
              <Text style={[styles.wordCount, { color: colors.mutedForeground }]}>
                {note.content.split(' ').length} words
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned'>('all');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : 0;

  const filtered = notes
    .filter(n => {
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || n.pinned;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  function openCreate() {
    setEditNote(null);
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function openEdit(note: Note) {
    setEditNote(note);
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notes</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{notes.length} note{notes.length !== 1 ? 's' : ''}</Text>
        </View>
        <Pressable
          onPress={openCreate}
          style={{ borderRadius: 14, overflow: 'hidden' }}
        >
          <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.newBtn}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.newBtnText}>New</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          value={search} onChangeText={setSearch}
          placeholder="Search notes..."
          placeholderTextColor={colors.mutedForeground}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x-circle" size={16} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {(['all', 'pinned'] as const).map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, {
              backgroundColor: f === filter ? colors.primary : colors.muted,
              borderColor: f === filter ? colors.primary : colors.border,
            }]}
          >
            {f === 'pinned' && <Feather name="bookmark" size={12} color={f === filter ? '#fff' : colors.mutedForeground} />}
            <Text style={[styles.filterText, { color: f === filter ? '#fff' : colors.mutedForeground }]}>
              {f === 'all' ? 'All Notes' : 'Pinned'}
            </Text>
          </Pressable>
        ))}
        {notes.length > 0 && (
          <View style={[styles.countChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.filterText, { color: colors.mutedForeground }]}>{filtered.length} shown</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="file-text" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {search ? 'No results' : filter === 'pinned' ? 'No pinned notes' : 'No notes yet'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {search
                ? 'Try different search terms'
                : filter === 'pinned'
                ? 'Pin notes to find them quickly'
                : 'Capture ideas, code snippets, and important notes'}
            </Text>
            {!search && filter === 'all' && (
              <Pressable
                onPress={openCreate}
                style={({ pressed }) => [{ borderRadius: 14, overflow: 'hidden', marginTop: 20, opacity: pressed ? 0.8 : 1 }]}
              >
                <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>Create First Note</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        ) : (
          filtered.map((note, i) => (
            <NoteCard key={note.id} note={note} onEdit={() => openEdit(note)} delay={i * 50} />
          ))
        )}
      </ScrollView>

      <NoteModal
        visible={modalVisible}
        note={editNote}
        onClose={() => { setModalVisible(false); setEditNote(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  newBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11,
    marginHorizontal: 20, marginTop: 14, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 14, alignItems: 'center' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  countChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginLeft: 'auto' },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  list: { paddingHorizontal: 20, paddingTop: 4, gap: 10 },
  card: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  cardAccent: { width: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { flex: 1, fontSize: 14, fontFamily: 'Inter_700Bold', letterSpacing: -0.2 },
  cardActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  cardContent: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 10 },
  cardEmpty: { fontSize: 12, fontFamily: 'Inter_400Regular', fontStyle: 'italic', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  colorDot: { width: 6, height: 6, borderRadius: 3 },
  cardTime: { fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1 },
  wordCount: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  empty: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 8, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  emptyBtn: { paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
  modal: { flex: 1 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 0 },
  modalStripe: { height: 3 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  modalClose: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  fieldLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  fieldWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
  },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  contentArea: {
    borderWidth: 1, borderRadius: 12, padding: 14,
    fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 200, textAlignVertical: 'top', lineHeight: 22,
  },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  tipText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 },
});
