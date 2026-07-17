/**
 * Library Screen — 4 segments: Notes | Folders | Photos | Links
 * Full CRUD for each section with premium AMOLED UI.
 */
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/useColors';
import {
  useData, Note, AppFolder, FolderDoc, SavedImage, Bookmark,
} from '@/context/DataContext';

const { width } = Dimensions.get('window');
const IMG_COLS = 3;
const IMG_SIZE = (width - 40 - 8 * (IMG_COLS - 1)) / IMG_COLS;

type Segment = 'notes' | 'folders' | 'photos' | 'links';

const NOTE_COLORS   = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#22C55E','#3B82F6','#EF4444','#14B8A6'];
const FOLDER_COLORS = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#22C55E','#3B82F6','#EF4444','#14B8A6'];

function timeSince(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60)    return 'just now';
  if (d < 3600)  return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  const days = Math.floor(d / 86400);
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/* ═══════════════════════════════════════════════════════════════
   Segment pill control
═══════════════════════════════════════════════════════════════ */
function SegmentPill({ active, onChange }: { active: Segment; onChange: (s: Segment) => void }) {
  const colors = useColors();
  const segs: { key: Segment; icon: string; label: string }[] = [
    { key: 'notes',   icon: 'file-text', label: 'Notes'   },
    { key: 'folders', icon: 'folder',    label: 'Folders' },
    { key: 'photos',  icon: 'image',     label: 'Photos'  },
    { key: 'links',   icon: 'link',      label: 'Links'   },
  ];
  return (
    <View style={[styles.pill, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      {segs.map(s => (
        <Pressable
          key={s.key}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(s.key); }}
          style={[styles.pillItem, active === s.key && { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name={s.icon as any} size={13} color={active === s.key ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.pillLabel, { color: active === s.key ? colors.foreground : colors.mutedForeground }]}>{s.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOTES SECTION
═══════════════════════════════════════════════════════════════ */
function NoteModal({ visible, note, onClose }: { visible: boolean; note: Note | null; onClose: () => void }) {
  const colors = useColors();
  const { addNote, updateNote } = useData();
  const [title,   setTitle]   = useState(note?.title   ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color,   setColor]   = useState(note?.color   ?? NOTE_COLORS[0]);

  React.useEffect(() => {
    if (visible) { setTitle(note?.title ?? ''); setContent(note?.content ?? ''); setColor(note?.color ?? NOTE_COLORS[0]); }
  }, [visible, note]);

  function save() {
    if (!title.trim()) return;
    if (note) updateNote(note.id, { title: title.trim(), content, color });
    else      addNote({ title: title.trim(), content, color, pinned: false, tags: [] });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <LinearGradient colors={[color, color + '77']} style={{ height: 3 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        <View style={[styles.modalHandle2, { backgroundColor: colors.border }]} />
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.mCancel, { color: colors.mutedForeground }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.mTitle, { color: colors.foreground }]}>{note ? 'Edit Note' : 'New Note'}</Text>
          <Pressable onPress={save} disabled={!title.trim()}>
            <Text style={[styles.mSave, { color: title.trim() ? color : colors.mutedForeground }]}>Save</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View>
            <Text style={[styles.fLabel, { color: colors.mutedForeground }]}>Color</Text>
            <View style={styles.colorRow}>
              {NOTE_COLORS.map(c => (
                <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c, borderWidth: c === color ? 2.5 : 0, borderColor: '#fff' }]}>
                  {c === color && <Feather name="check" size={12} color="#fff" />}
                </Pressable>
              ))}
            </View>
          </View>
          <View>
            <Text style={[styles.fLabel, { color: colors.mutedForeground }]}>Title *</Text>
            <View style={[styles.fWrap, { borderColor: color + '80', backgroundColor: colors.card }]}>
              <TextInput style={[styles.fInput, { color: colors.foreground }]} value={title} onChangeText={setTitle}
                placeholder="Note title..." placeholderTextColor={colors.mutedForeground} autoFocus={!note} />
            </View>
          </View>
          <View>
            <Text style={[styles.fLabel, { color: colors.mutedForeground }]}>Content</Text>
            <TextInput style={[styles.textArea, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              value={content} onChangeText={setContent} placeholder="Write your note here..."
              placeholderTextColor={colors.mutedForeground} multiline numberOfLines={12} textAlignVertical="top" />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function NoteCard({ note, onEdit, delay }: { note: Note; onEdit: () => void; delay: number }) {
  const colors = useColors();
  const { deleteNote, updateNote } = useData();
  function del() { Alert.alert('Delete Note', `Delete "${note.title}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteNote(note.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } }]); }
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)}>
      <Pressable onPress={onEdit} style={({ pressed }) => [styles.noteCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}>
        <View style={[styles.noteAccent, { backgroundColor: note.color }]} />
        <View style={{ flex: 1, paddingLeft: 12, paddingRight: 8, paddingVertical: 12 }}>
          <View style={styles.noteHeader}>
            <View style={[styles.noteIconBox, { backgroundColor: note.color + '22' }]}>
              <Feather name="file-text" size={12} color={note.color} />
            </View>
            <Text style={[styles.noteTitle, { color: colors.foreground }]} numberOfLines={1}>{note.title}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={() => { updateNote(note.id, { pinned: !note.pinned }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} hitSlop={8}>
                <Feather name="bookmark" size={13} color={note.pinned ? note.color : colors.mutedForeground} />
              </Pressable>
              <Pressable onPress={del} hitSlop={8}>
                <Feather name="trash-2" size={13} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>
          {note.content ? <Text style={[styles.noteContent, { color: colors.mutedForeground }]} numberOfLines={3}>{note.content}</Text> : null}
          <View style={styles.noteFoot}>
            <View style={[styles.noteDot, { backgroundColor: note.color }]} />
            <Text style={[styles.noteTime, { color: colors.mutedForeground }]}>{note.pinned ? '📌 ' : ''}{timeSince(note.updatedAt)}</Text>
            {note.content ? <Text style={[styles.noteWords, { color: colors.mutedForeground }]}>{note.content.split(/\s+/).filter(Boolean).length}w</Text> : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function NotesSection() {
  const colors = useColors();
  const { notes } = useData();
  const [modal,  setModal]  = useState(false);
  const [edit,   setEdit]   = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [pin,    setPin]    = useState(false);

  const filtered = notes
    .filter(n => {
      const q = search.toLowerCase();
      return (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) && (!pin || n.pinned);
    })
    .sort((a, b) => { if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1; return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); });

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.subBar}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={14} color={colors.mutedForeground} />
          <TextInput style={[styles.searchIn, { color: colors.foreground }]} value={search} onChangeText={setSearch} placeholder="Search notes..." placeholderTextColor={colors.mutedForeground} />
          {search ? <Pressable onPress={() => setSearch('')} hitSlop={8}><Feather name="x" size={14} color={colors.mutedForeground} /></Pressable> : null}
        </View>
        <Pressable onPress={() => setPin(!pin)} style={[styles.filterBtn, { backgroundColor: pin ? colors.primary + '22' : colors.muted, borderColor: pin ? colors.primary : colors.border }]}>
          <Feather name="bookmark" size={14} color={pin ? colors.primary : colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.listPad, { paddingBottom: 130 }]} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="file-text" size={32} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{search ? 'No results' : pin ? 'No pinned notes' : 'No notes yet'}</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Capture ideas, code snippets, and important thoughts</Text>
          </View>
        ) : filtered.map((n, i) => (
          <NoteCard key={n.id} note={n} onEdit={() => { setEdit(n); setModal(true); }} delay={i * 40} />
        ))}
      </ScrollView>

      <Pressable
        onPress={() => { setEdit(null); setModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        style={styles.fab}
      >
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.fabInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name="plus" size={24} color="#fff" />
        </LinearGradient>
      </Pressable>

      <NoteModal visible={modal} note={edit} onClose={() => { setModal(false); setEdit(null); }} />
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOLDERS SECTION
═══════════════════════════════════════════════════════════════ */
function CreateFolderModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const { addFolder } = useData();
  const [name,  setName]  = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0]);

  function create() {
    if (!name.trim()) return;
    addFolder({ name: name.trim(), color, icon: 'folder' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName(''); setColor(FOLDER_COLORS[0]); onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHandle2, { backgroundColor: colors.border }]} />
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose}><Text style={[styles.mCancel, { color: colors.mutedForeground }]}>Cancel</Text></Pressable>
          <Text style={[styles.mTitle, { color: colors.foreground }]}>New Folder</Text>
          <Pressable onPress={create} disabled={!name.trim()}><Text style={[styles.mSave, { color: name.trim() ? color : colors.mutedForeground }]}>Create</Text></Pressable>
        </View>
        <View style={{ padding: 20, gap: 18 }}>
          <View>
            <Text style={[styles.fLabel, { color: colors.mutedForeground }]}>Folder Name *</Text>
            <View style={[styles.fWrap, { borderColor: color + '80', backgroundColor: colors.card }]}>
              <Feather name="folder" size={15} color={color} />
              <TextInput style={[styles.fInput, { color: colors.foreground }]} value={name} onChangeText={setName}
                placeholder="e.g. Work Documents" placeholderTextColor={colors.mutedForeground} autoFocus returnKeyType="done" onSubmitEditing={create} />
            </View>
          </View>
          <View>
            <Text style={[styles.fLabel, { color: colors.mutedForeground }]}>Color</Text>
            <View style={styles.colorRow}>
              {FOLDER_COLORS.map(c => (
                <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c, borderWidth: c === color ? 2.5 : 0, borderColor: '#fff' }]}>
                  {c === color && <Feather name="check" size={12} color="#fff" />}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DocEditorModal({ visible, doc, folder, onClose }: { visible: boolean; doc: FolderDoc | null; folder: AppFolder; onClose: () => void }) {
  const colors = useColors();
  const { addDoc, updateDoc } = useData();
  const [title,   setTitle]   = useState(doc?.title   ?? '');
  const [content, setContent] = useState(doc?.content ?? '');

  React.useEffect(() => {
    if (visible) { setTitle(doc?.title ?? ''); setContent(doc?.content ?? ''); }
  }, [visible, doc]);

  function save() {
    if (!title.trim()) return;
    if (doc) updateDoc(folder.id, doc.id, { title: title.trim(), content });
    else     addDoc(folder.id, { title: title.trim(), content });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.editorBar, { borderBottomColor: colors.border, paddingTop: Platform.OS === 'ios' ? 56 : 20 }]}>
          <Pressable onPress={onClose} style={styles.editorBack}>
            <Feather name="chevron-left" size={20} color={colors.foreground} />
          </Pressable>
          <TextInput
            style={[styles.editorTitle, { color: colors.foreground }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Document title..."
            placeholderTextColor={colors.mutedForeground}
          />
          <Pressable onPress={save} disabled={!title.trim()}>
            <View style={[styles.saveChip, { backgroundColor: title.trim() ? folder.color : colors.muted }]}>
              <Text style={styles.saveChipText}>Save</Text>
            </View>
          </Pressable>
        </View>
        <TextInput
          style={[styles.editorBody, { color: colors.foreground, backgroundColor: colors.background }]}
          value={content}
          onChangeText={setContent}
          placeholder="Start writing..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlignVertical="top"
        />
      </View>
    </Modal>
  );
}

function FolderDetailModal({ visible, folder, onClose }: { visible: boolean; folder: AppFolder | null; onClose: () => void }) {
  const colors = useColors();
  const { deleteDoc } = useData();
  const [docModal, setDocModal] = useState(false);
  const [editDoc,  setEditDoc]  = useState<FolderDoc | null>(null);

  if (!folder) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <LinearGradient colors={[folder.color, folder.color + '66']} style={{ height: 4 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        <View style={[styles.modalHandle2, { backgroundColor: colors.border }]} />
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.mCancel, { color: colors.mutedForeground }]}>Close</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.folderIconSm, { backgroundColor: folder.color + '22' }]}>
              <Feather name="folder" size={14} color={folder.color} />
            </View>
            <Text style={[styles.mTitle, { color: colors.foreground }]}>{folder.name}</Text>
          </View>
          <Pressable onPress={() => { setEditDoc(null); setDocModal(true); }}>
            <Text style={[styles.mSave, { color: folder.color }]}>+ Doc</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}>
          {folder.docs.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: folder.color + '22', alignItems: 'center', justifyContent: 'center' }]}>
                <Feather name="file-plus" size={32} color={folder.color} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No documents yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Tap "+ Doc" to create your first document</Text>
            </View>
          ) : (
            folder.docs.map((doc, i) => (
              <Animated.View key={doc.id} entering={FadeInDown.delay(i * 40).duration(350)}>
                <Pressable
                  onPress={() => { setEditDoc(doc); setDocModal(true); }}
                  style={({ pressed }) => [styles.docCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
                >
                  <View style={[styles.docIcon, { backgroundColor: folder.color + '22' }]}>
                    <Feather name="file-text" size={16} color={folder.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.docTitle, { color: colors.foreground }]}>{doc.title}</Text>
                    {doc.content ? <Text style={[styles.docPreview, { color: colors.mutedForeground }]} numberOfLines={1}>{doc.content}</Text> : null}
                    <Text style={[styles.docTime, { color: colors.mutedForeground }]}>{timeSince(doc.updatedAt)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable hitSlop={8} onPress={() => Alert.alert('Delete Document', `Delete "${doc.title}"?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => { deleteDoc(folder.id, doc.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
                    ])}>
                      <Feather name="trash-2" size={15} color={colors.mutedForeground} />
                    </Pressable>
                    <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </View>
      <DocEditorModal visible={docModal} doc={editDoc} folder={folder} onClose={() => { setDocModal(false); setEditDoc(null); }} />
    </Modal>
  );
}

function FolderCard({ folder, delay }: { folder: AppFolder; delay: number }) {
  const colors = useColors();
  const { deleteFolder } = useData();
  const [open, setOpen] = useState(false);

  function del() {
    Alert.alert('Delete Folder', `Delete "${folder.name}" and all its documents?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteFolder(folder.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
    ]);
  }

  return (
    <>
      <Animated.View entering={FadeInDown.delay(delay).duration(350)}>
        <Pressable
          onPress={() => { setOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={({ pressed }) => [styles.folderCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient colors={[folder.color, folder.color + '66']} style={styles.folderStripe} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
          <View style={styles.folderBody}>
            <View style={[styles.folderBigIcon, { backgroundColor: folder.color + '22' }]}>
              <Feather name="folder" size={28} color={folder.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.folderName, { color: colors.foreground }]}>{folder.name}</Text>
              <Text style={[styles.folderMeta, { color: colors.mutedForeground }]}>
                {folder.docs.length} document{folder.docs.length !== 1 ? 's' : ''} · {timeSince(folder.updatedAt)}
              </Text>
            </View>
            <Pressable onPress={del} hitSlop={10} style={{ padding: 6 }}>
              <Feather name="trash-2" size={15} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
      <FolderDetailModal visible={open} folder={folder} onClose={() => setOpen(false)} />
    </>
  );
}

function FoldersSection() {
  const colors = useColors();
  const { folders } = useData();
  const [modal, setModal] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.listPad, { paddingBottom: 130 }]} showsVerticalScrollIndicator={false}>
        {folders.length === 0 ? (
          <View style={styles.empty}>
            <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="folder-plus" size={32} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No folders yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Create folders to organize your documents, notes, and files</Text>
          </View>
        ) : folders.map((f, i) => <FolderCard key={f.id} folder={f} delay={i * 50} />)}
      </ScrollView>

      <Pressable onPress={() => { setModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.fab}>
        <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.fabInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name="folder-plus" size={22} color="#fff" />
        </LinearGradient>
      </Pressable>

      <CreateFolderModal visible={modal} onClose={() => setModal(false)} />
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHOTOS SECTION
═══════════════════════════════════════════════════════════════ */
function ViewImageModal({ visible, image, onClose, onDelete }: {
  visible: boolean; image: SavedImage | null; onClose: () => void; onDelete: () => void;
}) {
  const colors = useColors();
  if (!image) return null;
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.imageOverlay}>
        <Pressable style={styles.imageClose} onPress={onClose}>
          <View style={styles.imageCloseBtn}><Feather name="x" size={20} color="#fff" /></View>
        </Pressable>
        <Image source={{ uri: image.uri }} style={styles.imageFull} resizeMode="contain" />
        <View style={styles.imageMeta}>
          <Text style={styles.imageMetaName}>{image.name}</Text>
          <Text style={styles.imageMetaTime}>{timeSince(image.createdAt)}</Text>
          {image.note ? <Text style={styles.imageMetaNote}>{image.note}</Text> : null}
          <Pressable onPress={onDelete} style={styles.imageDelBtn}>
            <Feather name="trash-2" size={16} color="#EF4444" />
            <Text style={styles.imageDelText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function PhotosSection() {
  const colors = useColors();
  const { savedImages, addImage, deleteImage } = useData();
  const [viewImg, setViewImg] = useState<SavedImage | null>(null);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to save images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      for (const asset of result.assets) {
        addImage({
          uri: asset.uri,
          name: asset.fileName ?? `Photo ${savedImages.length + 1}`,
          note: '',
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!result.canceled && result.assets[0]) {
      addImage({ uri: result.assets[0].uri, name: `Photo ${savedImages.length + 1}`, note: '' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {savedImages.length === 0 ? (
        <View style={[styles.listPad, styles.empty, { flex: 1, paddingBottom: 120 }]}>
          <LinearGradient colors={['#EC4899', '#8B5CF6']} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Feather name="image" size={32} color="#fff" />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No photos saved</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Save screenshots, references, inspiration, and any images you need</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
            <Pressable onPress={pickImage} style={[styles.photoActionBtn, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '55' }]}>
              <Feather name="image" size={16} color={colors.primary} />
              <Text style={[styles.photoActionText, { color: colors.primary }]}>Gallery</Text>
            </Pressable>
            <Pressable onPress={takePhoto} style={[styles.photoActionBtn, { backgroundColor: colors.accent + '22', borderColor: colors.accent + '55' }]}>
              <Feather name="camera" size={16} color={colors.accent} />
              <Text style={[styles.photoActionText, { color: colors.accent }]}>Camera</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
          {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <Pressable onPress={pickImage} style={[styles.photoActionBtn, { flex: 1, backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="image" size={15} color={colors.primary} />
              <Text style={[styles.photoActionText, { color: colors.foreground }]}>Add from Gallery</Text>
            </Pressable>
            <Pressable onPress={takePhoto} style={[styles.photoActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="camera" size={15} color={colors.accent} />
            </Pressable>
          </View>

          <Text style={[styles.gridCount, { color: colors.mutedForeground }]}>{savedImages.length} photo{savedImages.length !== 1 ? 's' : ''}</Text>

          <View style={styles.imgGrid}>
            {savedImages.map((img, i) => (
              <Animated.View key={img.id} entering={FadeInDown.delay(i * 30).duration(300)}>
                <Pressable onPress={() => setViewImg(img)} style={styles.imgThumb}>
                  <Image source={{ uri: img.uri }} style={styles.imgThumbImg} resizeMode="cover" />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      )}

      <ViewImageModal
        visible={!!viewImg}
        image={viewImg}
        onClose={() => setViewImg(null)}
        onDelete={() => {
          if (viewImg) { deleteImage(viewImg.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); setViewImg(null); }
        }}
      />
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LINKS SECTION
═══════════════════════════════════════════════════════════════ */
function AddLinkModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const { addBookmark } = useData();
  const [url,   setUrl]   = useState('');
  const [title, setTitle] = useState('');
  const [desc,  setDesc]  = useState('');
  const [tag,   setTag]   = useState('');

  function add() {
    let cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    if (!cleanUrl || !title.trim()) { Alert.alert('Required', 'URL and title are required'); return; }
    addBookmark({ url: cleanUrl, title: title.trim(), description: desc.trim(), tags: tag.trim() ? [tag.trim()] : [], pinned: false });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUrl(''); setTitle(''); setDesc(''); setTag(''); onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHandle2, { backgroundColor: colors.border }]} />
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose}><Text style={[styles.mCancel, { color: colors.mutedForeground }]}>Cancel</Text></Pressable>
          <Text style={[styles.mTitle, { color: colors.foreground }]}>Save Link</Text>
          <Pressable onPress={add}><Text style={[styles.mSave, { color: colors.info }]}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          {[
            { label: 'URL *',       icon: 'link',      value: url,   set: setUrl,   keyboard: 'url',   ph: 'https://example.com' },
            { label: 'Title *',     icon: 'type',      value: title, set: setTitle, keyboard: 'default', ph: 'e.g. Awesome Resource' },
            { label: 'Description', icon: 'align-left',value: desc,  set: setDesc,  keyboard: 'default', ph: 'What is this about?' },
            { label: 'Tag',         icon: 'tag',       value: tag,   set: setTag,   keyboard: 'default', ph: 'e.g. design, tools' },
          ].map((f, i) => (
            <View key={i}>
              <Text style={[styles.fLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
              <View style={[styles.fWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Feather name={f.icon as any} size={14} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.fInput, { color: colors.foreground }]}
                  value={f.value} onChangeText={f.set}
                  placeholder={f.ph} placeholderTextColor={colors.mutedForeground}
                  keyboardType={f.keyboard as any}
                  autoCapitalize="none" autoCorrect={false}
                  autoFocus={i === 0}
                />
              </View>
            </View>
          ))}

          <Pressable onPress={add} disabled={!url.trim() || !title.trim()} style={({ pressed }) => [{ borderRadius: 14, overflow: 'hidden', opacity: pressed || !url.trim() || !title.trim() ? 0.6 : 1 }]}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBtn}>
              <Feather name="link" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Save Link</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function BookmarkCard({ bookmark, delay }: { bookmark: Bookmark; delay: number }) {
  const colors = useColors();
  const { deleteBookmark, updateBookmark } = useData();

  function open() {
    const url = bookmark.url;
    if (Platform.OS === 'web') { Linking.openURL(url); }
    else WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
  }

  function del() {
    Alert.alert('Delete Link', `Delete "${bookmark.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteBookmark(bookmark.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
    ]);
  }

  let domain = '';
  try { domain = new URL(bookmark.url).hostname.replace('www.', ''); } catch {}

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)}>
      <Pressable onPress={open} style={({ pressed }) => [styles.linkCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}>
        {/* Domain favicon placeholder */}
        <View style={[styles.linkFavicon, { backgroundColor: colors.info + '22' }]}>
          <Feather name="globe" size={16} color={colors.info} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.linkTitle, { color: colors.foreground }]} numberOfLines={1}>{bookmark.title}</Text>
          <Text style={[styles.linkUrl, { color: colors.mutedForeground }]} numberOfLines={1}>{domain || bookmark.url}</Text>
          {bookmark.description ? <Text style={[styles.linkDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{bookmark.description}</Text> : null}
          <View style={styles.linkFoot}>
            {bookmark.tags.slice(0, 3).map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.info + '1A' }]}>
                <Text style={[styles.tagText, { color: colors.info }]}>#{tag}</Text>
              </View>
            ))}
            <Text style={[styles.linkTime, { color: colors.mutedForeground }]}>{timeSince(bookmark.createdAt)}</Text>
          </View>
        </View>
        <View style={{ gap: 12, paddingLeft: 8 }}>
          <Pressable onPress={() => { updateBookmark(bookmark.id, { pinned: !bookmark.pinned }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} hitSlop={8}>
            <Feather name="bookmark" size={15} color={bookmark.pinned ? colors.info : colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={del} hitSlop={8}>
            <Feather name="trash-2" size={15} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function LinksSection() {
  const colors = useColors();
  const { bookmarks } = useData();
  const [modal,  setModal]  = useState(false);
  const [search, setSearch] = useState('');

  const filtered = bookmarks
    .filter(b => {
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
    })
    .sort((a, b) => { if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1; return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.subBar}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border, flex: 1 }]}>
          <Feather name="search" size={14} color={colors.mutedForeground} />
          <TextInput style={[styles.searchIn, { color: colors.foreground }]} value={search} onChangeText={setSearch} placeholder="Search links..." placeholderTextColor={colors.mutedForeground} />
          {search ? <Pressable onPress={() => setSearch('')} hitSlop={8}><Feather name="x" size={14} color={colors.mutedForeground} /></Pressable> : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.listPad, { paddingBottom: 130 }]} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="link" size={32} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{search ? 'No results' : 'No links saved'}</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Save websites, articles, docs, and tools you want to revisit</Text>
          </View>
        ) : filtered.map((b, i) => <BookmarkCard key={b.id} bookmark={b} delay={i * 40} />)}
      </ScrollView>

      <Pressable onPress={() => { setModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.fab}>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.fabInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name="link" size={22} color="#fff" />
        </LinearGradient>
      </Pressable>

      <AddLinkModal visible={modal} onClose={() => setModal(false)} />
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════════════════════════════ */
export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, folders, savedImages, bookmarks } = useData();
  const [segment, setSegment] = useState<Segment>('notes');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const counts: Record<Segment, number> = {
    notes:   notes.length,
    folders: folders.length,
    photos:  savedImages.length,
    links:   bookmarks.length,
  };

  const segLabels: Record<Segment, string> = {
    notes: 'Notes', folders: 'Folders', photos: 'Photos', links: 'Links',
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={['#08081A', '#0D0D22']} style={[styles.header, { paddingTop: topPad + 14 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Library</Text>
            <Text style={[styles.headerSub, { color: '#ffffff55' }]}>
              {counts[segment]} {segLabels[segment].toLowerCase()}
            </Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: '#6366F115', borderColor: '#6366F133' }]}>
            <Feather name="book-open" size={16} color="#818CF8" />
          </View>
        </View>
        <SegmentPill active={segment} onChange={setSegment} />
      </LinearGradient>

      {/* Content */}
      {segment === 'notes'   && <NotesSection   />}
      {segment === 'folders' && <FoldersSection />}
      {segment === 'photos'  && <PhotosSection  />}
      {segment === 'links'   && <LinksSection   />}
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Header */
  header:    { paddingHorizontal: 20, paddingBottom: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerTitle:{ fontSize: 26, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  headerBadge:{ width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  /* Segment pill */
  pill:     { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 3, marginBottom: 0, overflow: 'hidden' },
  pillItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 11, borderWidth: 1, borderColor: 'transparent' },
  pillLabel:{ fontSize: 11, fontFamily: 'Inter_600SemiBold' },

  /* Sub-bar (search + filter) */
  subBar:   { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 },
  searchBox:{ flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchIn: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  filterBtn:{ width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  /* List padding */
  listPad: { paddingHorizontal: 20, paddingTop: 4, gap: 10 },

  /* FAB */
  fab:      { position: 'absolute', right: 20, bottom: 96, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12 },
  fabInner: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  /* Empty state */
  empty:     { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { width: 80, height: 80, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle:{ fontSize: 20, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  emptySub:  { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },

  /* Modal base */
  modal:       { flex: 1 },
  modalHandle2:{ width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 6 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  mTitle:  { fontSize: 16, fontFamily: 'Inter_700Bold' },
  mCancel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  mSave:   { fontSize: 15, fontFamily: 'Inter_700Bold' },
  fLabel:  { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  fWrap:   { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  fInput:  { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  textArea:{ borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 200, textAlignVertical: 'top', lineHeight: 22 },
  colorRow:{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch:  { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  /* Note card */
  noteCard:   { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  noteAccent: { width: 4 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  noteIconBox:{ width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  noteTitle:  { flex: 1, fontSize: 14, fontFamily: 'Inter_700Bold', letterSpacing: -0.2 },
  noteContent:{ fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 8 },
  noteFoot:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noteDot:    { width: 6, height: 6, borderRadius: 3 },
  noteTime:   { flex: 1, fontSize: 11, fontFamily: 'Inter_400Regular' },
  noteWords:  { fontSize: 11, fontFamily: 'Inter_400Regular' },

  /* Folder card */
  folderCard:  { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  folderStripe:{ height: 4 },
  folderBody:  { flexDirection: 'row', alignItems: 'center', padding: 16 },
  folderBigIcon:{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  folderIconSm: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  folderName:  { fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: -0.2, marginBottom: 4 },
  folderMeta:  { fontSize: 12, fontFamily: 'Inter_400Regular' },

  /* Doc card */
  docCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  docIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  docPreview:{ fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 3 },
  docTime:  { fontSize: 11, fontFamily: 'Inter_400Regular' },

  /* Doc editor */
  editorBar:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  editorBack: { padding: 4 },
  editorTitle:{ flex: 1, fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  saveChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  saveChipText:{ color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  editorBody: { flex: 1, padding: 20, fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 26 },

  /* Photos */
  imgGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imgThumb:  { width: IMG_SIZE, height: IMG_SIZE, borderRadius: 12, overflow: 'hidden' },
  imgThumbImg:{ width: '100%', height: '100%' },
  gridCount: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  photoActionBtn:{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  photoActionText:{ fontSize: 14, fontFamily: 'Inter_500Medium' },

  /* Image viewer */
  imageOverlay: { flex: 1, backgroundColor: '#000000EE', justifyContent: 'center', alignItems: 'center' },
  imageClose:   { position: 'absolute', top: 56, right: 20, zIndex: 10 },
  imageCloseBtn:{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff22', alignItems: 'center', justifyContent: 'center' },
  imageFull:    { width: width - 40, height: width - 40, borderRadius: 16 },
  imageMeta:    { position: 'absolute', bottom: 60, left: 20, right: 20, backgroundColor: '#000000CC', borderRadius: 16, padding: 16 },
  imageMetaName:{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  imageMetaTime:{ color: '#ffffff88', fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  imageMetaNote:{ color: '#ffffffCC', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  imageDelBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  imageDelText: { color: '#EF4444', fontSize: 14, fontFamily: 'Inter_500Medium' },

  /* Links */
  linkCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  linkFavicon:{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  linkTitle:  { fontSize: 14, fontFamily: 'Inter_700Bold', marginBottom: 3, letterSpacing: -0.2 },
  linkUrl:    { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  linkDesc:   { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, marginBottom: 6 },
  linkFoot:   { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tag:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText:    { fontSize: 11, fontFamily: 'Inter_500Medium' },
  linkTime:   { fontSize: 11, fontFamily: 'Inter_400Regular', marginLeft: 'auto' },
  addBtn:     { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14 },
  addBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
