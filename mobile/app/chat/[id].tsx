import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { io } from "socket.io-client";
import storage from "@/lib/storage";
import api from "@/lib/api";
import { GlassView } from "@/components/GlassView";
import { Send, ChevronLeft, Paperclip, Smile, MoreVertical } from "lucide-react-native";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  mediaUrl?: string;
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    const initChat = async () => {
      try {
        // Fetch current user
        const userRes = await api.get("/profile/me");
        setUser(userRes.data);

        // Fetch messages
        const msgsRes = await api.get(`/chat/messages/${id}`);
        setMessages(msgsRes.data);

        // Fetch conversation details (to get the other participant's name)
        const convsRes = await api.get("/chat/conversations");
        const currentConv = convsRes.data.find((c: any) => c.id === id);
        setConversation(currentConv);

        // Socket connection
        const token = await storage.getItem("userToken");
        // Using common socket path, usually it's the root or /socket.io
        socketRef.current = io("https://allumnova.cloud", {
          query: { token },
          transports: ["websocket"],
        });

        socketRef.current.on("new_message", (data: any) => {
          if (data.conversationId === id) {
            setMessages((prev) => [...prev, data]);
          }
        });

        // Add user_typing listener if needed
      } catch (error) {
        console.error("Chat init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const msgData = {
        conversationId: id,
        content: newMessage,
        receiverId: conversation?.participants?.[0]?.id,
      };

      const res = await api.post("/chat/messages", msgData);
      setMessages((prev) => [...prev, res.data]);
      
      // Emit via socket for instant delivery if server supports it
      socketRef.current.emit("send_message", {
          receiverId: conversation?.participants?.[0]?.id,
          message: res.data
      });
      
      setNewMessage("");
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View className={`mb-4 flex-row ${isMe ? "justify-end" : "justify-start"}`}>
        <View 
            className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                isMe ? "bg-accent rounded-tr-none" : "bg-white/10 rounded-tl-none border border-white/5"
            }`}
        >
          <Text className="text-white text-[15px] leading-5">{item.content}</Text>
          <Text className={`text-[9px] mt-1 ${isMe ? "text-white/60" : "text-white/40"}`}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#4FC3F7" size="large" />
      </View>
    );
  }

  const otherParticipant = conversation?.participants?.[0] || { name: "Chat" };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-4 mt-8 flex-row items-center border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full bg-accent items-center justify-center overflow-hidden">
           {otherParticipant.avatar ? (
              <Image source={{ uri: otherParticipant.avatar }} className="w-full h-full" />
           ) : (
              <Text className="text-white font-bold">{otherParticipant.name[0]}</Text>
           )}
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-white font-bold text-base">{otherParticipant.name}</Text>
          <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Online</Text>
        </View>
        <TouchableOpacity>
          <MoreVertical size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="p-4 bg-black border-t border-white/5 flex-row items-center space-x-3">
          <TouchableOpacity className="p-2 bg-white/5 rounded-full">
            <Paperclip size={20} color="#666" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm"
            placeholder="Type a message..."
            placeholderTextColor="#666"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSendMessage}
            className={`p-3 rounded-full ${newMessage.trim() ? 'bg-accent shadow-lg shadow-accent/40' : 'bg-white/5'}`}
          >
            <Send size={20} color={newMessage.trim() ? "white" : "#666"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
