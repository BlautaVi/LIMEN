import { useState, useEffect, useRef } from 'react';
import { Container, Paper, TextInput, Title, ThemeIcon, Textarea, Button, Group, ActionIcon, Box, Stack, Tooltip, Text, Badge, Image, Indicator, Modal, Grid } from '@mantine/core';
import { IconArrowLeft, IconLogout, IconGenderFemale, IconGenderMale, IconEyeOff, IconUserCircle, IconPencil, IconListDetails, IconBook, IconCertificate } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';

const PERSONALITY_TIPS: Record<string, string> = {
  'Врівноважений': 'Ви чудово справляєтеся з повсякденними викликами! Продовжуйте підтримувати цей баланс, приділяючи час своїм улюбленим справам та якісному відпочинку.',
  'Чуттєвий Емпат': 'Ви глибоко відчуваєте світ і емоції інших людей. Це прекрасний дар, але не забувайте про власні кордони — ваша енергія також потребує захисту та відновлення.',
  'Тривожний аналітик': 'Ваш розум постійно працює і шукає рішення. Спробуйте іноді ставити думки "на паузу", використовуючи техніки заземлення та фокусуючись на моменті "тут і зараз".',
  'У стані вигорання': 'Зараз ваші внутрішні ресурси вичерпані, і це абсолютно нормально відчувати втому. Найкраще, що ви можете зробити — дозволити собі відпочинок без почуття провини та звернутися за підтримкою до фахівця.',
};

