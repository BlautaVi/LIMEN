import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Text, Image, Center, Avatar, ThemeIcon, Box, Stack, Group, Badge, Loader, Divider, TextInput, Button, Tabs } from '@mantine/core';
import { IconPlus, IconSearch, IconMessageChatbot, IconUsers, IconStethoscope, IconLayoutList } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { title: 'Додати обговорення', icon: <IconPlus size={28} stroke={2.5} />, image: 'https://www.dropbox.com/scl/fi/rntgnp3jm0hfwiuh5onc7/17054008_5809569.jpg?rlkey=q8qfltyg3wckj0e8axe5c4kkb&st=nmc4xqp2&dl=1', link: '/create-post' },
  { title: 'Знайти фахівця', icon: <IconSearch size={28} stroke={2.5} />, image: 'https://www.dropbox.com/scl/fi/nzgkj9fegaxph3q4b3x38/12469236_Wavy_Ppl-04_Single-11.jpg?rlkey=5ulfwh37np64cj6llgfxj2vcu&st=4lrvgx7r&dl=1', link: '/specialists' },
  { title: 'AI-асистент', icon: <IconMessageChatbot size={28} stroke={2.5} />, image: 'https://www.dropbox.com/scl/fi/suiuyqky2m3u21ixkntza/12290914_Wavy_Tech-12_Single-01.jpg?rlkey=ektzdop1zndqp8wjxil35cm5r&st=6bqrq81s&dl=1', link: '/ai-chat' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const reactionsList = [
    { emoji: '🤍', label: 'Тримайся' }, { emoji: '🤗', label: 'Обіймаю' },
    { emoji: '💬', label: 'Розумію вас' }, { emoji: '🫂', label: 'Я з тобою' },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchPosts();
  }, []);

  const handleReaction = async (postId: string, emoji: string) => {
    try {
      const response = await api.put(`/posts/${postId}/react`, { emoji });
      setPosts(posts.map(p => p._id === postId ? response.data : p));
    } catch (error) { console.error(error); }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      const response = await api.put(`/posts/${postId}/comment`, { text });
      setPosts(posts.map(p => p._id === postId ? response.data : p));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) { alert('Помилка при додаванні коментаря'); }
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'users') return post.author?.role !== 'psychologist';
    if (activeTab === 'psychologists') return post.author?.role === 'psychologist';
    return true;
  });

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />
      <Container size="lg" py={{ base: 30, md: 60 }}>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mb={70} className="animate-slideUp">
          {ACTIONS.map((action, index) => (
            <Paper
              key={index} radius="xl" p="xl" onClick={() => navigate(action.link)}
              className="card-hover"
              style={{
                border: '1px solid var(--lm-border)', cursor: 'pointer',
                backgroundColor: '#fff', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', minHeight: '320px', gap: '20px',
                boxShadow: 'var(--lm-shadow-sm)',
              }}
            >
              <Text fw={800} size="xl" ta="center" style={{ color: 'var(--lm-dark)' }}>{action.title}</Text>
              <Center>
                <ThemeIcon size={70} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)' }}>
                  {action.icon}
                </ThemeIcon>
              </Center>
              <Box style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <Image src={action.image} alt={action.title} fit="contain" h={120} style={{ opacity: 0.85 }} />
              </Box>
            </Paper>
          ))}
        </SimpleGrid>

        <Title order={2} mb="xl" className="animate-slideUp-delay-1" style={{ color: 'var(--lm-dark)', textAlign: 'center', fontWeight: 800 }}>Стрічка спільноти</Title>

        <Tabs value={activeTab} onChange={setActiveTab} mb={40} color="orange" variant="pills" radius="xl">
          <Tabs.List justify="center" style={{ backgroundColor: 'var(--lm-border)', padding: '6px', borderRadius: 'var(--lm-radius-full)', display: 'inline-flex', margin: '0 auto' }}>
            <Tabs.Tab value="all" leftSection={<IconLayoutList size={18} />} style={{ fontWeight: 600 }}>Всі записи</Tabs.Tab>
            <Tabs.Tab value="users" leftSection={<IconUsers size={18} />} style={{ fontWeight: 600 }}>Спільнота</Tabs.Tab>
            <Tabs.Tab value="psychologists" leftSection={<IconStethoscope size={18} />} style={{ fontWeight: 600 }}>Поради психологів</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {loading ? (
          <Center mt={50}><Loader color="orange" /></Center>
        ) : filteredPosts.length === 0 ? (
          <Text ta="center" c="dimmed" mt={30} size="lg">У цій категорії поки немає постів </Text>
        ) : (
          <Stack gap="xl" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {filteredPosts.map((post) => {
              const latestComment = post.comments && post.comments.length > 0 ? post.comments[post.comments.length - 1] : null;
              const isPsychologistPost = post.author?.role === 'psychologist';
              const isMyPost = post.author?._id === currentUser._id || post.author === currentUser._id;

              return (
                <Paper
                  key={post._id} shadow="none" p={{ base: 24, md: 40 }} radius="xl"
                  className="card-hover"
                  style={{
                    border: isPsychologistPost ? '1px solid var(--lm-violet-border)' : '1px solid var(--lm-border)',
                    backgroundColor: '#fff', cursor: 'pointer',
                    boxShadow: 'var(--lm-shadow-sm)'
                  }}
                  onClick={() => navigate(`/posts/${post._id}`)}
                >
                  <Group mb="lg" gap="xs">
                    <Badge color={post.status === 'active' ? 'orange' : 'gray'} variant="light" size="md" radius="sm">
                      {post.status === 'active' ? 'Актуально' : 'Вирішено'}
                    </Badge>
                    {post.isSupportOnly && <Badge color="pink" variant="dot" size="md">Тільки підтримка</Badge>}
                    {post.visibility === 'anonymous' && <Badge color="gray" variant="outline" size="md">Анонімно</Badge>}
                  </Group>

                  <Group gap="md" mb="xl" onClick={(e) => { e.stopPropagation(); const authorId = post.author?._id || post.author; if (authorId) navigate(`/user/${authorId}`); }} style={{ cursor: 'pointer', width: 'fit-content' }}>
                    <Avatar src={post.author?.avatarUrl ? `http://localhost:3000${post.author.avatarUrl}` : null} radius="xl" size="md" style={{ boxShadow: 'var(--lm-shadow-sm)' }} />
                    <Box>
                      <Group gap="xs">
                        <Text size="md" fw={700} style={{ color: 'var(--lm-dark)' }}>
                          {post.author?.fullName || `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Анонім'}
                        </Text>
                        {isPsychologistPost && <Badge size="xs" color="violet" variant="filled">Психолог</Badge>}
                      </Group>
                      <Text size="xs" style={{ color: 'var(--lm-muted)' }}>{new Date(post.createdAt).toLocaleDateString('uk-UA')} • {post.emotion}</Text>
                    </Box>
                  </Group>

                  <Text fw={800} size="xl" style={{ color: 'var(--lm-dark)' }} mb="md">{post.title || 'Без заголовка'}</Text>
                  <Text style={{ color: 'var(--lm-dark-soft)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '16px', lineHeight: 1.65 }}>{post.content}</Text>
                  <Text size="sm" mt="md" fw={700} mb="xl" style={{ color: 'var(--lm-orange)' }}>Читати далі →</Text>

                  <Divider my="lg" color="var(--lm-border)" />

                  <Group gap="sm" mb="md" onClick={(e) => e.stopPropagation()}>
                    {reactionsList.map((reaction, idx) => {
                      const count = post.reactions?.filter((r: any) => r.emoji === reaction.emoji).length || 0;
                      const hasReacted = post.reactions?.some((r: any) => r.emoji === reaction.emoji && r.userId === currentUser._id);
                      return (
                        <Badge
                          key={idx} size="lg" radius="xl" variant={hasReacted ? "filled" : "light"} color={hasReacted ? "orange" : "gray"}
                          style={{ cursor: isMyPost ? 'default' : 'pointer', textTransform: 'none', backgroundColor: hasReacted ? 'var(--lm-orange)' : 'var(--lm-input-bg)', color: hasReacted ? '#fff' : 'var(--lm-dark)' }}
                          onClick={() => { if (!isMyPost) handleReaction(post._id, reaction.emoji); }}
                        >
                          {reaction.emoji} <span style={{ marginLeft: '4px', fontWeight: 600 }}>{count > 0 && count}</span>
                        </Badge>
                      );
                    })}
                  </Group>

                  {latestComment && (
                    <Box mt="xl" p="md" style={{ backgroundColor: 'var(--lm-bg-alt)', borderRadius: '16px', border: '1px solid var(--lm-border)' }} onClick={(e) => e.stopPropagation()}>
                      <Group justify="space-between" mb={6}>
                        <Text size="xs" fw={600} style={{ color: 'var(--lm-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Останній коментар</Text>
                      </Group>
                      <Text component="div" size="sm" fw={700} style={{ color: 'var(--lm-dark)', display: 'flex', alignItems: 'center', gap: '8px' }} mb={4}>
                        {latestComment.author?.fullName || 'Анонім'}
                        {latestComment.author?.role === 'psychologist' && <Badge size="xs" color="violet" variant="light">Психолог</Badge>}
                      </Text>
                      <Text size="sm" style={{ color: 'var(--lm-dark-soft)' }}>{latestComment.text}</Text>
                    </Box>
                  )}

                  {!post.isSupportOnly && currentUser.role === 'psychologist' && !isMyPost && (
                    <Group mt="xl" onClick={(e) => e.stopPropagation()}>
                      <TextInput
                        placeholder="Коротка порада фахівця..." size="md" radius="xl" style={{ flex: 1 }} value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.currentTarget.value })}
                        styles={{ input: { backgroundColor: 'var(--lm-bg-input)', border: '1px solid var(--lm-border)', '&:focus': { borderColor: 'var(--lm-violet)' } } }}
                      />
                      <Button size="md" radius="xl" color="violet" onClick={() => handleAddComment(post._id)}>Відправити</Button>
                    </Group>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}