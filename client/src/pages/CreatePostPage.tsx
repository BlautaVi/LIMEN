import { useState, useRef } from 'react';
import { Container, Paper, TextInput, Textarea, Button, Group, Stack, Box, Center, Grid, Text, Image, CloseButton, Select, Switch, Title, Badge } from '@mantine/core';
import { IconPhotoPlus, IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';

export function CreatePostPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isPsychologist = currentUser.role === 'psychologist';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [emotion, setEmotion] = useState<string | null>('Тривога');
  const [requestType, setRequestType] = useState<string | null>('vent');
  const [visibility, setVisibility] = useState<string | null>('public');
  const [isSupportOnly, setIsSupportOnly] = useState(false);

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
      padding: '20px 24px',
      transition: 'all 0.3s var(--lm-ease)',
      '&:focus': {
        borderColor: colors.buttonBright,
        backgroundColor: '#fff',
        boxShadow: `0 0 0 3px ${isPsychologist ? 'rgba(121,80,242,0.12)' : 'rgba(232,106,83,0.12)'}`
      }
    },
    label: {
      color: colors.textDark,
      fontWeight: 700,
      marginBottom: '10px',
      fontSize: '15px'
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
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

      await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Не вдалося створити пост');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: colors.bgApp }}>
      <Header />
      <Container size="lg" pt={{ base: 30, md: 60 }} pb={80}>

        <Center>
          <Paper
            shadow="none"
            radius={30}
            p={{ base: 24, md: 50 }}
            className="animate-slideUp"
            style={{
              width: '100%',
              maxWidth: '1000px',
              backgroundColor: '#fff',
              border: `1px solid ${colors.borderLight}`,
              boxShadow: colors.shadow
            }}
          >
            <Group justify="space-between" align="center" mb={40}>
              <Title order={2} style={{ color: colors.textDark, fontWeight: 800, fontSize: '28px' }}>
                {isPsychologist ? 'Опублікувати статтю 🧠' : 'Поділіться тим, що на душі 💙'}
              </Title>
              {isPsychologist && <Badge color="violet" size="xl" radius="md" variant="light">Режим спеціаліста</Badge>}
            </Group>

            <Grid gutter={{ base: 30, md: 60 }}>

              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="xl" h="100%">
                  <TextInput
                    placeholder={isPsychologist ? 'Заголовок вашої статті...' : 'Короткий заголовок (за бажанням)...'}
                    radius="xl"
                    size="xl"
                    styles={inputStyles}
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                  />

                  <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Textarea
                      placeholder={isPsychologist ? 'Поділіться професійним досвідом, технікою самодопомоги або корисною інформацією...' : 'Розкажіть про свою ситуацію якомога детальніше...'}
                      radius="xl"
                      size="xl"
                      styles={{
                        ...inputStyles,
                        root: { flex: 1, display: 'flex', flexDirection: 'column' },
                        wrapper: { flex: 1 },
                        input: { ...inputStyles.input, height: '100% !important', resize: 'none', paddingTop: '24px', paddingBottom: '24px', borderRadius: '24px' }
                      }}
                      minRows={14}
                      value={content}
                      onChange={(e) => setContent(e.currentTarget.value)}
                    />

                    {preview && (
                      <Box mt="xl" style={{ position: 'relative', width: 'fit-content' }}>
                        <Image src={preview} w={180} h={180} radius="xl" fit="cover" style={{ border: `3px solid ${colors.borderLight}`, boxShadow: 'var(--lm-shadow-md)' }} />
                        <CloseButton
                          onClick={clearFile}
                          variant="filled"
                          color="red"
                          size="md"
                          radius="xl"
                          style={{ position: 'absolute', top: -10, right: -10, boxShadow: '0 4px 10px rgba(255,0,0,0.2)' }}
                        />
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack justify="flex-start" gap="xl" h="100%">

                  <Select
                    label={isPsychologist ? "Основна тематика (Емоція)" : "Що ви відчуваєте?"}
                    data={['Тривога', 'Сум', 'Злість', 'Апатія', 'Страх', 'Самотність', 'Вигорання', 'Стрес']}
                    value={emotion}
                    onChange={setEmotion}
                    allowDeselect={false}
                    radius="xl"
                    size="lg"
                    styles={inputStyles}
                  />

                  {!isPsychologist && (
                    <>
                      <Select
                        label="Якої реакції ви очікуєте?"
                        data={[
                          { value: 'vent', label: 'Просто виговоритись' },
                          { value: 'support', label: 'Потрібна підтримка' },
                          { value: 'advice', label: 'Потрібна порада фахівця' }
                        ]}
                        value={requestType}
                        onChange={setRequestType}
                        allowDeselect={false}
                        radius="xl"
                        size="lg"
                        styles={inputStyles}
                      />

                      <Select
                        label="Хто побачить цей пост?"
                        data={[
                          { value: 'public', label: 'Усі користувачі (Публічно)' },
                          { value: 'anonymous', label: 'Усі (Анонімно)' },
                          { value: 'psychologists_only', label: 'Тільки психологи' }
                        ]}
                        value={visibility}
                        onChange={setVisibility}
                        allowDeselect={false}
                        radius="xl"
                        size="lg"
                        styles={inputStyles}
                      />

                      <Paper
                        p="xl"
                        radius="xl"
                        mt="xs"
                        style={{
                          backgroundColor: colors.bgLight,
                          border: `1px solid transparent`,
                          transition: 'all 0.2s var(--lm-ease)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setIsSupportOnly(!isSupportOnly)}
                      >
                        <Switch
                          labelPosition="left"
                          label={
                            <Group gap="sm">
                              <IconLock size={20} color={colors.textDark} />
                              <Text size="md" c={colors.textDark} fw={600}>Заборонити поради (тільки реакції)</Text>
                            </Group>
                          }
                          color="orange"
                          size="lg"
                          checked={isSupportOnly}
                          onChange={(event) => setIsSupportOnly(event.currentTarget.checked)}
                          style={{ pointerEvents: 'none' }}
                        />
                      </Paper>
                    </>
                  )}

                  {isPsychologist && (
                    <Paper p="xl" radius="xl" mt="xs" style={{ backgroundColor: colors.bgLight, border: `1px solid transparent` }}>
                      <Text size="md" c={colors.textDark} fw={500} style={{ lineHeight: 1.6 }}>
                        💡 Ваша стаття буде опублікована публічно у загальній стрічці. Вона отримає спеціальну позначку <b>"Поради психологів"</b>, щоб користувачам було легше її знайти.
                      </Text>
                    </Paper>
                  )}

                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />

                  <Button
                    variant="light"
                    color={isPsychologist ? "violet" : "gray"}
                    radius="xl"
                    size="lg"
                    mt="sm"
                    onClick={() => fileInputRef.current?.click()}
                    leftSection={<IconPhotoPlus size={22} />}
                    style={{
                      backgroundColor: 'transparent',
                      border: `2px dashed ${colors.borderLight}`,
                      color: colors.textDark,
                      height: '60px',
                      transition: 'all 0.25s var(--lm-ease)',
                    }}
                  >
                    {file ? 'Змінити обкладинку' : 'Прикріпити обкладинку'}
                  </Button>

                  <Box style={{ marginTop: 'auto', paddingTop: '30px' }}>
                    <Button
                      fullWidth
                      radius="xl"
                      size="xl"
                      loading={loading}
                      onClick={handleSubmit}
                      style={{
                        backgroundColor: colors.buttonBright,
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '18px',
                        height: '65px',
                        boxShadow: isPsychologist ? '0 10px 25px rgba(121, 80, 242, 0.3)' : 'var(--lm-shadow-orange)',
                        transition: 'transform 0.25s var(--lm-ease)'
                      }}
                      styles={{ root: { '&:hover': { transform: 'translateY(-2px)' } } }}
                    >
                      {isPsychologist ? 'Опублікувати статтю' : 'Опублікувати пост'}
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