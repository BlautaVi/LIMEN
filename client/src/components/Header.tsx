import { Group, ActionIcon, Box } from '@mantine/core';
import { IconArrowLeft, IconUserCircle, IconHelpCircle } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconBook, IconMessageCircle } from '@tabler/icons-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.pathname !== '/dashboard';

  return (
    <Box 
      component="header" 
      style={{ 
        backgroundColor: '#E0F7FA',
        padding: '12px 20px', 
        marginBottom: '30px'
      }}
    >
      <Group justify="space-between" align="center">
        <Box style={{ width: '32px' }}>
          {showBack ? (
            <ActionIcon 
              variant="transparent" 
              size="lg"
              onClick={() => navigate(-1)}
              style={{ color: '#0F7EAA' }}
            >
              <IconArrowLeft style={{ width: '28px', height: '28px', strokeWidth: 2.5 }} />
            </ActionIcon>
          ) : null}
        </Box>

        <Group gap="md">
          <ActionIcon 
            variant="transparent" 
            size="lg"
            onClick={() => navigate('/profile')}
            style={{ color: '#0F7EAA' }}
          >
            <IconUserCircle style={{ width: '32px', height: '32px', strokeWidth: 2 }} />
          </ActionIcon>
          <ActionIcon 
            variant="transparent" 
            onClick={() => navigate('/diary')} 
            title="Мій щоденник емоцій"
          >
            <IconBook size={28} color="#0F7EAA" stroke={2.5} />
          </ActionIcon>
          <ActionIcon variant="transparent" onClick={() => navigate('/chats')} title="Мої повідомлення">
            <IconMessageCircle size={28} color="#0F7EAA" stroke={2.5} />
          </ActionIcon>
          <ActionIcon 
            variant="transparent" 
            size="lg"
            style={{ color: '#0F7EAA' }}
          >
            <IconHelpCircle style={{ width: '32px', height: '32px', strokeWidth: 2 }} />
          </ActionIcon>
        </Group>
      </Group>
    </Box>
  );
}