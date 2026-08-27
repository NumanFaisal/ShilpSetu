import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';
import { WeavingThreadLoader } from '../../components/ui/WeavingThreadLoader';
import { getMessages, sendMessage, getAIAssistantResponse } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { MESSAGES, ARTISAN } from '../../mocks/seed';

interface Message {
  id: string;
  text: string;
  isMe: boolean;
  senderName: string;
  timestamp: string;
  isAI?: boolean;
}

export default function ChatScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const { userRole, simulateAIError } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const isAIThread = threadId === 'ai-assistant';

  useEffect(() => {
    if (isAIThread) {
      setMessages([{ id: '1', text: 'Namaste! I\'m your AI assistant. How can I help you grow your craft business today?', isMe: false, senderName: 'ShilpSetu AI', timestamp: new Date().toISOString(), isAI: true }]);
    } else {
      loadMessages();
    }
  }, [threadId]);

  const loadMessages = async () => {
    const data = await getMessages(threadId || 'thread-001');
    setMessages(data.map((m: any) => ({ ...m, isMe: m.senderId !== 'buyer-001' })));
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const myMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isMe: true,
      senderName: 'You',
      timestamp: new Date().toISOString(),
    };
    const userText = text.trim();
    setMessages((prev) => [...prev, myMsg]);
    setText('');
    setSending(true);

    if (isAIThread) {
      setAiTyping(true);
      try {
        const response = await getAIAssistantResponse(userText, { simulateError: simulateAIError });
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          isMe: false,
          senderName: 'ShilpSetu AI',
          timestamp: new Date().toISOString(),
          isAI: true,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (e: any) {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I\'m temporarily unavailable. Please try again in a moment.',
          isMe: false,
          senderName: 'ShilpSetu AI',
          timestamp: new Date().toISOString(),
          isAI: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setAiTyping(false);
      }
    } else {
      await sendMessage(threadId || 'thread-001', userText, userRole === 'artisan' ? 'artisan-001' : 'buyer-001');
    }
    setSending(false);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title={isAIThread ? 'AI Assistant' : 'Heritage Living'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={{ flexDirection: 'row', justifyContent: msg.isMe ? 'flex-end' : 'flex-start', gap: 8 }}>
              {!msg.isMe && (
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: msg.isAI ? '#5B6E4E' : '#F6EEDF', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: msg.isAI ? 12 : 14 }}>{msg.isAI ? '🤖' : '🏢'}</Text>
                </View>
              )}
              <View style={{ maxWidth: '75%', gap: 4 }}>
                {!msg.isMe && (
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8A726B', marginLeft: 4 }}>{msg.senderName}</Text>
                )}
                <View style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: msg.isMe ? 16 : 16,
                  borderBottomRightRadius: msg.isMe ? 4 : 16,
                  borderBottomLeftRadius: msg.isMe ? 16 : 4,
                  backgroundColor: msg.isMe ? '#B5502F' : (msg.isAI ? 'rgba(91,110,78,0.1)' : '#FFFDF8'),
                  borderWidth: msg.isMe ? 0 : 1,
                  borderColor: msg.isAI ? '#5B6E4E' : '#E4D8C3',
                }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: msg.isMe ? '#FFFFFF' : '#2B2420', lineHeight: 20 }}>{msg.text}</Text>
                </View>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: '#B8A9A5', alignSelf: msg.isMe ? 'flex-end' : 'flex-start', marginHorizontal: 4 }}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {/* AI Typing indicator */}
          {aiTyping && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#5B6E4E', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 12 }}>🤖</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(91,110,78,0.1)', borderRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#5B6E4E', padding: 12 }}>
                <WeavingThreadLoader size={40} color="#5B6E4E" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', gap: 10 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={isAIThread ? 'Ask me anything about your business...' : 'Type a message...'}
            placeholderTextColor="#B8A9A5"
            multiline
            style={{
              flex: 1,
              maxHeight: 100,
              backgroundColor: '#FFF8F6',
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#E4D8C3',
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: '#2B2420',
              lineHeight: 20,
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: text.trim() ? '#B5502F' : '#E4D8C3',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={18} color="#FFFFFF" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
