import { useState, useRef, useEffect } from 'react';
import { Container, Paper, Text, Group, Box, Stack, TextInput, ActionIcon, Loader, ScrollArea, Title, ThemeIcon } from '@mantine/core';
import { IconSend, IconRobot, IconArrowLeft } from '@tabler/icons-react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';

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
    <Box className="page-content" style={{ height: '100vh', backgroundColor: 'var(--lm-bg)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container size="md" py={{ base: 10, md: 30 }} px={{ base: 0, sm: 'md' }} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <Paper
          shadow="none"
          radius={{ base: 0, sm: 'xl' }} 
          style={{
            flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: '1px solid var(--lm-border)', borderTop: 'none', borderBottom: 'none', backgroundColor: 'var(--lm-card-bg)', // Замінено
            boxShadow: 'var(--lm-shadow-lg)'
          }}
        >

          <Box p={{ base: '12px 16px', md: '24px' }} className="glass" style={{ borderBottom: '1px solid var(--lm-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ActionIcon variant="subtle" color="gray" onClick={() => navigate(-1)} style={{ transition: 'transform 0.2s var(--lm-ease)', '&:hover': { transform: 'translateX(-4px)' } }}>
              <IconArrowLeft size={24} color="var(--lm-dark)" stroke={2.5} />
            </ActionIcon>
            <ThemeIcon size={{ base: 40, md: 50 }} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)' }}>
              <IconRobot size={24} stroke={2} />
            </ThemeIcon>
            <Box>
              <Title order={4} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>LIMEN AI</Title>
              <Text size="xs" fw={500} style={{ color: 'var(--lm-muted)' }}>Віртуальний асистент</Text>
            </Box>
          </Box>

          <ScrollArea style={{ flexGrow: 1, padding: '16px', backgroundColor: 'var(--lm-bg)' }} viewportRef={viewportRef}>
            <Stack gap="md">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <Group key={msg.id} justify={isAi ? 'flex-start' : 'flex-end'} align="flex-end" gap="xs" wrap="nowrap">
                    {isAi && (
                      <ThemeIcon size={30} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)', flexShrink: 0 }}>
                        <IconRobot size={18} stroke={2} />
                      </ThemeIcon>
                    )}
                    <Box
                      style={{
                        maxWidth: '85%', 
                        backgroundColor: isAi ? 'var(--lm-card-bg)' : 'var(--lm-orange)', 
                        color: isAi ? 'var(--lm-dark)' : '#fff',
                        padding: '12px 16px', 
                        borderRadius: isAi ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                        boxShadow: isAi ? 'var(--lm-shadow-md)' : '0 4px 12px rgba(232, 106, 83, 0.15)',
                        border: isAi ? '1px solid var(--lm-border)' : 'none',
                        fontSize: '15px', 
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      {isAi ? (
                        <Box 
                          style={{ 
                            '& p': { margin: '0 0 8px 0', '&:last-child': { margin: 0 } },
                            '& ul, & ol': { margin: '8px 0', paddingLeft: '16px' },
                            '& li': { marginBottom: '4px' },
                            '& strong': { fontWeight: 800, color: 'var(--lm-dark)' }
                          }}
                        >
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </Box>
                      ) : (
                        <Text style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#fff' }}> {/* Жорстко задаємо білий колір для тексту юзера */}
                          {msg.text}
                        </Text>
                      )}
                    </Box>
                  </Group>
                );
              })}

              {isTyping && (
                <Group justify="flex-start" align="flex-end" gap="xs" wrap="nowrap">
                  <ThemeIcon size={30} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)', flexShrink: 0 }}>
                    <IconRobot size={18} stroke={2} />
                  </ThemeIcon>
                  <Box style={{ backgroundColor: 'var(--lm-card-bg)', padding: '12px 16px', borderRadius: '20px 20px 20px 4px', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-md)' }}> {/* Замінено */}
                    <Loader color="orange" size="xs" type="dots" />
                  </Box>
                </Group>
              )}
            </Stack>
          </ScrollArea>

          <Box p={{ base: '12px 16px', md: '24px' }} className="glass" style={{ borderTop: '1px solid var(--lm-border)' }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <Group wrap="nowrap" gap="sm">
                <TextInput
                  placeholder="Розкажіть ШІ..."
                  radius="xl"
                  size="md" 
                  style={{ flexGrow: 1 }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                  disabled={isTyping}
                  styles={{
                    input: {
                      backgroundColor: 'var(--lm-bg-input)', border: '1px solid transparent', fontSize: '15px', padding: '0 16px', height: '44px', color: 'var(--lm-dark)', // Додано color
                      transition: 'all 0.2s var(--lm-ease)', '&:focus': { borderColor: 'var(--lm-orange)', backgroundColor: 'var(--lm-card-bg)', boxShadow: '0 0 0 3px rgba(232, 106, 83, 0.1)' } // Замінено hover bg
                    }
                  }}
                />
                <ActionIcon
                  type="submit" size="xl" radius="xl" variant="filled" disabled={!inputValue.trim() || isTyping}
                  style={{
                    width: '44px', height: '44px', backgroundColor: inputValue.trim() ? 'var(--lm-orange)' : 'var(--lm-border)', color: inputValue.trim() ? '#fff' : 'var(--lm-muted)', flexShrink: 0, // Змінено кольори вимкненого стану
                    transition: 'all 0.25s var(--lm-ease)', boxShadow: inputValue.trim() ? 'var(--lm-shadow-orange)' : 'none'
                  }}
                  styles={{ root: { '&:hover': { transform: inputValue.trim() ? 'scale(1.05)' : 'none', backgroundColor: inputValue.trim() ? 'var(--lm-orange-hover)' : 'var(--lm-border)' } } }} // Змінено hover колір
                >
                  <IconSend size={20} stroke={2} />
                </ActionIcon>
              </Group>
            </form>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}