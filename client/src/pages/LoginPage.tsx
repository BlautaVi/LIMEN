import { useState } from 'react';
import { TextInput, PasswordInput, Button, Title, Group, Anchor, Text, Stack, Image, Box, PinInput, Center, Modal, ThemeIcon } from '@mantine/core';
import { IconMailFast, IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState<'login' | 'register-info' | 'register-otp' | 'forgot-password' | 'reset-password'>('login');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const [messageModal, setMessageModal] = useState({ opened: false, title: '', text: '', type: 'success' });

  const closeMessageModal = () => setMessageModal({ ...messageModal, opened: false });

  const handleSendOtp = async () => {
    if (!email) return setMessageModal({ opened: true, title: 'Увага', text: 'Введіть Email', type: 'error' });
    if (step === 'register-info' && (!fullName || !password)) return setMessageModal({ opened: true, title: 'Увага', text: 'Заповніть всі поля', type: 'error' });

    setLoading(true);
    try {
      if (step === 'forgot-password') {
        await api.post('/auth/reset-password-request', { email });
        setMessageModal({ opened: true, title: 'Перевірте пошту', text: 'Код відновлення успішно надіслано на вашу електронну скриньку 📧', type: 'success' });
        setStep('reset-password'); 
      } else {
        await api.post('/auth/send-otp', { email });
        setMessageModal({ opened: true, title: 'Перевірте пошту', text: 'Код підтвердження надіслано на вашу електронну скриньку 📧', type: 'success' });
        setStep('register-otp'); 
      }
    } catch (error: any) { 
      setMessageModal({ opened: true, title: 'Помилка', text: error.response?.data?.message || 'Не вдалося відправити запит', type: 'error' });
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async () => {
    if ((step === 'register-otp' || step === 'reset-password') && otp.length < 6) return setMessageModal({ opened: true, title: 'Увага', text: 'Введіть 6-значний код', type: 'error' });
    if (step === 'reset-password' && !password) return setMessageModal({ opened: true, title: 'Увага', text: 'Введіть новий пароль', type: 'error' });

    if (loginAttempts >= 3 && step === 'login') {
      return setMessageModal({ opened: true, title: 'Ліміт вичерпано', text: 'Ви перевищили ліміт спроб. Будь ласка, відновіть пароль.', type: 'error' });
    }

    setLoading(true);
    try {
      if (step === 'reset-password') {
        await api.post('/auth/reset-password', { email, otp, newPassword: password });
        setMessageModal({ opened: true, title: 'Готово!', text: 'Пароль успішно змінено. Тепер ви можете увійти.', type: 'success' });
        setStep('login');
        setOtp('');
        setPassword('');
      } else {
        const endpoint = step === 'login' ? '/auth/login' : '/auth/register';
        const payload = step === 'login' ? { email, password } : { email, password, fullName, otp }; 

        const response = await api.post(endpoint, payload);

        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          const user = response.data.user;
          localStorage.setItem('user', JSON.stringify(user));
          navigate(user.isOnboarded ? '/dashboard' : '/onboarding');
        }
      }
    } catch (error: any) {
      if (step === 'login') setLoginAttempts(prev => prev + 1);
      setMessageModal({ opened: true, title: 'Помилка', text: error.response?.data?.message || 'Невірні дані', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes floatLogo {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <Modal 
        opened={messageModal.opened} 
        onClose={closeMessageModal} 
        centered 
        radius="xl"
        withCloseButton={false}
        overlayProps={{ blur: 4, opacity: 0.4 }}
        styles={{ content: { backgroundColor: 'var(--lm-card-bg)', border: '1px solid var(--lm-border)', padding: '24px', textAlign: 'center' } }}
      >
        <ThemeIcon 
          size={70} 
          radius="100%" 
          color={messageModal.type === 'success' ? 'teal' : 'red'} 
          variant="light" 
          mx="auto" 
          mb="md"
        >
          {messageModal.type === 'success' ? <IconCheck size={36} stroke={2.5} /> : <IconAlertTriangle size={36} stroke={2.5} />}
        </ThemeIcon>
        <Title order={3} style={{ color: 'var(--lm-dark)' }} mb="sm">{messageModal.title}</Title>
        <Text style={{ color: 'var(--lm-dark-soft)' }} mb="xl">{messageModal.text}</Text>
        <Button 
          fullWidth size="md" radius="xl" 
          color={messageModal.type === 'success' ? 'teal' : 'orange'} 
          onClick={closeMessageModal}
        >
          Зрозуміло
        </Button>
      </Modal>

      <Box style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--lm-bg)', position: 'relative', overflow: 'hidden' }}>
        
        <Box style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px' }} visibleFrom="md">
          <Box style={{
            width: '320px',
            height: '320px',
            borderRadius: '50%', 
            backgroundColor: 'var(--lm-card-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--lm-shadow-lg)',
            border: '2px solid var(--lm-border)',
            overflow: 'hidden',
            animation: 'floatLogo 5s ease-in-out infinite' 
          }}>
            <Image src="./vite.png" fit="cover" w="100%" h="100%" />
          </Box>
          <Text
            mt="xl"
            style={{
              fontSize: '14px',
              color: 'var(--lm-muted)',
              letterSpacing: '2px',
              fontWeight: 600,
              textTransform: 'uppercase',
              animation: 'floatLogo 5s ease-in-out infinite 0.2s' 
            }}
          >
            Ваш безпечний простір
          </Text>
        </Box>

        <Box style={{ flex: '1 1 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 40px) clamp(16px, 4vw, 20px)', zIndex: 1 }}>
          <Box style={{ 
            width: '100%', 
            maxWidth: '400px', 
            backgroundColor: 'var(--lm-card-bg)', 
            borderRadius: 'clamp(20px, 4vw, 32px)', 
            border: '1px solid var(--lm-border)', 
            boxShadow: 'var(--lm-shadow-lg)', 
            padding: 'clamp(24px, 5vw, 44px) clamp(20px, 4vw, 36px)' 
          }}>
            
            <Title order={1} ta="center" style={{ color: 'var(--lm-dark)', fontWeight: 800, marginBottom: '8px', fontSize: 'clamp(20px, 4vw, 28px)' }}>
              {step === 'login' ? 'З поверненням!' : step === 'register-info' ? 'Створіть акаунт' : step === 'forgot-password' ? 'Відновлення' : step === 'reset-password' ? 'Новий пароль' : 'Перевірка пошти'}
            </Title>

            <Text ta="center" mb={32} style={{ color: 'var(--lm-muted)', fontWeight: 500, fontSize: '14px' }}>
              {step === 'login' ? 'Увійдіть у свій безпечний простір' : step === 'forgot-password' ? 'Введіть email для скидання пароля' : step === 'reset-password' ? 'Введіть код з пошти та новий пароль' : 'Заповніть дані нижче'}
            </Text>

            <form onSubmit={(e) => { 
              e.preventDefault(); 
              if (step === 'register-info' || step === 'forgot-password') {
                handleSendOtp();
              } else {
                handleSubmit();
              }
            }}>
              <Stack gap="md">
                
                {(step === 'login' || step === 'register-info' || step === 'forgot-password') && (
                  <>
                    {step === 'register-info' && (
                      <TextInput placeholder="Як до вас звертатися?" radius="xl" size="md" value={fullName} onChange={(e) => setFullName(e.currentTarget.value)} styles={{ input: { backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)', height: '50px' } }} />
                    )}
                    <TextInput placeholder="Ваш Email" radius="xl" size="md" value={email} onChange={(e) => setEmail(e.currentTarget.value)} styles={{ input: { backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)', height: '50px' } }} />

                    {(step === 'login' || step === 'register-info') && (
                      <PasswordInput placeholder="Пароль" radius="xl" size="md" value={password} onChange={(e) => setPassword(e.currentTarget.value)} styles={{ input: { backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)', height: '50px' }, innerInput: { backgroundColor: 'transparent' } }} />
                    )}
                  </>
                )}

                {(step === 'register-otp' || step === 'reset-password') && (
                  <>
                    <Text ta="center" size="sm" fw={600} mb={-10} style={{ color: 'var(--lm-dark)' }}>Код з пошти:</Text>
                    <Center mb="sm">
                      <PinInput length={6} size="xl" value={otp} onChange={setOtp} type="number" />
                    </Center>
                    
                    {step === 'reset-password' && (
                      <PasswordInput placeholder="Введіть новий пароль" radius="xl" size="md" value={password} onChange={(e) => setPassword(e.currentTarget.value)} styles={{ input: { backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)', height: '50px' }, innerInput: { backgroundColor: 'transparent' } }} />
                    )}
                  </>
                )}

                {step === 'login' && loginAttempts > 0 && (
                  <Text size="xs" c="red" ta="right">Спроб залишилось: {3 - loginAttempts}</Text>
                )}

                {step === 'login' && (
                  <Anchor component="button" type="button" size="sm" ta="right" c="dimmed" onClick={() => setStep('forgot-password')}>Забули пароль?</Anchor>
                )}

                <Button
                  type="submit"
                  fullWidth size="md" radius="xl" loading={loading} disabled={loginAttempts >= 3 && step === 'login'}
                  style={{ background: 'var(--lm-orange)', color: '#fff', fontWeight: 700, height: '50px' }}
                >
                  {step === 'login' ? 'Увійти' : step === 'register-info' ? 'Далі' : step === 'forgot-password' ? 'Отримати код' : 'Підтвердити'}
                </Button>
              </Stack>
            </form>

            <Group justify="center" mt="xl">
              <Text size="sm" style={{ color: 'var(--lm-muted)', fontWeight: 500 }}>
                {step === 'login' ? 'Немає акаунту? ' : 'Вже маєте акаунт? '}
                <Anchor component="button" fw={700} style={{ color: 'var(--lm-orange)' }} onClick={() => { setStep(step === 'login' ? 'register-info' : 'login'); setOtp(''); setPassword(''); }}>
                  {step === 'login' ? 'Зареєструйтесь' : 'Авторизуйтесь'}
                </Anchor>
              </Text>
            </Group>
          </Box>
        </Box>
      </Box>
    </>
  );
}