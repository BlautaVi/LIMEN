import { useEffect, useState } from 'react';
import { Group, ActionIcon, Menu, Indicator, Text, Box, ScrollArea, Avatar, Tooltip, Burger, Drawer, Stack, Button, Divider, Modal, ThemeIcon, SimpleGrid, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconBell, IconMessageCircle, IconBook, IconUser, IconLogout, 
  IconLayoutList, IconChecks, IconAlertTriangle, IconPhone, IconShieldCheck 
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconShieldLock } from '@tabler/icons-react';
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

import api from '../services/api';

const EMERGENCY_CONTACTS = [
  { name: 'Lifeline Ukraine', phone: '7333', desc: 'Національна лінія запобігання суїцидам' },
  { name: 'Контакт-центр МОЗ', phone: '0 800 60 20 19', desc: 'Безкоштовно та цілодобово' },
  { name: 'Ла Страда-Україна', phone: '116 123', desc: 'Запобігання домашньому насильству' },
  { name: 'Служба порятунку', phone: '101 / 112', desc: 'Екстрені ситуації' }
];

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [sosOpened, { open: openSos, close: closeSos }] = useDisclosure(false);

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

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
      closeDrawer(); 
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
    closeDrawer();
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
    root: { '&:hover': { backgroundColor: isActive(path) ? 'var(--lm-orange-light)' : 'var(--lm-bg-input)', transform: 'translateY(-1px)' } }
  });

  const handleMobileNav = (path: string) => {
    navigate(path);
    closeDrawer();
  };

  return (
    <>
      <Modal 
        opened={sosOpened} 
        onClose={closeSos} 
        title={
          <Group gap="sm">
            <ThemeIcon color="red" variant="filled" radius="xl" size="lg"><IconAlertTriangle size={20} /></ThemeIcon>
            <Text fw={800} size="xl" c="red.8">Екстрена допомога</Text>
          </Group>
        }
        centered 
        radius="xl"
        size="lg"
        overlayProps={{ blur: 4, opacity: 0.4 }}
        styles={{ content: { backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)' }, header: { backgroundColor: 'var(--lm-card-bg)' } }}
      >
        <Stack gap="md">
          <Text size="sm" fw={500} style={{ color: 'var(--lm-dark-soft)' }}>
            Якщо ви відчуваєте, що не можете впоратися самостійно, або вашому життю загрожує небезпека - будь ласка, зверніться до спеціалістів негайно.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {EMERGENCY_CONTACTS.map((contact) => (
              <Paper key={contact.name} p="md" radius="lg" withBorder style={{ backgroundColor: 'var(--lm-bg-alt)', borderColor: 'var(--lm-border)' }}>
                <Text fw={800} size="sm" c="red.9" mb={4}>{contact.name}</Text>
                <Group gap="xs" mb={4}>
                  <IconPhone size={16} color="red" />
                  <Text fw={900} size="lg" c="red.7" component="a" href={`tel:${contact.phone.replace(/\s/g, '')}`} style={{ textDecoration: 'none' }}>
                    {contact.phone}
                  </Text>
                </Group>
                <Text size="xs" c="red.6" fw={500}>{contact.desc}</Text>
              </Paper>
            ))}
          </SimpleGrid>

          <Divider label="Limen Safe Space" labelPosition="center" color="red.1" />
          
          <Group gap="sm" p="sm" style={{ backgroundColor: 'var(--lm-bg-alt)', borderRadius: '12px', flexWrap: 'nowrap' }}>
            <IconShieldCheck size={24} color="#A0AEC0" style={{ flexShrink: 0 }} />
            <Text size="xs" style={{ color: 'var(--lm-muted)', flex: 1 }}>
              Ми поруч. Ви завжди можете анонімно написати у стрічку спільноти або звернутися до наших перевірених фахівців.
            </Text>
          </Group>
        </Stack>
      </Modal>

      <Box
        className="glass"
        style={{
          borderBottom: '1px solid var(--lm-glass-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
        px={{ base: 'md', sm: 40 }} 
        py={10}
      >
        <Group justify="space-between" h="100%">

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
            <Tooltip label="Екстрена допомога" position="bottom" withArrow color="red">
              <Button 
                color="red" 
                variant="filled" 
                radius="xl" 
                size="xs" 
                leftSection={<IconAlertTriangle size={16} stroke={3} />}
                onClick={openSos}
                style={{ 
                  boxShadow: '0 4px 12px rgba(255, 0, 0, 0.2)',
                  animation: 'pulse 2s infinite'
                }}
              >
                SOS
              </Button>
            </Tooltip>
            <Tooltip label={computedColorScheme === 'dark' ? "Світла тема" : "Темна тема"} position="bottom" withArrow>
              <ActionIcon
                onClick={toggleColorScheme}
                variant="subtle"
                size="xl"
                radius="xl"
                style={{ color: 'var(--lm-muted)', transition: 'all 0.25s var(--lm-ease)' }}
                styles={{ root: { '&:hover': { backgroundColor: 'var(--lm-bg-input)', transform: 'translateY(-1px)' } } }}
              >
                {computedColorScheme === 'dark' ? (
                  <IconSun size={22} stroke={2} color="var(--lm-orange)" />
                ) : (
                  <IconMoon size={22} stroke={2} />
                )}
              </ActionIcon>
            </Tooltip>

            <Group visibleFrom="sm" gap="sm">
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
            </Group>

            <Menu shadow="xl" width={320} position="bottom-end" radius="lg" withArrow>
              <Menu.Target>
                <Indicator color="var(--lm-orange)" size={10} offset={5} withBorder disabled={notifications.length === 0}>
                  <ActionIcon
                    variant="subtle" size="xl" radius="xl" title="Сповіщення"
                    style={{ color: 'var(--lm-muted)', transition: 'all 0.25s var(--lm-ease)' }}
                    styles={{ root: { '&:hover': { backgroundColor: 'var(--lm-bg-input)', transform: 'translateY(-1px)' } } }}
                  >
                    <IconBell size={22} stroke={2} />
                  </ActionIcon>
                </Indicator>
              </Menu.Target>

              <Menu.Dropdown p="md" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)' }}>
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
                        style={{ borderBottom: '1px solid var(--lm-border)', padding: '14px 12px', borderRadius: '12px', transition: 'background-color 0.2s', '&:hover': { backgroundColor: 'var(--lm-bg-input)' } }}
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

            <Box visibleFrom="sm">
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
                <Menu.Dropdown p="xs" style={{ backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)' }}>
                  <Menu.Label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--lm-muted)' }}>
                    Привіт, {currentUser.fullName || 'Користувач'}
                  </Menu.Label>
                  
                  {currentUser.role === 'admin' && (
                    <Menu.Item 
                      color="red" 
                      leftSection={<IconShieldLock size={16} stroke={2} />} 
                      onClick={() => navigate('/admin')} 
                      style={{ fontWeight: 600 }}
                    >
                      Панель керування
                    </Menu.Item>
                  )}
                  <Menu.Item leftSection={<IconUser size={16} stroke={2} />} onClick={() => navigate('/profile')} style={{ fontWeight: 500, color: 'var(--lm-dark)' }}>
                    Мій профіль
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconLogout size={16} stroke={2} />} onClick={handleLogout} style={{ fontWeight: 500 }}>
                    Вийти
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Box>

            <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" size="sm" color="var(--lm-dark)" />
          </Group>
        </Group>
      </Box>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="right"
        size="xs"
        padding="md"
        title={<Text fw={800} size="xl" style={{ color: 'var(--lm-dark)' }}>Меню</Text>}
        styles={{
          content: { backgroundColor: 'var(--lm-bg)' },
          header: { backgroundColor: 'var(--lm-bg)', borderBottom: '1px solid var(--lm-border)', paddingBottom: '16px' }
        }}
      >
        <Stack gap="sm" mt="md">
          <Button color="red" leftSection={<IconAlertTriangle size={20} />} onClick={() => { openSos(); closeDrawer(); }} radius="md" size="lg" justify="flex-start" mb="sm">Екстрена допомога (SOS)</Button>
          {currentUser.role === 'admin' && (
            <Button 
              color="red"
              variant="light"
              size="lg"
              radius="md"
              justify="flex-start"
              leftSection={<IconShieldLock size={20} />}
              onClick={() => handleMobileNav('/admin')}
              style={{ fontWeight: 600 }}
            >
              Панель керування
            </Button>
          )}
          <Button 
            variant={isActive('/dashboard') ? 'light' : 'subtle'} color="orange" 
            size="lg" radius="md" justify="flex-start" 
            leftSection={<IconLayoutList size={22} />} 
            onClick={() => handleMobileNav('/dashboard')}
          >
            Стрічка спільноти
          </Button>
          <Button 
            variant={isActive('/diary') ? 'light' : 'subtle'} color="orange" 
            size="lg" radius="md" justify="flex-start" 
            leftSection={<IconBook size={22} />} 
            onClick={() => handleMobileNav('/diary')}
          >
            Щоденник емоцій
          </Button>
          <Button 
            variant={isActive('/chats') ? 'light' : 'subtle'} color="orange" 
            size="lg" radius="md" justify="flex-start" 
            leftSection={<IconMessageCircle size={22} />} 
            onClick={() => handleMobileNav('/chats')}
          >
            Повідомлення
          </Button>

          <Divider my="sm" color="var(--lm-border)" />

          <Group wrap="nowrap" gap="md" p="xs">
            <Avatar src={currentUser.avatarUrl ? `http://localhost:3000${currentUser.avatarUrl}` : null} radius="xl" size="md" style={{ border: '2px solid var(--lm-border)' }} />
            <Box style={{ overflow: 'hidden' }}>
              <Text fw={700} size="sm" truncate style={{ color: 'var(--lm-dark)' }}>{currentUser.fullName || 'Користувач'}</Text>
              <Text size="xs" style={{ color: 'var(--lm-muted)' }}>{currentUser.role === 'psychologist' ? 'Психолог' : 'Користувач'}</Text>
            </Box>
          </Group>

          <Button 
            variant="subtle" color="gray" size="md" radius="md" justify="flex-start" 
            leftSection={<IconUser size={20} />} 
            onClick={() => handleMobileNav('/profile')}
            style={{ color: 'var(--lm-dark)' }}
          >
            Мій профіль
          </Button>
          <Button 
            variant="subtle" color="red" size="md" radius="md" justify="flex-start" 
            leftSection={<IconLogout size={20} />} 
            onClick={handleLogout}
          >
            Вийти
          </Button>
        </Stack>
      </Drawer>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(255, 0, 0, 0.4); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}