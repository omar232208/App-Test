import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useData, AIMessage } from '@/context/DataContext';
import { useAgents, getAgentMeta, AgentType } from '@/context/AgentsContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SUGGESTIONS = [
  { icon: 'code', text: 'Explain async/await in JavaScript' },
  { icon: 'zap', text: 'Generate a REST API for authentication' },
  { icon: 'cpu', text: 'How to optimize React performance?' },
  { icon: 'database', text: 'Write a SQL query to find duplicates' },
  { icon: 'git-branch', text: 'Explain Git rebase vs merge' },
];

async function getAIResponse(msg: string): Promise<string> {
  const apiUrl = process.env.EXPO_PUBLIC_AI_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, model: 'devos-ai' }),
      });
      const data = await res.json();
      if (data.response) return data.response;
    } catch { /* fall through to mock */ }
  }
  const m = msg.toLowerCase();
  if (m.includes('async') || m.includes('await') || m.includes('promise'))
    return "**async/await** is syntactic sugar over Promises:\n\n```javascript\nasync function getUsers() {\n  const res = await fetch('/api/users');\n  const data = await res.json();\n  return data;\n}\n```\nKey: `async` marks async function, `await` pauses until Promise resolves. Always use try/catch.";
  if (m.includes('rest') || m.includes('api') || m.includes('generate') || m.includes('endpoint'))
    return "Here's a clean auth REST API:\n\n```typescript\nrouter.post('/register', async (req, res) => {\n  const hashed = await bcrypt.hash(req.body.password, 12);\n  const user = await User.create({ ...req.body, password: hashed });\n  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);\n  res.status(201).json({ user, token });\n```";
  if (m.includes('optimize') || m.includes('performance') || m.includes('react'))
    return "**React Performance** — Top strategies:\n• `React.memo` to prevent unnecessary re-renders\n• `useMemo`/`useCallback` for stable references\n• `React.lazy` for code splitting\n• FlashList/FlatList instead of ScrollView\n• Avoid inline functions in JSX";
  if (m.includes('sql') || m.includes('database') || m.includes('duplicate') || m.includes('query'))
    return "**Find duplicates SQL:**\n\n```sql\nSELECT email, COUNT(*) FROM users\nGROUP BY email HAVING COUNT(*) > 1;\n```\nAlways backup before DELETE operations.";
  if (m.includes('git') || m.includes('rebase') || m.includes('merge'))
    return "**Git Rebase vs Merge:**\n• **Merge** — safe for shared branches, creates merge commit\n• **Rebase** — clean linear history, rewrites commits\n• Use merge for public branches, rebase for local cleanup\n• Never rebase commits others have pulled";
  if (m.includes('hello') || m.includes('hi ') || m.includes('hey'))
    return "Hey! 👋 I'm DevOS AI. I can help with code generation, debugging, architecture, SQL, performance, and more. What are you working on?";
  return "Great question! Let me help. Could you share more details about your specific use case? I can give targeted advice with more context.";
}

