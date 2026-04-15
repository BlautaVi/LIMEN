import { useState, useRef, useEffect } from 'react';
import { Container, Paper, Text, Avatar, Group, Box, Stack, TextInput, ActionIcon, Loader, Center, ScrollArea, Title, ThemeIcon } from '@mantine/core';
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
    <Box style={{ height: '100vh', backgroundColor: 'var(--lm-bg)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container size="md" py={30} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <Paper
          shadow="none"
          radius="xl"
          style={{
            flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: '1px solid var(--lm-border)', backgroundColor: '#fff',
            boxShadow: 'var(--lm-shadow-lg)'
          }}
        >

          {/* Header */}
          <Box p="24px" className="glass" style={{ borderBottom: '1px solid var(--lm-border)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <ActionIcon variant="subtle" color="gray" onClick={() => navigate(-1)} style={{ transition: 'transform 0.2s var(--lm-ease)', '&:hover': { transform: 'translateX(-4px)' } }}>
              <IconArrowLeft size={24} color="var(--lm-dark)" stroke={2.5} />
            </ActionIcon>
            <ThemeIcon size={50} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)' }}>
              <IconRobot size={28} stroke={2} />
            </ThemeIcon>
            <Box>
              <Title order={4} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>LIMEN AI</Title>
              <Text size="sm" fw={500} style={{ color: 'var(--lm-muted)' }}>Віртуальний психолог-асистент</Text>
            </Box>
          </Box>

          {/* Messages */}
          <ScrollArea style={{ flexGrow: 1, padding: '30px', backgroundColor: 'var(--lm-bg)' }} viewportRef={viewportRef}>
            <Stack gap="xl">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <Group key={msg.id} justify={isAi ? 'flex-start' : 'flex-end'} align="flex-end" gap="md">
                    {isAi && (
                      <ThemeIcon size={36} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)', flexShrink: 0 }}>
                        <IconRobot size={20} stroke={2} />
                      </ThemeIcon>
                    )}
                    <Box
                      style={{
                        maxWidth: '75%',
                        backgroundColor: isAi ? '#fff' : 'var(--lm-orange)',
                        color: isAi ? 'var(--lm-dark)' : '#fff',
                        padding: '16px 24px',
                        borderRadius: isAi ? '24px 24px 24px 6px' : '24px 24px 6px 24px',
                        boxShadow: isAi ? 'var(--lm-shadow-md)' : '0 8px 24px rgba(232, 106, 83, 0.18)',
                        border: isAi ? '1px solid var(--lm-border)' : 'none'
                      }}
                    >
                      <Text size="16px" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, fontWeight: 500 }}>
                        {msg.text}
                      </Text>
                    </Box>
                  </Group>
                );
              })}

              {isTyping && (
                <Group justify="flex-start" align="flex-end" gap="md">
                  <ThemeIcon size={36} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)', flexShrink: 0 }}>
                    <IconRobot size={20} stroke={2} />
                  </ThemeIcon>
                  <Box style={{ backgroundColor: '#fff', padding: '16px 24px', borderRadius: '24px 24px 24px 6px', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-md)' }}>
                    <Loader color="orange" size="sm" type="dots" />
                  </Box>
                </Group>
              )}
            </Stack>
          </ScrollArea>

          {/* Input */}
          <Box p="24px" className="glass" style={{ borderTop: '1px solid var(--lm-border)' }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <Group wrap="nowrap" gap="md">
                <TextInput
                  placeholder="Розкажіть ШІ про свої почуття..."
                  radius="xl"
                  size="xl"
                  style={{ flexGrow: 1 }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                  disabled={isTyping}
                  styles={{
                    input: {
                      backgroundColor: 'var(--lm-bg-input)', border: '1px solid transparent', fontSize: '16px', padding: '0 24px',
                      transition: 'all 0.2s var(--lm-ease)', '&:focus': { borderColor: 'var(--lm-orange)', backgroundColor: '#fff', boxShadow: '0 0 0 3px rgba(232, 106, 83, 0.1)' }
                    }
                  }}
                />
                <ActionIcon
                  type="submit" size="xl" radius="xl" variant="filled" disabled={!inputValue.trim() || isTyping}
                  style={{
                    width: '54px', height: '54px', backgroundColor: inputValue.trim() ? 'var(--lm-orange)' : '#EAEAEA', color: '#fff',
                    transition: 'all 0.25s var(--lm-ease)', boxShadow: inputValue.trim() ? 'var(--lm-shadow-orange)' : 'none'
                  }}
                  styles={{ root: { '&:hover': { transform: inputValue.trim() ? 'scale(1.05)' : 'none', backgroundColor: inputValue.trim() ? 'var(--lm-orange-hover)' : '#EAEAEA' } } }}
                >
                  <IconSend size={24} stroke={2} />
                </ActionIcon>
              </Group>
            </form>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}