import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Stack, Image, Center, Loader, Group, ActionIcon, Badge, Menu, Box, Divider, TextInput, Button } from '@mantine/core';
import { IconArrowLeft, IconDotsVertical, IconTrash, IconCheck, IconArchive, IconPencil } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const reactions = [
    { emoji: '🤍', label: 'Тримайся' },
    { emoji: '🤗', label: 'Обіймаю' },
    { emoji: '💬', label: 'Був/була у схожій ситуації' },
    { emoji: '🫂', label: 'Я з тобою' },
  ];

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Помилка завантаження поста', error);
      alert('Пост не знайдено');
      navigate('/my-posts');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await api.put(`/posts/${id}/status`, { status: newStatus });
      setPost(response.data);
    } catch (error) {
      alert('Помилка при зміні статусу');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Точно видалити цей пост?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/my-posts');
    } catch (error) {
      alert('Помилка видалення');
    }
  };

  if (loading) return <Center h="100vh"><Loader color="cyan" /></Center>;
  if (!post) return null;

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5FDFF' }}>
      <Header />
      <Container size="sm" pt={30} pb={60}>
        
        <Group mb="md">
          <ActionIcon variant="transparent" onClick={() => navigate(-1)}>
            <IconArrowLeft size={28} color="#0F7EAA" stroke={3} />
          </ActionIcon>
          <Text fw={700} size="lg" style={{ color: '#0F7EAA' }}>Обговорення</Text>
        </Group>

        <Paper shadow="md" p="xl" radius="lg" style={{ border: '1px solid #E1F5FE', backgroundColor: '#fff' }}>
          
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <Badge color={post.status === 'active' ? 'cyan' : 'gray'} variant="filled">
                {post.status === 'active' ? 'Ще турбує' : 'Вже пройшло'}
              </Badge>
              {post.isSupportOnly && <Badge color="pink" variant="light">Тільки підтримка</Badge>}
            </Group>

            {currentUser._id === (post.author?._id || post.author) && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={20} /></ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Керування постом</Menu.Label>
                  
                  <Menu.Item 
                    leftSection={<IconPencil size={16} />} 
                    onClick={() => navigate(`/edit-post/${post._id}`)}
                  >
                    Редагувати пост
                  </Menu.Item>

                  {post.status === 'active' ? (
                    <Menu.Item leftSection={<IconCheck size={16} />} onClick={() => handleStatusChange('passed')}>
                      Позначити "Вже пройшло"
                    </Menu.Item>
                  ) : (
                    <Menu.Item leftSection={<IconArchive size={16} />} onClick={() => handleStatusChange('active')}>
                      Повернути в "Ще турбує"
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={handleDelete}>
                    Видалити пост
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>

          {post.imageUrl && (
            <Image src={`http://localhost:3000${post.imageUrl}`} radius="md" mb="md" fit="cover" />
          )}
          
          <Text fw={700} size="xl" style={{ color: '#0F7EAA' }} mb="xs">{post.title}</Text>
          <Text style={{ whiteSpace: 'pre-wrap', color: '#333', fontSize: '16px', lineHeight: 1.6, wordBreak: 'break-word' }} mb="xl">
            {post.content}
          </Text>

          <Divider my="sm" />
          <Text size="sm" c="dimmed" mb="xs">Відреагувати:</Text>
          <Group gap="sm">
            {reactions.map((reaction, idx) => (
              <Badge 
                key={idx} 
                size="lg" 
                variant="light" 
                color="cyan" 
                style={{ cursor: 'pointer', textTransform: 'none' }}
              >
                {reaction.emoji} {reaction.label}
              </Badge>
            ))}
          </Group>
        </Paper>

        <Text mt={40} mb="md" fw={700} size="lg" style={{ color: '#0F7EAA' }}>Підтримка та поради</Text>
        <Paper shadow="xs" p="md" radius="md" style={{ backgroundColor: '#fff', border: '1px solid #eee' }}>
          {post.isSupportOnly ? (
            <Text c="dimmed" ta="center" py="xl">
              У цьому пості увімкнено режим "Тільки підтримка".<br/> 
              Тут не можна давати поради, лише залишати реакції. 🤍
            </Text>
          ) : (
            <Stack>
              <Text c="dimmed" fs="italic">Поки що немає коментарів. Психологи скоро зможуть вам відповісти.</Text>
              <Group mt="md">
                <TextInput placeholder="Написати коментар..." style={{ flex: 1 }} radius="xl" disabled />
                <Button radius="xl" color="cyan" disabled>Відправити</Button>
              </Group>
            </Stack>
          )}
        </Paper>

      </Container>
    </Box>
  );
}