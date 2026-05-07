import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Avatar, Center, Loader, Button, Group, Badge, Box, Stack, Divider, ThemeIcon, Title, ActionIcon, SimpleGrid } from '@mantine/core';
import { IconMessageCircle, IconHeart, IconHeartFilled, IconArrowLeft, IconCertificate, IconUser, IconBrain } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';

export function SpecialistProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialist, setSpecialist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchSpecialist = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setSpecialist(response.data);
      } catch (error) {
        console.error('Помилка завантаження профілю', error);
        alert('Спеціаліста не знайдено');
        navigate('/specialists');
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialist();
  }, [id]);

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

  if (loading) return <Center h="100vh" bg="var(--lm-bg)"><Loader color="orange" size="xl" /></Center>;
  if (!specialist) return null;

  const displayName = specialist.fullName || `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim() || 'Анонімний спеціаліст';

  return (
    <Box className="page-content" style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />
      <Container size="md" pt={{ base: 20, md: 40 }} pb={{ base: 40, md: 80 }} px={{ base: 'sm', sm: 'md' }}>

        <Group mb={{ base: 'md', md: 'xl' }}>
          <Button
            variant="subtle" color="gray" leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            style={{ paddingLeft: 0, color: 'var(--lm-muted)', transition: 'all 0.2s var(--lm-ease)', '&:hover': { transform: 'translateX(-4px)', color: 'var(--lm-dark)' } }}
          >
            Назад до списку
          </Button>
        </Group>

        <Paper
          shadow="none"
          radius={{ base: 'xl', md: 30 }}
          p={{ base: 20, sm: 30, md: 50 }} 
          className="animate-slideUp"
          style={{
            border: '1px solid var(--lm-border)',
            backgroundColor: 'var(--lm-card-bg)',
            position: 'relative',
            boxShadow: 'var(--lm-shadow-lg)'
          }}
        >

          <ActionIcon
            size="xl" radius="xl" variant="subtle" color="red"
            style={{ 
              position: 'absolute', 
              top: 'clamp(16px, 4vw, 30px)', 
              right: 'clamp(16px, 4vw, 30px)', 
              transition: 'transform 0.2s var(--lm-ease)', 
              '&:hover': { transform: 'scale(1.1)', backgroundColor: 'var(--lm-orange-light)' } 
            }}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            {isFavorite ? <IconHeartFilled size={32} /> : <IconHeart size={32} />}
          </ActionIcon>

          <Center mb={{ base: 'lg', md: 'xl' }} mt={{ base: 'lg', md: 0 }}>
            <Avatar
              src={specialist.avatarUrl ? `http://localhost:3000${specialist.avatarUrl}` : null}
              radius="100%"
              style={{ 
                width: 'clamp(120px, 25vw, 160px)', 
                height: 'clamp(120px, 25vw, 160px)', 
                border: '6px solid var(--lm-bg)', 
                boxShadow: 'var(--lm-shadow-lg)' 
              }}
            />
          </Center>

          <Stack align="center" gap="xs" mb={{ base: 'lg', md: 'xl' }}>
            <Title order={1} ta="center" style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: 'clamp(24px, 5vw, 30px)', lineHeight: 1.2 }}>
              {displayName}
            </Title>
            <Badge color="violet" size="lg" radius="md" variant="light" leftSection={<IconCertificate size={16} />} style={{ padding: '0 16px', height: '32px', textTransform: 'none', fontSize: '14px', fontWeight: 600 }}>
              Сертифікований психолог
            </Badge>
          </Stack>

          <Divider my={{ base: 24, md: 40 }} color="var(--lm-border)" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={{ base: 'md', md: 'xl' }} mb={{ base: 30, md: 40 }}>
            <Paper p={{ base: 'lg', md: 'xl' }} radius="xl" style={{ backgroundColor: 'var(--lm-bg-alt)', border: '1px solid var(--lm-border)' }}>
              <Group gap="md" mb="lg">
                <ThemeIcon size={48} color="orange" variant="light" radius="100%" style={{ backgroundColor: 'var(--lm-card-bg)', boxShadow: 'var(--lm-shadow-sm)' }}><IconUser size={24} stroke={2} /></ThemeIcon>
                <Text fw={800} size="lg" style={{ color: 'var(--lm-dark)' }}>Особисті дані</Text>
              </Group>
              <Text size="16px" style={{ color: 'var(--lm-dark-soft)' }} mb={8}><b style={{ color: 'var(--lm-dark)' }}>Стать:</b> {specialist.gender === 'male' ? 'Чоловіча' : specialist.gender === 'female' ? 'Жіноча' : 'Не вказано'}</Text>
              <Text size="16px" style={{ color: 'var(--lm-dark-soft)' }}><b style={{ color: 'var(--lm-dark)' }}>Вік:</b> {specialist.age ? `${specialist.age} років` : 'Не вказано'}</Text>
            </Paper>

            <Paper p={{ base: 'lg', md: 'xl' }} radius="xl" style={{ backgroundColor: 'var(--lm-bg-alt)', border: '1px solid var(--lm-border)' }}>
              <Group gap="md" mb="lg">
                <ThemeIcon size={48} color="violet" variant="light" radius="100%" style={{ backgroundColor: 'var(--lm-card-bg)', boxShadow: 'var(--lm-shadow-sm)' }}><IconBrain size={24} stroke={2} /></ThemeIcon>
                <Text fw={800} size="lg" style={{ color: 'var(--lm-dark)' }}>Напрямки роботи</Text>
              </Group>
              <Group gap="xs">
                {specialist.specializations && specialist.specializations.length > 0 && specialist.specializations[0] !== "" ? (
                  specialist.specializations.map((spec: string, idx: number) => (
                    <Badge key={idx} color="orange" variant="outline" size="lg" radius="sm" style={{ textTransform: 'none', fontWeight: 600, border: '1px solid var(--lm-orange)', color: 'var(--lm-orange)' }}>
                      {spec}
                    </Badge>
                  ))
                ) : (
                  <Text size="16px" c="dimmed">Спеціалізації не вказані</Text>
                )}
              </Group>
            </Paper>
          </SimpleGrid>

          <Box mb={{ base: 30, md: 50 }}>
            <Title order={3} mb="lg" style={{ color: 'var(--lm-dark)', fontWeight: 800 }}>Про спеціаліста та послуги</Title>
            <Text style={{ color: 'var(--lm-dark-soft)', lineHeight: 1.7, fontSize: 'clamp(15px, 3vw, 17px)', whiteSpace: 'pre-wrap' }}>
              {specialist.servicesDescription || "Цей спеціаліст ще не додав детальний опис своїх послуг. Ви можете написати йому особисто, щоб дізнатися більше."}
            </Text>
          </Box>

          <Group grow>
            <Button
              radius="xl"
              leftSection={<IconMessageCircle size={24} stroke={2} />}
              onClick={handleSendMessage}
              style={{
                backgroundColor: 'var(--lm-orange)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 'clamp(16px, 4vw, 18px)', 
                height: 'clamp(54px, 10vw, 65px)',
                boxShadow: 'var(--lm-shadow-orange)',
                transition: 'all 0.25s var(--lm-ease)'
              }}
              styles={{ root: { '&:hover': { transform: 'translateY(-2px)', backgroundColor: 'var(--lm-orange-hover)' } } }}
            >
              Почати спілкування
            </Button>
          </Group>

        </Paper>
      </Container>
    </Box>
  );
}