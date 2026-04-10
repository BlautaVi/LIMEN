import { useEffect, useState } from 'react';
import { Group, ActionIcon, Menu, Indicator, Text, Box, ScrollArea, Avatar } from '@mantine/core';
import { IconBell, IconMessageCircle, IconBook, IconUser, IconLogout, IconLayoutList } from '@tabler/icons-react';
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

  return (
    <Box style={{ borderBottom: '1px solid #E1F5FE', backgroundColor: '#fff', padding: '10px 40px' }}>
      <Group justify="space-between" h="100%">
        
        <Text 
          fw={900} 
          size="xl" 
          style={{ color: '#0F7EAA', cursor: 'pointer', letterSpacing: '1px' }}
          onClick={() => navigate('/dashboard')}
        >
          LIMEN
        </Text>

        <Group gap="md">
          <ActionIcon variant="subtle" color={location.pathname === '/dashboard' ? 'cyan' : 'gray'} onClick={() => navigate('/dashboard')} size="lg" title="Стрічка">
            <IconLayoutList size={22} />
          </ActionIcon>
          
          <ActionIcon variant="subtle" color={location.pathname === '/diary' ? 'cyan' : 'gray'} onClick={() => navigate('/diary')} size="lg" title="Щоденники">
            <IconBook size={22} />
          </ActionIcon>

          <ActionIcon variant="subtle" color={location.pathname.includes('/chats') ? 'cyan' : 'gray'} onClick={() => navigate('/chats')} size="lg" title="Повідомлення">
            <IconMessageCircle size={22} />
          </ActionIcon>

          <Menu shadow="xl" width={340} position="bottom-end" withArrow>
            <Menu.Target>
              <Indicator color="red" size={10} offset={4} disabled={notifications.length === 0}>
                <ActionIcon variant="subtle" color="gray" size="lg" title="Сповіщення">
                  <IconBell size={22} />
                </ActionIcon>
              </Indicator>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Нові сповіщення</Menu.Label>
              {notifications.length === 0 ? (
                <Text size="sm" c="dimmed" p="xl" ta="center">Немає нових сповіщень </Text>
              ) : (
                <ScrollArea h={350} type="auto">
                  {notifications.map((notif) => (
                    <Menu.Item 
                      key={notif._id} 
                      onClick={() => handleNotificationClick(notif)} 
                      style={{ borderBottom: '1px solid #F4F9FD', padding: '12px 16px' }}
                    >
                      <Text size="sm" fw={500} style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>
                        {getNotificationText(notif)}
                      </Text>
                      <Text size="xs" c="dimmed" mt={6}>
                        {new Date(notif.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Menu.Item>
                  ))}
                </ScrollArea>
              )}
            </Menu.Dropdown>
          </Menu>

          <Menu shadow="md" width={200} position="bottom-end" withArrow>
            <Menu.Target>
              <Avatar 
                src={currentUser.avatarUrl ? `http://localhost:3000${currentUser.avatarUrl}` : null} 
                radius="xl" 
                size="md" 
                color="cyan"
                style={{ cursor: 'pointer', border: '2px solid #E1F5FE' }}
              />
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Привіт, {currentUser.fullName  || 'Користувач'}</Menu.Label>
              <Menu.Item leftSection={<IconUser size={14} />} onClick={() => navigate('/profile')}>
                Мій профіль
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                Вийти
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

        </Group>
      </Group>
    </Box>
  );
}