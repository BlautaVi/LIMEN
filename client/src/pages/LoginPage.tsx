import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Container,
  Group,
  Anchor,
  Text,
  Grid,
  Stack,
  Image,
  Box,
  Center
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister 
        ? { email, password, fullName } 
        : { email, password };

      const response = await api.post(endpoint, payload);

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));

        alert(isRegister ? 'Успішна реєстрація!' : 'Успішний вхід!');
        if (user.isOnboarded) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (error: any) {
      alert('Помилка: ' + (error.response?.data?.message || 'Щось пішло не так'));
    }
  };

  return (
    <Grid minHeight="100vh" gutter={0}>
      <Grid.Col 
        span={{ base: 0, md: 6 }} 
        style={{ 
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px'
        }}
      >
        <Box style={{ width: '100%', maxWidth: '450px', height: 'auto' }}>
          <Image
            src="https://www.dropbox.com/scl/fi/rmb2pxbafhxz35pvj6txd/Background_image.png?rlkey=vktmlcc5s3j155tcvt0snovb1&st=135jdrw8&dl=1" 
            fit="contain" 
            alt="Abstract design"
            style={{ maxHeight: '500px' }}
          />
        </Box>
      </Grid.Col>

      <Grid.Col 
        span={{ base: 12, md: 6 }} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#fff',
          padding: '40px 20px'
        }}
      >
        <Container size="xs" style={{ width: '100%', maxWidth: '420px' }}>
          
          <Title 
            order={1} 
            ta="center" 
            style={{ 
              color: '#0F7EAA', 
              fontSize: '40px',
              fontWeight: 700,
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}
          >
            Вітаємо в LIMEN!
          </Title>
          
          <Text 
            c="#0F7EAA" 
            size="lg" 
            ta="center" 
            mb={40} 
            fw={400}
            style={{ fontSize: '18px' }}
          >
            {isRegister ? 'Заповніть поля для реєстрації:' : 'Заповніть поля:'}
          </Text>

          <Stack gap="lg">
            {isRegister && (
               <TextInput 
                 placeholder="Full Name" 
                 radius="md"
                 size="lg"
                 styles={{ 
                   input: { 
                     backgroundColor: '#F5F5F5', 
                     border: '1px solid #E0E0E0',
                     color: '#000',
                     fontSize: '16px',
                     padding: '12px 20px',
                     height: '52px',
                     borderRadius: '12px',
                     '::placeholder': {
                       color: '#999'
                     }
                   } 
                 }}
                 value={fullName}
                 onChange={(e) => setFullName(e.currentTarget.value)}
               />
            )}
            
            <TextInput 
                placeholder="Email" 
                radius="md"
                size="lg"
                styles={{ 
                   input: { 
                     backgroundColor: '#F5F5F5', 
                     border: '1px solid #E0E0E0',
                     color: '#000',
                     fontSize: '16px',
                     padding: '12px 20px',
                     height: '52px',
                     borderRadius: '12px',
                     '::placeholder': {
                       color: '#999'
                     }
                   } 
                 }}
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
            />
            
            <PasswordInput 
                placeholder="Password" 
                radius="md"
                size="lg"
                styles={{ 
                   input: { 
                     backgroundColor: '#F5F5F5', 
                     border: '1px solid #E0E0E0',
                     color: '#000',
                     fontSize: '16px',
                     padding: '12px 20px',
                     height: '52px',
                     borderRadius: '12px',
                     '::placeholder': {
                       color: '#999'
                     }
                   },
                   innerInput: {
                     backgroundColor: 'transparent'
                   }
                 }}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
            />

            <Button 
              fullWidth 
              mt="md" 
              size="lg" 
              radius="md"
              onClick={handleSubmit}
              style={{ 
                backgroundColor: '#4FCDFF',
                boxShadow: '0 8px 20px rgba(79, 205, 255, 0.4)', 
                color: '#fff',
                border: 'none',
                fontSize: '18px',
                fontWeight: 600,
                height: '56px',
                borderRadius: '14px',
                textTransform: 'none',
                transition: 'all 0.3s ease'
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: '#3DB8E8',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(79, 205, 255, 0.5)'
                  }
                }
              }}
            >
              {isRegister ? 'Sign Up' : 'Log In'}
            </Button>
          </Stack>

          <Group justify="center" mt="xl">
            <Text size="sm" style={{ color: '#0F7EAA', fontSize: '15px' }}>
              {isRegister ? 'Вже маєте акаунт? ' : 'Немає акаунту? '}
              <Anchor 
                size="sm" 
                component="button" 
                fw={600} 
                onClick={() => setIsRegister(!isRegister)}
                style={{ 
                  color: '#0F7EAA', 
                  textDecoration: 'underline',
                  fontSize: '15px'
                }}
              >
                {isRegister ? 'Авторизуйтесь' : 'Зареєструйтесь'}
              </Anchor>
            </Text>
          </Group>

        </Container>
      </Grid.Col>
    </Grid>
  );
}