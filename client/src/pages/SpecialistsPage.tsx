import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Text, Avatar, Center, Loader, Button, Badge, Box, ThemeIcon } from '@mantine/core';
import { IconUser, IconArrowRight } from '@tabler/icons-react';
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
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />
      <Container size="lg" pt={{ base: 30, md: 60 }} pb={80}>
        <Title ta="center" order={1} mb={10} className="animate-slideUp" style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: '34px' }}>
          Наші спеціалісти
        </Title>
        <Text ta="center" mb={50} fw={500} size="lg" className="animate-slideUp-delay-1" style={{ color: 'var(--lm-muted)' }}>
          Оберіть фахівця, який відгукується вам найбільше, та почніть шлях до себе.
        </Text>

        {loading ? (
          <Center h={200}><Loader color="orange" size="lg" /></Center>
        ) : specialists.length === 0 ? (
          <Paper p={60} ta="center" radius="xl" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent' }}>
            <Text size="lg" fw={500} style={{ color: 'var(--lm-muted)' }}>Поки що жоден користувач не отримав статус психолога.</Text>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {specialists.map((specialist) => {
              const displayName = specialist.fullName || `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim() || 'Анонімний спеціаліст';

              return (
                <Paper
                  key={specialist._id}
                  shadow="none"
                  p={{ base: 28, md: 40 }}
                  radius="xl"
                  className="card-hover"
                  style={{
                    border: '1px solid var(--lm-border)',
                    backgroundColor: '#fff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--lm-shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => navigate(`/specialists/${specialist._id}`)}
                >
                  <Center mb="xl" style={{ position: 'relative' }}>
                    {specialist.avatarUrl ? (
                      <Avatar
                        src={`http://localhost:3000${specialist.avatarUrl}`}
                        size={120}
                        radius={120}
                        style={{ border: '4px solid var(--lm-bg)', boxShadow: 'var(--lm-shadow-md)' }}
                      />
                    ) : (
                      <ThemeIcon size={120} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)' }}>
                        <IconUser size={50} stroke={1.5} />
                      </ThemeIcon>
                    )}
                    <Badge
                      color="violet" variant="filled" size="md"
                      style={{ position: 'absolute', bottom: -10, border: '2px solid #fff', boxShadow: 'var(--lm-shadow-sm)' }}
                    >
                      Психолог
                    </Badge>
                  </Center>

                  <Text fw={800} size="20px" style={{ color: 'var(--lm-dark)' }} mt="md" mb="xl">
                    {displayName}
                  </Text>

                  <Button
                    fullWidth
                    radius="xl"
                    size="md"
                    mt="auto"
                    rightSection={<IconArrowRight size={18} stroke={2.5} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/specialists/${specialist._id}`);
                    }}
                    style={{
                      backgroundColor: 'var(--lm-orange-light)',
                      color: 'var(--lm-orange)',
                      transition: 'all 0.25s var(--lm-ease)',
                      fontWeight: 700
                    }}
                    styles={{ root: { '&:hover': { backgroundColor: 'var(--lm-orange)', color: '#fff' } } }}
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