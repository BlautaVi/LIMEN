import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Stack, Image, Center, Loader, Group, ActionIcon, Badge, Menu, Box, Divider, TextInput, Avatar, Button } from '@mantine/core';
import { IconArrowLeft, IconDotsVertical, IconTrash, IconCheck, IconArchive, IconPencil } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [commentText, setCommentText] = useState('');
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
const handleReaction = async (emoji: string) => {
    try {
      const response = await api.put(`/posts/${id}/react`, { emoji });
      setPost(response.data); 
    } catch (error) {
      console.error('Помилка реакції', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await api.put(`/posts/${id}/comment`, { text: commentText });
      setPost(response.data); 
      setCommentText(''); 
    } catch (error) {
      alert('Помилка при додаванні коментаря');
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
          <Group 
            mb="md" 
            onClick={() => {
              const authorId = post.author?._id || post.author;
              if (authorId) navigate(`/user/${authorId}`);
            }} 
            style={{ cursor: 'pointer', width: 'fit-content' }}
          >
            <Avatar 
              src={post.author?.avatarUrl ? `http://localhost:3000${post.author.avatarUrl}` : null} 
              radius="xl" 
              size="md"
            />
            <Text 
              fw={500} 
              size="sm" 
              style={{ color: '#0F7EAA', textDecoration: 'none' }}
            >
              {post.author?.fullName || `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Анонім'}
            </Text>
          </Group>
          <Text fw={700} size="xl" style={{ color: '#0F7EAA' }} mb="xs">{post.title}</Text>
          <Text style={{ whiteSpace: 'pre-wrap', color: '#333', fontSize: '16px', lineHeight: 1.6, wordBreak: 'break-word' }} mb="xl">
            {post.content}
          </Text>

          <Divider my="sm" />
          <Text component="div" size="sm" c="dimmed" mb="xs">Відреагувати:</Text>
         <Group gap="sm">
            {reactions.map((reaction, idx) => {
              const count = post.reactions?.filter((r: any) => r.emoji === reaction.emoji).length || 0;
              const hasReacted = post.reactions?.some((r: any) => r.emoji === reaction.emoji && r.userId === currentUser._id);

              return (
                <Badge 
                  key={idx} 
                  size="lg" 
                  variant={hasReacted ? "filled" : "light"} 
                  color={hasReacted ? "pink" : "cyan"} 
                  style={{ cursor: 'pointer', textTransform: 'none', transition: 'transform 0.1s' }}
                  onClick={() => handleReaction(reaction.emoji)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {reaction.emoji} {reaction.label} {count > 0 && `(${count})`}
                </Badge>
              );
            })}
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
            <Stack mt="md">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment: any, idx: number) => (
                  <Paper key={idx} p="sm" radius="md" style={{ backgroundColor: '#F4FAFC', border: '1px solid #E1F5FE' }}>
                    <Group justify="space-between" mb={5}>
                      <Group gap="xs">
                        <Text fw={600} size="sm" color="#0F7EAA">
                          {comment.author?.fullName || 'Анонім'} 
                        </Text>
                        {comment.author?.role === 'psychologist' && (
                          <Badge size="xs" color="violet" variant="light">Психолог</Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>
                    </Group>
                    <Text size="sm" mb="sm">{comment.text}</Text>
                    
                    {comment.author?.role === 'psychologist' && currentUser._id !== comment.author?._id && (
                      <Button 
                        variant="subtle" 
                        size="xs" 
                        color="cyan" 
                        onClick={() => navigate(`/specialists/${comment.author._id}`)}
                      >
                        Консультуватись
                      </Button>
                    )}
                  </Paper>
                ))
              ) : (
                <Text c="dimmed" fs="italic" ta="center" py="sm">Поки що немає коментарів.</Text>
              )}
              
              <Group mt="md">
                <TextInput 
                  placeholder={currentUser.role === 'psychologist' ? "Написати пораду чи коментар..." : "Тільки психологи можуть залишати коментарі"} 
                  style={{ flex: 1 }} 
                  radius="xl" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.currentTarget.value)}
                  disabled={currentUser.role !== 'psychologist'} 
                />
                <Button 
                  radius="xl" 
                  color="cyan" 
                  disabled={currentUser.role !== 'psychologist' || !commentText.trim()}
                  onClick={handleAddComment}
                >
                  Відправити
                </Button>
              </Group>
            </Stack>
          )}
        </Paper>

      </Container>
    </Box>
  );
}