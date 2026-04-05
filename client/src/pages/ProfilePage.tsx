import { useState, useEffect, useRef } from 'react';
import { Container, Paper, TextInput, Button, Group, ActionIcon, Box, Stack, Tooltip, Text, Badge, Image, Indicator } from '@mantine/core';
import { IconArrowLeft, IconTrash, IconLogout, IconGenderFemale, IconGenderMale, IconEyeOff, IconUserCircle, IconPencil, IconListDetails } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    
    if (storedUser.fullName) {
      const parts = storedUser.fullName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if (storedUser.gender) setGender(storedUser.gender);
    if (storedUser.avatarUrl) setAvatarPreview(`http://localhost:3000${storedUser.avatarUrl}`);
  }, []);

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

  const colors = {
    bgLight: '#E1F5FE', borderLight: '#B3E5FC', textDark: '#0F7EAA', buttonBright: '#4FCDFF',
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5FDFF', paddingTop: '50px' }}>
      <Container size="md">
        <Paper shadow="xl" radius={20} style={{ overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 0 30px rgba(79, 205, 255, 0.3)' }}>
          
          <Box bg={colors.bgLight} p="md" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
            <Group justify="space-between">
              <ActionIcon variant="transparent" onClick={() => navigate(-1)}>
                <IconArrowLeft size={28} color={colors.textDark} stroke={3} />
              </ActionIcon>
              
              <Group gap="sm">
                <Tooltip label="Мої пости" position="bottom">
                  <ActionIcon variant="transparent" onClick={() => navigate('/my-posts')}>
                    <IconListDetails size={26} color={colors.textDark} stroke={2.5} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Вийти" position="bottom">
                  <ActionIcon variant="transparent" onClick={handleLogout}>
                    <IconLogout size={26} color={colors.textDark} stroke={2.5} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Box>

          <Box p={40}>
            <Group align="flex-start" gap={50} wrap="nowrap">
              
              <Stack align="center" style={{ flex: 1 }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarSelect} />
                
                <Indicator 
                  inline size={35} offset={15} position="bottom-end" color="cyan" withBorder
                  label={<IconPencil size={18} />} 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  {avatarPreview ? (
                    <Image src={avatarPreview} w={150} h={150} radius="100%" fit="cover" style={{ border: `4px solid ${colors.bgLight}` }} />
                  ) : (
                    <IconUserCircle size={150} color={colors.textDark} stroke={1.5} />
                  )}
                </Indicator>
                
                <Text fw={600} size="lg" style={{ color: colors.textDark }}>{user?.email}</Text>
                {user?.personalityType && <Badge size="lg" color="cyan" variant="light" mt="xs">Тип: {user.personalityType}</Badge>}
              </Stack>

              <Stack gap="lg" style={{ flex: 1.5 }}>
                <TextInput placeholder="Name" value={firstName} onChange={(e) => setFirstName(e.currentTarget.value)} radius="md" size="md" styles={{ input: { backgroundColor: colors.bgLight, borderColor: colors.borderLight, color: colors.textDark, fontWeight: 500 } }} />
                <TextInput placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.currentTarget.value)} radius="md" size="md" styles={{ input: { backgroundColor: colors.bgLight, borderColor: colors.borderLight, color: colors.textDark, fontWeight: 500 } }} />

                <Group justify="space-between" mt="md">
                  <Group gap={5} bg={colors.bgLight} p={5} style={{ borderRadius: '8px', border: `1px solid ${colors.borderLight}` }}>
                    <ActionIcon variant={gender === 'female' ? 'filled' : 'transparent'} color={gender === 'female' ? 'cyan' : 'gray'} onClick={() => setGender('female')}><IconGenderFemale size={20} color={gender === 'female' ? '#fff' : colors.textDark} /></ActionIcon>
                    <ActionIcon variant={gender === 'male' ? 'filled' : 'transparent'} color={gender === 'male' ? 'cyan' : 'gray'} onClick={() => setGender('male')}><IconGenderMale size={20} color={gender === 'male' ? '#fff' : colors.textDark} /></ActionIcon>
                    <ActionIcon variant={gender === 'hidden' ? 'filled' : 'transparent'} color={gender === 'hidden' ? 'cyan' : 'gray'} onClick={() => setGender('hidden')}><IconEyeOff size={20} color={gender === 'hidden' ? '#fff' : colors.textDark} /></ActionIcon>
                  </Group>

                  <Button size="md" radius="md" w={150} onClick={handleSave} loading={loading} style={{ backgroundColor: colors.buttonBright, color: '#fff', fontWeight: 600 }}>Save</Button>
                </Group>
              </Stack>

            </Group>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}