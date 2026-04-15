import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Text, Stack, Image, Center, Loader, Group, ActionIcon, Badge, Menu, Box, Divider, TextInput, Avatar, Button } from '@mantine/core';
import { IconArrowLeft, IconDotsVertical, IconTrash, IconCheck, IconArchive, IconPencil } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [commentText, setCommentText] = useState('');
  const reactions = [
    { emoji: '🤍', label: 'Тримайся' },
    { emoji: '🤗', label: 'Обіймаю' },
    { emoji: '💬', label: 'Розумію вас' },
    { emoji: '🫂', label: 'Я з тобою' },
  ];

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Помилка завантаження поста', error);
      alert('Пост не знайдено');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await api.put(`/posts/${id}/status`, { status: newStatus });
      setPost(response.data);
    } catch (error) {
      alert('Помилка при зміні статусу');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Точно видалити цей пост?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/dashboard');
    } catch (error) {
      alert('Помилка видалення');
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      const response = await api.put(`/posts/${id}/react`, { emoji });
      setPost(response.data);
    } catch (error) {
      console.error('Помилка реакції', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await api.put(`/posts/${id}/comment`, { text: commentText });
      setPost(response.data);
      setCommentText('');
    } catch (error) {
      alert('Помилка при додаванні коментаря');
    }
  };

  if (loading) return <Center h="100vh" bg="var(--lm-bg)"><Loader color="orange" /></Center>;
  if (!post) return null;

  const isMyPost = post.author?._id === currentUser._id || post.author === currentUser._id;
  const isPsychologistPost = post.author?.role === 'psychologist';

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />
      <Container size="sm" pt={{ base: 20, md: 40 }} pb={80}>

        <Group mb="xl" className="animate-fadeIn">
          <ActionIcon variant="transparent" onClick={() => navigate(-1)} style={{ transition: 'transform 0.2s var(--lm-ease)', '&:hover': { transform: 'translateX(-4px)' } }}>
            <IconArrowLeft size={28} color="var(--lm-dark)" stroke={2.5} />
          </ActionIcon>
          <Text fw={800} size="xl" style={{ color: 'var(--lm-dark)' }}>{isPsychologistPost ? 'Стаття спеціаліста' : 'Обговорення'}</Text>
        </Group>

        <Paper
          shadow="none"
          p={{ base: 24, md: 40 }}
          radius="xl"
          className="animate-slideUp"
          style={{
            border: isPsychologistPost ? '1px solid var(--lm-violet-border)' : '1px solid var(--lm-border)',
            backgroundColor: isPsychologistPost ? 'var(--lm-violet-light)' : '#fff',
            boxShadow: 'var(--lm-shadow-md)'
          }}
        >

          <Group justify="space-between" mb="xl">
            <Group gap="xs">
              {isPsychologistPost ? (
                <Badge color="violet" variant="light" size="md" radius="sm">Порада психолога</Badge>
              ) : (
                <Badge color={post.status === 'active' ? 'orange' : 'gray'} variant="light" size="md" radius="sm">
                  {post.status === 'active' ? 'Актуально' : 'Вже пройшло'}
                </Badge>
              )}
              {post.isSupportOnly && !isPsychologistPost && <Badge color="pink" variant="dot" size="md">Тільки підтримка</Badge>}
            </Group>

            {isMyPost && (
              <Menu shadow="xl" width={220} position="bottom-end" radius="md" withArrow>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="lg"><IconDotsVertical size={22} color="var(--lm-muted)" /></ActionIcon>
                </Menu.Target>
                <Menu.Dropdown p="xs">
                  <Menu.Label>Керування постом</Menu.Label>

                  <Menu.Item
                    leftSection={<IconPencil size={16} />}
                    onClick={() => navigate(`/edit-post/${post._id}`)}
                    style={{ fontWeight: 500 }}
                  >
                    Редагувати {isPsychologistPost ? 'статтю' : 'пост'}
                  </Menu.Item>

                  {!isPsychologistPost && (
                    post.status === 'active' ? (
                      <Menu.Item leftSection={<IconCheck size={16} />} onClick={() => handleStatusChange('passed')} style={{ fontWeight: 500 }}>
                        Позначити "Вже пройшло"
                      </Menu.Item>
                    ) : (
                      <Menu.Item leftSection={<IconArchive size={16} />} onClick={() => handleStatusChange('active')} style={{ fontWeight: 500 }}>
                        Повернути в "Ще турбує"
                      </Menu.Item>
                    )
                  )}
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={handleDelete} style={{ fontWeight: 500 }}>
                    Видалити {isPsychologistPost ? 'статтю' : 'пост'}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>

          {post.imageUrl && (
            <Image src={`http://localhost:3000${post.imageUrl}`} radius="lg" mb="xl" fit="cover" style={{ border: '1px solid var(--lm-border)' }} />
          )}

          <Group
            mb="xl"
            onClick={() => {
              const authorId = post.author?._id || post.author;
              if (authorId) navigate(`/user/${authorId}`);
            }}
            style={{ cursor: 'pointer', width: 'fit-content' }}
          >
            <Avatar
              src={post.author?.avatarUrl ? `http://localhost:3000${post.author.avatarUrl}` : null}
              radius="xl"
              size="lg"
              style={{ boxShadow: 'var(--lm-shadow-sm)' }}
            />
            <Box>
              <Text fw={700} size="md" style={{ color: 'var(--lm-dark)' }}>
                {post.author?.fullName || `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Анонім'}
              </Text>
              <Text size="xs" style={{ color: 'var(--lm-muted)' }}>
                {new Date(post.createdAt).toLocaleDateString('uk-UA')} • {post.emotion}
              </Text>
            </Box>
          </Group>

          <Text fw={800} size="24px" style={{ color: 'var(--lm-dark)', lineHeight: 1.3 }} mb="md">{post.title}</Text>
          <Text style={{ whiteSpace: 'pre-wrap', color: 'var(--lm-dark-soft)', fontSize: '17px', lineHeight: 1.7, wordBreak: 'break-word' }} mb="xl">
            {post.content}
          </Text>

          <Divider my="xl" color="var(--lm-border)" />

          <Text component="div" size="sm" fw={600} style={{ color: 'var(--lm-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }} mb="md">
            Відреагувати
          </Text>

          <Group gap="sm" wrap="wrap">
            {reactions.map((reaction, idx) => {
              const count = post.reactions?.filter((r: any) => r.emoji === reaction.emoji).length || 0;
              const hasReacted = post.reactions?.some((r: any) => r.emoji === reaction.emoji && r.userId === currentUser._id);

              return (
                <Badge
                  key={idx}
                  size="xl"
                  radius="xl"
                  variant={hasReacted ? "filled" : "light"}
                  style={{
                    cursor: isMyPost ? 'default' : 'pointer',
                    textTransform: 'none',
                    transition: 'all 0.2s var(--lm-ease)',
                    backgroundColor: hasReacted ? 'var(--lm-orange)' : 'var(--lm-input-bg)',
                    color: hasReacted ? '#fff' : 'var(--lm-dark)',
                    padding: '0 16px',
                    height: '40px'
                  }}
                  onClick={() => {
                    if (!isMyPost) handleReaction(reaction.emoji);
                  }}
                  onMouseEnter={(e) => !isMyPost && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !isMyPost && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <span style={{ fontSize: '18px', marginRight: '6px' }}>{reaction.emoji}</span>
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>{reaction.label}</span>
                  {count > 0 && <span style={{ marginLeft: '6px', fontWeight: 800 }}>({count})</span>}
                </Badge>
              );
            })}
          </Group>
        </Paper>

        <Text mt={50} mb="xl" fw={800} size="xl" style={{ color: 'var(--lm-dark)' }}>
          {isPsychologistPost ? 'Коментарі до статті' : 'Підтримка та поради'}
        </Text>

        <Box>
          {post.isSupportOnly && !isPsychologistPost ? (
            <Paper p={40} radius="xl" style={{ backgroundColor: 'var(--lm-bg-alt)', border: '1px dashed var(--lm-border)' }}>
              <Text style={{ color: 'var(--lm-muted)' }} ta="center" size="lg" fw={500}>
                У цьому пості увімкнено режим "Тільки підтримка".<br />
                Тут не можна давати поради, лише залишати реакції. 🤍
              </Text>
            </Paper>
          ) : (
            <Stack mt="md" gap="lg">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment: any, idx: number) => (
                  <Paper key={idx} p={24} radius="xl" style={{ backgroundColor: '#fff', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
                    <Group justify="space-between" mb="sm" align="flex-start">
                      <Group gap="sm">
                        <Avatar src={comment.author?.avatarUrl ? `http://localhost:3000${comment.author.avatarUrl}` : null} radius="xl" size="sm" />
                        <Box>
                          <Group gap="xs">
                            <Text fw={700} size="sm" style={{ color: 'var(--lm-dark)' }}>
                              {comment.author?.fullName || 'Анонім'}
                            </Text>
                            {comment.author?.role === 'psychologist' && (
                              <Badge size="xs" color="violet" variant="filled">Психолог</Badge>
                            )}
                          </Group>
                          <Text size="xs" style={{ color: 'var(--lm-muted)' }}>
                            {new Date(comment.createdAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </Box>
                      </Group>

                      {comment.author?.role === 'psychologist' && currentUser._id !== comment.author?._id && (
                        <Button
                          variant="light" size="xs" color="violet" radius="xl"
                          onClick={() => navigate(`/specialists/${comment.author._id}`)}
                        >
                          Консультуватись
                        </Button>
                      )}
                    </Group>
                    <Text size="md" style={{ color: 'var(--lm-dark-soft)', lineHeight: 1.5 }}>{comment.text}</Text>
                  </Paper>
                ))
              ) : (
                <Paper p={30} radius="xl" style={{ backgroundColor: 'var(--lm-bg-alt)', border: '1px dashed var(--lm-border)' }}>
                  <Text style={{ color: 'var(--lm-muted)' }} ta="center" fw={500}>Поки що немає коментарів. Будьте першим!</Text>
                </Paper>
              )}

              <Paper p={24} radius="xl" mt="md" style={{ backgroundColor: '#fff', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-sm)' }}>
                <Group align="flex-start" wrap="nowrap">
                  <Avatar src={currentUser.avatarUrl ? `http://localhost:3000${currentUser.avatarUrl}` : null} radius="xl" size="md" />
                  <Box style={{ flexGrow: 1 }}>
                    <TextInput
                      placeholder={currentUser.role === 'psychologist' ? "Написати пораду чи підтримку..." : "Тільки фахівці можуть залишати коментарі"}
                      size="lg"
                      radius="md"
                      value={commentText}
                      onChange={(e) => setCommentText(e.currentTarget.value)}
                      disabled={currentUser.role !== 'psychologist'}
                      styles={{ input: { backgroundColor: 'var(--lm-bg-input)', border: '1px solid var(--lm-border)', '&:focus': { borderColor: 'var(--lm-orange)', boxShadow: '0 0 0 3px rgba(232,106,83,0.1)' } } }}
                    />
                    <Group justify="flex-end" mt="md">
                      <Button
                        radius="xl" size="md"
                        disabled={currentUser.role !== 'psychologist' || !commentText.trim()}
                        onClick={handleAddComment}
                        style={{
                          backgroundColor: (currentUser.role === 'psychologist' && commentText.trim()) ? 'var(--lm-orange)' : undefined,
                          color: '#fff', transition: 'all 0.2s var(--lm-ease)'
                        }}
                      >
                        Відправити коментар
                      </Button>
                    </Group>
                  </Box>
                </Group>
              </Paper>
            </Stack>
          )}
        </Box>

      </Container>
    </Box>
  );
}