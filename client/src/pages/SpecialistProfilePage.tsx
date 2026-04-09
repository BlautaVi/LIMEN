import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Avatar, Center, Loader, Button, Group, Badge, Box, Stack, Divider,ThemeIcon, Title, ActionIcon, SimpleGrid } from '@mantine/core';
import { IconMessageCircle, IconHeart, IconHeartFilled, IconArrowLeft, IconCertificate, IconUser, IconCalendarStats, IconBrain } from '@tabler/icons-react';
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
  if (loading) return <Center h="100vh"><Loader color="cyan" /></Center>;
  if (!specialist) return null;

  const displayName = specialist.fullName || `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim() || 'Анонімний спеціаліст';

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5FDFF' }}>
      <Header />
      <Container size="md" pt={40} pb={60}>
        
        <Group mb="lg">
          <Button variant="subtle" color="cyan" leftSection={<IconArrowLeft size={18} />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
            Назад
          </Button>
        </Group>

        <Paper shadow="xl" radius="lg" p={40} style={{ border: '1px solid #E1F5FE', backgroundColor: '#fff', position: 'relative' }}>
          
          <ActionIcon size="xl" variant="subtle" color="red" style={{ position: 'absolute', top: 20, right: 20 }} onClick={() => setIsFavorite(!isFavorite)}>
            {isFavorite ? <IconHeartFilled size={28} /> : <IconHeart size={28} />}
          </ActionIcon>

          <Center mb="lg">
            <Avatar src={specialist.avatarUrl ? `http://localhost:3000${specialist.avatarUrl}` : null} size={150} radius={150} style={{ border: '4px solid #E1F5FE' }} />
          </Center>

          <Stack align="center" gap="xs">
            <Title order={2} style={{ color: '#0F7EAA' }}>{displayName}</Title>
            <Group gap="xs">
              <Badge color="violet" size="lg" variant="light" leftSection={<IconCertificate size={14} />}>
                Сертифікований психолог
              </Badge>
            </Group>
          </Stack>

          <Divider my="xl" />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
            <Paper p="md" radius="md" style={{ backgroundColor: '#F4FAFC', border: '1px solid #E1F5FE' }}>
              <Group gap="sm" mb="xs">
                <ThemeIcon color="cyan" variant="light" radius="xl"><IconUser size={18} /></ThemeIcon>
                <Text fw={600} style={{ color: '#0F7EAA' }}>Особисті дані</Text>
              </Group>
              <Text size="sm"><b>Стать:</b> {specialist.gender === 'male' ? 'Чоловіча' : specialist.gender === 'female' ? 'Жіноча' : 'Не вказано'}</Text>
              <Text size="sm"><b>Вік:</b> {specialist.age ? `${specialist.age} років` : 'Не вказано'}</Text>
            </Paper>

            <Paper p="md" radius="md" style={{ backgroundColor: '#F4FAFC', border: '1px solid #E1F5FE' }}>
              <Group gap="sm" mb="xs">
                <ThemeIcon color="violet" variant="light" radius="xl"><IconBrain size={18} /></ThemeIcon>
                <Text fw={600} style={{ color: '#0F7EAA' }}>Напрямки роботи</Text>
              </Group>
              <Group gap={5}>
                {specialist.specializations && specialist.specializations.length > 0 && specialist.specializations[0] !== "" ? (
                  specialist.specializations.map((spec: string, idx: number) => (
                    <Badge key={idx} color="cyan" variant="outline">{spec}</Badge>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">Спеціалізації не вказані</Text>
                )}
              </Group>
            </Paper>
          </SimpleGrid>

          <Box mb="xl">
            <Title order={4} mb="sm" style={{ color: '#0F7EAA' }}>Про спеціаліста та послуги</Title>
            <Text style={{ color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {specialist.servicesDescription || "Цей спеціаліст ще не додав детальний опис своїх послуг."}
            </Text>
          </Box>

          <Group grow mt="xl">
            <Button size="lg" color="cyan" radius="md" leftSection={<IconMessageCircle size={22} />} onClick={handleSendMessage} style={{ boxShadow: '0 4px 15px rgba(79, 205, 255, 0.4)' }}>
            Почати спілкування
          </Button>
          </Group>

        </Paper>
      </Container>
    </Box>
  );
}