import { useEffect, useState } from 'react';
import { Group, ActionIcon, Menu, Indicator, Text, Box, ScrollArea, Avatar, Tooltip } from '@mantine/core';
import { IconBell, IconMessageCircle, IconBook, IconUser, IconLogout, IconLayoutList, IconChecks } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Помилка завантаження сповіщень', error);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif: any) => {
    try {
      await api.post(`/notifications/${notif._id}/read`);

      setNotifications(prev => prev.filter(n => n._id !== notif._id));

      if (notif.type === 'message' && notif.conversationId) {
        navigate(`/chats/${notif.conversationId}`);
      } else if (notif.postId) {
        navigate(`/posts/${notif.postId}`);
      }
    } catch (error) {
      console.error('Помилка при прочитанні', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    try {
      await Promise.all(
        notifications.map(notif => api.post(`/notifications/${notif._id}/read`))
      );
      setNotifications([]);
    } catch (error) {
      console.error('Помилка при очищенні сповіщень', error);
    }
  };

  const getNotificationText = (notif: any) => {
    const name = notif.senderId?.fullName || notif.senderId?.firstName || 'Користувач';
    switch (notif.type) {
      case 'reaction': return `${name} відреагував(ла) на Ваш пост ❤️`;
      case 'comment': return `${name} залишив(ла) коментар під Вашим постом 💬`;
      case 'message': return `${name} надіслав(ла) Вам нове повідомлення ✉️`;
      default: return 'Нове сповіщення';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/diary') return location.pathname === '/diary';
    if (path === '/chats') return location.pathname.includes('/chats');
    return false;
  };

  const navBtnStyle = (path: string) => ({
    color: isActive(path) ? 'var(--lm-orange)' : 'var(--lm-muted)',
    backgroundColor: isActive(path) ? 'var(--lm-orange-light)' : 'transparent',
    transition: 'all 0.25s var(--lm-ease)',
    borderRadius: 'var(--lm-radius-full)',
  });

  const navBtnHover = (path: string) => ({
    root: { '&:hover': { backgroundColor: isActive(path) ? 'var(--lm-orange-light)' : 'var(--lm-input-bg)', transform: 'translateY(-1px)' } }
  });

  return (
    <Box
      className="glass"
      style={{
        borderBottom: '1px solid var(--lm-glass-border)',
        padding: '10px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Group justify="space-between" h="100%">

        {/* ЛОГОТИП */}
        <Text
          fw={900}
          size="26px"
          style={{
            color: 'var(--lm-dark)',
            cursor: 'pointer',
            letterSpacing: '-1px',
            transition: 'all 0.3s var(--lm-ease)',
            background: 'linear-gradient(135deg, var(--lm-dark) 0%, var(--lm-orange) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          onClick={() => navigate('/dashboard')}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          LIMEN
        </Text>

        <Group gap="sm">
          <ActionIcon
            variant="subtle"
            onClick={() => navigate('/dashboard')} size="xl" radius="xl" title="Стрічка"
            style={navBtnStyle('/dashboard')}
            styles={navBtnHover('/dashboard')}
          >
            <IconLayoutList size={22} stroke={2} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            onClick={() => navigate('/diary')} size="xl" radius="xl" title="Щоденник"
            style={navBtnStyle('/diary')}
            styles={navBtnHover('/diary')}
          >
            <IconBook size={22} stroke={2} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            onClick={() => navigate('/chats')} size="xl" radius="xl" title="Повідомлення"
            style={navBtnStyle('/chats')}
            styles={navBtnHover('/chats')}
          >
            <IconMessageCircle size={22} stroke={2} />
          </ActionIcon>

          <Menu shadow="xl" width={360} position="bottom-end" radius="lg" withArrow>
            <Menu.Target>
              <Indicator color="var(--lm-orange)" size={10} offset={5} withBorder disabled={notifications.length === 0}>
                <ActionIcon
                  variant="subtle" size="xl" radius="xl" title="Сповіщення"
                  style={{ color: 'var(--lm-muted)', transition: 'all 0.25s var(--lm-ease)' }}
                  styles={{ root: { '&:hover': { backgroundColor: 'var(--lm-input-bg)', transform: 'translateY(-1px)' } } }}
                >
                  <IconBell size={22} stroke={2} />
                </ActionIcon>
              </Indicator>
            </Menu.Target>

            <Menu.Dropdown p="md">
              <Group justify="space-between" align="center" mb={12} px={4}>
                <Text style={{ fontSize: '11px', fontWeight: 700, color: 'var(--lm-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Нові сповіщення
                </Text>
                {notifications.length > 0 && (
                  <Tooltip label="Позначити всі як прочитані" position="left" withArrow color="orange" size="xs">
                    <ActionIcon 
                      variant="subtle" 
                      color="orange" 
                      size="sm" 
                      radius="xl"
                      onClick={handleMarkAllAsRead}
                      style={{ transition: 'all 0.2s', '&:hover': { backgroundColor: 'var(--lm-orange-light)' } }}
                    >
                      <IconChecks size={18} stroke={2} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>

              {notifications.length === 0 ? (
                <Text size="sm" fw={500} style={{ color: 'var(--lm-muted)' }} p="xl" ta="center">Немає нових сповіщень 🔕</Text>
              ) : (
                <ScrollArea h={350} type="auto">
                  {notifications.map((notif) => (
                    <Menu.Item
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{ borderBottom: '1px solid var(--lm-border)', padding: '14px 12px', borderRadius: '12px', transition: 'background-color 0.2s' }}
                    >
                      <Text size="14px" fw={600} style={{ color: 'var(--lm-dark)', whiteSpace: 'normal', lineHeight: 1.5 }}>
                        {getNotificationText(notif)}
                      </Text>
                      <Text size="12px" fw={500} style={{ color: 'var(--lm-muted)' }} mt={6}>
                        {new Date(notif.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Menu.Item>
                  ))}
                </ScrollArea>
              )}
            </Menu.Dropdown>
          </Menu>

          <Menu shadow="xl" width={220} position="bottom-end" radius="lg" withArrow>
            <Menu.Target>
              <Avatar
                src={currentUser.avatarUrl ? `http://localhost:3000${currentUser.avatarUrl}` : null}
                radius="xl"
                size="md"
                style={{
                  cursor: 'pointer',
                  border: '2.5px solid var(--lm-border)',
                  transition: 'all 0.25s var(--lm-ease)',
                  boxShadow: 'var(--lm-shadow-sm)',
                }}
              />
            </Menu.Target>
            <Menu.Dropdown p="xs">
              <Menu.Label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--lm-muted)' }}>
                Привіт, {currentUser.fullName || 'Користувач'}
              </Menu.Label>
              <Menu.Item leftSection={<IconUser size={16} stroke={2} />} onClick={() => navigate('/profile')} style={{ fontWeight: 500, color: 'var(--lm-dark)' }}>
                Мій профіль
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={16} stroke={2} />} onClick={handleLogout} style={{ fontWeight: 500 }}>
                Вийти
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

        </Group>
      </Group>
    </Box>
  );
}