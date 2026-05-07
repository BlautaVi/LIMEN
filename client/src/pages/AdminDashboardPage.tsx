import { useEffect, useState } from 'react';
import { Container, Title, Text, Paper, Button, Group, Stack, Badge, Box, Center, Loader, Tabs, Avatar, SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconShieldLock, IconUsers, IconAlertTriangle, IconChartBar, IconUserMinus, IconHeart } from '@tabler/icons-react';
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
  const [users, setUsers] = useState<any[]>([]);
  const [postsStats, setPostsStats] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, psychologists: 0 });

  useEffect(() => {
    if (currentUser.role !== 'admin') { navigate('/dashboard'); return; }
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [appsRes, reportsRes, usersRes, postsRes, statsRes] = await Promise.all([
        api.get('/admin/applications').catch(() => ({ data: [] })),
        api.get('/reports/admin').catch(() => ({ data: [] })),       
        api.get('/users/specialists').catch(() => ({ data: [] })),      
        api.get('/posts').catch(() => ({ data: [] })),
        api.get('/admin/stats').catch(() => ({ data: { users: 0, posts: 0, psychologists: 0 } }))
      ]);
      
      setApplications(appsRes.data);
      setReports(reportsRes.data);
      setUsers(usersRes.data);
      
      const sortedPosts = postsRes.data.sort((a: any, b: any) => (b.reactions?.length || 0) - (a.reactions?.length || 0)).slice(0, 10);
      setPostsStats(sortedPosts);

      setStats({ users: statsRes.data.users || 0, posts: statsRes.data.posts || 0, psychologists: statsRes.data.psychologists || 0 });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleApplication = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/admin/applications/${id}`, { status });
      setApplications(prev => prev.filter(app => app._id !== id));
      fetchAdminData(); 
    } catch (error) { alert('Помилка обробки заявки'); }
  };

  const handleReport = async (reportId: string, action: 'delete_post' | 'dismiss') => {
    try {
      await api.post(`/admin/reports/${reportId}/resolve`, { action });
    
      setReports(prev => prev.filter(r => r._id !== reportId));
    } catch (error) { 
      console.error('Помилка:', error);
      alert('Помилка обробки скарги. Перевірте консоль.'); 
    }
  };

  const handleRevokePsychologist = async (userId: string) => {
    if (!window.confirm('Точно забрати статус психолога у цього користувача?')) return;
    try {
      await api.put(`/users/${userId}/revoke-psychologist`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      fetchAdminData();
    } catch (error) { alert('Помилка зняття статусу'); }
  };

  if (loading) return <Center h="100vh" bg="var(--lm-bg)"><Loader color="red" size="xl" /></Center>;

  return (
    <Box className="page-content" style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />

      <Container size="lg" pt={{ base: 30, md: 50 }} pb={80} px={{ base: 'md', sm: 'xl' }}>
        <Group mb={40} gap="sm" wrap="nowrap">
          <ThemeIcon size={60} radius="xl" color="red" variant="light" style={{ flexShrink: 0 }}><IconShieldLock size={32} stroke={2} /></ThemeIcon>
          <Box>
            <Title order={1} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: 'clamp(24px, 5vw, 36px)' }}>Панель керування</Title>
            <Text c="dimmed" fw={500} size="md">Вітаємо, Адміністраторе.</Text>
          </Box>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb={40}>
          <Paper p="xl" radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
            <Group justify="space-between"><Text size="sm" fw={700} c="dimmed" tt="uppercase">Користувачів</Text><IconUsers size={20} color="var(--lm-orange)" /></Group>
            <Text fw={900} size="36px" style={{ color: 'var(--lm-dark)' }}>{stats.users}</Text>
          </Paper>
          <Paper p="xl" radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
            <Group justify="space-between"><Text size="sm" fw={700} c="dimmed" tt="uppercase">Психологів</Text><IconShieldLock size={20} color="violet" /></Group>
            <Text fw={900} size="36px" style={{ color: 'var(--lm-dark)' }}>{stats.psychologists}</Text>
          </Paper>
          <Paper p="xl" radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
            <Group justify="space-between"><Text size="sm" fw={700} c="dimmed" tt="uppercase">Усіх постів</Text><IconChartBar size={20} color="teal" /></Group>
            <Text fw={900} size="36px" style={{ color: 'var(--lm-dark)' }}>{stats.posts}</Text>
          </Paper>
        </SimpleGrid>

        <Tabs value={activeTab} onChange={setActiveTab} color="red" variant="pills" radius="xl" mb={40}>
          <Tabs.List style={{ backgroundColor: 'var(--lm-border)', padding: '6px', borderRadius: '30px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <Tabs.Tab value="applications" leftSection={<IconUsers size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Заявки ({applications.length})</Tabs.Tab>
            <Tabs.Tab value="reports" leftSection={<IconAlertTriangle size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Скарги ({reports.length})</Tabs.Tab>
            <Tabs.Tab value="users" leftSection={<IconUserMinus size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Психологи</Tabs.Tab>
            <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Топ постів</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="applications" pt="xl">
            {applications.length === 0 ? (
              <Paper p={40} radius="xl" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent', textAlign: 'center' }}>
                <Text c="dimmed" fw={600} size="lg">Нових заявок немає. Можна відпочити</Text>
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
                        <Button color="red" variant="light" radius="xl" onClick={() => handleApplication(app._id, 'rejected')}>Відхилити</Button>
                        <Button color="green" radius="xl" onClick={() => handleApplication(app._id, 'approved')}>Схвалити</Button>
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
                <Text c="dimmed" fw={600} size="lg">Скарг немає. У спільноті мир та спокій</Text>
              </Paper>
            ) : (
              <Stack gap="md">
                {reports.map(report => (
                  <Paper key={report._id} p="xl" radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid #ffe3e3', boxShadow: 'var(--lm-shadow-sm)' }}>
                    <Badge color="red" variant="filled" mb="sm">Скарга на {report.targetType === 'post' ? 'Пост' : 'Користувача'}</Badge>
                    <Text fw={800} size="lg" c="red">{report.reason}</Text>
                    <Text size="sm" c="dimmed" mb="lg">Деталі: "{report.details || 'Не вказано'}"</Text>
                    <Group mt="md">
                      <Button variant="light" color="blue" radius="xl" onClick={() => navigate(report.targetType === 'post' ? `/posts/${report.targetId}` : `/user/${report.targetId}`)}>Переглянути контент</Button>
                      <Button color="red" radius="xl" onClick={() => handleReport(report._id, 'delete_post')}>Видалити контент</Button>
                      <Button variant="subtle" color="gray" radius="xl" onClick={() => handleReport(report._id, 'dismiss')} style={{ color: 'var(--lm-dark)' }}>Відхилити скаргу</Button>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="users" pt="xl">
            {users.length === 0 ? (
              <Paper p={40} radius="xl" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent', textAlign: 'center' }}>
                <Text c="dimmed" fw={600} size="lg">Немає жодного психолога.</Text>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {users.map(u => (
                  <Paper key={u._id} p="md" radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
                    <Group justify="space-between">
                      <Group>
                        <Avatar src={u.avatarUrl ? `http://localhost:3000${u.avatarUrl}` : null} radius="xl" />
                        <Text fw={700} style={{ color: 'var(--lm-dark)' }}>{u.fullName || u.email}</Text>
                      </Group>
                      <Button color="red" variant="light" size="xs" radius="xl" onClick={() => handleRevokePsychologist(u._id)}>Забрати статус</Button>
                    </Group>
                  </Paper>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="stats" pt="xl">
            <Title order={3} mb="md" style={{ color: 'var(--lm-dark)' }}>Топ-10 постів за підтримкою</Title>
            {postsStats.length === 0 ? (
              <Paper p={40} radius="xl" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent', textAlign: 'center' }}>
                <Text c="dimmed" fw={600} size="lg">Поки немає постів з реакціями.</Text>
              </Paper>
            ) : (
              <Stack gap="md">
                {postsStats.map((p, index) => (
                  <Paper 
                    key={p._id} 
                    p="md" 
                    radius="xl" 
                    style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(`/posts/${p._id}`)}
                  >
                    <Text fw={900} size="xl" c="dimmed" mr="md">#{index + 1}</Text>
                    <Box style={{ flex: 1 }}><Text fw={700} style={{ color: 'var(--lm-dark)' }} lineClamp={1}>{p.title || p.content}</Text></Box>
                    <Badge size="xl" color="orange" leftSection={<IconHeart size={14} />} style={{ textTransform: 'none' }}>{p.reactions?.length || 0} реакцій</Badge>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

        </Tabs>
      </Container>
    </Box>
  );
}