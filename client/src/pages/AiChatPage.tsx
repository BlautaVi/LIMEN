import { useState, useRef, useEffect } from 'react';
import { Container, Paper, Text, Avatar, Group, Box, Stack, TextInput, ActionIcon, Loader, Center, ScrollArea, Title } from '@mantine/core';
import { IconSend, IconRobot, IconArrowLeft } from '@tabler/icons-react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function AiChatPage() {
  const navigate = useNavigate();
  const defaultMessage = { id: 'default', text: 'Привіт! Я AI-асистент платформи LIMEN. Розкажіть, що вас турбує, або просто поділіться думками.', sender: 'ai' as const };
  
  const [messages, setMessages] = useState<any[]>([defaultMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/ai/history');
        if (response.data && response.data.length > 0) {
          const formattedHistory = response.data.map((msg: any) => ({
            id: msg._id,
            text: msg.text,
            sender: msg.sender
          }));
          setMessages([defaultMessage, ...formattedHistory]);
        }
      } catch (error) {
        console.error('Помилка завантаження історії AI', error);
      } finally {
        setIsLoadingHistory(false);
        scrollToBottom();
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottom();
    }
  }, [messages, isTyping, isLoadingHistory]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now().toString(), text: inputValue, sender: 'user' as const };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', { message: userMsg.text });
      const aiMsg = { id: (Date.now() + 1).toString(), text: response.data.reply, sender: 'ai' as const };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Помилка AI', error);
      const errorMsg = { id: (Date.now() + 1).toString(), text: 'Ой, щось пішло не так. Здається, мої сервери втомилися. Спробуйте пізніше 😔', sender: 'ai' as const };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Box style={{ height: '100vh', backgroundColor: '#F5FDFF', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Container size="md" py="md" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
        <Paper shadow="md" radius="lg" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #E1F5FE' }}>
          
          <Box p="md" style={{ backgroundColor: '#FAFCFE', borderBottom: '1px solid #E1F5FE', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <ActionIcon variant="subtle" color="cyan" onClick={() => navigate(-1)}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Avatar color="violet" radius="xl" size="md">
              <IconRobot size={24} />
            </Avatar>
            <Box>
              <Title order={5} style={{ color: '#0F7EAA' }}>LIMEN AI</Title>
              <Text size="xs" c="dimmed">Віртуальний психолог-асистент</Text>
            </Box>
          </Box>

          <ScrollArea style={{ flexGrow: 1, padding: '24px', backgroundColor: '#F4F9FD' }} viewportRef={viewportRef}>
            <Stack gap="lg">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <Group key={msg.id} justify={isAi ? 'flex-start' : 'flex-end'} align="flex-end" gap="xs">
                    {isAi && (
                      <Avatar color="violet" radius="xl" size="sm">
                        <IconRobot size={18} />
                      </Avatar>
                    )}
                    <Box 
                      style={{ 
                        maxWidth: '75%', 
                        backgroundColor: isAi ? '#fff' : '#4FCDFF', 
                        color: isAi ? '#2C3E50' : '#fff',
                        padding: '12px 18px', 
                        borderRadius: isAi ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        border: isAi ? '1px solid #E1F5FE' : 'none'
                      }}
                    >
                      <Text size="md" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>
                        {msg.text}
                      </Text>
                    </Box>
                  </Group>
                );
              })}
              
              {isTyping && (
                <Group justify="flex-start" align="flex-end" gap="xs">
                  <Avatar color="violet" radius="xl" size="sm"><IconRobot size={18} /></Avatar>
                  <Box style={{ backgroundColor: '#fff', padding: '12px 18px', borderRadius: '18px 18px 18px 4px', border: '1px solid #E1F5FE' }}>
                    <Loader color="violet" size="xs" type="dots" />
                  </Box>
                </Group>
              )}
            </Stack>
          </ScrollArea>

          <Box p="lg" style={{ backgroundColor: '#fff', borderTop: '1px solid #E1F5FE' }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <Group wrap="nowrap">
                <TextInput 
                  placeholder="Розкажіть ШІ про свої почуття..." 
                  radius="xl" 
                  size="md" 
                  style={{ flexGrow: 1 }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                  disabled={isTyping}
                  styles={{ input: { backgroundColor: '#F4F9FD', border: '1px solid transparent', '&:focus': { borderColor: '#845EF7' } } }}
                />
                <ActionIcon type="submit" color="violet" size="xl" radius="xl" variant="filled" disabled={!inputValue.trim() || isTyping} style={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
                  <IconSend size={22} />
                </ActionIcon>
              </Group>
            </form>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}