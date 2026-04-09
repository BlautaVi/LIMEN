import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Avatar, Group, Box, Stack, TextInput, ActionIcon, Loader, Center, ScrollArea, Menu, Badge } from '@mantine/core';
import { IconSend, IconMessageCircleOff, IconMoodSmile } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';

const AVAILABLE_REACTIONS = ['❤️', '👍', '😢', '😂', '🫂'];

export function ChatsPage() {
  const { id: activeChatId } = useParams(); 
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/conversations');
        setConversations(response.data);
      } catch (error) {
        console.error('Помилка завантаження чатів', error);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchConversations();
  }, [activeChatId]); 

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await api.get(`/messages/${activeChatId}`);
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error('Помилка завантаження повідомлень', error);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeChatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatId) return;

    try {
      const response = await api.post('/messages', {
        conversationId: activeChatId,
        text: newMessage
      });
      
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Помилка відправки', error);
    }
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await api.put(`/messages/${messageId}/react`, { emoji });
      setMessages((prev) => prev.map(msg => msg._id === messageId ? response.data : msg));
    } catch (error) {
      console.error('Помилка реакції', error);
    }
  };

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p._id !== currentUser._id) || conversation.participants[0];
  };

  return (
    <Box style={{ height: '100vh', backgroundColor: '#F5FDFF', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Container fluid px={40} py="md" style={{ maxWidth: '1600px', width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
        <Paper shadow="md" radius="lg" style={{ flexGrow: 1, display: 'flex', overflow: 'hidden', border: '1px solid #E1F5FE' }}>
          
          <Box style={{ width: '320px', backgroundColor: '#fff', borderRight: '1px solid #E1F5FE', display: 'flex', flexDirection: 'column' }}>
            <Box p="lg" style={{ borderBottom: '1px solid #E1F5FE', backgroundColor: '#FAFCFE' }}>
              <Text fw={800} size="xl" style={{ color: '#0F7EAA' }}>Діалоги</Text>
            </Box>
            
            <ScrollArea style={{ flexGrow: 1 }}>
              {loadingChats ? (
                <Center p="xl"><Loader color="cyan" size="sm" /></Center>
              ) : conversations.length === 0 ? (
                <Text c="dimmed" ta="center" p="xl" size="sm">У вас ще немає діалогів.</Text>
              ) : (
                conversations.map((chat) => {
                  const otherUser = getOtherParticipant(chat);
                  const isActive = chat._id === activeChatId;
                  const displayName = otherUser.fullName || `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Анонім';

                  return (
                    <Box 
                      key={chat._id} 
                      onClick={() => navigate(`/chats/${chat._id}`)}
                      style={{ 
                        padding: '16px 20px', 
                        cursor: 'pointer', 
                        backgroundColor: isActive ? '#EBF8FF' : '#fff',
                        transition: 'background-color 0.2s',
                        borderBottom: '1px solid #F0F4F8'
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F4FAFC' }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#fff' }}
                    >
                      <Group wrap="nowrap">
                        <Avatar src={otherUser.avatarUrl ? `http://localhost:3000${otherUser.avatarUrl}` : null} radius="xl" size="md" />
                        <Box style={{ overflow: 'hidden', flex: 1 }}>
                          <Text fw={isActive ? 700 : 500} size="sm" style={{ color: '#0F7EAA' }} truncate>{displayName}</Text>
                          {otherUser.role === 'psychologist' && <Text size="xs" c="violet">Психолог</Text>}
                        </Box>
                      </Group>
                    </Box>
                  );
                })
              )}
            </ScrollArea>
          </Box>

          <Box style={{ flexGrow: 1, backgroundColor: '#F4F9FD', display: 'flex', flexDirection: 'column' }}>
            {!activeChatId ? (
              <Center style={{ flexGrow: 1, flexDirection: 'column', color: '#B3E5FC' }}>
                <IconMessageCircleOff size={80} stroke={1} />
                <Text mt="md" fw={500} size="lg" style={{ color: '#0F7EAA' }}>Оберіть чат для початку спілкування</Text>
              </Center>
            ) : (
              <>
                <ScrollArea style={{ flexGrow: 1, padding: '24px' }} viewportRef={viewportRef}>
                  {loadingMessages ? (
                    <Center h="100%"><Loader color="cyan" /></Center>
                  ) : messages.length === 0 ? (
                    <Center h="100%"><Badge size="lg" color="cyan" variant="light">Почніть спілкування першим 👋</Badge></Center>
                  ) : (
                    <Stack gap="md">
                      {messages.map((msg) => {
                        const isMyMessage = msg.senderId === currentUser._id;
                        
                        const reactionsCount: Record<string, number> = {};
                        msg.reactions?.forEach((r: any) => {
                          reactionsCount[r.emoji] = (reactionsCount[r.emoji] || 0) + 1;
                        });

                        return (
                          <Group key={msg._id} justify={isMyMessage ? 'flex-end' : 'flex-start'} align="center" gap="xs" style={{ position: 'relative' }}>
                            
                            {!isMyMessage && (
                              <Menu shadow="md" width={220} position="top-start" withArrow>
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray" size="sm" style={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                                    <IconMoodSmile size={18} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Group gap={5} p={5} justify="center">
                                    {AVAILABLE_REACTIONS.map(emoji => (
                                      <ActionIcon key={emoji} variant="subtle" size="lg" onClick={() => handleToggleReaction(msg._id, emoji)}>
                                        <Text size="xl">{emoji}</Text>
                                      </ActionIcon>
                                    ))}
                                  </Group>
                                </Menu.Dropdown>
                              </Menu>
                            )}

                            <Box style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start' }}>
                              <Box 
                                style={{ 
                                  backgroundColor: isMyMessage ? '#4FCDFF' : '#fff', 
                                  color: isMyMessage ? '#fff' : '#2C3E50',
                                  padding: '12px 18px', 
                                  borderRadius: isMyMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                  border: isMyMessage ? 'none' : '1px solid #E1F5FE'
                                }}
                              >
                                <Text size="md" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>{msg.text}</Text>
                                <Text size="xs" ta={isMyMessage ? 'right' : 'left'} mt={4} style={{ color: isMyMessage ? 'rgba(255,255,255,0.8)' : '#A0AEC0', fontSize: '11px' }}>
                                  {new Date(msg.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                              </Box>

                              {Object.keys(reactionsCount).length > 0 && (
                                <Group gap={4} mt={-8} style={{ zIndex: 2, padding: isMyMessage ? '0 10px 0 0' : '0 0 0 10px' }}>
                                  {Object.entries(reactionsCount).map(([emoji, count]) => (
                                    <Badge 
                                      key={emoji} 
                                      color="gray" 
                                      variant="white" 
                                      size="sm"
                                      style={{ padding: '0 6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', textTransform: 'none' }}
                                      onClick={() => handleToggleReaction(msg._id, emoji)}
                                    >
                                      {emoji} {count > 1 ? count : ''}
                                    </Badge>
                                  ))}
                                </Group>
                              )}
                            </Box>

                            {isMyMessage && (
                              <Menu shadow="md" width={220} position="top-end" withArrow>
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray" size="sm" style={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                                    <IconMoodSmile size={18} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Group gap={5} p={5} justify="center">
                                    {AVAILABLE_REACTIONS.map(emoji => (
                                      <ActionIcon key={emoji} variant="subtle" size="lg" onClick={() => handleToggleReaction(msg._id, emoji)}>
                                        <Text size="xl">{emoji}</Text>
                                      </ActionIcon>
                                    ))}
                                  </Group>
                                </Menu.Dropdown>
                              </Menu>
                            )}

                          </Group>
                        );
                      })}
                    </Stack>
                  )}
                </ScrollArea>

                <Box p="lg" style={{ backgroundColor: '#fff', borderTop: '1px solid #E1F5FE' }}>
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                    <Group wrap="nowrap">
                      <TextInput 
                        placeholder="Напишіть повідомлення..." 
                        radius="xl" 
                        size="md" 
                        style={{ flexGrow: 1 }}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.currentTarget.value)}
                        styles={{ input: { backgroundColor: '#F4F9FD', border: '1px solid transparent', '&:focus': { borderColor: '#4FCDFF' } } }}
                      />
                      <ActionIcon type="submit" color="cyan" size="xl" radius="xl" variant="filled" disabled={!newMessage.trim()} style={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
                        <IconSend size={22} />
                      </ActionIcon>
                    </Group>
                  </form>
                </Box>
              </>
            )}
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}