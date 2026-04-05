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
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5FDFF' }}>
      <Header />
      <Container size="md" pt={40} pb={60}>
        
        {/* ХЕДЕР СТОРІНКИ З КНОПКОЮ */}
        <Group justify="space-between" mb={30}>
          <Title order={2} style={{ color: '#0F7EAA' }}>Мої пости</Title>
          <Button 
            leftSection={<IconPlus size={20} />} 
            radius="md" 
            color="cyan"
            onClick={() => navigate('/create-post')}
            style={{ backgroundColor: '#4FCDFF', boxShadow: '0 4px 10px rgba(79, 205, 255, 0.4)' }}
          >
            Створити пост
          </Button>
        </Group>

        {loading ? (
          <Center mt={50}><Loader color="cyan" /></Center>
        ) : posts.length === 0 ? (
          <Paper p={40} radius="md" ta="center" style={{ border: '1px dashed #B3E5FC', backgroundColor: 'transparent' }}>
            <Text c="dimmed" mb="md">У вас ще немає постів. Розкажіть, що вас турбує.</Text>
            <Button variant="light" color="cyan" onClick={() => navigate('/create-post')}>Створити перший пост</Button>
          </Paper>
        ) : (
          <Stack gap="lg">
             {posts.map((post) => (
              <Paper 
                key={post._id} 
                shadow="sm" 
                p="xl" 
                radius="md" 
                style={{ border: '1px solid #E1F5FE', position: 'relative', cursor: 'pointer' }} 
                onClick={() => navigate(`/posts/${post._id}`)} 
              >
                
                <ActionIcon 
                  color="red" 
                  variant="subtle" 
                  style={{ position: 'absolute', top: 15, right: 15 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(post._id);
                  }}
                >
                  <IconTrash size={20} />
                </ActionIcon>

                <Group mb="xs" gap="xs">
                  <Badge color={post.status === 'active' ? 'cyan' : 'gray'} variant="light">
                    {post.status === 'active' ? 'Ще турбує' : 'Вже пройшло'}
                  </Badge>
                  {post.isSupportOnly && <Badge color="pink" variant="dot">Тільки підтримка</Badge>}
                  {post.visibility === 'anonymous' && <Badge color="gray" variant="outline">Анонімно</Badge>}
                  {post.visibility === 'psychologists_only' && <Badge color="violet" variant="outline">Для психологів</Badge>}
                </Group>

                <Text size="sm" c="dimmed" mb="md">
                  {new Date(post.createdAt).toLocaleDateString()} • Емоція: {post.emotion}
                </Text>
                
                {post.imageUrl && (
                  <Image src={`http://localhost:3000${post.imageUrl}`} height={200} fit="cover" radius="md" mb="md" />
                )}
                
                <Text fw={700} style={{ color: '#0F7EAA' }} mb="sm">{post.title}</Text>
                <Text style={{ whiteSpace: 'pre-wrap', color: '#333', wordBreak: 'break-word' }}>{post.content}</Text>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}