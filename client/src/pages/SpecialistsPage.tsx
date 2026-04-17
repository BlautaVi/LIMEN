import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Text, Avatar, Center, Loader, Button, Badge, Box, ThemeIcon, Select, Group, Pagination, Stack } from '@mantine/core';
import { IconUser, IconArrowRight, IconFilter, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';

const ITEMS_PER_PAGE = 9; 

const AGE_RANGES = [
  { value: 'all', label: 'Будь-який вік' },
  { value: '18-25', label: '18 - 25 років' },
  { value: '26-35', label: '26 - 35 років' },
  { value: '36-45', label: '36 - 45 років' },
  { value: '46+', label: '46+ років' },
];

const GENDER_OPTIONS = [
  { value: 'all', label: 'Будь-яка стать' },
  { value: 'female', label: 'Жіноча' },
  { value: 'male', label: 'Чоловіча' },
];

export function SpecialistsPage() {
  const navigate = useNavigate();
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [genderFilter, setGenderFilter] = useState<string | null>('all');
  const [ageFilter, setAgeFilter] = useState<string | null>('all');
  const [specFilter, setSpecFilter] = useState<string | null>('all');
  
  const [activePage, setPage] = useState(1);

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

  const uniqueSpecializations = Array.from(
    new Set(
      specialists
        .flatMap(s => s.specializations || [])
        .map(s => s.trim())
    )
  ).filter(Boolean);

  const specOptions = [
    { value: 'all', label: 'Усі напрямки' },
    ...uniqueSpecializations.map(spec => ({ value: spec, label: spec }))
  ];

  const filteredSpecialists = specialists.filter(specialist => {
    let matchGender = true;
    if (genderFilter && genderFilter !== 'all') {
      matchGender = specialist.gender === genderFilter;
    }

    let matchAge = true;
    if (ageFilter && ageFilter !== 'all') {
      const age = parseInt(specialist.age);
      if (!age || isNaN(age)) {
        matchAge = false; 
      } else {
        if (ageFilter === '18-25') matchAge = age >= 18 && age <= 25;
        if (ageFilter === '26-35') matchAge = age >= 26 && age <= 35;
        if (ageFilter === '36-45') matchAge = age >= 36 && age <= 45;
        if (ageFilter === '46+') matchAge = age >= 46;
      }
    }

    let matchSpec = true;
    if (specFilter && specFilter !== 'all') {
      matchSpec = specialist.specializations?.some((sp: string) => sp.trim() === specFilter);
    }

    return matchGender && matchAge && matchSpec;
  });

  const totalPages = Math.ceil(filteredSpecialists.length / ITEMS_PER_PAGE);
  const paginatedSpecialists = filteredSpecialists.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [genderFilter, ageFilter, specFilter]);

  const resetFilters = () => {
    setGenderFilter('all');
    setAgeFilter('all');
    setSpecFilter('all');
  };

  const inputStyles = {
    input: {
      backgroundColor: '#fff',
      border: '1px solid var(--lm-border)',
      color: 'var(--lm-dark)',
      fontWeight: 500,
      fontSize: '15px',
      height: '48px',
      borderRadius: '24px',
      transition: 'all 0.2s ease',
      boxShadow: 'var(--lm-shadow-sm)',
      '&:focus': { borderColor: 'var(--lm-orange)', boxShadow: '0 0 0 2px rgba(232, 106, 83, 0.1)' }
    },
    label: { color: 'var(--lm-dark)', fontWeight: 600, marginBottom: '6px', fontSize: '13px', marginLeft: '10px' }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />
      <Container size="lg" pt={{ base: 30, md: 50 }} pb={80}>
        <Title ta="center" order={1} mb={10} className="animate-slideUp" style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: '34px' }}>
          Наші спеціалісти
        </Title>
        <Text ta="center" mb={40} fw={500} size="lg" className="animate-slideUp-delay-1" style={{ color: 'var(--lm-muted)' }}>
          Оберіть фахівця, який відгукується вам найбільше, та почніть шлях до себе.
        </Text>

        {/* БЛОК ФІЛЬТРІВ */}
        <Paper p="xl" radius="30px" mb={40} className="animate-slideUp-delay-1" style={{ backgroundColor: 'var(--lm-bg-alt)', border: '1px solid var(--lm-border)' }}>
          <Group mb="md" gap="xs">
            <ThemeIcon color="orange" variant="light" radius="xl"><IconFilter size={18} /></ThemeIcon>
            <Text fw={700} style={{ color: 'var(--lm-dark)' }}>Фільтрувати спеціалістів</Text>
          </Group>
          
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" align="flex-end">
            <Select 
              label="Спеціалізація" 
              placeholder="Оберіть напрямок" 
              data={specOptions} 
              value={specFilter} 
              onChange={setSpecFilter} 
              styles={inputStyles} 
              searchable
            />
            <Select 
              label="Стать" 
              data={GENDER_OPTIONS} 
              value={genderFilter} 
              onChange={setGenderFilter} 
              styles={inputStyles} 
            />
            <Select 
              label="Вік фахівця" 
              data={AGE_RANGES} 
              value={ageFilter} 
              onChange={setAgeFilter} 
              styles={inputStyles} 
            />
          </SimpleGrid>

          {(genderFilter !== 'all' || ageFilter !== 'all' || specFilter !== 'all') && (
            <Group justify="flex-end" mt="lg">
              <Button variant="subtle" color="gray" radius="xl" size="sm" leftSection={<IconX size={16} />} onClick={resetFilters} style={{ color: 'var(--lm-muted)' }}>
                Скинути фільтри
              </Button>
            </Group>
          )}
        </Paper>

        {loading ? (
          <Center h={200}><Loader color="orange" size="lg" /></Center>
        ) : specialists.length === 0 ? (
          <Paper p={60} ta="center" radius="xl" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent' }}>
            <Text size="lg" fw={500} style={{ color: 'var(--lm-muted)' }}>Поки що жоден користувач не отримав статус психолога.</Text>
          </Paper>
        ) : filteredSpecialists.length === 0 ? (
          <Paper p={60} ta="center" radius="xl" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent' }}>
            <Text size="lg" fw={500} mb="md" style={{ color: 'var(--lm-muted)' }}>За вашими фільтрами нікого не знайдено.</Text>
            <Button variant="light" color="orange" radius="xl" onClick={resetFilters}>Показати всіх</Button>
          </Paper>
        ) : (
          <Stack gap={50}>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              {paginatedSpecialists.map((specialist) => {
                const displayName = specialist.fullName || `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim() || 'Анонімний спеціаліст';

                return (
                  <Paper
                    key={specialist._id}
                    shadow="none"
                    p={{ base: 28, md: 40 }}
                    radius="30px"
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

                    <Text fw={800} size="20px" style={{ color: 'var(--lm-dark)' }} mt="md" mb="xs">
                      {displayName}
                    </Text>
                    
                    {/* Виводимо вік та стать, якщо вони є, для зручності */}
                    {(specialist.age || specialist.gender && specialist.gender !== 'hidden') && (
                      <Text size="sm" fw={600} mb="xl" style={{ color: 'var(--lm-muted)' }}>
                        {specialist.age ? `${specialist.age} років` : ''} 
                        {specialist.age && specialist.gender && specialist.gender !== 'hidden' ? ' • ' : ''}
                        {specialist.gender === 'female' ? 'Жінка' : specialist.gender === 'male' ? 'Чоловік' : ''}
                      </Text>
                    )}

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

            {totalPages > 1 && (
              <Center mt="xl">
                <Pagination 
                  total={totalPages} 
                  value={activePage} 
                  onChange={setPage} 
                  color="orange" 
                  radius="xl" 
                  size="lg"
                  styles={{
                    control: {
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--lm-dark-soft)',
                      fontWeight: 600,
                      '&[data-active]': {
                        backgroundColor: 'var(--lm-orange)',
                        color: '#fff',
                        boxShadow: 'var(--lm-shadow-orange)'
                      }
                    }
                  }}
                />
              </Center>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}