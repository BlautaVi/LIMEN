import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Stack, Text, Image, Center, Avatar, ThemeIcon, Box, Group, Badge, Loader, Divider, TextInput, Button, Tabs, AspectRatio, ActionIcon, Menu, Modal, Select, Textarea } from '@mantine/core';
import { IconPlus, IconSearch, IconMessageChatbot, IconUsers, IconStethoscope, IconLayoutList, IconVideo, IconDotsVertical, IconPencil, IconCheck, IconArchive, IconTrash, IconAlertOctagon, IconFlag } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { title: 'Додати обговорення', icon: <IconPlus size={28} stroke={2.5} />, image: 'https://www.dropbox.com/scl/fi/pqkvsn48wmhdcvdoxebot/17054008_5809569-removebg-preview.png?rlkey=gxnilg9prsklch5lpdrfwvd64&st=r3743awg&dl=1', link: '/create-post' },
  { title: 'Знайти фахівця', icon: <IconSearch size={28} stroke={2.5} />, image: 'https://www.dropbox.com/scl/fi/e7wln90q6h1pt9j0yu03r/12469236_Wavy_Ppl-04_Single-11-Photoroom.png?rlkey=2p3kxhf1ah0kxhfv8c5c0t8n2&st=1hzgqk0a&dl=1', link: '/specialists' },
  { title: 'AI-асистент', icon: <IconMessageChatbot size={28} stroke={2.5} />, image: 'https://www.dropbox.com/scl/fi/f1c1v749l74yvw83efxg3/12290914_Wavy_Tech-12_Single-01-Photoroom.png?rlkey=rwddly24jpjh6y62oo7m9oyjg&st=ws3r1rlv&dl=1', link: '/ai-chat' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSuccessOpened, setReportSuccessOpened] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>('');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const reactionsList = [
    { emoji: '🤍', label: 'Тримайся' }, { emoji: '🤗', label: 'Обіймаю' },
    { emoji: '💬', label: 'Розумію вас' }, { emoji: '🫂', label: 'Я з тобою' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, videosRes] = await Promise.all([
          api.get('/posts'),
          api.get('/videos').catch(() => ({ data: [] })) 
        ]);
        setPosts(postsRes.data);
        setVideos(videosRes.data);
      } catch (error) { 
        console.error(error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const handleReaction = async (postId: string, emoji: string) => {
    try {
      const response = await api.put(`/posts/${postId}/react`, { emoji });
      setPosts(posts.map(p => p._id === postId ? response.data : p));
    } catch (error) { console.error(error); }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      const response = await api.put(`/posts/${postId}/comment`, { text });
      setPosts(posts.map(p => p._id === postId ? response.data : p));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) { alert('Помилка при додаванні коментаря'); }
  };

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      const response = await api.put(`/posts/${postId}/status`, { status: newStatus });
      setPosts(posts.map(p => p._id === postId ? response.data : p));
    } catch (error) {
      alert('Помилка при зміні статусу');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Точно видалити цей пост?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (error) {
      alert('Помилка видалення');
    }
  };

  const openReportModal = (postId: string) => {
    setReportingPostId(postId);
    setIsReportModalOpen(true);
  };

  const submitReport = async () => {
    if (!reportReason || !reportingPostId) {
      alert('Будь ласка, оберіть причину скарги');
      return;
    }
    
    setIsReporting(true);
    try {
      await api.post('/reports', { 
        targetId: reportingPostId, 
        targetType: 'post', 
        reason: reportReason,
        details: reportDetails
      });
      setIsReportModalOpen(false);
      setReportReason('');
      setReportDetails('');
      setReportingPostId(null);
      setReportSuccessOpened(true);
    } catch (error) {
      console.error('Помилка при відправці скарги', error);
      alert('Не вдалося надіслати скаргу.');
    } finally {
      setIsReporting(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'users') return post.author?.role !== 'psychologist';
    if (activeTab === 'psychologists') return post.author?.role === 'psychologist';
    return true;
  });

  return (
    <Box className="page-content" style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />

      <Modal 
        opened={reportSuccessOpened} 
        onClose={() => setReportSuccessOpened(false)} 
        centered 
        radius="xl" 
        withCloseButton={false} 
        overlayProps={{ blur: 4, opacity: 0.4 }}
        styles={{ content: { backgroundColor: 'var(--lm-card-bg)', padding: '30px', textAlign: 'center', border: '1px solid var(--lm-border)' } }}
      >
        <Text size="60px" mb="sm">🛡️✨</Text>
        <Title order={3} style={{ color: 'var(--lm-dark)' }} mb="sm">Скаргу надіслано!</Title>
        <Text style={{ color: 'var(--lm-dark-soft)' }} mb="xl">
          Дякуємо, що допомагаєте робити LIMEN безпечним простором для всіх. Модератори вже перевіряють цей контент.
        </Text>
        <Button fullWidth size="md" radius="xl" color="orange" onClick={() => setReportSuccessOpened(false)}>
          Зрозуміло
        </Button>
      </Modal>

      <Modal 
        opened={isReportModalOpen} 
        onClose={() => { setIsReportModalOpen(false); setReportingPostId(null); }} 
        title={
          <Group gap="sm">
            <ThemeIcon color="red" variant="light" radius="xl"><IconFlag size={18} /></ThemeIcon>
            <Text fw={800} style={{ color: 'var(--lm-dark)' }}>Поскаржитись на контент</Text>
          </Group>
        }
        radius="xl"
        centered
        overlayProps={{ blur: 3, opacity: 0.3 }}
        styles={{ content: { backgroundColor: 'var(--lm-card-bg)' }, header: { backgroundColor: 'var(--lm-card-bg)' } }}
      >
        <Stack gap="md">
          <Select
            label="Причина скарги"
            placeholder="Оберіть причину"
            data={['Спам або реклама', 'Образа / Агресія', 'Небезпечний контент', 'Самоушкодження', 'Інше']}
            value={reportReason}
            onChange={setReportReason}
            required
            radius="md"
            styles={{ 
              input: { backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)', '&:focus': { borderColor: 'var(--lm-orange)', backgroundColor: 'var(--lm-card-bg)' } },
              label: { color: 'var(--lm-dark)' }
            }}
          />
          <Textarea
            label="Деталі (опціонально)"
            placeholder="Опишіть проблему детальніше..."
            value={reportDetails}
            onChange={(e) => setReportDetails(e.currentTarget.value)}
            minRows={3}
            radius="md"
            styles={{ 
              input: { backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)', '&:focus': { borderColor: 'var(--lm-orange)', backgroundColor: 'var(--lm-card-bg)' } },
              label: { color: 'var(--lm-dark)' }
            }}
          />
          <Button color="red" fullWidth radius="xl" size="md" mt="sm" loading={isReporting} onClick={submitReport}>
            Надіслати скаргу
          </Button>
        </Stack>
      </Modal>

      <Container size="xl" pt={{ base: 20, md: 60 }} pb={{ base: 100, sm: 60, md: 80 }} px={{ base: 'md', sm: 'xl' }}>

        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing={{ base: 'md', md: 'xl' }} mb={{ base: 40, md: 70 }} className="animate-slideUp">
          {ACTIONS.map((action, index) => (
            <Paper
              key={index} radius="xl" p={{ base: 'lg', md: 'xl' }} onClick={() => navigate(action.link)}
              className="card-hover"
              style={{
                border: '1px solid var(--lm-border)', cursor: 'pointer',
                backgroundColor: 'var(--lm-card-bg)', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', minHeight: 'auto', gap: '16px', boxShadow: 'var(--lm-shadow-sm)',
              }}
            >
              <Text fw={800} size="xl" ta="center" style={{ color: 'var(--lm-dark)' }}>{action.title}</Text>
              <Center py={{ base: 'sm', md: 0 }}>
                <ThemeIcon size={70} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)' }}>{action.icon}</ThemeIcon>
              </Center>
              <Box style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <Image src={action.image} alt={action.title} fit="contain" h={{ base: 90, sm: 120 }} style={{ opacity: 0.85 }} />
              </Box>
            </Paper>
          ))}
        </SimpleGrid>

        <Title order={2} mb="xl" className="animate-slideUp-delay-1" style={{ color: 'var(--lm-dark)', textAlign: 'center', fontWeight: 800 }}>Стрічка спільноти</Title>

        <Tabs value={activeTab} onChange={setActiveTab} mb={{ base: 30, md: 40 }} color="orange" variant="pills" radius="xl">
          <Tabs.List justify="center" style={{ backgroundColor: 'var(--lm-border)', padding: '6px', borderRadius: '30px', display: 'flex', margin: '0 auto', flexWrap: 'wrap', gap: '4px', maxWidth: 'fit-content' }}>
            <Tabs.Tab value="all" leftSection={<IconLayoutList size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Всі записи</Tabs.Tab>
            <Tabs.Tab value="users" leftSection={<IconUsers size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Спільнота</Tabs.Tab>
            <Tabs.Tab value="psychologists" leftSection={<IconStethoscope size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Поради</Tabs.Tab>
            <Tabs.Tab value="videos" leftSection={<IconVideo size={16} />} style={{ fontWeight: 600, color: 'var(--lm-dark)' }}>Релакс</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {activeTab === 'videos' ? (
          loading ? (
            <Center mt={50}><Loader color="orange" /></Center>
          ) : videos.length === 0 ? (
            <Text ta="center" c="dimmed" mt={30} size="lg">Адміністратори ще не додали відео</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'md', md: 'xl' }} className="animate-slideUp">
              {videos.map((video) => (
                <Paper key={video._id} p={{ base: 'lg', md: 'xl' }} radius="xl" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                  <AspectRatio ratio={16 / 9} mb="lg" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--lm-bg-alt)' }}>
                    <iframe src={`https://www.youtube.com/embed/${video.youtubeId}`} title={video.title} style={{ border: 0 }} allowFullScreen />
                  </AspectRatio>
                  <Title order={3} mb="xs" style={{ color: 'var(--lm-dark)', fontWeight: 800 }}>{video.title}</Title>
                  <Text style={{ color: 'var(--lm-dark-soft)', lineHeight: 1.6, fontSize: '15px' }}>{video.description}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          )
        ) : (
          loading ? (
            <Center mt={50}><Loader color="orange" /></Center>
          ) : filteredPosts.length === 0 ? (
            <Text ta="center" c="dimmed" mt={30} size="lg">У цій категорії поки немає постів </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={{ base: 'md', md: 'xl' }}>
              {filteredPosts.map((post) => {
                const latestComment = post.comments && post.comments.length > 0 ? post.comments[post.comments.length - 1] : null;
                const isPsychologistPost = post.author?.role === 'psychologist';
                const isMyPost = post.author?._id === currentUser._id || post.author === currentUser._id;

                return (
                  <Paper
                    key={post._id} shadow="none" p={{ base: 20, sm: 24, md: 30 }} radius="xl" className="card-hover"
                    style={{ border: isPsychologistPost ? '1px solid var(--lm-violet-border)' : '1px solid var(--lm-border)', backgroundColor: 'var(--lm-card-bg)', cursor: 'pointer', boxShadow: 'var(--lm-shadow-sm)', display: 'flex', flexDirection: 'column' }}
                    onClick={() => navigate(`/posts/${post._id}`)}
                  >
                    <Group justify="space-between" mb="md" align="flex-start">
                      <Group gap="xs">
                        <Badge color={post.status === 'active' ? 'orange' : 'gray'} variant="light" size="sm" radius="sm">
                          {post.status === 'active' ? 'Актуально' : 'Вже пройшло'}
                        </Badge>
                        {post.isSupportOnly && <Badge color="pink" variant="dot" size="sm">Тільки підтримка</Badge>}
                        {post.visibility === 'anonymous' && <Badge color="gray" variant="outline" size="sm">Анонімно</Badge>}
                      </Group>
                      <Menu shadow="xl" width={220} position="bottom-end" radius="md" withArrow>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
                            <IconDotsVertical size={20} color="var(--lm-muted)" />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)' }}>
                          {isMyPost ? (
                            <>
                              <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => navigate(`/edit-post/${post._id}`)} style={{ color: 'var(--lm-dark)' }}>Редагувати</Menu.Item>
                              {!isPsychologistPost && (
                                post.status === 'active' ? (
                                  <Menu.Item leftSection={<IconCheck size={16} />} onClick={() => handleStatusChange(post._id, 'passed')} style={{ color: 'var(--lm-dark)' }}>Позначити "Вже пройшло"</Menu.Item>
                                ) : (
                                  <Menu.Item leftSection={<IconArchive size={16} />} onClick={() => handleStatusChange(post._id, 'active')} style={{ color: 'var(--lm-dark)' }}>Повернути в "Ще турбує"</Menu.Item>
                                )
                              )}
                              <Menu.Divider />
                              <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => handleDelete(post._id)}>Видалити</Menu.Item>
                            </>
                          ) : (
                            <Menu.Item color="red" leftSection={<IconAlertOctagon size={16} />} onClick={() => openReportModal(post._id)}>Поскаржитись</Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    <Group gap="sm" mb="lg" wrap="nowrap" onClick={(e) => { e.stopPropagation(); const authorId = post.author?._id || post.author; if (authorId) navigate(`/user/${authorId}`); }} style={{ cursor: 'pointer' }}>
                      <Avatar src={post.author?.avatarUrl ? `http://localhost:3000${post.author.avatarUrl}` : null} radius="xl" size="md" style={{ boxShadow: 'var(--lm-shadow-sm)' }} />
                      <Box style={{ flex: 1, overflow: 'hidden' }}>
                        <Group gap="xs" wrap="nowrap">
                          <Text size="sm" fw={700} style={{ color: 'var(--lm-dark)' }} truncate>{post.author?.fullName || `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Анонім'}</Text>
                          {isPsychologistPost && <Badge size="xs" color="violet" variant="filled" style={{ flexShrink: 0 }}>Психолог</Badge>}
                        </Group>
                        <Text size="xs" style={{ color: 'var(--lm-muted)' }} truncate>{new Date(post.createdAt).toLocaleDateString('uk-UA')} • {post.emotion}</Text>
                      </Box>
                    </Group>

                    <Text fw={800} size="lg" style={{ color: 'var(--lm-dark)' }} mb="xs">{post.title || 'Без заголовка'}</Text>

                    <Box style={{ flexGrow: 1 }}>
                      <Text style={{ color: 'var(--lm-dark-soft)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '15px', lineHeight: 1.6 }}>{post.content}</Text>
                      <Text size="sm" mt="xs" fw={700} style={{ color: 'var(--lm-orange)' }}>Читати далі →</Text>
                    </Box>

                    <Divider my="md" color="var(--lm-border)" />

                    <Group gap="xs" mb={latestComment || (!post.isSupportOnly && currentUser.role === 'psychologist' && !isMyPost) ? "md" : 0} onClick={(e) => e.stopPropagation()}>
                      {reactionsList.map((reaction, idx) => {
                        const count = post.reactions?.filter((r: any) => r.emoji === reaction.emoji).length || 0;
                        const hasReacted = post.reactions?.some((r: any) => r.emoji === reaction.emoji && r.userId === currentUser._id);
                        return (
                          <Badge
                            key={idx} size="md" radius="xl" variant={hasReacted ? "filled" : "light"} color={hasReacted ? "orange" : "gray"}
                            style={{ cursor: isMyPost ? 'default' : 'pointer', textTransform: 'none', backgroundColor: hasReacted ? 'var(--lm-orange)' : 'var(--lm-bg-input)', color: hasReacted ? '#fff' : 'var(--lm-dark)' }}
                            onClick={() => { if (!isMyPost) handleReaction(post._id, reaction.emoji); }}
                          >
                            {reaction.emoji} <span style={{ marginLeft: '4px', fontWeight: 600 }}>{count > 0 && count}</span>
                          </Badge>
                        );
                      })}
                    </Group>

                    {latestComment && (
                      <Box mt="auto" p="sm" style={{ backgroundColor: 'var(--lm-bg-alt)', borderRadius: '12px', border: '1px solid var(--lm-border)' }} onClick={(e) => e.stopPropagation()}>
                        <Group justify="space-between" mb={4}>
                          <Text size="10px" fw={700} style={{ color: 'var(--lm-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Останній коментар</Text>
                        </Group>
                        <Text component="div" size="xs" fw={700} style={{ color: 'var(--lm-dark)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }} mb={2}>
                          {latestComment.author?.fullName || 'Анонім'}
                          {latestComment.author?.role === 'psychologist' && <Badge size="10px" color="violet" variant="light">Психолог</Badge>}
                        </Text>
                        <Text size="xs" style={{ color: 'var(--lm-dark-soft)' }} lineClamp={2}>{latestComment.text}</Text>
                      </Box>
                    )}

                    {!post.isSupportOnly && currentUser.role === 'psychologist' && !isMyPost && (
                      <Group mt="auto" pt={latestComment ? "md" : 0} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                        <TextInput
                          placeholder="Коротка порада..." size="sm" radius="xl" style={{ flex: 1 }} value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.currentTarget.value })}
                          styles={{ input: { backgroundColor: 'var(--lm-bg-input)', border: '1px solid var(--lm-border)', color: 'var(--lm-dark)', '&:focus': { borderColor: 'var(--lm-violet)', backgroundColor: 'var(--lm-card-bg)' } } }}
                        />
                        <Button size="sm" radius="xl" color="violet" onClick={() => handleAddComment(post._id)} px={{ base: 'xs', sm: 'md' }}>Відправити</Button>
                      </Group>
                    )}
                  </Paper>
                );
              })}
            </SimpleGrid>
          )
        )}
      </Container>
    </Box>
  );
}