import { useState, useRef, useEffect } from 'react';
import { Container, Paper, TextInput, Textarea, Button, Group, Stack, Box, Center, Grid, Text, Image, CloseButton, Select, Switch, Title, Loader } from '@mantine/core';
import { IconPhotoPlus, IconLock, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';

export function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState<string | null>('');
  const [requestType, setRequestType] = useState<string | null>('');
  const [visibility, setVisibility] = useState<string | null>('');
  const [isSupportOnly, setIsSupportOnly] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        const post = response.data;
        setTitle(post.title || '');
        setContent(post.content || '');
        setEmotion(post.emotion || 'Не визначено');
        setRequestType(post.requestType || 'vent');
        setVisibility(post.visibility || 'public');
        setIsSupportOnly(post.isSupportOnly || false);
        if (post.imageUrl) setPreview(`http://localhost:3000${post.imageUrl}`);
      } catch (error) {
        alert('Помилка завантаження поста');
        navigate('/my-posts');
      } finally {
        setPageLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const colors = { bgLight: '#F4FAFC', borderLight: '#C9EAF7', textDark: '#0F7EAA', buttonBright: '#4FCDFF', label: '#68A4C4' };
  const inputStyles = { input: { backgroundColor: colors.bgLight, borderColor: colors.borderLight, color: colors.textDark, fontWeight: 500, fontSize: '15px', padding: '20px 15px' }, label: { color: colors.textDark, fontWeight: 600, marginBottom: '8px', fontSize: '14px' } };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return alert('Введіть текст поста!');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('emotion', emotion || 'Не визначено');
      formData.append('requestType', requestType || 'vent');
      formData.append('visibility', visibility || 'public');
      formData.append('isSupportOnly', String(isSupportOnly));
      
      if (file) formData.append('image', file);

      await api.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      alert('Пост успішно оновлено!');
      navigate(`/posts/${id}`); 
    } catch (error) {
      console.error(error);
      alert('Не вдалося оновити пост');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Center h="100vh"><Loader color="cyan" /></Center>;

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5FDFF' }}>
      <Header />
      <Container size="lg" pt={40} pb={60}>
        <Group mb="lg"><Button variant="subtle" color="cyan" leftSection={<IconArrowLeft size={18} />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>Назад</Button></Group>
        <Center>
          <Paper shadow="xl" radius={30} p={40} style={{ width: '100%', maxWidth: '950px', backgroundColor: '#fff', border: '1px solid #E1F5FE' }}>
            <Title order={2} mb={30} style={{ color: colors.textDark }}>Редагування поста</Title>
            <Grid gutter={50}>
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="xl" h="100%">
                  <TextInput placeholder="Короткий заголовок (за бажанням)..." radius="md" size="md" styles={inputStyles} value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
                  <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Textarea placeholder="Розкажіть про свою ситуацію..." radius="md" size="md" styles={{ ...inputStyles, root: { flex: 1, display: 'flex', flexDirection: 'column' }, wrapper: { flex: 1 }, input: { ...inputStyles.input, height: '100% !important', resize: 'none', paddingTop: '15px' } }} minRows={12} value={content} onChange={(e) => setContent(e.currentTarget.value)} />
                    {preview && (
                      <Box mt="md" style={{ position: 'relative', width: 'fit-content' }}>
                        <Image src={preview} w={150} h={150} radius="md" fit="cover" style={{ border: `2px solid ${colors.borderLight}` }} />
                        <CloseButton onClick={() => { setFile(null); setPreview(null); }} variant="filled" color="red" size="sm" style={{ position: 'absolute', top: -10, right: -10, borderRadius: '50%' }} />
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack justify="flex-start" gap="lg" h="100%">
                  <Select label="Емоція" data={['Тривога', 'Сум', 'Злість', 'Апатія', 'Страх', 'Самотність']} value={emotion} onChange={setEmotion} allowDeselect={false} radius="md" size="md" styles={inputStyles} />
                  <Select label="Ваш запит" data={[{ value: 'vent', label: 'Просто виговоритись' }, { value: 'support', label: 'Потрібна підтримка' }, { value: 'advice', label: 'Потрібна порада' }]} value={requestType} onChange={setRequestType} allowDeselect={false} radius="md" size="md" styles={inputStyles} />
                  <Select label="Видимість" data={[{ value: 'public', label: 'Публічно' }, { value: 'anonymous', label: 'Анонімно' }, { value: 'psychologists_only', label: 'Тільки психологам' }]} value={visibility} onChange={setVisibility} allowDeselect={false} radius="md" size="md" styles={inputStyles} />
                  <Paper p="lg" radius="md" mt="sm" style={{ backgroundColor: colors.bgLight, border: `1px dashed ${colors.borderLight}` }}>
                    <Switch labelPosition="left" label={<Group gap="xs"><IconLock size={18} color={colors.textDark} /><Text size="sm" c={colors.textDark} fw={600}>Тільки підтримка (без порад)</Text></Group>} color="cyan" size="md" checked={isSupportOnly} onChange={(event) => setIsSupportOnly(event.currentTarget.checked)} />
                  </Paper>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />
                  <Button variant="outline" color="cyan" radius="md" size="md" mt="sm" onClick={() => fileInputRef.current?.click()} leftSection={<IconPhotoPlus size={22} />} style={{ borderStyle: 'dashed', borderWidth: '2px', backgroundColor: 'transparent' }}>
                    {preview ? 'Змінити фотографію' : 'Прикріпити фотографію'}
                  </Button>
                  <Box style={{ marginTop: 'auto', paddingTop: '20px' }}>
                    <Button fullWidth radius="md" size="lg" color="cyan" loading={loading} onClick={handleSave} style={{ backgroundColor: colors.buttonBright, color: '#fff', fontWeight: 700, boxShadow: '0 6px 15px rgba(79, 205, 255, 0.4)' }}>
                      Зберегти зміни
                    </Button>
                  </Box>
                </Stack>
              </Grid.Col>
            </Grid>
          </Paper>
        </Center>
      </Container>
    </Box>
  );
}