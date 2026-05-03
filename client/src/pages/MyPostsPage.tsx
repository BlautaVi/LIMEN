import { useEffect, useState } from 'react';
import { Container, Title, Box, Paper, Text, Stack, Image, Center, Loader, Button, Group, ActionIcon, Badge } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';

export function MyPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const response = await api.get('/posts/my');
      setPosts(response.data);
    } catch (error) {
      console.error('Помилка завантаження постів', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей пост?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (error) {
      alert('Помилка при видаленні');
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />
      <Container size="md" pt={{ base: 30, md: 60 }} pb={80}>

        <Group justify="space-between" mb={40} align="center" className="animate-slideUp">
          <Title order={2} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: '28px' }}>
            Мої публікації
          </Title>
          <Button
            leftSection={<IconPlus size={20} stroke={2.5} />}
            radius="xl"
            size="md"
            onClick={() => navigate('/create-post')}
            style={{
              backgroundColor: 'var(--lm-orange)',
              color: '#fff',
              fontWeight: 700,
              boxShadow: 'var(--lm-shadow-orange)',
              transition: 'all 0.25s var(--lm-ease)'
            }}
            styles={{ root: { '&:hover': { transform: 'translateY(-2px)', backgroundColor: 'var(--lm-orange-hover)' } } }}
          >
            Створити пост
          </Button>
        </Group>

        {loading ? (
          <Center mt={50}><Loader color="orange" /></Center>
        ) : posts.length === 0 ? (
          <Paper p={60} radius="xl" ta="center" className="animate-fadeIn" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent' }}>
            <Text size="lg" fw={500} style={{ color: 'var(--lm-muted)' }} mb="lg">
              У вас ще немає постів. Розкажіть, що вас турбує.
            </Text>
            <Button variant="light" color="orange" radius="xl" size="md" onClick={() => navigate('/create-post')}>
              Створити перший пост
            </Button>
          </Paper>
        ) : (
          <Stack gap="xl">
            {posts.map((post) => (
              <Paper
                key={post._id}
                shadow="none"
                p={{ base: 24, md: 40 }}
                radius="xl"
                className="card-hover"
                style={{
                  border: '1px solid var(--lm-border)',
                  backgroundColor: 'var(--lm-card-bg)',
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: 'var(--lm-shadow-sm)'
                }}
                onClick={() => navigate(`/posts/${post._id}`)}
              >

                <ActionIcon
                  color="red"
                  variant="subtle"
                  size="xl"
                  radius="xl"
                  style={{ position: 'absolute', top: 20, right: 20, transition: 'all 0.2s var(--lm-ease)', '&:hover': { backgroundColor: 'var(--lm-orange-light)' } }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(post._id);
                  }}
                >
                  <IconTrash size={22} stroke={1.5} />
                </ActionIcon>

                <Group mb="lg" gap="xs">
                  <Badge color={post.status === 'active' ? 'orange' : 'gray'} variant="light" size="md" radius="sm">
                    {post.status === 'active' ? 'Ще турбує' : 'Вже пройшло'}
                  </Badge>
                  {post.isSupportOnly && <Badge color="pink" variant="dot" size="md">Тільки підтримка</Badge>}
                  {post.visibility === 'anonymous' && <Badge color="gray" variant="outline" size="md">Анонімно</Badge>}
                  {post.visibility === 'psychologists_only' && <Badge color="violet" variant="outline" size="md">Для психологів</Badge>}
                </Group>

                <Text size="sm" fw={500} style={{ color: 'var(--lm-muted)' }} mb="lg">
                  {new Date(post.createdAt).toLocaleDateString('uk-UA')} • Емоція: {post.emotion}
                </Text>

                {post.imageUrl && (
                  <Image src={`http://localhost:3000${post.imageUrl}`} height={250} fit="cover" radius="lg" mb="xl" style={{ border: '1px solid var(--lm-border)' }} />
                )}

                <Text fw={800} size="xl" style={{ color: 'var(--lm-dark)' }} mb="sm">{post.title || 'Без заголовка'}</Text>
                <Text style={{ whiteSpace: 'pre-wrap', color: 'var(--lm-dark-soft)', lineHeight: 1.65, fontSize: '16px', wordBreak: 'break-word' }}>
                  {post.content}
                </Text>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}