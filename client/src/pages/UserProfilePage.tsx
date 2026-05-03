import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Avatar, Center, Loader, Button, Group, Badge, Box, Stack, Divider, Title, SimpleGrid, Card, ThemeIcon } from '@mantine/core';
import { IconMessageCircle, IconArrowLeft, IconNotes, IconUser } from '@tabler/icons-react';
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

  if (loading) return <Center h="100vh" bg="var(--lm-bg)"><Loader color="orange" size="xl" /></Center>;
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
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />
      <Container size="md" pt={{ base: 20, md: 40 }} pb={{ base: 40, md: 80 }} px={{ base: 'sm', sm: 'md' }}>

        <Group mb={{ base: 'md', md: 'xl' }}>
          <Button
            variant="subtle" color="gray" leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            style={{ paddingLeft: 0, color: 'var(--lm-muted)', transition: 'all 0.2s var(--lm-ease)', '&:hover': { transform: 'translateX(-4px)', color: 'var(--lm-dark)' } }}
          >
            Назад
          </Button>
        </Group>

        <Paper
          shadow="none"
          radius={{ base: 'xl', md: 30 }}
          p={{ base: 24, sm: 30, md: 50 }} 
          mb={{ base: 40, md: 60 }}
          className="animate-slideUp"
          style={{
            border: '1px solid var(--lm-border)',
            backgroundColor: 'var(--lm-card-bg)',
            boxShadow: 'var(--lm-shadow-lg)'
          }}
        >
          <Center mb={{ base: 'lg', md: 'xl' }}>
            {userProfile.avatarUrl ? (
              <Avatar
                src={`http://localhost:3000${userProfile.avatarUrl}`}
                radius="100%"
                style={{ 
                  width: 'clamp(100px, 25vw, 140px)', 
                  height: 'clamp(100px, 25vw, 140px)', 
                  border: '6px solid var(--lm-bg)', 
                  boxShadow: 'var(--lm-shadow-lg)' 
                }}
              />
            ) : (
              <ThemeIcon 
                radius="100%" variant="light" 
                style={{ 
                  width: 'clamp(100px, 25vw, 140px)', 
                  height: 'clamp(100px, 25vw, 140px)', 
                  backgroundColor: 'var(--lm-warm)', 
                  color: 'var(--lm-orange)' 
                }}
              >
                <IconUser size={60} stroke={1.5} />
              </ThemeIcon>
            )}
          </Center>

          <Stack align="center" gap="sm">
            <Title ta="center" order={1} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: 'clamp(22px, 5vw, 30px)', lineHeight: 1.2 }}>
              {displayName}
            </Title>

            <Group gap="xs" mt="xs">
              {userProfile.role === 'psychologist' && (
                <Badge color="violet" size="lg" radius="md" variant="light" style={{ padding: '0 16px', height: '32px', textTransform: 'none', fontSize: '14px', fontWeight: 600 }}>Психолог</Badge>
              )}
              {userProfile.role !== 'psychologist' && userProfile.personalityType && (
                <Badge color="orange" size="lg" radius="md" variant="outline" style={{ padding: '0 16px', height: '32px', textTransform: 'none', fontSize: '14px', fontWeight: 600, border: '1px solid var(--lm-orange)', color: 'var(--lm-orange)' }}>
                  {userProfile.personalityType}
                </Badge>
              )}
            </Group>
          </Stack>

          {!isMe && (
            <Group justify="center" mt={{ base: 30, md: 40 }}>
              <Button
                radius="xl"
                leftSection={<IconMessageCircle size={22} stroke={2} />}
                onClick={handleSendMessage}
                style={{
                  backgroundColor: 'var(--lm-orange)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '16px',
                  height: 'clamp(50px, 8vw, 60px)', 
                  padding: '0 clamp(20px, 5vw, 40px)',
                  boxShadow: 'var(--lm-shadow-orange)',
                  transition: 'all 0.25s var(--lm-ease)'
                }}
                styles={{ root: { '&:hover': { transform: 'translateY(-2px)', backgroundColor: 'var(--lm-orange-hover)' } } }}
              >
                Написати повідомлення
              </Button>
            </Group>
          )}
        </Paper>

        <Group gap="sm" mb="xl" className="animate-slideUp-delay-1">
          <ThemeIcon size={40} radius="xl" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)' }}>
            <IconNotes size={20} stroke={2} />
          </ThemeIcon>
          <Title order={3} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: 'clamp(20px, 4vw, 24px)' }}>Публікації користувача</Title>
        </Group>

        <Divider mb={{ base: 30, md: 40 }} color="var(--lm-border)" />

        {userPosts.length === 0 ? (
          <Paper p={{ base: 30, md: 50 }} radius="xl" ta="center" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent' }}>
            <Text size="lg" fw={500} style={{ color: 'var(--lm-muted)' }}>
              Цей користувач ще не робив публікацій.
            </Text>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={{ base: 'md', md: 'xl' }}>
            {userPosts.map((post) => (
              <Card
                key={post._id}
                shadow="none"
                p={{ base: 24, md: 30 }} 
                radius="xl"
                withBorder
                className="card-hover"
                style={{
                  borderColor: 'var(--lm-border)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--lm-card-bg)',
                  boxShadow: 'var(--lm-shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => navigate(`/posts/${post._id}`)}
              >
                <Text size="sm" fw={600} mb="md" style={{ color: 'var(--lm-muted)' }}>
                  {new Date(post.createdAt).toLocaleDateString('uk-UA')}
                </Text>
                <Title order={4} style={{ color: 'var(--lm-dark)', marginBottom: '12px', fontWeight: 800, lineHeight: 1.4 }} lineClamp={2}>
                  {post.title || 'Без заголовка'}
                </Title>
                <Text size="15px" lineClamp={3} style={{ color: 'var(--lm-dark-soft)', lineHeight: 1.6, flexGrow: 1 }}>
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