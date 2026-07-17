import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useActivity } from '@/context/ActivityContext';
import { useAgents } from '@/context/AgentsContext';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Badge } from '@/components/ui/Badge';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function timeSince(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatCard({ icon, label, value, color, delay }: {
  icon: string; label: string; value: string; color: string; delay: number;
}) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(450)}
      style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <LinearGradient colors={[color + '28', color + '10']} style={styles.statIconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Feather name={icon as any} size={16} color={color} />
      </LinearGradient>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </Animated.View>
  );
}

function QuickAction({ icon, label, gradient, onPress, delay }: {
  icon: string; label: string; gradient: [string, string]; onPress: () => void; delay: number;
}) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(450)} style={styles.qaItem}>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
        style={({ pressed }) => [styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
      >
        <LinearGradient colors={gradient} style={styles.qaIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name={icon as any} size={20} color="#fff" />
        </LinearGradient>
        <Text style={[styles.qaLabel, { color: colors.foreground }]}>{label}</Text>
        <Feather name="chevron-right" size={13} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

function ProjectRow({ project, delay }: { project: any; delay: number }) {
  const colors = useColors();
  const done = project.tasks.filter((t: any) => t.status === 'done').length;
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <Pressable
        onPress={() => router.push('/(tabs)/projects')}
        style={({ pressed }) => [styles.projectRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
      >
        <View style={[styles.projectDot, { backgroundColor: project.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>{project.name}</Text>
          <View style={styles.progressMini}>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <LinearGradient colors={[project.color, project.color + 'AA']} style={[styles.progressFill, { width: `${project.progress}%` as any }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </View>
            <Text style={[styles.progressPct, { color: colors.mutedForeground }]}>{project.progress}%</Text>
          </View>
          <Text style={[styles.taskCount, { color: colors.mutedForeground }]}>{done}/{project.tasks.length} tasks</Text>
        </View>
        <ProgressRing progress={project.progress} size={40} strokeWidth={4} color={project.color} />
      </Pressable>
    </Animated.View>
  );
}

function ActivityRow({ icon, text, time, color }: { icon: string; text: string; time: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.actRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.actIcon, { backgroundColor: color + '22' }]}>
        <Feather name={icon as any} size={12} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.actText, { color: colors.foreground }]} numberOfLines={1}>{text}</Text>
        <Text style={[styles.actTime, { color: colors.mutedForeground }]}>{time}</Text>
      </View>
    </View>
  );
}

function HeatmapCell({ level }: { level: number }) {
  const colors = useColors();
  const opacity = [0.08, 0.2, 0.4, 0.7, 1][level] || 0.08;
  return (
    <View style={[styles.hmCell, { backgroundColor: level > 0 ? colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0') : colors.border + '44' }]} />
  );
}

function GitHubHeatmap() {
  const colors = useColors();
  const days = Array.from({ length: 49 }, (_, i) => ({ level: Math.floor(Math.random() * 5) }));
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  return (
    <View style={[styles.hmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.hmTitle, { color: colors.foreground }]}>Development Activity</Text>
      <View style={styles.hmWrap}>
        <View style={styles.hmLabels}>
          {dayLabels.map((d, i) => (
            <Text key={i} style={[styles.hmDayLabel, { color: colors.mutedForeground }]}>{d}</Text>
          ))}
        </View>
        <View style={styles.hmGrid}>
          {Array.from({ length: 7 }, (_, row) => (
            <View key={row} style={{ flexDirection: 'row' }}>
              {days.slice(row * 7, row * 7 + 7).map((d, col) => (
                <HeatmapCell key={col} level={d.level} />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function AISuggestionCard({ icon, text, gradient, onPress }: {
  icon: string; text: string; gradient: [string, string]; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, marginBottom: 8 }]}
    >
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16 }}
      >
        <Feather name={icon as any} size={18} color="#fff" />
        <Text style={{ flex: 1, color: '#fff', fontSize: 13, fontFamily: 'Inter_500Medium' }}>{text}</Text>
        <Feather name="arrow-right" size={14} color="#ffffffaa" />
      </LinearGradient>
    </Pressable>
  );
}

function FloatingAIButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPress(); }}
      style={({ pressed }) => [styles.fabAI, { opacity: pressed ? 0.85 : 1 }]}
    >
      <LinearGradient colors={[colors.primary, colors.accent]} style={styles.fabGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Feather name="cpu" size={22} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { projects, notes, bookmarks, savedImages, folders } = useData();
  const { unreadCount } = useActivity();
  const { agents } = useAgents();
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : 0;

  const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks = projects.reduce((a, p) => a + p.tasks.filter(t => t.status === 'done').length, 0);
  const activeProjects = projects.filter(p => p.status === 'active');
  const score = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  const aiSuggestions = [
    { icon: 'target', text: `${activeProjects.length} active projects need attention`, gradient: ['#6366F1', '#4F46E5'] as [string, string] },
    { icon: 'clock', text: `${totalTasks - doneTasks} pending tasks — start with high priority`, gradient: ['#8B5CF6', '#7C3AED'] as [string, string] },
    { icon: 'users', text: `${agents.length} AI agents ready — assign them tasks`, gradient: ['#EC4899', '#DB2777'] as [string, string] },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} tintColor={colors.primary} />}
      >
        <LinearGradient colors={['#08081A', '#0D0D26', '#05050A']} style={[styles.hero, { paddingTop: topPad + 16 }]}>
          <View style={[styles.heroOrb1, { backgroundColor: '#6366F118' }]} />
          <View style={[styles.heroOrb2, { backgroundColor: '#8B5CF612' }]} />
          <View style={styles.heroTopBar}>
            <Pressable onPress={() => {}} style={[styles.iconBtn, { backgroundColor: '#ffffff0D', borderColor: '#ffffff15' }]}>
              <Feather name="bell" size={17} color="#ffffffCC" />
              {unreadCount > 0 && (
                <View style={[styles.notifDot, { backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, top: -5, right: -5, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.heroAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.heroAvatarText}>{initials}</Text>
            </LinearGradient>
          </View>

          <Animated.View entering={FadeInUp.duration(500)} style={styles.heroCenter}>
            <Text style={styles.heroGreet}>{greeting()}</Text>
            <Text style={styles.heroName}>{user?.name?.split(' ')[0] ?? 'Developer'}</Text>
            <Text style={[styles.heroSub, { color: '#ffffff55' }]}>
              {score > 0 ? `${score}% productivity — ${doneTasks}/${totalTasks} tasks done` : 'Ready to build something great?'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).duration(500)} style={styles.scoreWrap}>
            <View style={[styles.scoreCard, { backgroundColor: '#ffffff08', borderColor: '#ffffff12' }]}>
              <ProgressRing progress={score} size={100} strokeWidth={9} />
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreTitle}>Productivity Score</Text>
                <Text style={styles.scoreVal}>{score}%</Text>
                <Text style={styles.scoreDesc}>{doneTasks}/{totalTasks} tasks done</Text>
                <View style={{ marginTop: 10 }}>
                  <Badge
                    label={score >= 80 ? '🔥 Excellent' : score >= 50 ? '✓ On Track' : '⚡ Getting Started'}
                    variant={score >= 80 ? 'success' : score >= 50 ? 'info' : 'warning'}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.body}>
          {/* AI Suggestions */}
          <View style={{ marginBottom: 20 }}>
            <View style={[styles.sectionRow, { marginBottom: 10 }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>AI Insights</Text>
              <Badge label="AI Powered" variant="primary" size="sm" />
            </View>
            {aiSuggestions.map((s, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(i * 80).duration(400)}>
                <AISuggestionCard {...s} onPress={() => {
                  if (i === 0) router.push('/(tabs)/projects');
                  else if (i === 1) router.push('/(tabs)/projects');
                  else router.push('/(tabs)/ai');
                }} />
              </Animated.View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
          <View style={styles.statsRow}>
            <StatCard icon="check-circle" label="Done"     value={`${doneTasks}`}             color={colors.success} delay={80}  />
            <StatCard icon="folder"       label="Projects" value={`${activeProjects.length}`} color={colors.primary} delay={120} />
            <StatCard icon="file-text"    label="Notes"    value={`${notes.length}`}           color={colors.accent}  delay={160} />
            <StatCard icon="cpu"          label="Agents"   value={`${agents.length}`}          color="#EC4899"        delay={200} />
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={styles.qaGrid}>
            <QuickAction icon="plus-circle"  label="New Task"     gradient={['#6366F1', '#4F46E5']} onPress={() => router.push('/(tabs)/projects')} delay={100} />
            <QuickAction icon="folder-plus"  label="New Project"  gradient={['#8B5CF6', '#7C3AED']} onPress={() => router.push('/(tabs)/projects')} delay={140} />
            <QuickAction icon="cpu"          label="AI Agents"    gradient={['#EC4899', '#DB2777']} onPress={() => router.push('/(tabs)/ai')}       delay={180} />
            <QuickAction icon="message-circle" label="Community"  gradient={['#3B82F6', '#2563EB']} onPress={() => router.push('/(tabs)/community')} delay={220} />
          </View>

          {/* Library stats */}
          <Animated.View entering={FadeInDown.delay(240).duration(400)}>
            <View style={[styles.libraryStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { icon: 'file-text', label: 'Notes',   value: notes.length,       color: '#6366F1' },
                { icon: 'folder',    label: 'Folders',  value: folders.length,     color: '#8B5CF6' },
                { icon: 'image',     label: 'Photos',   value: savedImages.length, color: '#EC4899' },
                { icon: 'link',      label: 'Links',    value: bookmarks.length,   color: '#3B82F6' },
              ].map((item, idx, arr) => (
                <Pressable
                  key={item.label}
                  onPress={() => router.push('/(tabs)/library')}
                  style={[styles.libItem, idx < arr.length - 1 && { borderRightWidth: 1, borderRightColor: colors.border }]}
                >
                  <View style={[styles.libIcon, { backgroundColor: item.color + '22' }]}>
                    <Feather name={item.icon as any} size={13} color={item.color} />
                  </View>
                  <Text style={[styles.libVal, { color: colors.foreground }]}>{item.value}</Text>
                  <Text style={[styles.libLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* GitHub-style Heatmap */}
          <GitHubHeatmap />

          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Active Projects</Text>
                <Pressable onPress={() => router.push('/(tabs)/projects')}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontFamily: 'Inter_500Medium' }}>View all</Text>
                </Pressable>
              </View>
              {activeProjects.slice(0, 3).map((p, i) => (
                <ProjectRow key={p.id} project={p} delay={i * 50} />
              ))}
            </>
          )}

          {/* Recent Activity */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
          <View style={[styles.actCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {projects.length === 0 && notes.length === 0 ? (
              <View style={styles.emptyAct}>
                <LinearGradient colors={[colors.primary, colors.accent]} style={styles.emptyActIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Feather name="activity" size={22} color="#fff" />
                </LinearGradient>
                <Text style={[styles.emptyActTitle, { color: colors.foreground }]}>No activity yet</Text>
                <Text style={[styles.emptyActSub, { color: colors.mutedForeground }]}>Create a project or note to get started</Text>
              </View>
            ) : (
              <>
                {projects.slice(0, 3).map(p => (
                  <ActivityRow key={p.id} icon="folder" text={`Created project "${p.name}"`} time={timeSince(p.createdAt)} color={p.color} />
                ))}
                {notes.slice(0, 2).map(n => (
                  <ActivityRow key={n.id} icon="file-text" text={`Added note "${n.title}"`} time={timeSince(n.createdAt)} color={colors.accent} />
                ))}
                {bookmarks.slice(0, 1).map(b => (
                  <ActivityRow key={b.id} icon="link" text={`Saved link "${b.title}"`} time={timeSince(b.createdAt)} color={colors.info} />
                ))}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating AI Button */}
      <FloatingAIButton onPress={() => router.push('/(tabs)/ai')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 28, overflow: 'hidden' },
  heroOrb1: { position: 'absolute', width: 280, height: 280, borderRadius: 999, top: -100, right: -70 },
  heroOrb2: { position: 'absolute', width: 220, height: 220, borderRadius: 999, bottom: -50, left: -80 },
  heroTopBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 24 },
  iconBtn: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  notifDot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', top: 7, right: 7 },
  heroAvatar: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },
  heroCenter: { alignItems: 'center', marginBottom: 24 },
  heroGreet: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#ffffff55', marginBottom: 4 },
  heroName: { fontSize: 30, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: -0.6, marginBottom: 6 },
  heroSub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  scoreWrap: { width: '100%' },
  scoreCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, padding: 20, gap: 20 },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#ffffff55', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  scoreVal: { fontSize: 42, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: -1, lineHeight: 48 },
  scoreDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#ffffff66', marginTop: 2 },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: -0.2, marginBottom: 12, marginTop: 4 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, gap: 6 },
  statIconBg: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  statLabel: { fontSize: 9, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.3 },
  qaGrid: { gap: 9, marginBottom: 20 },
  qaItem: { width: '100%' },
  quickAction: { borderRadius: 16, padding: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  qaIconBox: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  libraryStrip: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  libItem: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  libIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  libVal: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  libLabel: { fontSize: 9, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.3 },
  projectRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1 },
  projectDot: { width: 10, height: 10, borderRadius: 5 },
  projectName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 5 },
  progressMini: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4 },
  progressPct: { fontSize: 10, fontFamily: 'Inter_500Medium', width: 28 },
  taskCount: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  actCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  actIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  actText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  actTime: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  emptyAct: { alignItems: 'center', padding: 32, gap: 10 },
  emptyActIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emptyActTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  emptyActSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  hmCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  hmTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  hmWrap: { flexDirection: 'row', gap: 6 },
  hmLabels: { justifyContent: 'space-between', paddingVertical: 2 },
  hmDayLabel: { fontSize: 8, fontFamily: 'Inter_500Medium', lineHeight: 14 },
  hmGrid: { flex: 1, gap: 3 },
  hmCell: { width: 14, height: 14, borderRadius: 3, margin: 1 },
  fabAI: { position: 'absolute', bottom: 100, right: 20, zIndex: 100 },
  fabGrad: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
