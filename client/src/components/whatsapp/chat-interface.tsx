import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Search, 
  Smile, 
  Paperclip, 
  Mic, 
  MicOff,
  Send, 
  Phone,
  Video,
  MoreVertical,
  User,
  Loader2
} from "lucide-react";

interface Message {
  id: number;
  conversationId: number;
  messageId: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  content: string;
  mediaUrl?: string;
  fromMe: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'received';
  createdAt: string;
}

interface Conversation {
  id: number;
  phone: string;
  name: string;
  lastMessageAt?: string;
  createdAt: string;
  lastMessage?: {
    content: string;
    fromMe: boolean;
    timestamp: string;
  };
  unreadCount?: number;
}

export function ChatInterface() {
  const { toast } = useToast();

  // Buscar conversas reais do banco com polling automático
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/whatsapp/conversations'],
    refetchInterval: 3000, // Atualiza a cada 3 segundos
    refetchIntervalInBackground: true,
  });

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Buscar mensagens da conversa selecionada com polling automático
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/whatsapp/messages', selectedConversation?.id],
    enabled: !!selectedConversation?.id,
    refetchInterval: 2000, // Atualiza a cada 2 segundos
    refetchIntervalInBackground: true,
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; content: string }) => {
      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      // Invalidar queries para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/messages', selectedConversation?.id] });
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
      console.error('Erro ao enviar mensagem:', error);
    },
  });

  // Auto-scroll quando novas mensagens chegam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.phone.includes(searchTerm)
  );

  // Calcular contadores não lidas
  const unreadCount = conversations.reduce((acc: number, conv: Conversation) => 
    acc + (conv.unreadCount || 0), 0
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: newMessage.trim(),
    });
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, you would start/stop audio recording here
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}min`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Função para formatear telefone de forma legível
  const formatPhone = (phone: string) => {
    // Remove @c.us se presente
    const cleanPhone = phone.replace('@c.us', '');
    // Adiciona formatação brasileira se for número brasileiro
    if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
      const ddd = cleanPhone.substring(2, 4);
      const number = cleanPhone.substring(4);
      const formatted = `+55 ${ddd} ${number.substring(0, 5)}-${number.substring(5)}`;
      return formatted;
    }
    return cleanPhone;
  };

  return (
    <div className="chat-layout" data-testid="chat-interface">
      {/* Chat Sidebar */}
      <div className="chat-sidebar" data-testid="chat-sidebar">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border" data-testid="sidebar-header">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Conversas</h3>
            <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
              {conversationsLoading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                `${unreadCount} não lidas`
              )}
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-conversations"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto" data-testid="conversations-list">
          {conversationsLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando conversas...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conversation: Conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-border hover:bg-muted cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
                data-testid={`conversation-${conversation.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground truncate" data-testid={`conversation-name-${conversation.id}`}>
                        {conversation.name}
                      </p>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-muted-foreground" data-testid={`conversation-time-${conversation.id}`}>
                          {formatLastMessageTime(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate" data-testid={`conversation-last-message-${conversation.id}`}>
                        {conversation.lastMessage?.content || formatPhone(conversation.phone)}
                      </p>
                      {(conversation.unreadCount || 0) > 0 && (
                        <Badge 
                          className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center"
                          data-testid={`conversation-unread-${conversation.id}`}
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground" data-testid="no-conversations">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" />
              <p>Nenhuma conversa encontrada</p>
              <p className="text-xs mt-2">
                As conversas aparecerão automaticamente quando mensagens chegarem do WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Main */}
      <div className="chat-main" data-testid="chat-main">
        {selectedConversation ? (
          <div className="chat-window h-full flex flex-col">
            {/* Chat Header */}
            <div className="chat-header flex items-center justify-between" data-testid="chat-header">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium text-foreground" data-testid="chat-contact-name">
                    {selectedConversation.name}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="chat-contact-phone">
                    {formatPhone(selectedConversation.phone)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" data-testid="button-call">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-video">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-more">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages flex-1 space-y-4" data-testid="chat-messages">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Carregando mensagens...</span>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div
                      className={`message-bubble ${message.fromMe ? 'sent' : 'received'}`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${message.fromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {formatTime(message.timestamp)}
                        {message.fromMe && (
                          <span className="ml-2">
                            {message.status === 'sent' && '✓'}
                            {message.status === 'delivered' && '✓✓'}
                            {message.status === 'read' && '✓✓'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-32 text-center text-muted-foreground">
                  <div>
                    <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-xs">Inicie a conversa enviando uma mensagem</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="chat-input-area" data-testid="chat-input-area">
              <Button
                variant="ghost"
                size="sm"
                className="chat-tool-btn"
                data-testid="button-emoji"
              >
                <Smile className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="chat-tool-btn"
                data-testid="button-attach"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <Textarea
                ref={textareaRef}
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                className="flex-1 resize-none min-h-[40px] max-h-[120px]"
                data-testid="input-message"
                disabled={sendMessageMutation.isPending}
              />
              
              <Button
                variant="ghost"
                size="sm"
                className={`chat-tool-btn ${isRecording ? 'text-red-500' : ''}`}
                onClick={toggleRecording}
                data-testid="button-record"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-10 h-10 p-0"
                data-testid="button-send"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="chat-welcome" data-testid="chat-welcome">
            <MessageSquare className="w-16 h-16 text-primary mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Bem-vindo ao Chat</h2>
            <p className="text-muted-foreground">Selecione uma conversa para começar.</p>
            <p className="text-xs text-muted-foreground mt-2">
              As mensagens do WhatsApp aparecerão automaticamente aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}