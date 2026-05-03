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
  const colors = {
    bgApp: 'var(--lm-bg)',
    bgLight: 'var(--lm-bg-input)',
    borderLight: 'var(--lm-border)',
    textDark: 'var(--lm-dark)',
    buttonBright: isPsychologist ? 'var(--lm-violet, #7950f2)' : 'var(--lm-orange)',
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
        backgroundColor: 'var(--lm-card-bg)',
        boxShadow: `0 0 0 3px ${isPsychologist ? 'rgba(121,80,242,0.12)' : 'rgba(232,106,83,0.12)'}`
      }
    },
    label: {
      color: colors.textDark,
      fontWeight: 700,
      marginBottom: '8px', 
      fontSize: '14px'
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
      <Container size="lg" pt={{ base: 20, md: 60 }} pb={{ base: 40, md: 80 }} px={{ base: 'sm', sm: 'md' }}>

        <Center>
          <Paper
            shadow="none"
            radius={{ base: 'xl', md: 30 }} 
            p={{ base: 20, sm: 30, md: 50 }} 
            className="animate-slideUp"
            style={{
              width: '100%',
              maxWidth: '1000px',
              backgroundColor: 'var(--lm-card-bg)',
              border: `1px solid ${colors.borderLight}`,
              boxShadow: colors.shadow
            }}
          >
            <Group justify="space-between" align="center" mb={{ base: 24, md: 40 }} wrap="nowrap">
              <Title order={2} style={{ color: colors.textDark, fontWeight: 800, fontSize: 'clamp(20px, 4vw, 28px)', lineHeight: 1.2 }}>
                {isPsychologist ? 'Опублікувати статтю 🧠' : 'Поділіться тим, що на душі 💙'}
              </Title>
              {isPsychologist && <Badge color="violet" size="lg" radius="md" variant="light" display={{ base: 'none', sm: 'flex' }}>Режим спеціаліста</Badge>}
            </Group>

            <Grid gutter={{ base: 30, md: 60 }}>

              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap="lg" h="100%">
                  <TextInput
                    placeholder={isPsychologist ? 'Заголовок вашої статті...' : 'Короткий заголовок (за бажанням)...'}
                    radius="xl"
                    size="md" 
                    styles={inputStyles}
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                  />

                  <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Textarea
                      placeholder={isPsychologist ? 'Поділіться професійним досвідом, технікою самодопомоги або корисною інформацією...' : 'Розкажіть про свою ситуацію якомога детальніше...'}
                      radius="xl"
                      size="md"
                      styles={{
                        ...inputStyles,
                        root: { flex: 1, display: 'flex', flexDirection: 'column' },
                        wrapper: { flex: 1 },
                        input: { 
                          ...inputStyles.input, 
                          height: '100% !important', 
                          minHeight: '200px', 
                          resize: 'none', 
                          paddingTop: '20px', 
                          paddingBottom: '20px', 
                          borderRadius: '24px' 
                        }
                      }}
                      value={content}
                      onChange={(e) => setContent(e.currentTarget.value)}
                    />

                    {preview && (
                      <Box mt="lg" style={{ position: 'relative', width: 'fit-content' }}>
                        <Image src={preview} w={{ base: 120, sm: 180 }} h={{ base: 120, sm: 180 }} radius="xl" fit="cover" style={{ border: `3px solid ${colors.borderLight}`, boxShadow: 'var(--lm-shadow-md)' }} />
                        <CloseButton
                          onClick={clearFile}
                          variant="filled"
                          color="red"
                          size="sm"
                          radius="xl"
                          style={{ position: 'absolute', top: -8, right: -8, boxShadow: '0 4px 10px rgba(255,0,0,0.2)' }}
                        />
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack justify="flex-start" gap="lg" h="100%">

                  <Select
                    label={isPsychologist ? "Основна тематика (Емоція)" : "Що ви відчуваєте?"}
                    data={['Тривога', 'Сум', 'Злість', 'Апатія', 'Страх', 'Самотність', 'Вигорання', 'Стрес']}
                    value={emotion}
                    onChange={setEmotion}
                    allowDeselect={false}
                    radius="xl"
                    size="md"
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
                        size="md"
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
                        size="md"
                        styles={inputStyles}
                      />

                      <Paper
                        p={{ base: 'md', sm: 'xl' }}
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
                            <Group gap="sm" wrap="nowrap">
                              <IconLock size={20} color={colors.textDark} style={{ flexShrink: 0 }} />
                              <Text size="sm" c={colors.textDark} fw={600} style={{ lineHeight: 1.2 }}>Заборонити поради (тільки реакції)</Text>
                            </Group>
                          }
                          color="orange"
                          size="md"
                          checked={isSupportOnly}
                          onChange={(event) => setIsSupportOnly(event.currentTarget.checked)}
                          style={{ pointerEvents: 'none' }}
                        />
                      </Paper>
                    </>
                  )}

                  {isPsychologist && (
                    <Paper p={{ base: 'md', sm: 'xl' }} radius="xl" mt="xs" style={{ backgroundColor: colors.bgLight, border: `1px solid transparent` }}>
                      <Text size="sm" c={colors.textDark} fw={500} style={{ lineHeight: 1.6 }}>
                        💡 Ваша стаття буде опублікована публічно у загальній стрічці. Вона отримає спеціальну позначку <b>"Поради психологів"</b>, щоб користувачам було легше її знайти.
                      </Text>
                    </Paper>
                  )}

                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />

                  <Button
                    variant="light"
                    color={isPsychologist ? "violet" : "gray"}
                    radius="xl"
                    size="md"
                    mt={{ base: 0, md: 'auto' }} 
                    onClick={() => fileInputRef.current?.click()}
                    leftSection={<IconPhotoPlus size={20} />}
                    style={{
                      backgroundColor: 'transparent',
                      border: `2px dashed ${colors.borderLight}`,
                      color: colors.textDark,
                      height: '54px',
                      transition: 'all 0.25s var(--lm-ease)',
                    }}
                  >
                    {file ? 'Змінити обкладинку' : 'Прикріпити обкладинку'}
                  </Button>

                  <Box style={{ paddingTop: '16px' }}>
                    <Button
                      fullWidth
                      radius="xl"
                      size="lg" 
                      loading={loading}
                      onClick={handleSubmit}
                      style={{
                        backgroundColor: colors.buttonBright,
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '16px',
                        height: '58px',
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