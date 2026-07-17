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
import { useData, Project, Priority, TaskStatus } from '@/context/DataContext';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Badge } from '@/components/ui/Badge';
import * as Haptics from 'expo-haptics';

const PROJECT_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#22C55E', '#3B82F6', '#EF4444', '#14B8A6'];
const PRIORITY_COLORS: Record<Priority, string> = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444', urgent: '#8B5CF6' };

function CreateModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const { addProject } = useData();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [nameFocus, setNameFocus] = useState(false);

  function create() {
    if (!name.trim()) return;
    addProject({ name: name.trim(), description: desc.trim(), status: 'active', color, icon: 'folder', progress: 0 });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName(''); setDesc(''); setColor(PROJECT_COLORS[0]);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Project</Text>
          <Pressable onPress={onClose} style={[styles.modalClose, { backgroundColor: colors.muted }]}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Project Name *</Text>
            <View style={[styles.fieldWrap, { borderColor: nameFocus ? color : colors.border, backgroundColor: colors.card }]}>
              <Feather name="folder" size={16} color={nameFocus ? color : colors.mutedForeground} />
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                value={name} onChangeText={setName}
                placeholder="e.g. Mobile App Redesign"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
              />
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              value={desc} onChangeText={setDesc}
              placeholder="What is this project about?"
              placeholderTextColor={colors.mutedForeground}
              multiline numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Accent Color</Text>
            <View style={styles.colorRow}>
              {PROJECT_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorSwatch, { backgroundColor: c }]}
                >
                  {c === color && (
                    <View style={styles.colorCheck}>
                      <Feather name="check" size={12} color="#fff" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={create}
            disabled={!name.trim()}
            style={({ pressed }) => [styles.createBtn, { opacity: pressed || !name.trim() ? 0.6 : 1, overflow: 'hidden', borderRadius: 14 }]}
          >
            <LinearGradient colors={[color, color + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtnInner}>
              <Feather name="folder-plus" size={18} color="#fff" />
              <Text style={styles.createBtnText}>Create Project</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function AddTaskModal({ projectId, visible, onClose }: { projectId: string; visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const { addTask } = useData();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

  function add() {
    if (!title.trim()) return;
    addTask(projectId, { title: title.trim(), status: 'todo', priority });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTitle(''); setPriority('medium');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Task</Text>
          <Pressable onPress={onClose} style={[styles.modalClose, { backgroundColor: colors.muted }]}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>
        <View style={{ padding: 20, gap: 16 }}>
          <View style={[styles.fieldWrap, { borderColor: colors.primary, backgroundColor: colors.card }]}>
            <Feather name="check-square" size={16} color={colors.primary} />
            <TextInput
              style={[styles.fieldInput, { color: colors.foreground }]}
              value={title} onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              onSubmitEditing={add}
              returnKeyType="done"
            />
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Priority</Text>
            <View style={styles.priorityRow}>
              {priorities.map(p => (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[styles.priorityChip, {
                    backgroundColor: p === priority ? PRIORITY_COLORS[p] + '22' : colors.muted,
                    borderColor: p === priority ? PRIORITY_COLORS[p] : colors.border,
                  }]}
                >
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[p] }]} />
                  <Text style={[styles.priorityText, { color: p === priority ? PRIORITY_COLORS[p] : colors.mutedForeground }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={add} disabled={!title.trim()}
            style={({ pressed }) => [{ borderRadius: 14, overflow: 'hidden', opacity: pressed || !title.trim() ? 0.6 : 1 }]}
          >
            <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addTaskBtn}>
              <Text style={styles.addTaskText}>Add Task</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function TaskItem({ task, projectId }: { task: any; projectId: string }) {
  const colors = useColors();
  const { updateTask } = useData();
  const isDone = task.status === 'done';

  function toggle() {
    updateTask(projectId, task.id, { status: isDone ? 'todo' : 'done' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <Pressable onPress={toggle} style={[styles.taskItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.taskCheck, {
        borderColor: isDone ? colors.success : colors.border,
        backgroundColor: isDone ? colors.success : 'transparent',
      }]}>
        {isDone && <Feather name="check" size={11} color="#fff" />}
      </View>
      <Text style={[styles.taskTitle, {
        color: isDone ? colors.mutedForeground : colors.foreground,
        textDecorationLine: isDone ? 'line-through' : 'none',
        flex: 1,
      }]} numberOfLines={1}>{task.title}</Text>
      <View style={[styles.priorityPill, { backgroundColor: PRIORITY_COLORS[task.priority as Priority] + '22' }]}>
        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority as Priority], width: 5, height: 5 }]} />
      </View>
    </Pressable>
  );
}

function ProjectCard({ project, delay }: { project: Project; delay: number }) {
  const colors = useColors();
  const { deleteProject } = useData();
  const [expanded, setExpanded] = useState(false);
  const [addTask, setAddTask] = useState(false);

  const doneTasks = project.tasks.filter(t => t.status === 'done').length;

  function confirmDelete() {
    Alert.alert('Delete Project', `Delete "${project.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteProject(project.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
    ]);
  }

  return (
    <>
      <Animated.View entering={FadeInDown.delay(delay).duration(450)}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Top color stripe */}
          <LinearGradient colors={[project.color, project.color + '66']} style={styles.cardStripe} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <View style={[styles.cardColorBadge, { backgroundColor: project.color + '22', borderColor: project.color + '44' }]}>
                <View style={[styles.cardColorDot, { backgroundColor: project.color }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{project.name}</Text>
                {project.description ? (
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={1}>{project.description}</Text>
                ) : null}
              </View>
              <Pressable onPress={confirmDelete} hitSlop={8} style={{ padding: 4 }}>
                <Feather name="trash-2" size={14} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {/* Progress bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <LinearGradient
                    colors={[project.color, project.color + 'BB']}
                    style={[styles.progressFill, { width: `${project.progress}%` as any }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={[styles.progressPct, { color: colors.mutedForeground }]}>{project.progress}%</Text>
              </View>
              <Text style={[styles.tasksMeta, { color: colors.mutedForeground }]}>{doneTasks}/{project.tasks.length} tasks done</Text>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <Badge
                label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                variant={project.status === 'active' ? 'success' : 'default'}
              />
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Pressable
                  onPress={() => { setAddTask(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[styles.miniBtn, { borderColor: project.color + '66', backgroundColor: project.color + '11' }]}
                >
                  <Feather name="plus" size={12} color={project.color} />
                  <Text style={[styles.miniBtnText, { color: project.color }]}>Task</Text>
                </Pressable>
                <Pressable
                  onPress={() => setExpanded(!expanded)}
                  style={[styles.expandBtn, { backgroundColor: colors.muted }]}
                >
                  <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>

            {expanded && project.tasks.length > 0 && (
              <View style={[styles.taskList, { borderTopColor: colors.border }]}>
                {project.tasks.map(t => <TaskItem key={t.id} task={t} projectId={project.id} />)}
              </View>
            )}

            {expanded && project.tasks.length === 0 && (
              <View style={[styles.noTasks, { borderTopColor: colors.border }]}>
                <Text style={[styles.noTasksText, { color: colors.mutedForeground }]}>No tasks yet — add one above</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
      <AddTaskModal projectId={project.id} visible={addTask} onClose={() => setAddTask(false)} />
    </>
  );
}

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects } = useData();
  const [createVisible, setCreateVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Projects</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{projects.length} total</Text>
        </View>
        <Pressable
          onPress={() => { setCreateVisible(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{ overflow: 'hidden', borderRadius: 14 }}
        >
          <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.newBtn}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.newBtnText}>New</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.muted, borderColor: colors.border, marginHorizontal: 20, marginTop: 14, marginBottom: 10 }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          value={search} onChangeText={setSearch}
          placeholder="Search projects..."
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
        {(['all', 'active', 'completed'] as const).map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, {
              backgroundColor: f === filter ? colors.primary : colors.muted,
              borderColor: f === filter ? colors.primary : colors.border,
            }]}
          >
            <Text style={[styles.filterText, { color: f === filter ? '#fff' : colors.mutedForeground }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 120 : 110 }]} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="folder-plus" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {search ? 'No results found' : 'No projects yet'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {search ? 'Try a different search term' : 'Create your first project and start organizing your work'}
            </Text>
            {!search && (
              <Pressable
                onPress={() => setCreateVisible(true)}
                style={({ pressed }) => [{ borderRadius: 14, overflow: 'hidden', marginTop: 20, opacity: pressed ? 0.8 : 1 }]}
              >
                <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>Create Project</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        ) : (
          filtered.map((p, i) => <ProjectCard key={p.id} project={p} delay={i * 60} />)
        )}
      </ScrollView>

      <CreateModal visible={createVisible} onClose={() => setCreateVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  newBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  list: { padding: 20, gap: 12 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', marginBottom: 0 },
  cardStripe: { height: 4 },
  cardBody: { padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  cardColorBadge: { width: 36, height: 36, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cardColorDot: { width: 12, height: 12, borderRadius: 6 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: -0.2 },
  cardDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  progressSection: { marginBottom: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  progressBar: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5 },
  progressPct: { fontSize: 11, fontFamily: 'Inter_600SemiBold', width: 30 },
  tasksMeta: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  miniBtnText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  expandBtn: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  taskList: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 4 },
  taskItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  taskCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  priorityPill: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  noTasks: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 12, paddingBottom: 4 },
  noTasksText: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 8, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  emptyBtn: { paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
  modal: { flex: 1 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  modalClose: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  fieldWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 80, textAlignVertical: 'top' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  colorCheck: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 2 },
  createBtn: {},
  createBtnInner: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  createBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  priorityRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  priorityChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  priorityText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  addTaskBtn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  addTaskText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
