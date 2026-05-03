import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Avatar, Group, Box, Stack, TextInput, ActionIcon, Loader, Center, ScrollArea, Menu, Badge, ThemeIcon, Button, Modal } from '@mantine/core';
import { IconSend, IconMessageCircleOff, IconMoodSmile, IconPencil, IconTrash, IconPin, IconX, IconCheck, IconCalendarEvent, IconArrowLeft } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
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
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [consultDate, setConsultDate] = useState<Date | null>(null);
  const [consultNote, setConsultNote] = useState('');

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
      setEditingMessageId(null);
      setNewMessage('');
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
      if (editingMessageId) {
        await api.put(`/messages/${editingMessageId}/edit`, { text: newMessage });
        setMessages(prev => prev.map(msg => msg._id === editingMessageId ? { ...msg, text: newMessage, isEdited: true } : msg));
        setEditingMessageId(null);
      } else {
        const response = await api.post('/messages', {
          conversationId: activeChatId,
          text: newMessage,
          type: 'text'
        });
        setMessages((prev) => [...prev, response.data]);
        scrollToBottom();
      }
      setNewMessage('');
    } catch (error) {
      console.error('Помилка відправки/редагування', error);
    }
  };

  const handleSendConsultation = async () => {
    if (!activeChatId || !consultDate) return;

    const isPsychologist = currentUser.role === 'psychologist';
    const type = isPsychologist ? 'consultation_offer' : 'consultation_request';
    const text = isPsychologist 
      ? `Пропоную провести консультацію ${dayjs(consultDate).format('DD.MM.YYYY')} 📅\n${consultNote}`
      : `Хочу записатися до вас на консультацію ${dayjs(consultDate).format('DD.MM.YYYY')} 📅\n${consultNote}`;

    try {
      const response = await api.post('/messages', {
        conversationId: activeChatId,
        text: text,
        type: type,
        metaData: { 
          date: consultDate, 
          status: 'pending'
        }
      });
      
      setMessages((prev) => [...prev, response.data]);
      setIsConsultModalOpen(false);
      setConsultDate(null);
      setConsultNote('');
      scrollToBottom();
    } catch (error) {
      console.error('Помилка створення консультації', error);
    }
  };

  const handleConsultationResponse = async (messageId: string, status: 'accepted' | 'declined') => {
    try {
      await api.put(`/messages/${messageId}/consultation-status`, { status });
      setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, metaData: { ...msg.metaData, status } } : msg));
      
      await api.post('/messages', {
        conversationId: activeChatId,
        text: status === 'accepted' ? ' Консультацію підтверджено!' : ' На жаль, зараз немає можливості провести консультацію.',
        type: 'text'
      });
      
      const response = await api.get(`/messages/${activeChatId}`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Помилка оновлення статусу', error);
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

  const handleDeleteMessage = async (messageId: string, forEveryone: boolean) => {
    if (!window.confirm(forEveryone ? 'Видалити це повідомлення для всіх?' : 'Видалити це повідомлення тільки для себе?')) return;
    try {
      await api.delete(`/messages/${messageId}?forEveryone=${forEveryone}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Помилка видалення', error);
      alert('Не вдалося видалити повідомлення');
    }
  };

  const handleTogglePin = async (messageId: string) => {
    try {
      await api.put(`/messages/${messageId}/pin`);
      setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg));
    } catch (error) {
      console.error('Помилка закріплення', error);
    }
  };

  const startEditing = (msg: any) => {
    setEditingMessageId(msg._id);
    setNewMessage(msg.text);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setNewMessage('');
  };

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p._id !== currentUser._id) || conversation.participants[0];
  };

  const pinnedMessage = messages.slice().reverse().find(m => m.isPinned);

  const activeConversation = conversations.find(c => c._id === activeChatId);
  const otherUser = activeConversation ? getOtherParticipant(activeConversation) : null;
  const isChattingWithPsychologist = otherUser?.role === 'psychologist';
  const amIPsychologist = currentUser.role === 'psychologist';

  return (
    <Box style={{ height: '100vh', backgroundColor: 'var(--lm-bg)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Modal opened={isConsultModalOpen} onClose={() => setIsConsultModalOpen(false)} title={<Text fw={800} size="xl" style={{ color: 'var(--lm-dark)', letterSpacing: '-0.5px' }}>{amIPsychologist ? 'Запропонувати консультацію' : 'Записатись на консультацію'}</Text>} centered radius="xl" overlayProps={{ blur: 4, opacity: 0.4 }}>
        <Stack gap="md" mt="sm">
          <DatePickerInput
            label="Оберіть бажану дату"
            placeholder="Натисніть щоб вибрати"
            value={consultDate}
            onChange={setConsultDate}
            minDate={new Date()}
            radius="xl"
            size="md"
            styles={{ input: { backgroundColor: 'var(--lm-bg-input)', border: '1px solid transparent', color: 'var(--lm-dark)', '&:focus': { borderColor: 'var(--lm-orange)' } } }}
          />
          <TextInput
            label="Коментар (тема або побажання)"
            placeholder="Про що б ви хотіли поговорити?"
            value={consultNote}
            onChange={(e) => setConsultNote(e.currentTarget.value)}
            radius="xl"
            size="md"
            styles={{ input: { backgroundColor: 'var(--lm-bg-input)', border: '1px solid transparent', color: 'var(--lm-dark)', '&:focus': { borderColor: 'var(--lm-orange)' } } }}
          />
          <Button fullWidth radius="xl" size="lg" mt="md" onClick={handleSendConsultation} disabled={!consultDate}
            style={{ backgroundColor: 'var(--lm-orange)', color: '#fff', fontWeight: 700, boxShadow: 'var(--lm-shadow-orange)' }}
          >
            Відправити запит
          </Button>
        </Stack>
      </Modal>
      
      <Container fluid px={{ base: 0, sm: 20, md: 40 }} py={{ base: 0, sm: 20, md: 30 }} style={{ maxWidth: '1600px', width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <Paper 
          shadow="none" 
          radius={{ base: 0, sm: 'xl' }} 
          style={{ 
            flexGrow: 1, display: 'flex', overflow: 'hidden', 
            border: '1px solid var(--lm-border)', borderTop: 'none', borderBottom: 'none', backgroundColor: 'var(--lm-card-bg)',
            boxShadow: 'var(--lm-shadow-sm)'
          }}
        >
          
          <Box 
            display={{ base: activeChatId ? 'none' : 'flex', md: 'flex' }}
            style={{ width: '100%', maxWidth: '380px', minWidth: '300px', flex: '0 0 auto', backgroundColor: 'var(--lm-card-bg)', borderRight: '1px solid var(--lm-border)', flexDirection: 'column', zIndex: 2 }}
          >
            <Box p="24px" style={{ borderBottom: '1px solid var(--lm-border)', backgroundColor: 'var(--lm-card-bg)' }}>
              <Text fw={800} size="24px" style={{ color: 'var(--lm-dark)', letterSpacing: '-0.5px' }}>Діалоги</Text>
            </Box>
            
            <ScrollArea style={{ flexGrow: 1, backgroundColor: 'var(--lm-bg-alt)' }}>
              {loadingChats ? (
                <Center p="xl" mt="xl"><Loader color="orange" size="md" /></Center>
              ) : conversations.length === 0 ? (
                <Text c="dimmed" ta="center" p="xl" size="md" fw={500} style={{ color: 'var(--lm-muted)' }}>У вас ще немає діалогів.</Text>
              ) : (
                conversations.map((chat) => {
                  const oUser = getOtherParticipant(chat);
                  const isActive = chat._id === activeChatId;
                  const displayName = oUser.fullName || `${oUser.firstName || ''} ${oUser.lastName || ''}`.trim() || 'Анонім';

                  return (
                    <Box 
                      key={chat._id} 
                      onClick={() => navigate(`/chats/${chat._id}`)}
                      style={{ 
                        padding: '16px 20px', cursor: 'pointer', 
                        backgroundColor: isActive ? 'var(--lm-orange-light)' : 'transparent',
                        borderLeft: isActive ? '4px solid var(--lm-orange)' : '4px solid transparent',
                        transition: 'all 0.2s ease',
                        borderBottom: '1px solid var(--lm-border)'
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--lm-card-bg)' }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <Group wrap="nowrap" gap="md">
                        <Avatar src={oUser.avatarUrl ? `http://localhost:3000${oUser.avatarUrl}` : null} radius="xl" size="md" style={{ border: '2px solid var(--lm-card-bg)', boxShadow: 'var(--lm-shadow-sm)' }} />
                        <Box style={{ overflow: 'hidden', flex: 1 }}>
                          <Text fw={isActive ? 800 : 600} size="15px" style={{ color: 'var(--lm-dark)' }} truncate>{displayName}</Text>
                          {oUser.role === 'psychologist' && <Badge size="xs" color="violet" variant="light" mt={2}>Психолог</Badge>}
                        </Box>
                      </Group>
                    </Box>
                  );
                })
              )}
            </ScrollArea>
          </Box>

          <Box 
            display={{ base: activeChatId ? 'flex' : 'none', md: 'flex' }}
            style={{ flex: '1 1 auto', backgroundColor: 'var(--lm-bg)', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
          >
            {!activeChatId ? (
              <Center display={{ base: 'none', md: 'flex' }} style={{ flexGrow: 1, flexDirection: 'column', backgroundColor: 'var(--lm-bg)' }}>
                <ThemeIcon size={120} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-orange-light)', color: 'var(--lm-orange)', opacity: 0.8 }} mb="xl">
                  <IconMessageCircleOff size={60} stroke={1.5} />
                </ThemeIcon>
                <Text fw={700} size="xl" style={{ color: 'var(--lm-dark)' }}>Оберіть діалог ліворуч</Text>
                <Text size="md" mt="xs" style={{ color: 'var(--lm-muted)' }}>щоб почати або продовжити спілкування</Text>
              </Center>
            ) : (
              <>
                <Box p="16px 20px" style={{ borderBottom: '1px solid var(--lm-border)', backgroundColor: 'var(--lm-card-bg)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                  <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/chats')} hiddenFrom="md">
                    <IconArrowLeft size={24} stroke={2} color="var(--lm-dark)" />
                  </ActionIcon>
                  <Avatar src={otherUser?.avatarUrl ? `http://localhost:3000${otherUser.avatarUrl}` : null} radius="xl" size="md" />
                  <Box style={{ overflow: 'hidden', flex: 1 }}>
                    <Text fw={700} size="15px" style={{ color: 'var(--lm-dark)', lineHeight: 1.2 }} truncate>
                      {otherUser?.fullName || `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || 'Анонім'}
                    </Text>
                    {isChattingWithPsychologist && <Text size="xs" style={{ color: 'var(--lm-orange)', fontWeight: 600 }}>Психолог</Text>}
                  </Box>
                </Box>

                {pinnedMessage && (
                  <Box p="12px 20px" style={{ backgroundColor: 'var(--lm-card-bg)', borderBottom: '1px solid var(--lm-border)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 5, boxShadow: 'var(--lm-shadow-sm)' }}>
                    <ThemeIcon variant="light" color="orange" radius="xl" size="md"><IconPin size={16} /></ThemeIcon>
                    <Box style={{ flex: 1, overflow: 'hidden' }}>
                      <Text size="10px" fw={700} style={{ color: 'var(--lm-orange)', textTransform: 'uppercase' }}>Закріплене повідомлення</Text>
                      <Text size="sm" truncate style={{ color: 'var(--lm-dark-soft)' }}>{pinnedMessage.text}</Text>
                    </Box>
                  </Box>
                )}

                <ScrollArea style={{ flexGrow: 1, padding: '16px', backgroundColor: 'var(--lm-bg)' }} viewportRef={viewportRef}>
                  {loadingMessages ? (
                    <Center h="100%"><Loader color="orange" size="md" /></Center>
                  ) : messages.length === 0 ? (
                    <Center h="100%"><Badge size="lg" radius="xl" color="orange" variant="light" style={{ fontWeight: 600, padding: '0 16px', height: '36px', textTransform: 'none' }}>Почніть спілкування першим 👋</Badge></Center>
                  ) : (
                    <Stack gap="md">
                      {messages.map((msg) => {
                        const isMyMessage = msg.senderId === currentUser._id;
                        const isConsultationMsg = msg.type === 'consultation_offer' || msg.type === 'consultation_request';

                        const reactionsCount: Record<string, number> = {};
                        msg.reactions?.forEach((r: any) => {
                          reactionsCount[r.emoji] = (reactionsCount[r.emoji] || 0) + 1;
                        });

                        return (
                          <Group key={msg._id} justify={isMyMessage ? 'flex-end' : 'flex-start'} align="center" gap="xs" wrap="nowrap" style={{ position: 'relative' }}>
                            
                            {!isMyMessage && (
                              <Menu shadow="xl" width={220} position="top-start" withArrow radius="md">
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray" size="sm" radius="xl" style={{ opacity: 0.5, transition: 'all 0.2s', '&:hover': { opacity: 1, backgroundColor: 'var(--lm-orange-light)', color: 'var(--lm-orange)' } }}>
                                    <IconMoodSmile size={18} stroke={2} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Group gap={4} p={8} justify="center" mb="xs">
                                    {AVAILABLE_REACTIONS.map(emoji => (
                                      <ActionIcon key={emoji} variant="subtle" size="lg" radius="xl" onClick={() => handleToggleReaction(msg._id, emoji)} style={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.15)', backgroundColor: 'var(--lm-bg-input)' } }}>
                                        <Text size="20px">{emoji}</Text>
                                      </ActionIcon>
                                    ))}
                                  </Group>
                                  <Menu.Divider />
                                  <Menu.Item leftSection={<IconPin size={16} />} onClick={() => handleTogglePin(msg._id)} style={{ fontWeight: 500, color: 'var(--lm-dark)' }}>
                                    {msg.isPinned ? 'Відкріпити' : 'Закріпити'}
                                  </Menu.Item>
                                  <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => handleDeleteMessage(msg._id, false)} style={{ fontWeight: 500 }}>
                                    Видалити для мене
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            )}

                            <Box style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start' }}>
                              <Box 
                                style={{ 
                                  backgroundColor: isMyMessage ? (isConsultationMsg ? 'var(--lm-orange-light)' : 'var(--lm-orange)') : 'var(--lm-card-bg)',
                                  color: isMyMessage && !isConsultationMsg ? '#fff' : 'var(--lm-dark)',
                                  padding: '12px 16px', 
                                  borderRadius: isMyMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                  boxShadow: isMyMessage && !isConsultationMsg ? 'var(--lm-shadow-sm)' : '0 4px 12px rgba(43, 69, 78, 0.05)',
                                  border: (isMyMessage && !isConsultationMsg) ? 'none' : (isConsultationMsg ? '2px dashed var(--lm-orange)' : '1px solid var(--lm-border)'),
                                  position: 'relative',
                                  width: isConsultationMsg ? '100%' : 'auto',
                                  minWidth: isConsultationMsg ? '260px' : 'auto'
                                }}
                              >
                                {isConsultationMsg && (
                                  <Badge color="orange" variant="filled" size="sm" mb="xs" style={{ display: 'block', width: 'fit-content' }}>
                                    {msg.type === 'consultation_offer' ? 'Пропозиція консультації' : 'Запит на консультацію'}
                                  </Badge>
                                )}

                                {msg.isPinned && (
                                  <IconPin size={14} style={{ position: 'absolute', top: -8, right: isMyMessage ? 10 : -8, color: isMyMessage ? '#FFF' : 'var(--lm-orange)', transform: 'rotate(45deg)' }} />
                                )}
                                <Text size="15px" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5, fontWeight: isConsultationMsg ? 600 : 500 }}>{msg.text}</Text>
                                
                                {isConsultationMsg && !isMyMessage && msg.metaData?.status === 'pending' && (
                                  <Group grow mt="md" gap="xs">
                                    <Button size="xs" radius="xl" color="green" onClick={() => handleConsultationResponse(msg._id, 'accepted')}>Підтвердити</Button>
                                    <Button size="xs" radius="xl" color="red" variant="light" onClick={() => handleConsultationResponse(msg._id, 'declined')}>Відхилити</Button>
                                  </Group>
                                )}

                                {isConsultationMsg && msg.metaData?.status !== 'pending' && (
                                  <Badge color={msg.metaData?.status === 'accepted' ? 'green' : 'red'} variant="light" size="sm" mt="md" style={{ display: 'block', textAlign: 'center' }}>
                                    {msg.metaData?.status === 'accepted' ? 'Прийнято' : 'Відхилено'}
                                  </Badge>
                                )}

                                <Group gap={6} justify={isMyMessage ? 'flex-end' : 'flex-start'} mt={8}>
                                  <Text size="10px" style={{ color: isMyMessage && !isConsultationMsg ? 'rgba(255,255,255,0.7)' : 'var(--lm-muted)', fontWeight: 600 }}>
                                    {new Date(msg.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                  </Text>
                                  {msg.isEdited && (
                                    <Text size="10px" style={{ color: isMyMessage && !isConsultationMsg ? 'rgba(255,255,255,0.6)' : 'var(--lm-muted)', fontStyle: 'italic' }}>
                                      (змінено)
                                    </Text>
                                  )}
                                </Group>
                              </Box>

                              {Object.keys(reactionsCount).length > 0 && (
                                <Group gap={4} mt={-10} style={{ zIndex: 2, padding: isMyMessage ? '0 12px 0 0' : '0 0 0 12px' }}>
                                  {Object.entries(reactionsCount).map(([emoji, count]) => (
                                    <Badge 
                                      key={emoji} color="gray" variant="white" size="md" radius="xl"
                                      style={{ padding: '0 6px', height: '24px', boxShadow: 'var(--lm-shadow-sm)', cursor: 'pointer', textTransform: 'none', border: '1px solid var(--lm-border)', backgroundColor: 'var(--lm-card-bg)' }}
                                      onClick={() => handleToggleReaction(msg._id, emoji)}
                                    >
                                      <span style={{ fontSize: '12px', marginRight: count > 1 ? '4px' : '0' }}>{emoji}</span> 
                                      <span style={{ fontWeight: 700, color: 'var(--lm-dark)' }}>{count > 1 ? count : ''}</span>
                                    </Badge>
                                  ))}
                                </Group>
                              )}
                            </Box>

                            {isMyMessage && (
                              <Menu shadow="xl" width={220} position="top-end" withArrow radius="md">
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray" size="sm" radius="xl" style={{ opacity: 0.5, transition: 'all 0.2s', '&:hover': { opacity: 1, backgroundColor: 'var(--lm-orange-light)', color: 'var(--lm-orange)' } }}>
                                    <IconMoodSmile size={18} stroke={2} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Group gap={4} p={8} justify="center" mb="xs">
                                    {AVAILABLE_REACTIONS.map(emoji => (
                                      <ActionIcon key={emoji} variant="subtle" size="lg" radius="xl" onClick={() => handleToggleReaction(msg._id, emoji)} style={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.15)', backgroundColor: 'var(--lm-bg-input)' } }}>
                                        <Text size="20px">{emoji}</Text>
                                      </ActionIcon>
                                    ))}
                                  </Group>
                                  <Menu.Divider />
                                  <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => startEditing(msg)} style={{ fontWeight: 500, color: 'var(--lm-dark)' }}>
                                    Редагувати
                                  </Menu.Item>
                                  <Menu.Item leftSection={<IconPin size={16} />} onClick={() => handleTogglePin(msg._id)} style={{ fontWeight: 500, color: 'var(--lm-dark)' }}>
                                    {msg.isPinned ? 'Відкріпити' : 'Закріпити'}
                                  </Menu.Item>
                                  <Menu.Divider />
                                  <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => handleDeleteMessage(msg._id, false)} style={{ fontWeight: 500 }}>
                                    Видалити для мене
                                  </Menu.Item>
                                  <Menu.Item color="red" fw={600} leftSection={<IconTrash size={16} stroke={2.5}/>} onClick={() => handleDeleteMessage(msg._id, true)}>
                                    Видалити для всіх
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            )}

                          </Group>
                        );
                      })}
                    </Stack>
                  )}
                </ScrollArea>

                <Box style={{ backgroundColor: 'var(--lm-card-bg)', borderTop: '1px solid var(--lm-border)', display: 'flex', flexDirection: 'column' }}>
                  
                  {editingMessageId && (
<Box p="8px 20px" style={{ backgroundColor: 'var(--lm-orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--lm-border)' }}>                      <Group gap="xs">
                        <IconPencil size={14} color="var(--lm-orange)" />
                        <Text size="xs" fw={600} style={{ color: 'var(--lm-orange)' }}>Редагування повідомлення...</Text>
                      </Group>
                      <ActionIcon size="sm" radius="xl" variant="subtle" color="gray" onClick={cancelEditing}>
                        <IconX size={14} />
                      </ActionIcon>
                    </Box>
                  )}

                  <Box p={{ base: '12px 16px', md: '16px 24px' }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {(amIPsychologist || isChattingWithPsychologist) && (
                      <ActionIcon 
                        size="lg" radius="xl" variant="light" color="violet" 
                        title={amIPsychologist ? "Запропонувати консультацію" : "Записатися на консультацію"}
                        onClick={() => setIsConsultModalOpen(true)}
                        style={{ backgroundColor: 'var(--lm-bg-alt)', flexShrink: 0 }}
                      >
                        <IconCalendarEvent size={20} stroke={2} />
                      </ActionIcon>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ flexGrow: 1, display: 'flex', gap: '8px' }}>
                      <TextInput 
                        placeholder="Повідомлення..." 
                        radius="xl" size="md" style={{ flexGrow: 1 }} value={newMessage} onChange={(e) => setNewMessage(e.currentTarget.value)}
                        styles={{ 
                          input: { 
                            backgroundColor: 'var(--lm-bg-input)', border: '1px solid transparent', fontSize: '15px', padding: '0 16px', color: 'var(--lm-dark)',
                            transition: 'all 0.2s var(--lm-ease)', '&:focus': { borderColor: 'var(--lm-orange)', backgroundColor: 'var(--lm-card-bg)', boxShadow: '0 0 0 3px rgba(232, 106, 83, 0.1)' } 
                          } 
                        }}
                      />
                      <ActionIcon 
                        type="submit" size="lg" radius="xl" variant="filled" disabled={!newMessage.trim()} 
                        style={{ 
                          width: '42px', height: '42px', backgroundColor: newMessage.trim() ? 'var(--lm-orange)' : 'var(--lm-border)', color: newMessage.trim() ? '#fff' : 'var(--lm-muted)', flexShrink: 0,
                          transition: 'all 0.2s var(--lm-ease)', boxShadow: newMessage.trim() ? 'var(--lm-shadow-orange)' : 'none'
                        }}
                        styles={{ root: { '&:hover': { transform: newMessage.trim() ? 'scale(1.05)' : 'none', backgroundColor: newMessage.trim() ? 'var(--lm-orange-hover)' : 'var(--lm-border)' } } }}
                      >
                        {editingMessageId ? <IconCheck size={20} stroke={2.5} /> : <IconSend size={20} stroke={2} />}
                      </ActionIcon>
                    </form>
                  </Box>

                </Box>
              </>
            )}
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}