function MessageBubble({ msg }: { msg: AIMessage }) {
  const colors = useColors();
  const isUser = msg.role === 'user';
  return (
    <Animated.View entering={FadeInUp.duration(280)} style={[styles.bubbleRow, isUser ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
      {!isUser && (
        <LinearGradient colors={[colors.primary, colors.accent]} style={styles.aiAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name="cpu" size={13} color="#fff" />
        </LinearGradient>
      )}
      <View style={[styles.bubble, isUser
        ? { backgroundColor: colors.primary }
        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
      ]}>
        <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.foreground }]}>{msg.content}</Text>
        <Text style={[styles.bubbleTime, { color: isUser ? '#ffffff55' : colors.mutedForeground }]}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
}

function AgentCard({ type, status, onPress }: { type: AgentType; status: string; onPress: () => void }) {
  const colors = useColors();
  const meta = getAgentMeta(type);
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => [styles.agentCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.agentIcon, { backgroundColor: meta.color + '22' }]}>
        <Feather name={meta.icon as any} size={16} color={meta.color} />
      </View>
      <Text style={[styles.agentName, { color: colors.foreground }]} numberOfLines={1}>
        {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </Text>
      <View style={[styles.statusDot, { backgroundColor: status === 'working' ? '#F59E0B' : status === 'completed' ? '#22C55E' : '#636375' }]} />
    </Pressable>
  );
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { aiMessages, addAIMessage, clearAIMessages } = useData();
  const { agents, assignTask, createDefaultAgents } = useAgents();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [view, setView] = useState<'chat' | 'agents'>('chat');
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const flatRef = useRef<FlatList>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function send(text: string) {
    const t = text.trim();
    if (!t || typing) return;
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addAIMessage({ role: 'user', content: t });
    setTyping(true);
    try {
      const reply = await getAIResponse(t);
      addAIMessage({ role: 'assistant', content: reply });
    } catch { /* ignore */ }
    setTyping(false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }

  const isEmpty = aiMessages.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#08081A', '#0F0F28']} style={[styles.header, { paddingTop: topPad + 14 }]}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={[colors.primary, colors.accent]} style={styles.headerAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Feather name="cpu" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>{view === 'agents' ? 'AI Agents' : 'DevOS AI'}</Text>
            <Text style={[styles.headerStatus, { color: colors.mutedForeground }]}>
              {view === 'agents' ? `${agents.length} agents ready` : typing ? 'Thinking...' : 'Online'}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => setView(view === 'chat' ? 'agents' : 'chat')}
            style={[styles.clearBtn, { backgroundColor: view === 'agents' ? colors.primary + '33' : '#ffffff10', borderColor: '#ffffff15' }]}
          >
            <Feather name={view === 'chat' ? 'grid' : 'message-square'} size={15} color={view === 'agents' ? colors.primary : '#ffffff88'} />
          </Pressable>
          {view === 'chat' && !isEmpty && (
            <Pressable onPress={clearAIMessages} style={[styles.clearBtn, { backgroundColor: '#ffffff10', borderColor: '#ffffff15' }]}>
              <Feather name="trash-2" size={15} color="#ffffff88" />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {view === 'agents' ? (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          {agents.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <Feather name="cpu" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No agents yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Create your AI team to get started</Text>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); createDefaultAgents(); }}
                style={({ pressed }) => [{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, opacity: pressed ? 0.8 : 1 }]}
              >
                <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>Create Default Agents</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {agents.map((agent, i) => (
                <Animated.View key={agent.id} entering={FadeInDown.delay(i * 40).duration(300)} style={{ width: (width - 52) / 3 }}>
                  <AgentCard
                    type={agent.type}
                    status={agent.status}
                    onPress={async () => {
                      setSelectedAgent(agent.type);
                      await assignTask(agent.id, input || `Perform ${agent.type.replace('_', ' ')} analysis`);
                      setView('chat');
                    }}
                  />
                </Animated.View>
              ))}
            </View>
          )}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 20 }]}>
            Tap an agent to assign a task, or switch to chat mode
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={0}>
          {isEmpty ? (
            <View style={styles.emptyWrap}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.emptyHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Feather name="cpu" size={44} color="#fff" />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>AI Developer Assistant</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Ask me anything about code, architecture, debugging, or best practices.
              </Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s, i) => (
                  <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(400)}>
                    <Pressable
                      onPress={() => send(s.text)}
                      style={({ pressed }) => [styles.suggChip, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                    >
                      <View style={[styles.suggIconBox, { backgroundColor: colors.primary + '22' }]}>
                        <Feather name={s.icon as any} size={14} color={colors.primary} />
                      </View>
                      <Text style={[styles.suggText, { color: colors.foreground }]}>{s.text}</Text>
                      <Feather name="arrow-up-right" size={14} color={colors.mutedForeground} />
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </View>
          ) : (
            <FlatList
              ref={flatRef}
              data={aiMessages}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <MessageBubble msg={item} />}
              contentContainerStyle={[styles.msgList, { paddingBottom: 16 }]}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
              ListFooterComponent={typing ? (
                <View style={styles.typingRow}>
                  <LinearGradient colors={[colors.primary, colors.accent]} style={styles.aiAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Feather name="cpu" size={13} color="#fff" />
                  </LinearGradient>
                  <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.typingDots}>
                      {[0, 1, 2].map(i => (<View key={i} style={[styles.typingDot, { backgroundColor: colors.primary }]} />))}
                    </View>
                  </View>
                </View>
              ) : null}
            />
          )}
          <View style={[styles.inputBar, { borderTopColor: colors.border, paddingBottom: botPad + 10, backgroundColor: colors.background }]}>
            <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.foreground }]}
                value={input}
                onChangeText={setInput}
                placeholder="Ask anything..."
                placeholderTextColor={colors.mutedForeground}
                multiline maxLength={2000}
                returnKeyType="send"
                onSubmitEditing={({ nativeEvent }) => send(nativeEvent.text)}
                blurOnSubmit={false}
              />
              <Pressable
                onPress={() => send(input)}
                disabled={!input.trim() || typing}
                style={({ pressed }) => [styles.sendBtn, { backgroundColor: input.trim() && !typing ? colors.primary : colors.muted, opacity: pressed ? 0.8 : 1 }]}
              >
                <Feather name="send" size={15} color={input.trim() && !typing ? '#fff' : colors.mutedForeground} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
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
  clearBtn: { width: 36, height: 36, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 36 },
  emptyHero: { width: 86, height: 86, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 12 },
  emptyTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.4, marginBottom: 10 },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  suggestions: { width: '100%', gap: 8 },
  suggChip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  suggIconBox: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  suggText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  msgList: { paddingHorizontal: 16, paddingTop: 16 },
  bubbleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  bubbleRowLeft: { alignSelf: 'flex-start', alignItems: 'flex-end' },
  bubbleRowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiAvatar: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bubble: { borderRadius: 18, padding: 13, maxWidth: '80%' },
  bubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  bubbleTime: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 5, alignSelf: 'flex-end' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  typingBubble: { borderRadius: 14, padding: 13, borderWidth: 1 },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  typingDot: { width: 6, height: 6, borderRadius: 3 },
  inputBar: { paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderWidth: 1, borderRadius: 18, paddingLeft: 16, paddingRight: 8, paddingVertical: 8 },
  textInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', maxHeight: 120, paddingVertical: 4 },
  sendBtn: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  agentCard: { alignItems: 'center', gap: 6, padding: 12, borderRadius: 16, borderWidth: 1 },
  agentIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  agentName: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  sectionLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 20 },
});