const getTipForPersonality = (type?: string) => {
  if (!type) return null;
  const foundKey = Object.keys(PERSONALITY_TIPS).find(key => type.includes(key));
  return foundKey ? PERSONALITY_TIPS[foundKey] : 'Прислухайтеся до своїх емоцій та не бійтеся просити про підтримку, коли вона вам потрібна. 🤍';
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
  const [eduDegree, setEduDegree] = useState('');
  const [experience, setExperience] = useState('');
  const [diplomaLink, setDiplomaLink] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!localUser._id) {
          navigate('/login');
          return;
        }

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

      } catch (error) {
        console.error('Помилка синхронізації профілю', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSubmitPsychologistApp = async () => {
    if (!eduDegree.trim() || !experience.trim() || !diplomaLink.trim()) {
      alert('Будь ласка, заповніть всі поля, щоб ми могли перевірити ваші дані.');
      return;
    }

    setIsSubmittingApp(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await api.put('/users/become-psychologist');
      localStorage.setItem('user', JSON.stringify(response.data));
      alert('Вашу заявку успішно схвалено (Демо-режим)! Вітаємо в команді спеціалістів LIMEN 👨‍⚕️');
      window.location.reload();
    } catch (error) {
      alert('Помилка. Не вдалося надіслати заявку.');
    } finally {
      setIsSubmittingApp(false);
      setIsModalOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
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
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      alert('Дані профілю успішно оновлено!');
    } catch (error) {
      console.error(error);
      alert('Помилка при збереженні даних');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    input: {
      backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)',
      fontWeight: 500, fontSize: '16px', padding: '0 20px', height: '54px',
      transition: 'all 0.3s var(--lm-ease)',
      '&:focus': { borderColor: 'var(--lm-orange)', backgroundColor: 'var(--lm-card-bg)', boxShadow: '0 0 0 3px rgba(232, 106, 83, 0.1)' }
    },
    label: { color: 'var(--lm-dark)', fontWeight: 700, marginBottom: '8px', fontSize: '15px' }
  };

  const modalInputStyles = {
    input: {
      backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)',
      fontWeight: 500, fontSize: '15px', padding: '0 20px', height: '48px',
      transition: 'all 0.3s var(--lm-ease)',
      '&:focus': { borderColor: 'var(--lm-orange)', backgroundColor: 'var(--lm-card-bg)', boxShadow: '0 0 0 3px rgba(232, 106, 83, 0.1)' }
    },
    label: { color: 'var(--lm-dark)', fontWeight: 700, marginBottom: '6px', fontSize: '14px' }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)', paddingTop: '0px', paddingBottom: '80px' }}>
      <Header /> 
      
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <Group gap="sm">
            <ThemeIcon color="orange" variant="light" radius="xl" size="lg" style={{ backgroundColor: 'var(--lm-warm)' }}><IconCertificate size={20} /></ThemeIcon>
            <Text fw={800} size="xl" style={{ color: 'var(--lm-dark)', letterSpacing: '-0.5px' }}>Заявка на статус психолога</Text>
          </Group>
        }
        centered
        radius="xl"
        size="lg"
        overlayProps={{ blur: 4, opacity: 0.4 }}
        styles={{
          content: { padding: '24px', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-lg)', backgroundColor: 'var(--lm-card-bg)' },
          header: { marginBottom: '16px', backgroundColor: 'var(--lm-card-bg)' }
        }}
      >
        <Stack gap="md" mt="sm">
          <Text size="sm" mb="sm" style={{ color: 'var(--lm-dark-soft)', lineHeight: 1.5 }}>
            LIMEN піклується про безпеку спільноти. Будь ласка, надайте інформацію про вашу освіту та досвід. Після перевірки документів ви отримаєте доступ до інструментів фахівця.
          </Text>

          <TextInput
            label="Вища психологічна освіта"
            placeholder="Назва ВНЗ, спеціальність та рік випуску"
            value={eduDegree} onChange={(e) => setEduDegree(e.currentTarget.value)}
            radius="xl" styles={modalInputStyles}
          />
          <TextInput
            label="Досвід роботи"
            placeholder="Скільки років ви практикуєте?"
            value={experience} onChange={(e) => setExperience(e.currentTarget.value)}
            radius="xl" styles={modalInputStyles}
          />
          <TextInput
            label="Посилання на диплом/сертифікати"
            placeholder="Google Drive, Dropbox, Linkedin тощо"
            value={diplomaLink} onChange={(e) => setDiplomaLink(e.currentTarget.value)}
            radius="xl" styles={modalInputStyles}
          />

          <Button
            fullWidth mt="xl" size="lg" radius="xl"
            loading={isSubmittingApp}
            onClick={handleSubmitPsychologistApp}
            style={{
              backgroundColor: 'var(--lm-orange)', color: '#fff', fontWeight: 700,
              boxShadow: 'var(--lm-shadow-orange)', transition: 'all 0.25s var(--lm-ease)'
            }}
            styles={{ root: { '&:hover': { transform: 'translateY(-2px)', backgroundColor: 'var(--lm-orange-hover)' } } }}
          >
            Відправити на перевірку
          </Button>
        </Stack>
      </Modal>

      <Container size="md" pt={{ base: 20, md: 40 }} px={{ base: 'md', sm: 'xl' }}>
        <Paper
          shadow="none"
          radius={{ base: 'xl', md: 30 }}
          className="animate-slideUp"
          style={{ overflow: 'hidden', backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-lg)' }}
        >

          <Box p={{ base: '16px 20px', md: '24px 40px' }} style={{ borderBottom: `1px solid var(--lm-border)`, backgroundColor: 'var(--lm-card-bg)' }}>
            <Group justify="space-between">
              <ActionIcon variant="transparent" onClick={() => navigate(-1)} style={{ transition: 'transform 0.2s var(--lm-ease)', '&:hover': { transform: 'translateX(-4px)' } }}>
                <IconArrowLeft size={28} color="var(--lm-dark)" stroke={2.5} />
              </ActionIcon>

              <Group gap="xs">
                <Tooltip label="Мій щоденник емоцій" position="bottom" color="orange" withArrow>
                  <ActionIcon variant="subtle" radius="xl" size="lg" onClick={() => navigate('/diary')} style={{ color: 'var(--lm-orange)', transition: 'all 0.2s var(--lm-ease)', '&:hover': { backgroundColor: 'var(--lm-orange-light)' } }}>
                    <IconBook size={24} stroke={2} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Мої пости" position="bottom" color="orange" withArrow>
                  <ActionIcon variant="subtle" radius="xl" size="lg" onClick={() => navigate('/my-posts')} style={{ color: 'var(--lm-muted)', transition: 'all 0.2s var(--lm-ease)', '&:hover': { color: 'var(--lm-orange)', backgroundColor: 'var(--lm-orange-light)' } }}>
                    <IconListDetails size={24} stroke={2} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Вийти" position="bottom" color="red" withArrow>
                  <ActionIcon variant="subtle" radius="xl" size="lg" onClick={handleLogout} style={{ color: 'var(--lm-muted)', transition: 'all 0.2s var(--lm-ease)', '&:hover': { color: '#ff6b6b', backgroundColor: 'var(--lm-orange-light)' } }}>
                    <IconLogout size={24} stroke={2} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Box>

          <Box p={{ base: 20, sm: 30, md: 50 }}>
            <Grid gutter={{ base: 40, md: 60 }}>
              
              <Grid.Col span={{ base: 12, sm: 4, md: 4 }}>
                <Stack align="center">
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarSelect} />

                  <Indicator
                    inline size={36} offset={15} position="bottom-end" color="orange" withBorder
                    label={<IconPencil size={18} stroke={2} />}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s var(--lm-ease)', '&:hover': { transform: 'scale(1.05)' } }}
                  >
                    {avatarPreview ? (
                      <Image src={avatarPreview} w={{ base: 140, md: 160 }} h={{ base: 140, md: 160 }} radius="100%" fit="cover" style={{ border: `4px solid var(--lm-card-bg)`, boxShadow: 'var(--lm-shadow-md)' }} />
                    ) : (
                      <IconUserCircle size={160} color="var(--lm-border)" stroke={1} style={{ backgroundColor: 'var(--lm-bg-alt)', borderRadius: '50%', width: '100%', height: 'auto', maxWidth: '160px' }} />
                    )}
                  </Indicator>

                  <Text fw={800} size="xl" mt="xs" style={{ color: 'var(--lm-dark)', textAlign: 'center' }}>{user?.email}</Text>

                  {user?.role !== 'psychologist' ? (
                    <Button variant="light" color="orange" radius="xl" mt="sm" onClick={() => setIsModalOpen(true)} style={{ fontWeight: 600 }}>
                      Подати заявку психолога
                    </Button>
                  ) : (
                    <Badge color="violet" size="lg" radius="md" mt="xs" variant="light" style={{ padding: '0 16px', height: '32px', fontWeight: 600, textTransform: 'none' }}>
                      Підтверджений психолог
                    </Badge>
                  )}

                  {user?.role !== 'psychologist' && (
                    <Stack gap={12} mt="xl" align="center" style={{ width: '100%' }}>
                      {user?.personalityType ? (
                        <>
                          <Badge size="xl" color="orange" variant="outline" style={{ textTransform: 'none', padding: '0 20px', height: '36px', border: '1px solid var(--lm-orange)', color: 'var(--lm-orange)' }}>
                            Тип: {user.personalityType}
                          </Badge>
                          <Text size="sm" ta="center" style={{ maxWidth: '350px', lineHeight: 1.6, color: 'var(--lm-dark-soft)' }}>
                            💡 {getTipForPersonality(user.personalityType)}
                          </Text>
                          <Button variant="subtle" size="xs" color="gray" radius="xl" onClick={() => navigate('/onboarding')} mt="xs" style={{ color: 'var(--lm-muted)' }}>
                            Пройти тест повторно
                          </Button>
                        </>
                      ) : (
                        <Button variant="light" color="orange" size="md" radius="xl" onClick={() => navigate('/onboarding')} style={{ fontWeight: 600 }}>
                          Пройти тест на особистість
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 8, md: 8 }}>
                <Stack gap="lg" h="100%">

                  <TextInput placeholder="Ваше ім'я" value={firstName} onChange={(e) => setFirstName(e.currentTarget.value)} radius="xl" size="md" styles={inputStyles} />
                  <TextInput placeholder="Ваше прізвище" value={lastName} onChange={(e) => setLastName(e.currentTarget.value)} radius="xl" size="md" styles={inputStyles} />

                  {user?.role === 'psychologist' && (
                    <Paper p={{ base: 'lg', md: 'xl' }} radius="xl" mt="md" style={{ border: '1px solid var(--lm-border)', backgroundColor: 'var(--lm-bg-alt)' }}>
                      <Title order={4} mb="xl" style={{ color: 'var(--lm-dark)', fontWeight: 800 }}>Професійне резюме (бачать клієнти)</Title>

                      <TextInput label="Ваш вік" placeholder="Наприклад: 32" value={age} onChange={(e) => setAge(e.currentTarget.value)} radius="xl" size="md" styles={inputStyles} mb="lg" />
                      <TextInput
                        label="Спеціалізації (через кому)"
                        placeholder="КПТ, Гештальт-терапія, Сімейна психологія..."
                        value={specializations.join(', ')}
                        onChange={(e) => setSpecializations(e.currentTarget.value.split(',').map(s => s.trim()))}
                        mb="lg" radius="xl" size="md" styles={inputStyles}
                      />
                      <Textarea
                        label="Про вас та ваші послуги"
                        placeholder="Розкажіть про свій досвід, методи роботи та з чим допомагаєте..."
                        minRows={5}
                        value={servicesDescription}
                        onChange={(e) => setServicesDescription(e.currentTarget.value)}
                        radius="xl" size="md"
                        styles={{ ...inputStyles, input: { ...inputStyles.input, borderRadius: '24px', paddingTop: '16px', paddingBottom: '16px', height: 'auto' } }}
                      />
                    </Paper>
                  )}

                  <Group justify="space-between" mt="xl" align="flex-end" wrap="wrap">
                    <Box mb={{ base: 20, sm: 0 }}>
                      <Text size="sm" fw={700} mb={8} style={{ color: 'var(--lm-dark)' }}>Стать</Text>
                      <Group gap={8} p={6} style={{ backgroundColor: 'var(--lm-bg-input)', borderRadius: 'var(--lm-radius-full)', border: `1px solid var(--lm-border)` }}>
                        <ActionIcon size="xl" radius="xl" variant={gender === 'female' ? 'filled' : 'transparent'} color={gender === 'female' ? 'orange' : 'gray'} onClick={() => setGender('female')} style={{ backgroundColor: gender === 'female' ? 'var(--lm-orange)' : 'transparent', color: gender === 'female' ? '#fff' : 'var(--lm-muted)' }}><IconGenderFemale size={22} stroke={2} /></ActionIcon>
                        <ActionIcon size="xl" radius="xl" variant={gender === 'male' ? 'filled' : 'transparent'} color={gender === 'male' ? 'orange' : 'gray'} onClick={() => setGender('male')} style={{ backgroundColor: gender === 'male' ? 'var(--lm-orange)' : 'transparent', color: gender === 'male' ? '#fff' : 'var(--lm-muted)' }}><IconGenderMale size={22} stroke={2} /></ActionIcon>
                        <ActionIcon size="xl" radius="xl" variant={gender === 'hidden' ? 'filled' : 'transparent'} color={gender === 'hidden' ? 'gray' : 'gray'} onClick={() => setGender('hidden')} style={{ backgroundColor: gender === 'hidden' ? 'var(--lm-dark-soft)' : 'transparent', color: gender === 'hidden' ? '#fff' : 'var(--lm-muted)' }}><IconEyeOff size={22} stroke={2} /></ActionIcon>
                      </Group>
                    </Box>

                    <Button
                      size="lg" radius="xl" w={{ base: '100%', sm: 180 }} onClick={handleSave} loading={loading}
                      style={{
                        backgroundColor: 'var(--lm-orange)', color: '#fff', fontWeight: 800, fontSize: '16px', height: '56px',
                        boxShadow: 'var(--lm-shadow-orange)', transition: 'all 0.25s var(--lm-ease)'
                      }}
                      styles={{ root: { '&:hover': { transform: 'translateY(-2px)', backgroundColor: 'var(--lm-orange-hover)' } } }}
                    >
                      Зберегти
                    </Button>
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