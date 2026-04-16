import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Text, Image, Center, Avatar, ThemeIcon, Box, Group, Badge, Loader, Divider, TextInput, Button, Tabs, AspectRatio } from '@mantine/core';
import { IconPlus, IconSearch, IconMessageChatbot, IconUsers, IconStethoscope, IconLayoutList, IconVideo } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { title: 'Додати обговорення', icon: <IconPlus size={28} stroke={2.5} />, image: 'https://www.dropbox.com/scl/fi/rntgnp3jm0hfwiuh5onc7/17054008_5809569.jpg?rlkey=q8qfltyg3wckj0e8axe5c4kkb&st=nmc4xqp2&dl=1', link: '/create-post' },
  { title: 'Знайти фахівця', icon: <IconSearch size={28} stroke={2.5} />, image: 'https://www.dropbox.com/scl/fi/nzgkj9fegaxph3q4b3x38/12469236_Wavy_Ppl-04_Single-11.jpg?rlkey=5ulfwh37np64cj6llgfxj2vcu&st=4lrvgx7r&dl=1', link: '/specialists' },
  { title: 'AI-асистент', icon: <IconMessageChatbot size={28} stroke={2.5} />, image: 'https://www.dropbox.com/scl/fi/suiuyqky2m3u21ixkntza/12290914_Wavy_Tech-12_Single-01.jpg?rlkey=ektzdop1zndqp8wjxil35cm5r&st=6bqrq81s&dl=1', link: '/ai-chat' },
];

