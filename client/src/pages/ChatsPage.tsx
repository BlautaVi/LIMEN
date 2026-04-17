import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Avatar, Group, Box, Stack, TextInput, ActionIcon, Loader, Center, ScrollArea, Menu, Badge, ThemeIcon, Button, Modal } from '@mantine/core';
import { IconSend, IconMessageCircleOff, IconMoodSmile, IconPencil, IconTrash, IconPin, IconX, IconCheck, IconCalendarEvent } from '@tabler/icons-react';
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
        text: status === 'accepted' ? '✅ Консультацію підтверджено!' : '❌ На жаль, зараз немає можливості провести консультацію.',
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
    <Box style={{ height: '100vh', backgroundColor: '#FCFBF8', display: 'flex', flexDirection: 'column' }}>
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
            styles={{ input: { backgroundColor: 'var(--lm-bg-input)', border: '1px solid transparent', '&:focus': { borderColor: 'var(--lm-orange)' } } }}
          />
          <TextInput
            label="Коментар (тема або побажання)"
            placeholder="Про що б ви хотіли поговорити?"
            value={consultNote}
            onChange={(e) => setConsultNote(e.currentTarget.value)}
            radius="xl"
            size="md"
            styles={{ input: { backgroundColor: 'var(--lm-bg-input)', border: '1px solid transparent', '&:focus': { borderColor: 'var(--lm-orange)' } } }}
          />
          <Button fullWidth radius="xl" size="lg" mt="md" onClick={handleSendConsultation} disabled={!consultDate}
            style={{ backgroundColor: 'var(--lm-orange)', color: '#fff', fontWeight: 700, boxShadow: 'var(--lm-shadow-orange)' }}
          >
            Відправити запит
          </Button>
        </Stack>
      </Modal>
      
      <Container fluid px={{ base: 10, md: 40 }} py={30} style={{ maxWidth: '1600px', width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <Paper 
          shadow="none" 
          radius="xl" 
          style={{ 
            flexGrow: 1, display: 'flex', overflow: 'hidden', 
            border: '1px solid #F0EBE1', backgroundColor: '#fff',
            boxShadow: '0 15px 50px rgba(43, 69, 78, 0.05)'
          }}
        >
          
          <Box style={{ width: '360px', backgroundColor: '#fff', borderRight: '1px solid #F0EBE1', display: 'flex', flexDirection: 'column', zIndex: 2 }}>
            <Box p="24px" style={{ borderBottom: '1px solid #F0EBE1', backgroundColor: '#fff' }}>
              <Text fw={800} size="24px" style={{ color: '#2B454E', letterSpacing: '-0.5px' }}>Діалоги</Text>
            </Box>
            
            <ScrollArea style={{ flexGrow: 1, backgroundColor: '#FAF9F6' }}>
              {loadingChats ? (
                <Center p="xl" mt="xl"><Loader color="orange" size="md" /></Center>
              ) : conversations.length === 0 ? (
                <Text c="dimmed" ta="center" p="xl" size="md" fw={500} style={{ color: '#85969C' }}>У вас ще немає діалогів.</Text>
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
                        padding: '20px 24px', cursor: 'pointer', 
                        backgroundColor: isActive ? '#F9F4EC' : 'transparent',
                        borderLeft: isActive ? '4px solid #E86A53' : '4px solid transparent',
                        transition: 'all 0.2s ease',
                        borderBottom: '1px solid #F0EBE1'
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#fff' }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <Group wrap="nowrap" gap="md">
                        <Avatar src={oUser.avatarUrl ? `http://localhost:3000${oUser.avatarUrl}` : null} radius="xl" size="lg" style={{ border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
                        <Box style={{ overflow: 'hidden', flex: 1 }}>
                          <Text fw={isActive ? 800 : 600} size="16px" style={{ color: '#2B454E' }} truncate>{displayName}</Text>
                          {oUser.role === 'psychologist' && <Badge size="xs" color="violet" variant="light" mt={4}>Психолог</Badge>}
                        </Box>
                      </Group>
                    </Box>
                  );
                })
              )}
            </ScrollArea>
          </Box>

          <Box style={{ flexGrow: 1, backgroundColor: '#FCFBF8', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {!activeChatId ? (
              <Center style={{ flexGrow: 1, flexDirection: 'column', backgroundColor: '#FCFBF8' }}>
                <ThemeIcon size={120} radius="100%" variant="light" style={{ backgroundColor: '#F9F4EC', color: '#E86A53', opacity: 0.8 }} mb="xl">
                  <IconMessageCircleOff size={60} stroke={1.5} />
                </ThemeIcon>
                <Text fw={700} size="xl" style={{ color: '#2B454E' }}>Оберіть діалог ліворуч</Text>
                <Text size="md" mt="xs" style={{ color: '#85969C' }}>щоб почати або продовжити спілкування</Text>
              </Center>
            ) : (
              <>
                {pinnedMessage && (
                  <Box p="12px 24px" style={{ backgroundColor: '#fff', borderBottom: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 5, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <ThemeIcon variant="light" color="orange" radius="xl" size="md"><IconPin size={16} /></ThemeIcon>
                    <Box style={{ flex: 1, overflow: 'hidden' }}>
                      <Text size="xs" fw={700} style={{ color: '#E86A53', textTransform: 'uppercase' }}>Закріплене повідомлення</Text>
                      <Text size="sm" truncate style={{ color: '#4A5B61' }}>{pinnedMessage.text}</Text>
                    </Box>
                  </Box>
                )}

                <ScrollArea style={{ flexGrow: 1, padding: '30px' }} viewportRef={viewportRef}>
                  {loadingMessages ? (
                    <Center h="100%"><Loader color="orange" size="md" /></Center>
                  ) : messages.length === 0 ? (
                    <Center h="100%"><Badge size="xl" radius="xl" color="orange" variant="light" style={{ fontWeight: 600, padding: '0 20px', height: '40px', textTransform: 'none' }}>Почніть спілкування першим 👋</Badge></Center>
                  ) : (
                    <Stack gap="xl">
                      {messages.map((msg) => {
                        const isMyMessage = msg.senderId === currentUser._id;
                        const isConsultationMsg = msg.type === 'consultation_offer' || msg.type === 'consultation_request';
                        
                        const reactionsCount: Record<string, number> = {};
                        msg.reactions?.forEach((r: any) => {
                          reactionsCount[r.emoji] = (reactionsCount[r.emoji] || 0) + 1;
                        });

                        return (
                          <Group key={msg._id} justify={isMyMessage ? 'flex-end' : 'flex-start'} align="center" gap="md" style={{ position: 'relative' }}>
                            
                            {!isMyMessage && (
                              <Menu shadow="xl" width={220} position="top-start" withArrow radius="md">
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray" size="md" radius="xl" style={{ opacity: 0.4, transition: 'all 0.2s', '&:hover': { opacity: 1, backgroundColor: '#F9F4EC', color: '#E86A53' } }}>
                                    <IconMoodSmile size={20} stroke={2} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Group gap={4} p={8} justify="center" mb="xs">
                                    {AVAILABLE_REACTIONS.map(emoji => (
                                      <ActionIcon key={emoji} variant="subtle" size="lg" radius="xl" onClick={() => handleToggleReaction(msg._id, emoji)} style={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.15)', backgroundColor: '#F4F2EE' } }}>
                                        <Text size="20px">{emoji}</Text>
                                      </ActionIcon>
                                    ))}
                                  </Group>
                                  <Menu.Divider />
                                  <Menu.Item leftSection={<IconPin size={16} />} onClick={() => handleTogglePin(msg._id)} style={{ fontWeight: 500, color: '#2B454E' }}>
                                    {msg.isPinned ? 'Відкріпити' : 'Закріпити'}
                                  </Menu.Item>
                                  <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => handleDeleteMessage(msg._id, false)} style={{ fontWeight: 500 }}>
                                    Видалити для мене
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            )}

                            <Box style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start' }}>
                              <Box 
                                style={{ 
                                  backgroundColor: isMyMessage ? (isConsultationMsg ? '#f6e5e2' : '#E86A53') : '#fff',
                                  color: isMyMessage && !isConsultationMsg ? '#fff' : '#2B454E',
                                  padding: '16px 24px', 
                                  borderRadius: isMyMessage ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                                  boxShadow: isMyMessage && !isConsultationMsg ? '0 8px 20px rgba(232, 106, 83, 0.2)' : '0 8px 25px rgba(43, 69, 78, 0.05)',
                                  border: (isMyMessage && !isConsultationMsg) ? 'none' : (isConsultationMsg ? '2px dashed var(--lm-orange)' : '1px solid #F0EBE1'),
                                  position: 'relative',
                                  width: isConsultationMsg ? '320px' : 'auto' 
                                }}
                              >
                                {isConsultationMsg && (
                                  <Badge color="orange" variant="filled" size="sm" mb="xs" style={{ display: 'block', width: 'fit-content' }}>
                                    {msg.type === 'consultation_offer' ? 'Пропозиція консультації' : 'Запит на консультацію'}
                                  </Badge>
                                )}

                                {msg.isPinned && (
                                  <IconPin size={14} style={{ position: 'absolute', top: -8, right: isMyMessage ? 10 : -8, color: isMyMessage ? '#FFF' : '#E86A53', transform: 'rotate(45deg)' }} />
                                )}
                                <Text size="16px" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5, fontWeight: isConsultationMsg ? 600 : 500 }}>{msg.text}</Text>
                                
                                {isConsultationMsg && !isMyMessage && msg.metaData?.status === 'pending' && (
                                  <Group grow mt="md">
                                    <Button size="xs" radius="xl" color="green" onClick={() => handleConsultationResponse(msg._id, 'accepted')}>Підтвердити</Button>
                                    <Button size="xs" radius="xl" color="red" variant="light" onClick={() => handleConsultationResponse(msg._id, 'declined')}>Відхилити</Button>
                                  </Group>
                                )}

                                {isConsultationMsg && msg.metaData?.status !== 'pending' && (
                                  <Badge 
                                    color={msg.metaData?.status === 'accepted' ? 'green' : 'red'} 
                                    variant="light" size="sm" mt="md" style={{ display: 'block', textAlign: 'center' }}
                                  >
                                    {msg.metaData?.status === 'accepted' ? 'Прийнято' : 'Відхилено'}
                                  </Badge>
                                )}

                                <Group gap={6} justify={isMyMessage ? 'flex-end' : 'flex-start'} mt={8}>
                                  <Text size="11px" style={{ color: isMyMessage && !isConsultationMsg ? 'rgba(255,255,255,0.7)' : '#85969C', fontWeight: 600 }}>
                                    {new Date(msg.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                  </Text>
                                  {msg.isEdited && (
                                    <Text size="11px" style={{ color: isMyMessage && !isConsultationMsg ? 'rgba(255,255,255,0.6)' : '#A0AEC0', fontStyle: 'italic' }}>
                                      (змінено)
                                    </Text>
                                  )}
                                </Group>
                              </Box>

                              {Object.keys(reactionsCount).length > 0 && (
                                <Group gap={6} mt={-12} style={{ zIndex: 2, padding: isMyMessage ? '0 16px 0 0' : '0 0 0 16px' }}>
                                  {Object.entries(reactionsCount).map(([emoji, count]) => (
                                    <Badge 
                                      key={emoji} color="gray" variant="white" size="lg" radius="xl"
                                      style={{ padding: '0 8px', height: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', textTransform: 'none', border: '1px solid #F0EBE1' }}
                                      onClick={() => handleToggleReaction(msg._id, emoji)}
                                    >
                                      <span style={{ fontSize: '14px', marginRight: count > 1 ? '4px' : '0' }}>{emoji}</span> 
                                      <span style={{ fontWeight: 700, color: '#4A5B61' }}>{count > 1 ? count : ''}</span>
                                    </Badge>
                                  ))}
                                </Group>
                              )}
                            </Box>

                            {isMyMessage && (
                              <Menu shadow="xl" width={220} position="top-end" withArrow radius="md">
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray" size="md" radius="xl" style={{ opacity: 0.4, transition: 'all 0.2s', '&:hover': { opacity: 1, backgroundColor: '#F9F4EC', color: '#E86A53' } }}>
                                    <IconMoodSmile size={20} stroke={2} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Group gap={4} p={8} justify="center" mb="xs">
                                    {AVAILABLE_REACTIONS.map(emoji => (
                                      <ActionIcon key={emoji} variant="subtle" size="lg" radius="xl" onClick={() => handleToggleReaction(msg._id, emoji)} style={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.15)', backgroundColor: '#F4F2EE' } }}>
                                        <Text size="20px">{emoji}</Text>
                                      </ActionIcon>
                                    ))}
                                  </Group>
                                  <Menu.Divider />
                                  <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => startEditing(msg)} style={{ fontWeight: 500, color: '#2B454E' }}>
                                    Редагувати
                                  </Menu.Item>
                                  <Menu.Item leftSection={<IconPin size={16} />} onClick={() => handleTogglePin(msg._id)} style={{ fontWeight: 500, color: '#2B454E' }}>
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

                <Box style={{ backgroundColor: '#fff', borderTop: '1px solid #F0EBE1', display: 'flex', flexDirection: 'column' }}>
                  
                  {editingMessageId && (
                    <Box p="10px 24px" style={{ backgroundColor: '#F9F4EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0EBE1' }}>
                      <Group gap="xs">
                        <IconPencil size={16} color="#E86A53" />
                        <Text size="sm" fw={600} style={{ color: '#E86A53' }}>Редагування повідомлення...</Text>
                      </Group>
                      <ActionIcon size="sm" radius="xl" variant="subtle" color="gray" onClick={cancelEditing}>
                        <IconX size={16} />
                      </ActionIcon>
                    </Box>
                  )}

                  <Box p="16px 24px" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {(amIPsychologist || isChattingWithPsychologist) && (
                      <ActionIcon 
                        size="xl" radius="xl" variant="light" color="violet" 
                        title={amIPsychologist ? "Запропонувати консультацію" : "Записатися на консультацію"}
                        onClick={() => setIsConsultModalOpen(true)}
                        style={{ backgroundColor: 'var(--lm-bg-alt)', flexShrink: 0 }}
                      >
                        <IconCalendarEvent size={24} stroke={2} />
                      </ActionIcon>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ flexGrow: 1, display: 'flex', gap: '12px' }}>
                      <TextInput 
                        placeholder="Напишіть повідомлення..." 
                        radius="xl" size="xl" style={{ flexGrow: 1 }} value={newMessage} onChange={(e) => setNewMessage(e.currentTarget.value)}
                        styles={{ 
                          input: { 
                            backgroundColor: '#F8F9FA', border: '1px solid transparent', fontSize: '16px', padding: '0 24px',
                            transition: 'all 0.2s ease', '&:focus': { borderColor: '#E86A53', backgroundColor: '#fff', boxShadow: '0 0 0 4px rgba(232, 106, 83, 0.1)' } 
                          } 
                        }}
                      />
                      <ActionIcon 
                        type="submit" size="xl" radius="xl" variant="filled" disabled={!newMessage.trim()} 
                        style={{ 
                          width: '54px', height: '54px', backgroundColor: newMessage.trim() ? '#E86A53' : '#EAEAEA', color: '#fff',
                          transition: 'all 0.2s ease', boxShadow: newMessage.trim() ? '0 8px 20px rgba(232, 106, 83, 0.3)' : 'none', flexShrink: 0
                        }}
                        styles={{ root: { '&:hover': { transform: newMessage.trim() ? 'scale(1.05)' : 'none', backgroundColor: newMessage.trim() ? '#D65A44' : '#EAEAEA' } } }}
                      >
                        {editingMessageId ? <IconCheck size={24} stroke={2.5} /> : <IconSend size={24} stroke={2} />}
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