import React, { useRef, useState } from 'react';
import {
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
import * as Haptics from 'expo-haptics';

const SUGGESTIONS = [
  { icon: 'code', text: 'Explain async/await in JavaScript' },
  { icon: 'zap', text: 'Generate a REST API for authentication' },
  { icon: 'cpu', text: 'How to optimize React performance?' },
  { icon: 'database', text: 'Write a SQL query to find duplicates' },
  { icon: 'git-branch', text: 'Explain Git rebase vs merge' },
];

function getAIResponse(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('async') || m.includes('await') || m.includes('promise')) {
    return "**async/await** is syntactic sugar over Promises that makes asynchronous code look synchronous:\n\n```javascript\n// Old way with Promises\nfetch('/api/users')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\n// Modern async/await\nasync function getUsers() {\n  try {\n    const res = await fetch('/api/users');\n    const data = await res.json();\n    console.log(data);\n  } catch (err) {\n    console.error(err);\n  }\n}\n```\n\nKey points:\n• `async` marks a function as asynchronous\n• `await` pauses execution until the Promise resolves\n• Always use try/catch for error handling\n• `await` can only be used inside `async` functions";
  }
  if (m.includes('rest') || m.includes('api') || m.includes('generate') || m.includes('endpoint')) {
    return "Here's a clean authentication REST API:\n\n```typescript\nimport express from 'express';\nimport bcrypt from 'bcrypt';\nimport jwt from 'jsonwebtoken';\n\nconst router = express.Router();\n\n// POST /api/auth/register\nrouter.post('/register', async (req, res) => {\n  const { email, password, name } = req.body;\n  const hashed = await bcrypt.hash(password, 12);\n  const user = await User.create({ email, password: hashed, name });\n  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);\n  res.status(201).json({ user, token });\n});\n\n// POST /api/auth/login\nrouter.post('/login', async (req, res) => {\n  const { email, password } = req.body;\n  const user = await User.findByEmail(email);\n  if (!user || !await bcrypt.compare(password, user.password)) {\n    return res.status(401).json({ error: 'Invalid credentials' });\n  }\n  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);\n  res.json({ user, token });\n});\n```\n\nThis includes secure password hashing and JWT token generation.";
  }
  if (m.includes('optimize') || m.includes('performance') || m.includes('react')) {
    return "**React Performance Optimization** — Top strategies:\n\n**1. Memoization**\n```jsx\n// Prevent unnecessary re-renders\nconst MyComponent = React.memo(({ data }) => {\n  return <View>...</View>;\n});\n\n// Memoize expensive calculations\nconst filtered = useMemo(\n  () => data.filter(item => item.active),\n  [data]\n);\n```\n\n**2. Code Splitting**\n```jsx\nconst HeavyChart = React.lazy(() => import('./HeavyChart'));\n// Wrap in <Suspense fallback={<Spinner />}>\n```\n\n**3. Avoid inline functions in JSX**\n```jsx\n// Bad — creates new function on every render\nonPress={() => handlePress(item.id)}\n\n// Good — stable reference\nconst handlePress = useCallback((id) => {...}, []);\n```\n\n**4. Virtual Lists** — Use FlashList instead of ScrollView for large datasets";
  }
  if (m.includes('sql') || m.includes('database') || m.includes('duplicate') || m.includes('query')) {
    return "**SQL Query — Find Duplicates:**\n\n```sql\n-- Method 1: Using GROUP BY\nSELECT email, COUNT(*) as count\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY count DESC;\n\n-- Method 2: Show full duplicate rows\nSELECT *\nFROM users u1\nWHERE EXISTS (\n  SELECT 1 FROM users u2\n  WHERE u2.email = u1.email\n  AND u2.id != u1.id\n)\nORDER BY email;\n\n-- Method 3: Delete duplicates (keep newest)\nDELETE FROM users\nWHERE id NOT IN (\n  SELECT MAX(id)\n  FROM users\n  GROUP BY email\n);\n```\n\nAlways backup your data before running DELETE operations!";
  }
  if (m.includes('git') || m.includes('rebase') || m.includes('merge')) {
    return "**Git Rebase vs Merge:**\n\n**Merge** — Creates a merge commit, preserves history\n```bash\ngit checkout main\ngit merge feature-branch\n# Creates: main ← merge commit ← (feature + main)\n```\n\n**Rebase** — Rewrites commits onto target, clean linear history\n```bash\ngit checkout feature-branch\ngit rebase main\n# Replays your commits on top of main\n```\n\n**When to use each:**\n• **Merge** for public/shared branches (safe, non-destructive)\n• **Rebase** for local cleanup before PR (cleaner history)\n• **Never rebase** commits that others have pulled from\n\n**Interactive rebase** to squash/edit commits:\n```bash\ngit rebase -i HEAD~3\n```";
  }
  if (m.includes('hello') || m.includes('hi ') || m.includes('hey')) {
    return "Hey! 👋 I'm DevOS AI — your intelligent coding companion. I can help you with:\n\n• **Code generation** — APIs, components, utilities\n• **Debugging** — Find and fix errors\n• **Code explanation** — Understand complex code\n• **Architecture** — Design patterns, best practices\n• **SQL & Database** — Queries and optimization\n• **Performance** — Profiling and optimization tips\n\nWhat are you working on today?";
  }
  return "Great question! Let me help you with that.\n\nBased on what you're asking, here are the key things to know:\n\n**1. Understand the fundamentals** — before jumping to solutions, make sure you grasp the core concepts involved\n\n**2. Start simple** — implement the minimal version first, then add complexity\n\n**3. Consider edge cases** — what happens with empty data, errors, or unexpected inputs?\n\n**4. Test as you go** — write tests alongside your code, not after\n\nCould you share more details about your specific use case? I can give you more targeted advice with more context.";
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
      <View style={[
        styles.bubble,
        isUser
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
      ]}>
        <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.foreground }]}>
          {msg.content}
        </Text>
        <Text style={[styles.bubbleTime, { color: isUser ? '#ffffff55' : colors.mutedForeground }]}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { aiMessages, addAIMessage, clearAIMessages } = useData();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  function send(text: string) {
    const t = text.trim();
    if (!t || typing) return;
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addAIMessage({ role: 'user', content: t });
    setTyping(true);
    setTimeout(() => {
      addAIMessage({ role: 'assistant', content: getAIResponse(t) });
      setTyping(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }, 900 + Math.random() * 600);
  }

  const isEmpty = aiMessages.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={['#08081A', '#0F0F28']} style={[styles.header, { paddingTop: topPad + 14 }]}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={[colors.primary, colors.accent]} style={styles.headerAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Feather name="cpu" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>DevOS AI</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={[styles.onlineDot, { backgroundColor: typing ? colors.warning : colors.success }]} />
              <Text style={[styles.headerStatus, { color: typing ? colors.warning : colors.success }]}>
                {typing ? 'Thinking...' : 'Online'}
              </Text>
            </View>
          </View>
        </View>
        {!isEmpty && (
          <Pressable onPress={clearAIMessages} style={[styles.clearBtn, { backgroundColor: '#ffffff10', borderColor: '#ffffff15' }]}>
            <Feather name="trash-2" size={15} color="#ffffff88" />
          </Pressable>
        )}
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {isEmpty ? (
          <View style={styles.emptyWrap}>
            {/* Hero */}
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
                    {[0, 1, 2].map(i => (
                      <View key={i} style={[styles.typingDot, { backgroundColor: colors.primary }]} />
                    ))}
                  </View>
                </View>
              </View>
            ) : null}
          />
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { borderTopColor: colors.border, paddingBottom: botPad + 10, backgroundColor: colors.background }]}>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: colors.foreground }]}
              value={input}
              onChangeText={setInput}
              placeholder="Ask anything..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={2000}
              returnKeyType="send"
              onSubmitEditing={({ nativeEvent }) => send(nativeEvent.text)}
              blurOnSubmit={false}
            />
            <Pressable
              onPress={() => send(input)}
              disabled={!input.trim() || typing}
              style={({ pressed }) => [
                styles.sendBtn,
                { backgroundColor: input.trim() && !typing ? colors.primary : colors.muted, opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Feather name="send" size={15} color={input.trim() && !typing ? '#fff' : colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
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
});
