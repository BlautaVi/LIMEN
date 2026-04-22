import { useState, useRef, useEffect } from 'react';
import { Container, Paper, TextInput, Textarea, Button, Group, Stack, Box, Center, Grid, Text, Image, CloseButton, Select, Switch, Title, Loader, Badge } from '@mantine/core';
import { IconPhotoPlus, IconLock, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';

export function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isPsychologist = currentUser.role === 'psychologist';

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
        navigate('/dashboard');
      } finally {
        setPageLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const colors = isPsychologist ? {
    bgApp: 'var(--lm-violet-light)',
    bgLight: '#F5F0FF',
    borderLight: 'var(--lm-violet-border)',
    textDark: '#5F3DC4',
    buttonBright: 'var(--lm-violet)',
    shadow: '0 15px 40px rgba(95, 61, 196, 0.08)'
  } : {
    bgApp: 'var(--lm-bg)',
    bgLight: 'var(--lm-input-bg)',
    borderLight: 'var(--lm-border)',
    textDark: 'var(--lm-dark)',
    buttonBright: 'var(--lm-orange)',
    shadow: 'var(--lm-shadow-md)'
  };

  const inputStyles = {
    input: {
      backgroundColor: colors.bgLight,
      borderColor: 'transparent',
      color: colors.textDark,
      fontWeight: 500,
      fontSize: '16px',
      padding: '16px 24px', 
      height: '54px', 
      transition: 'all 0.3s var(--lm-ease)',
      '&:focus': {
        borderColor: colors.buttonBright,
        backgroundColor: '#fff',
        boxShadow: `0 0 0 3px ${isPsychologist ? 'rgba(121,80,242,0.12)' : 'rgba(232,106,83,0.12)'}`
      }
    },
    label: { color: colors.textDark, fontWeight: 700, marginBottom: '8px', fontSize: '14px' }
  };

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
      formData.append('requestType', isPsychologist ? 'advice' : (requestType || 'vent'));
      formData.append('visibility', isPsychologist ? 'public' : (visibility || 'public'));
      formData.append('isSupportOnly', isPsychologist ? 'false' : String(isSupportOnly));

      if (file) formData.append('image', file);

      await api.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      navigate(`/posts/${id}`);
    } catch (error) {
      console.error(error);
      alert('Не вдалося оновити пост');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Center h="100vh" bg={colors.bgApp}><Loader color={isPsychologist ? "violet" : "orange"} /></Center>;

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: colors.bgApp }}>
      <Header />
      <Container size="lg" pt={{ base: 20, md: 40 }} pb={{ base: 40, md: 80 }} px={{ base: 'sm', sm: 'md' }}>
        <Group mb="xl">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate(-1)}
            style={{ paddingLeft: 0, color: 'var(--lm-muted)', transition: 'all 0.2s var(--lm-ease)', '&:hover': { transform: 'translateX(-4px)', color: colors.textDark } }}
          >
            Назад
          </Button>
        </Group>

        <Center>
          <Paper
            shadow="none"
            radius={{ base: 'xl', md: 30 }}
            p={{ base: 20, sm: 30, md: 50 }} 
            className="animate-slideUp"
            style={{
              width: '100%',
              maxWidth: '1000px',
              backgroundColor: '#fff',
              border: `1px solid ${colors.borderLight}`,
              boxShadow: colors.shadow
            }}
          >
            <Group justify="space-between" align="center" mb={{ base: 24, md: 40 }} wrap="nowrap">
              <Title order={2} style={{ color: colors.textDark, fontWeight: 800, fontSize: 'clamp(20px, 4vw, 28px)', lineHeight: 1.2 }}>
                Редагування {isPsychologist ? 'статті' : 'поста'}
              </Title>
              {isPsychologist && <Badge color="violet" size="lg" radius="md" variant="light" display={{ base: 'none', sm: 'flex' }}>Режим спеціаліста</Badge>}
            </Group>

            <Grid gutter={{ base: 30, md: 60 }}>
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="lg" h="100%">
                  <TextInput
                    placeholder={isPsychologist ? 'Заголовок вашої статті...' : 'Короткий заголовок (за бажанням)...'}
                    radius="xl" size="md" styles={inputStyles} value={title} onChange={(e) => setTitle(e.currentTarget.value)}
                  />
                  <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Textarea
                      placeholder="Розкажіть про свою ситуацію..."
                      radius="xl" size="md"
                      styles={{ 
                        ...inputStyles, 
                        root: { flex: 1, display: 'flex', flexDirection: 'column' }, 
                        wrapper: { flex: 1 }, 
                        input: { ...inputStyles.input, height: '100% !important', minHeight: '200px', resize: 'none', paddingTop: '20px', paddingBottom: '20px', borderRadius: '24px' } 
                      }}
                      value={content} onChange={(e) => setContent(e.currentTarget.value)}
                    />
                    {preview && (
                      <Box mt="lg" style={{ position: 'relative', width: 'fit-content' }}>
                        <Image src={preview} w={{ base: 120, sm: 180 }} h={{ base: 120, sm: 180 }} radius="xl" fit="cover" style={{ border: `3px solid ${colors.borderLight}`, boxShadow: 'var(--lm-shadow-md)' }} />
                        <CloseButton onClick={() => { setFile(null); setPreview(null); }} variant="filled" color="red" size="sm" radius="xl" style={{ position: 'absolute', top: -8, right: -8, boxShadow: '0 4px 10px rgba(255,0,0,0.2)' }} />
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack justify="flex-start" gap="lg" h="100%">
                  <Select label={isPsychologist ? "Основна тематика (Емоція)" : "Що ви відчуваєте?"} data={['Тривога', 'Сум', 'Злість', 'Апатія', 'Страх', 'Самотність', 'Вигорання', 'Стрес']} value={emotion} onChange={setEmotion} allowDeselect={false} radius="xl" size="md" styles={inputStyles} />

                  {!isPsychologist && (
                    <>
                      <Select label="Якої реакції ви очікуєте?" data={[{ value: 'vent', label: 'Просто виговоритись' }, { value: 'support', label: 'Потрібна підтримка' }, { value: 'advice', label: 'Потрібна порада фахівця' }]} value={requestType} onChange={setRequestType} allowDeselect={false} radius="xl" size="md" styles={inputStyles} />
                      <Select label="Хто побачить цей пост?" data={[{ value: 'public', label: 'Усі користувачі (Публічно)' }, { value: 'anonymous', label: 'Усі (Анонімно)' }, { value: 'psychologists_only', label: 'Тільки психологи' }]} value={visibility} onChange={setVisibility} allowDeselect={false} radius="xl" size="md" styles={inputStyles} />

                      <Paper 
                        p={{ base: 'md', sm: 'xl' }} 
                        radius="xl" 
                        mt="xs" 
                        style={{ backgroundColor: colors.bgLight, border: `1px solid transparent`, transition: 'all 0.2s var(--lm-ease)', cursor: 'pointer' }} 
                        onClick={() => setIsSupportOnly(!isSupportOnly)}
                      >
                        <Switch 
                          labelPosition="left" 
                          label={
                            <Group gap="sm" wrap="nowrap">
                              <IconLock size={20} color={colors.textDark} style={{ flexShrink: 0 }} />
                              <Text size="sm" c={colors.textDark} fw={600} style={{ lineHeight: 1.2 }}>Заборонити поради (тільки реакції)</Text>
                            </Group>
                          } 
                          color="orange" size="md" checked={isSupportOnly} onChange={(event) => setIsSupportOnly(event.currentTarget.checked)} style={{ pointerEvents: 'none' }} 
                        />
                      </Paper>
                    </>
                  )}

                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />

                  <Button
                    variant="light" color={isPsychologist ? "violet" : "gray"} radius="xl" size="md" mt={{ base: 0, md: 'auto' }}
                    onClick={() => fileInputRef.current?.click()} leftSection={<IconPhotoPlus size={20} />}
                    style={{ backgroundColor: 'transparent', border: `2px dashed ${colors.borderLight}`, color: colors.textDark, height: '54px', transition: 'all 0.25s var(--lm-ease)' }}
                  >
                    {preview ? 'Змінити обкладинку' : 'Прикріпити обкладинку'}
                  </Button>

                  <Box style={{ paddingTop: '16px' }}>
                    <Button
                      fullWidth radius="xl" size="lg" loading={loading} onClick={handleSave}
                      style={{ backgroundColor: colors.buttonBright, color: '#fff', fontWeight: 800, fontSize: '16px', height: '58px', boxShadow: isPsychologist ? '0 10px 25px rgba(121, 80, 242, 0.3)' : 'var(--lm-shadow-orange)', transition: 'transform 0.25s var(--lm-ease)' }}
                      styles={{ root: { '&:hover': { transform: 'translateY(-2px)' } } }}
                    >
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