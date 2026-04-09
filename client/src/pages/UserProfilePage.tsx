import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Avatar, Center, Loader, Button, Group, Badge, Box, Stack, Divider, Title, SimpleGrid, Card } from '@mantine/core';
import { IconMessageCircle, IconArrowLeft, IconNotes } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';

export function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userRes = await api.get(`/users/${id}`);
        setUserProfile(userRes.data);

        const postsRes = await api.get('/posts');
        const filteredPosts = postsRes.data.filter((post: any) => post.author?._id === id);
        setUserPosts(filteredPosts);

      } catch (error) {
        console.error('Помилка завантаження профілю', error);
        alert('Користувача не знайдено');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, [id]);

  if (loading) return <Center h="100vh"><Loader color="cyan" /></Center>;
  if (!userProfile) return null;

  const displayName = userProfile.fullName || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Анонімний користувач';
  const isMe = currentUser._id === id;

  const handleSendMessage = async () => {
    try {
      const response = await api.post('/conversations/find-or-create', { participantId: id });
      
      const conversationId = response.data._id;
      navigate(`/chats/${conversationId}`);
    } catch (error) {
      console.error('Помилка при створенні чату', error);
      alert('Не вдалося створити чат');
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5FDFF' }}>
      <Header />
      <Container size="md" pt={40} pb={60}>
        
        <Group mb="lg">
          <Button variant="subtle" color="cyan" leftSection={<IconArrowLeft size={18} />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
            Назад
          </Button>
        </Group>

        <Paper shadow="sm" radius="lg" p={40} mb="xl" style={{ border: '1px solid #E1F5FE', backgroundColor: '#fff' }}>
          <Center mb="lg">
            <Avatar src={userProfile.avatarUrl ? `http://localhost:3000${userProfile.avatarUrl}` : null} size={120} radius={120} style={{ border: '4px solid #E1F5FE' }} />
          </Center>

          <Stack align="center" gap="xs">
            <Title order={2} style={{ color: '#0F7EAA' }}>{displayName}</Title>
            
            <Group gap="xs">
              {userProfile.role === 'psychologist' && (
                <Badge color="violet" size="md" variant="light">Психолог</Badge>
              )}
              {userProfile.role !== 'psychologist' && userProfile.personalityType && (
                <Badge color="yellow" size="md" variant="outline">{userProfile.personalityType}</Badge>
              )}
            </Group>
          </Stack>

          {!isMe && (
            <Group justify="center" mt="xl">
              <Button size="md" color="cyan" radius="xl" leftSection={<IconMessageCircle size={20} />} onClick={handleSendMessage}>
                Написати повідомлення
              </Button>
            </Group>
          )}
        </Paper>

        {/* ПУБЛІКАЦІЇ КОРИСТУВАЧА */}
        <Group gap="sm" mb="md">
          <IconNotes size={24} color="#0F7EAA" />
          <Title order={3} style={{ color: '#0F7EAA' }}>Публікації користувача</Title>
        </Group>
        
        <Divider mb="xl" color="#E1F5FE" />

        {userPosts.length === 0 ? (
          <Text c="dimmed" ta="center" fs="italic">Цей користувач ще не робив публікацій.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {userPosts.map((post) => (
              <Card key={post._id} shadow="sm" p="lg" radius="md" withBorder style={{ borderColor: '#E1F5FE', cursor: 'pointer' }} onClick={() => navigate(`/posts/${post._id}`)}>
                <Text size="sm" c="dimmed" mb="xs">
                  {new Date(post.createdAt).toLocaleDateString('uk-UA')}
                </Text>
                <Title order={5} style={{ color: '#0F7EAA', marginBottom: '10px' }} lineClamp={1}>
                  {post.title}
                </Title>
                <Text size="sm" lineClamp={3} style={{ color: '#555' }}>
                  {post.content}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        )}

      </Container>
    </Box>
  );
}