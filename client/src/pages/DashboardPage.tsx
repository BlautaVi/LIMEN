import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Text, Image, Center, Avatar, ThemeIcon, Box, Stack, Group, Badge, Loader, Divider, TextInput, Button } from '@mantine/core';
import { IconPlus, IconSearch, IconMessageChatbot } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { IconBook } from '@tabler/icons-react';

const ACTIONS = [
  {
    title: 'Додати новий пост для обговорення',
    icon: <IconPlus size={30} stroke={3} />,
    image: 'https://www.dropbox.com/scl/fi/rntgnp3jm0hfwiuh5onc7/17054008_5809569.jpg?rlkey=q8qfltyg3wckj0e8axe5c4kkb&st=nmc4xqp2&dl=1',
    link: '/create-post',
  },
  {
    title: 'Пошук спеціаліста',
    icon: <IconSearch size={30} stroke={3} />,
    image: 'https://www.dropbox.com/scl/fi/nzgkj9fegaxph3q4b3x38/12469236_Wavy_Ppl-04_Single-11.jpg?rlkey=5ulfwh37np64cj6llgfxj2vcu&st=4lrvgx7r&dl=1',
    link: '/specialists',
  },
  {
    title: 'Розпочати розмову з AI-асистентом',
    icon: <IconMessageChatbot size={30} stroke={3} />,
    image: 'https://www.dropbox.com/scl/fi/suiuyqky2m3u21ixkntza/12290914_Wavy_Tech-12_Single-01.jpg?rlkey=ektzdop1zndqp8wjxil35cm5r&st=6bqrq81s&dl=1',
    link: '/ai-chat',
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const reactionsList = [
    { emoji: '🤍', label: 'Тримайся' },
    { emoji: '🤗', label: 'Обіймаю' },
    { emoji: '💬', label: 'Був(ла) у схожій ситуації' },
    { emoji: '🫂', label: 'Я з тобою' },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Помилка завантаження стрічки', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleReaction = async (postId: string, emoji: string) => {
    try {
      const response = await api.put(`/posts/${postId}/react`, { emoji });
      setPosts(posts.map(p => p._id === postId ? response.data : p));
    } catch (error) {
      console.error('Помилка реакції', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      const response = await api.put(`/posts/${postId}/comment`, { text });
      setPosts(posts.map(p => p._id === postId ? response.data : p));
      setCommentInputs({ ...commentInputs, [postId]: '' }); 
    } catch (error) {
      alert('Помилка при додаванні коментаря');
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5FDFF' }}>
      <Header />
      <Container size="lg" py="xl">

        <Title ta="center" order={1} mb={50} style={{ color: '#0F7EAA', fontSize: '32px', fontWeight: 700 }}>
          Оберіть дію, яку хочете зробити...
        </Title>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mb={60}>
          {ACTIONS.map((action, index) => (
            <Paper
              key={index}
              radius="md"
              p="xl"
              onClick={() => navigate(action.link)}
              style={{
                border: '1px solid #E0F7FA', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                backgroundColor: '#fff', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', minHeight: '400px', gap: '20px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(79, 205, 255, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <Text fw={700} size="lg" ta="center" style={{ color: '#0F7EAA' }}>{action.title}</Text>
              <Center>
                <ThemeIcon size={70} radius="xl" variant="light" style={{ backgroundColor: '#E0F7FA', border: 'none' }}>
                  <div style={{ color: '#0F7EAA' }}>{action.icon}</div>
                </ThemeIcon>
              </Center>
              <Box style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingTop: '20px' }}>
                <Image src={action.image} alt={action.title} fit="contain" h={160} />
              </Box>
            </Paper>
          ))}
        </SimpleGrid>

        <Title order={3} mb="lg" style={{ color: '#0F7EAA' }}>Останні обговорення спільноти</Title>

        {loading ? (
          <Center mt={50}><Loader color="cyan" /></Center>
        ) : posts.length === 0 ? (
          <Text ta="center" c="dimmed">Поки що немає постів. Будьте першим!</Text>
        ) : (
          <Stack gap="lg">
            {posts.map((post) => {
              const latestComment = post.comments && post.comments.length > 0 ? post.comments[post.comments.length - 1] : null;

              return (
                <Paper
                  key={post._id}
                  shadow="sm"
                  p="xl"
                  radius="md"
                  style={{ border: '1px solid #E1F5FE', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => navigate(`/posts/${post._id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <Group mb="xs" gap="xs">
                    <Badge color={post.status === 'active' ? 'cyan' : 'gray'} variant="light">
                      {post.status === 'active' ? 'Актуально' : 'Вирішено'}
                    </Badge>
                    {post.isSupportOnly && <Badge color="pink" variant="dot">Тільки підтримка</Badge>}
                    {post.visibility === 'anonymous' && <Badge color="gray" variant="outline">Анонімно</Badge>}
                  </Group>

                  <Text size="sm" c="dimmed" mb="md">{new Date(post.createdAt).toLocaleDateString()} • Емоція: {post.emotion}</Text>
                  <Group 
                    gap="sm" 
                    mb="md" 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      const authorId = post.author?._id || post.author;
                      if (authorId) navigate(`/user/${authorId}`);
                    }}
                    style={{ cursor: 'pointer', width: 'fit-content' }}
                  >
                    <Avatar 
                      src={post.author?.avatarUrl ? `http://localhost:3000${post.author.avatarUrl}` : null} 
                      radius="xl" 
                      size="sm" 
                    />
                    <Text size="sm" fw={500} style={{ color: '#0F7EAA' }}>
                      {post.author?.fullName || `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Анонім'}
                    </Text>
                  </Group>
                  <Text fw={700} style={{ color: '#0F7EAA' }} mb="sm">{post.title || 'Без заголовка'}</Text>
                  
                  <Text style={{ color: '#333', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.content}
                  </Text>
                  <Text size="sm" color="cyan" mt="sm" fw={600} mb="md">Читати далі →</Text>

                  <Divider my="sm" />

                  <Group gap="xs" mb="md" onClick={(e) => e.stopPropagation()}>
                    {reactionsList.map((reaction, idx) => {
                      const count = post.reactions?.filter((r: any) => r.emoji === reaction.emoji).length || 0;
                      const hasReacted = post.reactions?.some((r: any) => r.emoji === reaction.emoji && r.userId === currentUser._id);
                      return (
                        <Badge 
                          key={idx} 
                          variant={hasReacted ? "filled" : "light"} 
                          color={hasReacted ? "pink" : "cyan"} 
                          style={{ cursor: 'pointer', textTransform: 'none' }}
                          onClick={() => handleReaction(post._id, reaction.emoji)}
                        >
                          {reaction.emoji} {count > 0 && count}
                        </Badge>
                      );
                    })}
                  </Group>

                  {latestComment && (
                    <Box mb="md" p="sm" style={{ backgroundColor: '#F4FAFC', borderRadius: '8px', border: '1px solid #E1F5FE' }} onClick={(e) => e.stopPropagation()}>
                      <Group justify="space-between" mb={2}>
                        <Text size="xs" c="dimmed">Останній коментар:</Text>
                        <Text size="xs" c="dimmed">{new Date(latestComment.createdAt).toLocaleDateString()}</Text>
                      </Group>
                       <Text component="div" size="sm" fw={600} color="#0F7EAA" mb={2}>
                        {latestComment.author?.fullName || 'Анонім'} 
                        <Badge size="xs" color="violet" ml={5} variant="light">Психолог</Badge>
                      </Text>
                      <Text size="sm">{latestComment.text}</Text>
                    </Box>
                  )}

                  {!post.isSupportOnly && currentUser.role === 'psychologist' && (
                    <Group mt="sm" onClick={(e) => e.stopPropagation()}>
                      <TextInput 
                        placeholder="Швидка порада чи коментар..." 
                        size="sm" 
                        radius="md"
                        style={{ flex: 1 }} 
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.currentTarget.value })}
                      />
                      <Button size="sm" radius="md" color="cyan" onClick={() => handleAddComment(post._id)}>
                        Відправити
                      </Button>
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