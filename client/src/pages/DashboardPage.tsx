import { Container, Title, SimpleGrid, Paper, Text, Image, Center, ThemeIcon, Box } from '@mantine/core';
import { IconPlus, IconSearch, IconMessageChatbot } from '@tabler/icons-react'; 
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

const ACTIONS = [
  {
    title: 'Додати новий пост для обговорення',
    icon: <IconPlus size={30} stroke={3} />,
    image: 'https://www.dropbox.com/scl/fi/rntgnp3jm0hfwiuh5onc7/17054008_5809569.jpg?rlkey=q8qfltyg3wckj0e8axe5c4kkb&st=nmc4xqp2&dl=1', 
    link: '/create-post',
  },
  {
    title: 'Пошук спеціаліста',
    icon: <IconSearch size={30} stroke={3} />,
    image: 'https://www.dropbox.com/scl/fi/nzgkj9fegaxph3q4b3x38/12469236_Wavy_Ppl-04_Single-11.jpg?rlkey=5ulfwh37np64cj6llgfxj2vcu&st=4lrvgx7r&dl=1',
    link: '/specialists',
  },
  {
    title: 'Розпочати розмову з AI-асистентом',
    icon: <IconPlus size={30} stroke={3} />, 
    image: 'https://www.dropbox.com/scl/fi/suiuyqky2m3u21ixkntza/12290914_Wavy_Tech-12_Single-01.jpg?rlkey=ektzdop1zndqp8wjxil35cm5r&st=6bqrq81s&dl=1', 
    link: '/ai-chat',
  }
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header /> 
      <Container size="lg" py="xl">
        <Title 
          ta="center" 
          order={1} 
          mb={50} 
          style={{ color: '#0F7EAA', fontSize: '32px', fontWeight: 700 }}
        >
          Оберіть дію, яку хочете зробити...
        </Title>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
          {ACTIONS.map((action, index) => (
            <Paper
              key={index}
              shadow={undefined}
              radius="md"
              p="xl"
              onClick={() => navigate(action.link)}
              style={{
                border: '1px solid #E0F7FA',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '400px',
                gap: '20px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(79, 205, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Text 
                fw={700} 
                size="lg" 
                ta="center" 
                style={{ color: '#0F7EAA' }}
              >
                {action.title}
              </Text>

              <Center>
                <ThemeIcon 
                  size={70} 
                  radius="xl" 
                  variant="light" 
                  style={{ 
                    backgroundColor: '#E0F7FA',
                    border: 'none'
                  }}
                >
                  <div style={{ color: '#0F7EAA' }}>{action.icon}</div>
                </ThemeIcon>
              </Center>

              <Box style={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'flex-end', 
                justifyContent: 'center',
                paddingTop: '20px'
              }}>
                <Image 
                  src={action.image} 
                  alt={action.title}
                  fit="contain"
                  h={160} 
                />
              </Box>
            </Paper>
          ))}
        </SimpleGrid>

      </Container>
    </>
  );
}