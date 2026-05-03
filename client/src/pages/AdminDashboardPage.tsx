import { useEffect, useState } from 'react';
import { Container, Title, Text, Paper,ThemeIcon, Button, Group, Stack, Badge, Box, Center, Loader, Tabs, TextInput, Textarea, Avatar, SimpleGrid, Modal, Divider } from '@mantine/core';
import { IconShieldLock, IconUsers, IconAlertTriangle, IconVideo, IconCheck, IconX, IconTrash, IconPlus, IconChartBar, IconExternalLink } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import api from '../services/api';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState<string | null>('applications');
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, psychologists: 0 });

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', youtubeId: '', description: '', category: 'relax' });

  useEffect(() => {
    if (currentUser.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [appsRes, reportsRes, videosRes, statsRes] = await Promise.all([
        api.get('/admin/applications').catch((err) => { console.warn('Заявки:', err.message); return { data: [] }; }),
        api.get('/reports/admin').catch((err) => { console.warn('Скарги:', err.message); return { data: [] }; }),       
        api.get('/videos').catch((err) => { console.warn('Відео:', err.message); return { data: [] }; }),              
        api.get('/admin/stats').catch((err) => { console.warn('Статистика:', err.message); return { data: { users: 0, posts: 0, psychologists: 0 } }; })
      ]);
      
      setApplications(appsRes.data);
      setReports(reportsRes.data);
      setVideos(videosRes.data);
      
      setStats({
        users: statsRes.data.users || 0,
        posts: statsRes.data.posts || 0,
        psychologists: statsRes.data.psychologists || 0,
      });
    } catch (error) {
      console.error('Критична помилка завантаження даних адміна:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplication = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/admin/applications/${id}`, { status });
      setApplications(prev => prev.filter(app => app._id !== id));
      alert(`Заявку ${status === 'approved' ? 'схвалено ✅' : 'відхилено ❌'}`);
    } catch (error) {
      alert('Помилка обробки заявки');
    }
  };

  const handleReport = async (reportId: string, action: 'delete_post' | 'dismiss') => {
    try {
      await api.post(`/admin/reports/${reportId}/resolve`, { action });
      setReports(prev => prev.filter(r => r._id !== reportId));
    } catch (error) {
      alert('Помилка обробки скарги');
    }
  };

  const handleAddVideo = async () => {
    try {
      const res = await api.post('/videos', newVideo);
      setVideos([res.data, ...videos]);
      setIsVideoModalOpen(false);
      setNewVideo({ title: '', youtubeId: '', description: '', category: 'relax' });
    } catch (error) {
      alert('Помилка додавання відео');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('Видалити це відео?')) return;
    try {
      await api.delete(`/videos/${id}`);
      setVideos(videos.filter(v => v._id !== id));
    } catch (error) {
      alert('Помилка видалення');
    }
  };

  if (loading) return <Center h="100vh" bg="var(--lm-bg)"><Loader color="red" size="xl" /></Center>;

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />

      <Modal opened={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} title={<Text fw={800} size="xl">Додати нове відео</Text>} radius="xl" centered overlayProps={{ blur: 3, opacity: 0.3 }}>
        <Stack gap="md">
          <TextInput label="Заголовок" value={newVideo.title} onChange={(e) => setNewVideo({...newVideo, title: e.currentTarget.value})} radius="md" styles={{ input: { backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)' } }} />
          <TextInput label="YouTube ID (напр. dQw4w9WgXcQ)" value={newVideo.youtubeId} onChange={(e) => setNewVideo({...newVideo, youtubeId: e.currentTarget.value})} radius="md" styles={{ input: { backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)' } }} />
          <Textarea label="Короткий опис" value={newVideo.description} onChange={(e) => setNewVideo({...newVideo, description: e.currentTarget.value})} radius="md" minRows={3} styles={{ input: { backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)' } }} />
          <Button color="red" radius="xl" size="md" onClick={handleAddVideo} fullWidth mt="md">Зберегти відео</Button>
        </Stack>
      </Modal>

      <Container size="lg" pt={{ base: 30, md: 50 }} pb={80} px={{ base: 'md', sm: 'xl' }}>
        <Group mb={40} gap="sm" wrap="nowrap">
          <ThemeIcon size={60} radius="xl" color="red" variant="light" style={{ flexShrink: 0 }}>
            <IconShieldLock size={32} stroke={2} />
          </ThemeIcon>
          <Box>
            <Title order={1} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: 'clamp(24px, 5vw, 36px)' }}>Панель керування</Title>
            <Text c="dimmed" fw={500} size="md">Вітаємо, Адміністраторе. Влада у ваших руках 👑</Text>
          </Box>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb={40}>
          <Paper p="xl" radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
            <Group justify="space-between">
              <Text size="sm" fw={700} c="dimmed" tt="uppercase">Користувачів</Text>
              <IconUsers size={20} color="var(--lm-orange)" />
            </Group>
            <Text fw={900} size="36px" style={{ color: 'var(--lm-dark)' }}>{stats.users}</Text>
          </Paper>
          <Paper p="xl" radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
            <Group justify="space-between">
              <Text size="sm" fw={700} c="dimmed" tt="uppercase">Психологів</Text>
              <IconShieldLock size={20} color="violet" />
            </Group>
            <Text fw={900} size="36px" style={{ color: 'var(--lm-dark)' }}>{stats.psychologists}</Text>
          </Paper>
          <Paper p="xl" radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
            <Group justify="space-between">
              <Text size="sm" fw={700} c="dimmed" tt="uppercase">Усіх постів</Text>
              <IconChartBar size={20} color="teal" />
            </Group>
            <Text fw={900} size="36px" style={{ color: 'var(--lm-dark)' }}>{stats.posts}</Text>
          </Paper>
        </SimpleGrid>

        <Tabs value={activeTab} onChange={setActiveTab} color="red" variant="pills" radius="xl" mb={40}>
          <Tabs.List style={{ backgroundColor: 'var(--lm-border)', padding: '6px', borderRadius: '30px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <Tabs.Tab value="applications" leftSection={<IconUsers size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Заявки ({applications.length})</Tabs.Tab>
            <Tabs.Tab value="reports" leftSection={<IconAlertTriangle size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Скарги ({reports.length})</Tabs.Tab>
            <Tabs.Tab value="videos" leftSection={<IconVideo size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Відеоконтент</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="applications" pt="xl">
            {applications.length === 0 ? (
              <Paper p={40} radius="xl" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent', textAlign: 'center' }}>
                <Text c="dimmed" fw={600} size="lg">Нових заявок немає. Можна відпочити ☕</Text>
              </Paper>
            ) : (
              <Stack gap="md">
                {applications.map(app => (
                  <Paper key={app._id} p={{ base: 'md', sm: 'xl' }} radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
                    <Group justify="space-between" align="flex-start" wrap="wrap">
                      <Group gap="md" wrap="nowrap">
                        <Avatar src={app.user?.avatarUrl ? `http://localhost:3000${app.user.avatarUrl}` : null} size="lg" radius="xl" />
                        <Box>
                          <Text fw={800} size="lg" style={{ color: 'var(--lm-dark)' }}>{app.user?.fullName || 'Анонім'}</Text>
                          <Text size="sm" c="dimmed">{app.user?.email}</Text>
                        </Box>
                      </Group>
                      <Group gap="xs">
                        <Button color="red" variant="light" radius="xl" leftSection={<IconX size={16}/>} onClick={() => handleApplication(app._id, 'rejected')}>Відхилити</Button>
                        <Button color="green" radius="xl" leftSection={<IconCheck size={16}/>} onClick={() => handleApplication(app._id, 'approved')}>Схвалити</Button>
                      </Group>
                    </Group>
                    <Divider my="md" color="var(--lm-border)" />
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                      <Box><Text size="xs" c="dimmed" tt="uppercase" fw={700}>Освіта</Text><Text fw={600} style={{ color: 'var(--lm-dark-soft)' }}>{app.eduDegree}</Text></Box>
                      <Box><Text size="xs" c="dimmed" tt="uppercase" fw={700}>Досвід</Text><Text fw={600} style={{ color: 'var(--lm-dark-soft)' }}>{app.experience}</Text></Box>
                      <Box><Text size="xs" c="dimmed" tt="uppercase" fw={700}>Документи</Text><Text component="a" href={app.diplomaLink} target="_blank" c="blue" fw={600} style={{ textDecoration: 'underline' }}>Переглянути диплом</Text></Box>
                    </SimpleGrid>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="reports" pt="xl">
            {reports.length === 0 ? (
              <Paper p={40} radius="xl" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent', textAlign: 'center' }}>
                <Text c="dimmed" fw={600} size="lg">Скарг немає. У спільноті мир та спокій 🕊️</Text>
              </Paper>
            ) : (
              <Stack gap="md">
                {reports.map(report => (
                  <Paper key={report._id} p={{ base: 'md', sm: 'xl' }} radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
                    <Group justify="space-between" mb="md" align="flex-start" wrap="wrap">
                      <Badge color="red" variant="filled" size="lg">Скарга на {report.targetType === 'post' ? 'Пост' : 'Користувача'}</Badge>
                      <Text size="xs" c="dimmed" fw={600}>{new Date(report.createdAt).toLocaleString('uk-UA')}</Text>
                    </Group>
                    
                    <Text fw={800} size="lg" mb="xs" c="red">Причина: {report.reason}</Text>
                    {report.details && <Text size="sm" c="red" mb="lg" style={{ fontStyle: 'italic', opacity: 0.8 }}>Коментар: "{report.details}"</Text>}
                    
                    <Divider my="md" color="var(--lm-border)" />

                    <Group gap="sm" wrap="wrap">
                      <Button 
                        variant="light" color="blue" radius="xl" 
                        leftSection={<IconExternalLink size={16}/>} 
                        onClick={() => navigate(report.targetType === 'post' ? `/posts/${report.targetId}` : `/user/${report.targetId}`)}
                      >
                        Переглянути {report.targetType === 'post' ? 'пост' : 'профіль'}
                      </Button>

                      <Button color="red" radius="xl" leftSection={<IconTrash size={16}/>} onClick={() => handleReport(report._id, 'delete_post')}>
                        Видалити контент
                      </Button>
                      <Button color="gray" variant="subtle" radius="xl" onClick={() => handleReport(report._id, 'dismiss')} style={{ color: 'var(--lm-dark)' }}>
                        Відхилити скаргу
                      </Button>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="videos" pt="xl">
            <Button mb="xl" color="red" radius="xl" leftSection={<IconPlus size={18} />} onClick={() => setIsVideoModalOpen(true)}>
              Додати відео
            </Button>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {videos.map(video => (
                <Paper key={video._id} p="md" radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
                  <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt="thumbnail" style={{ width: '100%', borderRadius: '16px', marginBottom: '12px' }} />
                  <Text fw={800} lineClamp={1} size="lg" style={{ color: 'var(--lm-dark)' }}>{video.title}</Text>
                  <Text size="sm" c="dimmed" mt={4} lineClamp={2} style={{ lineHeight: 1.5 }}>{video.description}</Text>
                  <Button fullWidth variant="light" color="red" mt="md" radius="xl" onClick={() => handleDeleteVideo(video._id)}>Видалити</Button>
                </Paper>
              ))}
            </SimpleGrid>
          </Tabs.Panel>

        </Tabs>
      </Container>
    </Box>
  );
}