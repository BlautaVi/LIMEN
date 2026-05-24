import { useState, useEffect, useRef } from 'react';
import { Container, Paper, TextInput, Title, ThemeIcon, Textarea, Button, Group, ActionIcon, Box, Stack, Text, Badge, Image, Indicator, Modal, Grid } from '@mantine/core';
import { IconArrowLeft, IconLogout, IconGenderFemale, IconGenderMale, IconEyeOff, IconUserCircle, IconPencil, IconCertificate, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';
import { useDisclosure } from '@mantine/hooks';

const PERSONALITY_TIPS: Record<string, string> = {
  'Врівноважений': 'Ви чудово справляєтеся з повсякденними викликами! Продовжуйте підтримувати цей баланс.',
  'Чуттєвий Емпат': 'Ви глибоко відчуваєте світ. Не забувайте про власні кордони — ваша енергія потребує відновлення.',
  'Тривожний аналітик': 'Спробуйте іноді ставити думки "на паузу", використовуючи техніки заземлення.',
  'У стані вигорання': 'Ваші ресурси вичерпані. Найкраще — дозволити собі відпочинок без почуття провини.',
};

const getTipForPersonality = (type?: string) => {
  if (!type) return null;
  const foundKey = Object.keys(PERSONALITY_TIPS).find(key => type.includes(key));
  return foundKey ? PERSONALITY_TIPS[foundKey] : 'Прислухайтеся до своїх емоцій та не бійтеся просити про підтримку. 🤍';
};

export function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'hidden'>('hidden');
  const [user, setUser] = useState<any>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [age, setAge] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [servicesDescription, setServicesDescription] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successOpened, { open: openSuccess, close: closeSuccess }] = useDisclosure(false);
  
  const [eduDegree, setEduDegree] = useState('');
  const [experience, setExperience] = useState('');
  const [diplomaLink, setDiplomaLink] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!localUser._id) { navigate('/login'); return; }

        const response = await api.get(`/users/${localUser._id}`);
        const freshUser = response.data;

        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));

        setAge(freshUser.age || '');
        setSpecializations(freshUser.specializations || []);
        setServicesDescription(freshUser.servicesDescription || '');

        if (freshUser.fullName) {
          const parts = freshUser.fullName.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
        if (freshUser.gender) setGender(freshUser.gender);
        if (freshUser.avatarUrl) setAvatarPreview(`http://localhost:3000${freshUser.avatarUrl}`);

      } catch (error) { console.error('Помилка синхронізації', error); }
    };
    fetchUserData();
  }, [navigate]);

  const handleSubmitPsychologistApp = async () => {
    if (!eduDegree.trim() || !experience.trim() || !diplomaLink.trim()) return;
    setIsSubmittingApp(true);
    try {
      const response = await api.put('/users/become-psychologist', { eduDegree, experience, diplomaLink });
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      setIsModalOpen(false);
      openSuccess(); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('gender', gender);
      formData.append('age', age);
      formData.append('specializations', specializations.join(','));
      formData.append('servicesDescription', servicesDescription);
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const inputStyles = {
    input: {
      backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)',
      fontWeight: 500, fontSize: '16px', padding: '0 20px', height: '54px', transition: 'all 0.3s var(--lm-ease)',
      '&:focus': { borderColor: 'var(--lm-orange)', backgroundColor: 'var(--lm-card-bg)', boxShadow: '0 0 0 3px rgba(232, 106, 83, 0.1)' }
    },
    label: { color: 'var(--lm-dark)', fontWeight: 700, marginBottom: '8px', fontSize: '15px' }
  };

  return (
    <Box className="page-content" style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)', paddingBottom: '80px' }}>
      <Header /> 
      
      <Modal opened={successOpened} onClose={closeSuccess} centered radius="xl" withCloseButton={false} overlayProps={{ blur: 4, opacity: 0.4 }} styles={{ content: { backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', padding: '30px', textAlign: 'center' } }}>
        <ThemeIcon size={80} radius="100%" color="green" variant="light" mx="auto" mb="lg"><IconCheck size={40} /></ThemeIcon>
        <Title order={2} style={{ color: 'var(--lm-dark)' }} mb="sm">Заявку схвалено!</Title>
        <Text style={{ color: 'var(--lm-dark-soft)' }} mb="xl">Вітаємо в команді спеціалістів LIMEN 👨‍⚕️. Тепер вам доступні нові функції.</Text>
        <Button fullWidth size="lg" radius="xl" color="green" onClick={closeSuccess}>Чудово</Button>
      </Modal>

      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title={<Group gap="sm"><ThemeIcon color="orange" variant="light" radius="xl" size="lg"><IconCertificate size={20} /></ThemeIcon><Text fw={800} size="xl" style={{ color: 'var(--lm-dark)' }}>Заявка на статус психолога</Text></Group>} centered radius="xl" size="lg" overlayProps={{ blur: 4, opacity: 0.4 }} styles={{ content: { padding: '24px', backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)' }, header: { backgroundColor: 'var(--lm-card-bg)' } }}>
        <Stack gap="md" mt="sm">
          <Text size="sm" mb="sm" style={{ color: 'var(--lm-dark-soft)' }}>Надайте інформацію про вашу освіту. Після перевірки ви отримаєте доступ до інструментів фахівця.</Text>
          <TextInput label="Вища психологічна освіта" value={eduDegree} onChange={(e) => setEduDegree(e.currentTarget.value)} radius="xl" styles={inputStyles} />
          <TextInput label="Досвід роботи" value={experience} onChange={(e) => setExperience(e.currentTarget.value)} radius="xl" styles={inputStyles} />
          <TextInput label="Посилання на диплом/сертифікати" value={diplomaLink} onChange={(e) => setDiplomaLink(e.currentTarget.value)} radius="xl" styles={inputStyles} />
          <Button fullWidth mt="xl" size="lg" radius="xl" loading={isSubmittingApp} onClick={handleSubmitPsychologistApp} style={{ backgroundColor: 'var(--lm-orange)', color: '#fff' }}>Відправити на перевірку</Button>
        </Stack>
      </Modal>

      <Container size="md" pt={{ base: 20, md: 40 }} px={{ base: 'md', sm: 'xl' }}>
        <Paper shadow="none" radius="30px" className="animate-slideUp" style={{ overflow: 'hidden', backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)' }}>
          <Box p={{ base: 20, sm: 30, md: 50 }}>
            <Grid gutter={{ base: 40, md: 60 }}>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Stack align="center">
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarSelect} />
                  <Indicator inline size={36} offset={15} position="bottom-end" color="orange" withBorder label={<IconPencil size={18} />} onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                    {avatarPreview ? <Image src={avatarPreview} w={160} h={160} radius="100%" fit="cover" style={{ border: `4px solid var(--lm-bg)` }} /> : <IconUserCircle size={160} color="var(--lm-border)" style={{ backgroundColor: 'var(--lm-bg-alt)', borderRadius: '50%' }} />}
                  </Indicator>
                  <Text fw={800} size="xl" mt="xs" style={{ color: 'var(--lm-dark)' }}>{user?.email}</Text>
                  
                  {user?.role === 'psychologist' && (
                    <Badge color="violet" size="lg" radius="md" mt="xs" variant="light" style={{ padding: '0 16px', height: '32px', textTransform: 'none' }}>Підтверджений психолог</Badge>
                  )}

                  {user?.role === 'admin' && (
                    <Badge color="red" size="lg" radius="md" mt="xs" variant="light" style={{ padding: '0 16px', height: '32px', textTransform: 'none' }}>Адміністратор</Badge>
                  )}

                  {user?.role === 'user' && (
                    <Stack gap="sm" mt="xs" align="center" style={{ width: '100%' }}>
                      
                      {user?.personalityType && (
                        <Paper p="sm" radius="md" style={{ backgroundColor: 'var(--lm-bg-alt)', border: '1px solid var(--lm-border)', width: '100%' }}>
                          <Text size="sm" fw={700} ta="center" style={{ color: 'var(--lm-dark)' }}>Ваш стан: {user.personalityType}</Text>
                          <Text size="xs" ta="center" mt={4} style={{ color: 'var(--lm-muted)' }}>{getTipForPersonality(user.personalityType)}</Text>
                        </Paper>
                      )}

                      <Button 
                        variant="light" color="blue" radius="xl" fullWidth 
                        onClick={() => navigate('/onboarding')}
                        styles={{
                          root: { height: 'auto', minHeight: '42px', padding: '10px 16px' },
                          label: { whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2 }
                        }}
                      >
                        {user?.personalityType ? 'Пройти тест знову' : 'Пройти тест на особистість'}
                      </Button>

                      <Button 
                        variant="light" color="orange" radius="xl" fullWidth 
                        onClick={() => setIsModalOpen(true)}
                        styles={{
                          root: { height: 'auto', minHeight: '42px', padding: '10px 16px' },
                          label: { whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2 }
                        }}
                      >
                        Подати заявку психолога
                      </Button>
                    </Stack>
                  )}

                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 8 }}>
                <Stack gap="lg">
                  <TextInput placeholder="Ваше ім'я" value={firstName} onChange={(e) => setFirstName(e.currentTarget.value)} radius="xl" size="md" styles={inputStyles} />
                  <TextInput placeholder="Ваше прізвище" value={lastName} onChange={(e) => setLastName(e.currentTarget.value)} radius="xl" size="md" styles={inputStyles} />

                  {user?.role === 'psychologist' && (
                    <Paper p="xl" radius="xl" style={{ border: '1px solid var(--lm-border)', backgroundColor: 'var(--lm-bg-alt)' }}>
                      <Title order={4} mb="xl" style={{ color: 'var(--lm-dark)', fontWeight: 800 }}>Професійне резюме</Title>
                      <TextInput label="Ваш вік" value={age} onChange={(e) => setAge(e.currentTarget.value)} radius="xl" size="md" styles={inputStyles} mb="lg" />
                      <TextInput label="Спеціалізації (через кому)" value={specializations.join(', ')} onChange={(e) => setSpecializations(e.currentTarget.value.split(','))} mb="lg" radius="xl" size="md" styles={inputStyles} />
                      <Textarea label="Про вас та ваші послуги" minRows={5} value={servicesDescription} onChange={(e) => setServicesDescription(e.currentTarget.value)} radius="xl" size="md" styles={{ ...inputStyles, input: { ...inputStyles.input, borderRadius: '24px', paddingTop: '16px', height: 'auto' } }} />
                    </Paper>
                  )}

                  <Group justify="space-between" mt="xl">
                    <Box>
                      <Text size="sm" fw={700} mb={8} style={{ color: 'var(--lm-dark)' }}>Стать</Text>
                      <Group gap={8} p={6} style={{ backgroundColor: 'var(--lm-bg-input)', borderRadius: 'var(--lm-radius-full)', border: `1px solid var(--lm-border)` }}>
                        <ActionIcon size="xl" radius="xl" variant={gender === 'female' ? 'filled' : 'transparent'} color={gender === 'female' ? 'orange' : 'gray'} onClick={() => setGender('female')} style={{ backgroundColor: gender === 'female' ? 'var(--lm-orange)' : 'transparent', color: gender === 'female' ? '#fff' : 'var(--lm-muted)' }}><IconGenderFemale size={22} /></ActionIcon>
                        <ActionIcon size="xl" radius="xl" variant={gender === 'male' ? 'filled' : 'transparent'} color={gender === 'male' ? 'orange' : 'gray'} onClick={() => setGender('male')} style={{ backgroundColor: gender === 'male' ? 'var(--lm-orange)' : 'transparent', color: gender === 'male' ? '#fff' : 'var(--lm-muted)' }}><IconGenderMale size={22} /></ActionIcon>
                        <ActionIcon size="xl" radius="xl" variant={gender === 'hidden' ? 'filled' : 'transparent'} color="gray" onClick={() => setGender('hidden')} style={{ backgroundColor: gender === 'hidden' ? 'var(--lm-dark-soft)' : 'transparent', color: gender === 'hidden' ? '#fff' : 'var(--lm-muted)' }}><IconEyeOff size={22} /></ActionIcon>
                      </Group>
                    </Box>

                    <Button size="lg" radius="xl" w={{ base: '100%', sm: 180 }} onClick={handleSave} loading={loading} style={{ backgroundColor: 'var(--lm-orange)', color: '#fff' }}>Зберегти</Button>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}