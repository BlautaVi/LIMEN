import { useState, useEffect, useRef } from 'react';
import { Container, Paper, TextInput, Title, Textarea, Button, Group, ActionIcon, Box, Stack, Tooltip, Text, Badge, Image, Indicator } from '@mantine/core';
import { IconArrowLeft, IconLogout, IconGenderFemale, IconGenderMale, IconEyeOff, IconUserCircle, IconPencil, IconListDetails, IconBook } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
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

  const handleBecomePsychologist = async () => {
    if (!window.confirm('Ви дійсно хочете отримати статус психолога? Ваш профіль буде видно іншим користувачам у списку спеціалістів.')) return;
    
    try {
      const response = await api.put('/users/become-psychologist');
      localStorage.setItem('user', JSON.stringify(response.data));
      alert('Вітаємо! Тепер ви психолог 👨‍⚕️');
      window.location.reload(); 
    } catch (error) {
      alert('Помилка. Не вдалося змінити статус.');
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
      backgroundColor: '#F8F9FA', borderColor: 'transparent', color: '#2B454E', 
      fontWeight: 500, fontSize: '16px', padding: '0 24px', height: '56px',
      transition: 'all 0.3s ease',
      '&:focus': { borderColor: '#E86A53', backgroundColor: '#fff', boxShadow: '0 0 0 4px rgba(232, 106, 83, 0.1)' }
    },
    label: { color: '#2B454E', fontWeight: 700, marginBottom: '8px', fontSize: '15px' }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#FCFBF8', paddingTop: '60px', paddingBottom: '80px' }}>
      <Container size="md">
        <Paper 
          shadow="none" 
          radius="30px" 
          style={{ overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #F0EBE1', boxShadow: '0 15px 50px rgba(43, 69, 78, 0.05)' }}
        >
          
          <Box p="24px 40px" style={{ borderBottom: `1px solid #F0EBE1`, backgroundColor: '#fff' }}>
            <Group justify="space-between">
              <ActionIcon variant="transparent" onClick={() => navigate(-1)} style={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateX(-4px)' } }}>
                <IconArrowLeft size={28} color="#2B454E" stroke={2.5} />
              </ActionIcon>
              
              <Group gap="md">
                <Tooltip label="Мій щоденник емоцій" position="bottom" color="orange" withArrow>
                  <ActionIcon variant="subtle" radius="xl" size="lg" onClick={() => navigate('/diary')} style={{ color: '#E86A53', transition: 'all 0.2s', '&:hover': { backgroundColor: '#FFF0F0' } }}>
                    <IconBook size={26} stroke={2} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Мої пости" position="bottom" color="orange" withArrow>
                  <ActionIcon variant="subtle" radius="xl" size="lg" onClick={() => navigate('/my-posts')} style={{ color: '#85969C', transition: 'all 0.2s', '&:hover': { color: '#E86A53', backgroundColor: '#FFF0F0' } }}>
                    <IconListDetails size={26} stroke={2} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Вийти" position="bottom" color="red" withArrow>
                  <ActionIcon variant="subtle" radius="xl" size="lg" onClick={handleLogout} style={{ color: '#85969C', transition: 'all 0.2s', '&:hover': { color: '#ff6b6b', backgroundColor: '#FFF0F0' } }}>
                    <IconLogout size={26} stroke={2} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Box>

          <Box p={{ base: 30, md: 50 }}>
            <Group align="flex-start" gap={60} wrap="nowrap">
              
              <Stack align="center" style={{ flex: 1 }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarSelect} />
                
                <Indicator 
                  inline size={40} offset={15} position="bottom-end" color="orange" withBorder
                  label={<IconPencil size={20} stroke={2} />} 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  {avatarPreview ? (
                    <Image src={avatarPreview} w={160} h={160} radius="100%" fit="cover" style={{ border: `4px solid #FCFBF8`, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }} />
                  ) : (
                    <IconUserCircle size={160} color="#EAEAEA" stroke={1} style={{ backgroundColor: '#FAF9F6', borderRadius: '50%' }} />
                  )}
                </Indicator>
                
                {user?.role !== 'psychologist' ? (
                  <Button variant="light" color="orange" radius="xl" mt="lg" onClick={handleBecomePsychologist} style={{ fontWeight: 600 }}>
                    Отримати статус психолога
                  </Button>
                ) : (
                  <Badge color="violet" size="lg" radius="md" mt="lg" variant="light" style={{ padding: '0 16px', height: '32px', fontWeight: 600, textTransform: 'none' }}>
                    Ви - підтверджений психолог
                  </Badge>
                )}

                <Text fw={800} size="xl" mt="xs" style={{ color: '#2B454E' }}>{user?.email}</Text>
                
                {user?.role !== 'psychologist' && (
                  <Stack gap={12} mt="xl" align="center">
                    {user?.personalityType ? (
                      <>
                        <Badge size="xl" color="orange" variant="outline" style={{ textTransform: 'none', padding: '0 20px', height: '36px', border: '1px solid #E86A53', color: '#E86A53' }}>
                          Тип: {user.personalityType}
                        </Badge>
                        <Text size="sm" ta="center" px="md" style={{ maxWidth: '350px', lineHeight: 1.6, color: '#4A5B61' }}>
                          💡 {getTipForPersonality(user.personalityType)}
                        </Text>
                        <Button variant="subtle" size="xs" color="gray" radius="xl" onClick={() => navigate('/onboarding')} mt="xs" style={{ color: '#85969C' }}>
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

              <Stack gap="xl" style={{ flex: 1.5 }}>
                
                <TextInput placeholder="Ваше ім'я" value={firstName} onChange={(e) => setFirstName(e.currentTarget.value)} radius="xl" size="lg" styles={inputStyles} />
                <TextInput placeholder="Ваше прізвище" value={lastName} onChange={(e) => setLastName(e.currentTarget.value)} radius="xl" size="lg" styles={inputStyles} />
                
                {user?.role === 'psychologist' && (
                  <Paper p="xl" radius="xl" mt="md" style={{ border: '1px solid #F0EBE1', backgroundColor: '#FAF9F6' }}>
                    <Title order={4} mb="xl" style={{ color: '#2B454E', fontWeight: 800 }}>Професійне резюме (бачать клієнти)</Title>
                    
                    <TextInput label="Ваш вік" placeholder="Наприклад: 32" value={age} onChange={(e) => setAge(e.currentTarget.value)} radius="xl" size="lg" styles={inputStyles} mb="lg" />
                    <TextInput 
                      label="Спеціалізації (через кому)" 
                      placeholder="КПТ, Гештальт-терапія, Сімейна психологія..." 
                      value={specializations.join(', ')} 
                      onChange={(e) => setSpecializations(e.currentTarget.value.split(',').map(s => s.trim()))} 
                      mb="lg" radius="xl" size="lg" styles={inputStyles}
                    />
                    <Textarea 
                      label="Про вас та ваші послуги" 
                      placeholder="Розкажіть про свій досвід, методи роботи та з чим допомагаєте..." 
                      minRows={5} 
                      value={servicesDescription} 
                      onChange={(e) => setServicesDescription(e.currentTarget.value)} 
                      radius="xl" size="lg"
                      styles={{ ...inputStyles, input: { ...inputStyles.input, borderRadius: '24px', paddingTop: '20px', paddingBottom: '20px', height: 'auto' } }}
                    />
                  </Paper>
                )}
                
                <Group justify="space-between" mt="xl" align="center">
                  <Box>
                    <Text size="sm" fw={700} mb={8} style={{ color: '#2B454E' }}>Стать</Text>
                    <Group gap={8} p={6} style={{ backgroundColor: '#F8F9FA', borderRadius: '50px', border: `1px solid #F0EBE1` }}>
                      <ActionIcon size="xl" radius="xl" variant={gender === 'female' ? 'filled' : 'transparent'} color={gender === 'female' ? 'orange' : 'gray'} onClick={() => setGender('female')} style={{ backgroundColor: gender === 'female' ? '#E86A53' : 'transparent', color: gender === 'female' ? '#fff' : '#85969C' }}><IconGenderFemale size={22} stroke={2} /></ActionIcon>
                      <ActionIcon size="xl" radius="xl" variant={gender === 'male' ? 'filled' : 'transparent'} color={gender === 'male' ? 'orange' : 'gray'} onClick={() => setGender('male')} style={{ backgroundColor: gender === 'male' ? '#E86A53' : 'transparent', color: gender === 'male' ? '#fff' : '#85969C' }}><IconGenderMale size={22} stroke={2} /></ActionIcon>
                      <ActionIcon size="xl" radius="xl" variant={gender === 'hidden' ? 'filled' : 'transparent'} color={gender === 'hidden' ? 'gray' : 'gray'} onClick={() => setGender('hidden')} style={{ backgroundColor: gender === 'hidden' ? '#4A5B61' : 'transparent', color: gender === 'hidden' ? '#fff' : '#85969C' }}><IconEyeOff size={22} stroke={2} /></ActionIcon>
                    </Group>
                  </Box>

                  <Button 
                    size="lg" radius="xl" w={180} onClick={handleSave} loading={loading} 
                    style={{ 
                      backgroundColor: '#E86A53', color: '#fff', fontWeight: 800, fontSize: '16px', height: '56px',
                      boxShadow: '0 8px 25px rgba(232, 106, 83, 0.25)', transition: 'all 0.2s ease' 
                    }}
                    styles={{ root: { '&:hover': { transform: 'translateY(-2px)', backgroundColor: '#D65A44' } } }}
                  >
                    Зберегти
                  </Button>
                </Group>
              </Stack>

            </Group>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}