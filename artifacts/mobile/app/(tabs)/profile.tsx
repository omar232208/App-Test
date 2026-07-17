import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';

/* ─── Setting row ─────────────────────────────────────────────── */
function SettingRow({ icon, label, value, onPress, iconColor, danger, toggle, toggleValue, onToggle, delay = 0 }: {
  icon: string; label: string; value?: string; onPress?: () => void;
  iconColor?: string; danger?: boolean; toggle?: boolean;
  toggleValue?: boolean; onToggle?: (v: boolean) => void; delay?: number;
}) {
  const colors = useColors();
  const ic = danger ? colors.destructive : (iconColor ?? colors.primary);
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)}>
      <Pressable
        onPress={onPress}
        disabled={toggle || !onPress}
        style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed && !toggle ? 0.7 : 1 }]}
      >
        <View style={[styles.rowIcon, { backgroundColor: ic + '1A' }]}>
          <Feather name={icon as any} size={15} color={ic} />
        </View>
        <Text style={[styles.rowLabel, { color: danger ? colors.destructive : colors.foreground }]}>{label}</Text>
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={v => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle?.(v); }}
            thumbColor={toggleValue ? colors.primary : '#888'}
            trackColor={{ false: colors.border, true: colors.primary + '55' }}
          />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            {value ? <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
            {onPress ? <Feather name="chevron-right" size={14} color={colors.mutedForeground} /> : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ─── Section ─────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

/* ─── Theme picker modal ──────────────────────────────────────── */
function ThemeModal({ visible, current, onClose, onSelect }: {
  visible: boolean; current: ThemeMode; onClose: () => void; onSelect: (t: ThemeMode) => void;
}) {
  const colors = useColors();
  const opts: { value: ThemeMode; label: string; icon: string; desc: string }[] = [
    { value: 'dark',   label: 'Dark',   icon: 'moon',    desc: 'AMOLED dark (recommended)' },
    { value: 'light',  label: 'Light',  icon: 'sun',     desc: 'Light & clean' },
    { value: 'system', label: 'System', icon: 'monitor', desc: 'Follow device setting' },
  ];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.themeCardTitle, { color: colors.foreground }]}>Choose Theme</Text>
          {opts.map(o => (
            <Pressable
              key={o.value}
              onPress={() => { onSelect(o.value); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }}
              style={[styles.themeOpt, { borderColor: current === o.value ? colors.primary : colors.border }]}
            >
              <View style={[styles.themeOptIcon, { backgroundColor: current === o.value ? colors.primary + '22' : colors.muted }]}>
                <Feather name={o.icon as any} size={16} color={current === o.value ? colors.primary : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.themeOptLabel, { color: colors.foreground }]}>{o.label}</Text>
                <Text style={[styles.themeOptDesc, { color: colors.mutedForeground }]}>{o.desc}</Text>
              </View>
              {current === o.value && <Feather name="check-circle" size={18} color={colors.primary} />}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

/* ─── Edit Profile modal ──────────────────────────────────────── */
function EditProfileModal({ visible, current, onClose, onSave }: {
  visible: boolean; current: string; onClose: () => void; onSave: (name: string) => void;
}) {
  const colors = useColors();
  const [name, setName] = useState(current);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Profile</Text>
          <Pressable onPress={() => { if (name.trim()) { onSave(name.trim()); onClose(); } }}>
            <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
          </Pressable>
        </View>
        <View style={{ padding: 20 }}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Display Name</Text>
          <View style={[styles.fieldWrap, { borderColor: colors.primary, backgroundColor: colors.card }]}>
            <Feather name="user" size={15} color={colors.primary} />
            <TextInput
              style={[styles.fieldInput, { color: colors.foreground }]}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              returnKeyType="done"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ─── Change Password modal ───────────────────────────────────── */
function ChangePasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const [old, setOld] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');

  function doChange() {
    if (!old || !newPw || !confirm) { Alert.alert('Error', 'Fill all fields'); return; }
    if (newPw !== confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (newPw.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'Password changed!');
    setOld(''); setNewPw(''); setConfirm('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Change Password</Text>
          <Pressable onPress={doChange}>
            <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
          </Pressable>
        </View>
        <View style={{ padding: 20, gap: 14 }}>
          {[
            { label: 'Current Password', value: old, set: setOld },
            { label: 'New Password',     value: newPw, set: setNewPw },
            { label: 'Confirm New',      value: confirm, set: setConfirm },
          ].map((f, i) => (
            <View key={i}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
              <View style={[styles.fieldWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Feather name="lock" size={15} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.fieldInput, { color: colors.foreground }]}
                  value={f.value}
                  onChangeText={f.set}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry
                  returnKeyType="next"
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

/* ─── Export Data modal ───────────────────────────────────────── */
function showExport(data: object) {
  const json = JSON.stringify(data, null, 2);
  Alert.alert(
    'Export Data',
    `Your data is ready to export.\n\n${json.slice(0, 300)}...`,
    [{ text: 'OK' }]
  );
}

/* ─── Main screen ─────────────────────────────────────────────── */
export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const { projects, notes, folders, savedImages, bookmarks } = useData();
  const { theme, notifications, compact, emailDigest, setTheme, setNotifications, setCompact, setEmailDigest } = useTheme();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : 0;

  const [themeModal,    setThemeModal]    = useState(false);
  const [editModal,     setEditModal]     = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks  = projects.reduce((a, p) => a + p.tasks.filter(t => t.status === 'done').length, 0);
  const initials   = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';

  function handleLogout() {
    Alert.alert('Sign Out', 'Sign out of DevOS?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/welcome'); },
      },
    ]);
  }

  const storageKB = ((projects.length * 2 + notes.length + folders.length + savedImages.length + bookmarks.length) * 1.5).toFixed(0);

  const stats = [
    { label: 'Projects', value: projects.length },
    { label: 'Tasks',    value: totalTasks },
    { label: 'Done',     value: doneTasks },
    { label: 'Notes',    value: notes.length },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: botPad + 110 }}>

        {/* Hero */}
        <LinearGradient colors={['#080818', '#0F0F28']} style={[styles.hero, { paddingTop: topPad + 20 }]}>
          <View style={[styles.heroOrb1, { backgroundColor: '#6366F110' }]} />
          <View style={[styles.heroOrb2, { backgroundColor: '#8B5CF60C' }]} />

          <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarWrap}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <Pressable
              onPress={() => setEditModal(true)}
              style={[styles.avatarEdit, { backgroundColor: colors.primary, borderColor: '#080818' }]}
            >
              <Feather name="edit-2" size={10} color="#fff" />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.nameBlock}>
            <Text style={styles.heroName}>{user?.name ?? 'Developer'}</Text>
            <Text style={styles.heroEmail}>{user?.email ?? ''}</Text>
            <View style={[styles.roleBadge, { borderColor: '#6366F155', backgroundColor: '#6366F115' }]}>
              <View style={[styles.roleDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.roleText}>{user?.role ?? 'Developer'}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={[styles.statsStrip, { backgroundColor: '#ffffff08', borderColor: '#ffffff10' }]}>
            {stats.map((s, i) => (
              <View key={s.label} style={[styles.statItem, i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: '#ffffff15' }]}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>
        </LinearGradient>

        {/* Settings */}
        <View style={styles.body}>
          <Section title="ACCOUNT">
            <SettingRow icon="user"     label="Edit Profile" onPress={() => setEditModal(true)} delay={50} />
            <SettingRow icon="at-sign"  label="Username"     value={`@${(user?.name ?? 'dev').toLowerCase().replace(/\s+/g, '')}`} delay={80} />
            <SettingRow icon="calendar" label="Member Since"
              value={user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString([], { month: 'long', year: 'numeric' }) : 'Today'}
              delay={110} />
          </Section>

          <Section title="APPEARANCE">
            <SettingRow icon="moon"   label="Theme"       value={themeLabel} onPress={() => setThemeModal(true)} iconColor="#818CF8" delay={150} />
            <SettingRow icon="layout" label="Compact Mode" toggle toggleValue={compact} onToggle={setCompact} iconColor="#8B5CF6" delay={180} />
          </Section>

          <Section title="NOTIFICATIONS">
            <SettingRow icon="bell"   label="Push Notifications" toggle toggleValue={notifications} onToggle={setNotifications} iconColor="#EC4899" delay={220} />
            <SettingRow icon="mail"   label="Email Digest"       toggle toggleValue={emailDigest} onToggle={setEmailDigest} iconColor="#6366F1" delay={250} />
          </Section>

          <Section title="SECURITY">
            <SettingRow icon="lock"    label="Change Password" onPress={() => setPasswordModal(true)} iconColor="#EF4444" delay={300} />
            <SettingRow icon="shield"  label="Two-Factor Auth" value="Coming soon" iconColor="#F59E0B" delay={330} />
            <SettingRow icon="smartphone" label="Active Sessions" value="1 device" iconColor="#3B82F6" delay={360} />
          </Section>

          <Section title="DATA & STORAGE">
            <SettingRow icon="download" label="Export Data" onPress={() => showExport({ projects, notes, folders, bookmarks })} iconColor="#14B8A6" delay={400} />
            <SettingRow icon="database" label="Storage Used"  value={`~${storageKB} KB`} delay={430} />
            <SettingRow icon="refresh-cw" label="Sync Status" value="Up to date" delay={460} />
          </Section>

          <Section title="ABOUT">
            <SettingRow icon="info"        label="Version"     value="1.0.0 (Build 1)" delay={500} />
            <SettingRow icon="star"        label="Rate DevOS"  onPress={() => Alert.alert('Thanks! ⭐', 'We appreciate your support.')} iconColor="#F59E0B" delay={520} />
            <SettingRow icon="help-circle" label="Help & Support" onPress={() => Alert.alert('Support', 'Email: support@devos.app')} iconColor="#3B82F6" delay={540} />
            <SettingRow icon="file-text"   label="Privacy Policy" onPress={() => {}} delay={560} />
          </Section>

          {/* Sign Out */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutBtn, { backgroundColor: '#EF444415', borderColor: '#EF444430', opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
          </Pressable>

          <Text style={[styles.footer, { color: colors.mutedForeground }]}>DevOS v1.0.0 · Made with ❤️ for developers</Text>
        </View>
      </ScrollView>

      <ThemeModal    visible={themeModal}    current={theme} onClose={() => setThemeModal(false)} onSelect={setTheme} />
      <EditProfileModal
        visible={editModal}
        current={user?.name ?? ''}
        onClose={() => setEditModal(false)}
        onSave={(name) => updateUser({ name })}
      />
      <ChangePasswordModal visible={passwordModal} onClose={() => setPasswordModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center', overflow: 'hidden' },
  heroOrb1: { position: 'absolute', width: 220, height: 220, borderRadius: 999, top: -60, right: -50 },
  heroOrb2: { position: 'absolute', width: 180, height: 180, borderRadius: 999, bottom: -40, left: -60 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatar:     { width: 92, height: 92, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 34, fontFamily: 'Inter_700Bold', color: '#fff' },
  avatarEdit: { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nameBlock:  { alignItems: 'center', gap: 6, marginBottom: 20 },
  heroName:   { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.4 },
  heroEmail:  { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#ffffff77' },
  roleBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginTop: 4 },
  roleDot:    { width: 6, height: 6, borderRadius: 3 },
  roleText:   { color: '#818CF8', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsStrip: { flexDirection: 'row', width: '100%', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  statItem:   { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal:    { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 },
  statLbl:    { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#ffffff55', marginTop: 2 },
  body:       { paddingHorizontal: 20, paddingTop: 8 },
  section:    { marginTop: 20 },
  sectionTitle: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 },
  sectionCard:  { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon:    { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel:   { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },
  rowValue:   { fontSize: 13, fontFamily: 'Inter_400Regular' },
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28, padding: 16, borderRadius: 16, borderWidth: 1 },
  logoutText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  footer:     { textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 20, marginBottom: 8 },

  /* Overlay / modals */
  overlay:     { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center', padding: 24 },
  themeCard:   { width: '100%', borderRadius: 20, borderWidth: 1, padding: 20, gap: 10 },
  themeCardTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 4, textAlign: 'center' },
  themeOpt:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  themeOptIcon:{ width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  themeOptLabel:{ fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  themeOptDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  modal:       { flex: 1 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  modalTitle:  { fontSize: 16, fontFamily: 'Inter_700Bold' },
  modalCancel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  modalSave:   { fontSize: 15, fontFamily: 'Inter_700Bold' },
  fieldLabel:  { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  fieldWrap:   { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  fieldInput:  { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
});
