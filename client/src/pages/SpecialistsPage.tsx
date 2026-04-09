import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Text, Avatar, Center, Loader, Button, Badge, Box, Group } from '@mantine/core';
import { IconUserCircle, IconArrowRight, IconStar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';

export function SpecialistsPage() {
  const navigate = useNavigate();
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const response = await api.get('/users/specialists');
        setSpecialists(response.data);
      } catch (error) {
        console.error('Помилка завантаження спеціалістів', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialists();
  }, []);

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5FDFF' }}>
      <Header />
      <Container size="lg" py="xl">
        <Title ta="center" order={1} mb={10} style={{ color: '#0F7EAA' }}>
          Наші спеціалісти
        </Title>
        <Text ta="center" c="dimmed" mb={40}>
          Оберіть психолога, який вам найбільше відгукується, та почніть роботу над собою.
        </Text>

        {loading ? (
          <Center h={200}><Loader color="cyan" /></Center>
        ) : specialists.length === 0 ? (
          <Paper p={40} ta="center" radius="md" style={{ border: '1px dashed #B3E5FC', backgroundColor: 'transparent' }}>
            <Text c="dimmed">Поки що жоден користувач не отримав статус психолога.</Text>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {specialists.map((specialist) => {
              const displayName = specialist.fullName || `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim() || 'Анонімний спеціаліст';
              
              return (
                <Paper 
                  key={specialist._id} 
                  shadow="sm" 
                  p="xl" 
                  radius="md" 
                  style={{ border: '1px solid #E1F5FE', backgroundColor: '#fff', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => navigate(`/specialists/${specialist._id}`)}
                >
                  <Center mb="md">
                    {specialist.avatarUrl ? (
                      <Avatar src={`http://localhost:3000${specialist.avatarUrl}`} size={100} radius={100} style={{ border: '3px solid #E1F5FE' }} />
                    ) : (
                      <IconUserCircle size={100} color="#C9EAF7" stroke={1} />
                    )}
                  </Center>
                  
                  <Text fw={700} size="lg" style={{ color: '#0F7EAA' }}>
                    {displayName}
                  </Text>
                  
                  <Badge color="violet" variant="light" mt="xs" mb="md">
                    Психолог
                  </Badge>

                  {specialist.personalityType && (
                    <Group justify="center" gap={5} mb="md">
                      <IconStar size={16} color="#FFD700" />
                      <Text size="sm" c="dimmed">{specialist.personalityType}</Text>
                    </Group>
                  )}

                  <Button 
                    fullWidth 
                    variant="light" 
                    color="cyan" 
                    mt="md"
                    rightSection={<IconArrowRight size={18} />}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      navigate(`/specialists/${specialist._id}`);
                    }}
                  >
                    Переглянути профіль
                  </Button>
                </Paper>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}