const RELAX_VIDEOS = [
  {
    id: '1',
    title: '15 хвилин йоги для зняття стресу',
    description: 'М\'яка практика для розслаблення тіла та заспокоєння нервової системи після важкого дня. Підходить для початківців.',
    youtubeId: 'v7AYKMP6rOE' 
  },
  {
    id: '2',
    title: 'Дихальна вправа "Квадрат" (Box Breathing)',
    description: 'Потужна техніка дихання для швидкого зниження тривоги та паніки. Дихайте разом із візуалізацією на екрані.',
    youtubeId: 'tEmt1Znux58'
  },
  {
    id: '3',
    title: 'Коротка медитація для спокою',
    description: '10 хвилин глибокого занурення у себе. Допомагає зупинити потік тривожних думок та повернутись у стан "тут і зараз".',
    youtubeId: 'inpok4MKVLM'
  },
  {
    id: '4',
    title: 'Розтяжка для шиї та спини',
    description: 'Ідеально для тих, хто багато сидить або відчуває фізичний прояв стресу (затиски). Покращує кровообіг та знімає біль.',
    youtubeId: 'X3-gKPNyrTA'
  }
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
      <Container size="xl" py={{ base: 30, md: 60 }}>

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
          <Tabs.List justify="center" style={{ backgroundColor: 'var(--lm-border)', padding: '6px', borderRadius: 'var(--lm-radius-full)', display: 'inline-flex', margin: '0 auto', flexWrap: 'wrap', gap: '4px' }}>
            <Tabs.Tab value="all" leftSection={<IconLayoutList size={18} />} style={{ fontWeight: 600 }}>Всі записи</Tabs.Tab>
            <Tabs.Tab value="users" leftSection={<IconUsers size={18} />} style={{ fontWeight: 600 }}>Спільнота</Tabs.Tab>
            <Tabs.Tab value="psychologists" leftSection={<IconStethoscope size={18} />} style={{ fontWeight: 600 }}>Поради психологів</Tabs.Tab>
            <Tabs.Tab value="videos" leftSection={<IconVideo size={18} />} style={{ fontWeight: 600 }}>Релакс та Відео</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {activeTab === 'videos' ? (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" className="animate-slideUp">
            {RELAX_VIDEOS.map((video) => (
              <Paper 
                key={video.id} 
                p="xl" 
                radius="xl" 
                style={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid var(--lm-border)', 
                  boxShadow: 'var(--lm-shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <AspectRatio ratio={16 / 9} mb="lg" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--lm-bg-alt)' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </AspectRatio>
                <Title order={3} mb="xs" style={{ color: 'var(--lm-dark)', fontWeight: 800 }}>{video.title}</Title>
                <Text style={{ color: 'var(--lm-dark-soft)', lineHeight: 1.6, fontSize: '15px' }}>{video.description}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        ) : (
          loading ? (
            <Center mt={50}><Loader color="orange" /></Center>
          ) : filteredPosts.length === 0 ? (
            <Text ta="center" c="dimmed" mt={30} size="lg">У цій категорії поки немає постів </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {filteredPosts.map((post) => {
                const latestComment = post.comments && post.comments.length > 0 ? post.comments[post.comments.length - 1] : null;
                const isPsychologistPost = post.author?.role === 'psychologist';
                const isMyPost = post.author?._id === currentUser._id || post.author === currentUser._id;

                return (
                  <Paper
                    key={post._id} shadow="none" p={{ base: 24, md: 30 }} radius="xl"
                    className="card-hover"
                    style={{
                      border: isPsychologistPost ? '1px solid var(--lm-violet-border)' : '1px solid var(--lm-border)',
                      backgroundColor: '#fff', cursor: 'pointer',
                      boxShadow: 'var(--lm-shadow-sm)',
                      display: 'flex', flexDirection: 'column' 
                    }}
                    onClick={() => navigate(`/posts/${post._id}`)}
                  >
                    <Group mb="md" gap="xs">
                      <Badge color={post.status === 'active' ? 'orange' : 'gray'} variant="light" size="sm" radius="sm">
                        {post.status === 'active' ? 'Актуально' : 'Вирішено'}
                      </Badge>
                      {post.isSupportOnly && <Badge color="pink" variant="dot" size="sm">Тільки підтримка</Badge>}
                      {post.visibility === 'anonymous' && <Badge color="gray" variant="outline" size="sm">Анонімно</Badge>}
                    </Group>

                    <Group gap="sm" mb="lg" onClick={(e) => { e.stopPropagation(); const authorId = post.author?._id || post.author; if (authorId) navigate(`/user/${authorId}`); }} style={{ cursor: 'pointer', width: 'fit-content' }}>
                      <Avatar src={post.author?.avatarUrl ? `http://localhost:3000${post.author.avatarUrl}` : null} radius="xl" size="md" style={{ boxShadow: 'var(--lm-shadow-sm)' }} />
                      <Box>
                        <Group gap="xs">
                          <Text size="sm" fw={700} style={{ color: 'var(--lm-dark)' }}>
                            {post.author?.fullName || `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Анонім'}
                          </Text>
                          {isPsychologistPost && <Badge size="xs" color="violet" variant="filled">Психолог</Badge>}
                        </Group>
                        <Text size="xs" style={{ color: 'var(--lm-muted)' }}>{new Date(post.createdAt).toLocaleDateString('uk-UA')} • {post.emotion}</Text>
                      </Box>
                    </Group>

                    <Text fw={800} size="lg" style={{ color: 'var(--lm-dark)' }} mb="xs">{post.title || 'Без заголовка'}</Text>
                    
                    <Box style={{ flexGrow: 1 }}>
                      <Text style={{ color: 'var(--lm-dark-soft)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '15px', lineHeight: 1.6 }}>{post.content}</Text>
                      <Text size="sm" mt="xs" fw={700} style={{ color: 'var(--lm-orange)' }}>Читати далі →</Text>
                    </Box>

                    <Divider my="md" color="var(--lm-border)" />

                    <Group gap="xs" mb={latestComment || (!post.isSupportOnly && currentUser.role === 'psychologist' && !isMyPost) ? "md" : 0} onClick={(e) => e.stopPropagation()}>
                      {reactionsList.map((reaction, idx) => {
                        const count = post.reactions?.filter((r: any) => r.emoji === reaction.emoji).length || 0;
                        const hasReacted = post.reactions?.some((r: any) => r.emoji === reaction.emoji && r.userId === currentUser._id);
                        return (
                          <Badge
                            key={idx} size="md" radius="xl" variant={hasReacted ? "filled" : "light"} color={hasReacted ? "orange" : "gray"}
                            style={{ cursor: isMyPost ? 'default' : 'pointer', textTransform: 'none', backgroundColor: hasReacted ? 'var(--lm-orange)' : 'var(--lm-input-bg)', color: hasReacted ? '#fff' : 'var(--lm-dark)' }}
                            onClick={() => { if (!isMyPost) handleReaction(post._id, reaction.emoji); }}
                          >
                            {reaction.emoji} <span style={{ marginLeft: '4px', fontWeight: 600 }}>{count > 0 && count}</span>
                          </Badge>
                        );
                      })}
                    </Group>

                    {latestComment && (
                      <Box mt="auto" p="sm" style={{ backgroundColor: 'var(--lm-bg-alt)', borderRadius: '12px', border: '1px solid var(--lm-border)' }} onClick={(e) => e.stopPropagation()}>
                        <Group justify="space-between" mb={4}>
                          <Text size="10px" fw={700} style={{ color: 'var(--lm-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Останній коментар</Text>
                        </Group>
                        <Text component="div" size="xs" fw={700} style={{ color: 'var(--lm-dark)', display: 'flex', alignItems: 'center', gap: '6px' }} mb={2}>
                          {latestComment.author?.fullName || 'Анонім'}
                          {latestComment.author?.role === 'psychologist' && <Badge size="10px" color="violet" variant="light">Психолог</Badge>}
                        </Text>
                        <Text size="xs" style={{ color: 'var(--lm-dark-soft)' }} lineClamp={2}>{latestComment.text}</Text>
                      </Box>
                    )}

                    {!post.isSupportOnly && currentUser.role === 'psychologist' && !isMyPost && (
                      <Group mt="auto" pt={latestComment ? "md" : 0} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                        <TextInput
                          placeholder="Коротка порада фахівця..." size="sm" radius="xl" style={{ flex: 1 }} value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.currentTarget.value })}
                          styles={{ input: { backgroundColor: 'var(--lm-bg-input)', border: '1px solid var(--lm-border)', '&:focus': { borderColor: 'var(--lm-violet)' } } }}
                        />
                        <Button size="sm" radius="xl" color="violet" onClick={() => handleAddComment(post._id)}>Відправити</Button>
                      </Group>
                    )}
                  </Paper>
                );
              })}
            </SimpleGrid>
          )
        )}
      </Container>
    </Box>
  );
}