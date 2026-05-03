import { useState } from 'react';
import { TextInput, PasswordInput, Button, Title, Group, Anchor, Text, Stack, Image, Box, PinInput, Center } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState<'login' | 'register-info' | 'register-otp'>('login');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email || !password || !fullName) {
      alert('Будь ласка, заповніть всі поля');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      setStep('register-otp'); 
    } catch (error: any) {
      alert('Помилка: ' + (error.response?.data?.message || 'Не вдалося відправити код'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (step === 'register-otp' && otp.length < 6) {
      alert('Введіть 6-значний код');
      return;
    }

    setLoading(true);
    try {
      const endpoint = step === 'login' ? '/auth/login' : '/auth/register';
      const payload = step === 'login' 
        ? { email, password } 
        : { email, password, fullName, otp }; 

      const response = await api.post(endpoint, payload);

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));

        if (user.isOnboarded) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (error: any) {
      alert('Помилка: ' + (error.response?.data?.message || 'Щось пішло не так'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--lm-bg)',
        backgroundImage: 'radial-gradient(circle at top left, var(--lm-bg-alt) 0%, transparent 60%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box style={{
        position: 'absolute', top: '-15%', left: '-10%', width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,106,83,0.12) 0%, rgba(232,106,83,0.04) 40%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <Box style={{
        position: 'absolute', bottom: '-20%', right: '-5%', width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(43,69,78,0.06) 0%, rgba(43,69,78,0.02) 40%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />
      <Box style={{
        position: 'absolute', top: '40%', right: '30%', width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,106,83,0.06) 0%, transparent 60%)',
        filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <Box
        style={{
          flex: '1 1 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
        }}
        visibleFrom="md"
      >
        <Box style={{
          position: 'absolute', top: '10%', left: '10%', width: '120px', height: '120px',
          borderRadius: '50%', border: '1.5px solid rgba(232,106,83,0.12)',
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <Box style={{
          position: 'absolute', bottom: '15%', right: '15%', width: '80px', height: '80px',
          borderRadius: '50%', border: '1.5px solid rgba(43,69,78,0.08)',
          pointerEvents: 'none',
          animation: 'float 5s ease-in-out infinite 1s',
        }} />
        <Box style={{
          position: 'absolute', top: '55%', left: '5%', width: '50px', height: '50px',
          borderRadius: '50%',
          background: 'rgba(232,106,83,0.06)',
          pointerEvents: 'none',
          animation: 'float 7s ease-in-out infinite 0.5s',
        }} />
        <Box style={{
          position: 'absolute', top: '20%', right: '10%', width: '36px', height: '36px',
          borderRadius: '50%',
          background: 'rgba(43,69,78,0.04)',
          pointerEvents: 'none',
          animation: 'float 4s ease-in-out infinite 2s',
        }} />

        <Box
          className="animate-float"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box style={{
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'var(--lm-card-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--lm-shadow-lg)',
            border: '1px solid var(--lm-border)',
            overflow: 'hidden',
          }}>
            <Image
              src="./vite.png"
              fit="cover"
              alt="Limen Fox Logo"
              style={{
                width: '100%',  
                height: '100%',
              }}
            />
          </Box>

          <Box style={{ textAlign: 'center' }}>
            <Text
              style={{
                fontSize: '13px',
                color: 'var(--lm-muted)',
                letterSpacing: '2px',
                marginTop: '6px',
                fontWeight: 500,
              }}
            >
              Ваш безпечний простір
            </Text>
          </Box>
        </Box>
      </Box>

      <Box
        style={{
          flex: '1 1 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          className="animate-slideUp"
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: 'var(--lm-card-bg)',
            backdropFilter: 'blur(32px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
            borderRadius: '32px',
            border: '1px solid var(--lm-border)',
            boxShadow: 'var(--lm-shadow-lg)',
            padding: 'clamp(30px, 5vw, 52px) clamp(24px, 4vw, 40px) clamp(28px, 4vw, 44px)',
          }}
        >
          <Box hiddenFrom="md" style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Image
              src="./vite.png"
              fit="contain"
              alt="Limen Fox Logo"
              style={{
                maxHeight: '100px',
                margin: '0 auto',
                filter: 'drop-shadow(0 4px 12px rgba(232,106,83,0.15))',
              }}
            />
          </Box>

          <Box style={{
            width: '40px',
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, var(--lm-orange), rgba(232,106,83,0.3))',
            margin: '0 auto 24px',
          }} />

          <Title
            order={1}
            ta="center"
            style={{
              color: 'var(--lm-dark)',
              fontSize: 'clamp(22px, 5vw, 30px)',
              fontWeight: 800,
              marginBottom: '8px',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
            }}
          >
            {step === 'login' ? 'З поверненням!' : step === 'register-info' ? 'Створіть акаунт' : 'Перевірка пошти'}
          </Title>

          <Text
            ta="center"
            mb={36}
            style={{
              color: 'var(--lm-muted)',
              fontSize: 'clamp(13px, 0.9rem, 15px)',
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {step === 'login' ? 'Увійдіть у свій безпечний простір' : step === 'register-info' ? 'Ваш безпечний простір чекає на вас' : `Ми відправили код на ${email}`}
          </Text>

          <Stack gap="md">
            {step !== 'register-otp' && (
              <>
                {step === 'register-info' && (
                  <TextInput
                    placeholder="Як до вас звертатися?"
                    radius="xl"
                    size="lg"
                    styles={{
                      input: {
                        backgroundColor: 'var(--lm-bg-input)',
                        border: '1px solid transparent',
                        color: 'var(--lm-dark)',
                        fontSize: 'clamp(13px, 0.9rem, 15px)',
                        padding: '12px 22px',
                        height: '54px',
                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                        '&:focus': {
                          borderColor: 'var(--lm-orange)',
                          backgroundColor: 'var(--lm-card-bg)',
                          boxShadow: '0 0 0 3px rgba(232,106,83,0.1)',
                        },
                        '&::placeholder': {
                          color: 'var(--lm-muted)',
                          fontWeight: 400,
                        }
                      }
                    }}
                    value={fullName}
                    onChange={(e) => setFullName(e.currentTarget.value)}
                  />
                )}

                <TextInput
                  placeholder="Ваш Email"
                  radius="xl"
                  size="lg"
                  styles={{
                    input: {
                      backgroundColor: 'var(--lm-bg-input)',
                      border: '1px solid transparent',
                      color: 'var(--lm-dark)',
                      fontSize: 'clamp(13px, 0.9rem, 15px)',
                      padding: '12px 22px',
                      height: '54px',
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                      '&:focus': {
                        borderColor: 'var(--lm-orange)',
                        backgroundColor: 'var(--lm-card-bg)',
                        boxShadow: '0 0 0 3px rgba(232,106,83,0.1)',
                      },
                      '&::placeholder': {
                        color: 'var(--lm-muted)',
                        fontWeight: 400,
                      }
                    }
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />

                <PasswordInput
                  placeholder="Пароль"
                  radius="xl"
                  size="lg"
                  styles={{
                    input: {
                      backgroundColor: 'var(--lm-bg-input)',
                      border: '1px solid transparent',
                      color: 'var(--lm-dark)',
                      fontSize: 'clamp(13px, 0.9rem, 15px)',
                      padding: '12px 22px',
                      height: '54px',
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                      '&:focus-within': {
                        borderColor: 'var(--lm-orange)',
                        backgroundColor: 'var(--lm-card-bg)',
                        boxShadow: '0 0 0 3px rgba(232,106,83,0.1)',
                      },
                      '&::placeholder': {
                        color: 'var(--lm-muted)',
                        fontWeight: 400,
                      }
                    },
                    innerInput: {
                      backgroundColor: 'transparent',
                    }
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />
              </>
            )}

            {step === 'register-otp' && (
              <Center mb="lg">
                <PinInput 
                  length={6} 
                  size="xl" 
                  value={otp} 
                  onChange={setOtp} 
                  type="number" 
                  styles={{ 
                    input: { 
                      borderColor: 'transparent', 
                      backgroundColor: 'var(--lm-bg-input)', 
                      color: 'var(--lm-dark)', 
                      fontWeight: 700,
                      '&:focus': {
                        borderColor: 'var(--lm-orange)',
                        backgroundColor: 'var(--lm-card-bg)'
                      }
                    } 
                  }}
                />
              </Center>
            )}

            <Button
              fullWidth
              mt="lg"
              size="lg"
              radius="xl"
              loading={loading}
              onClick={step === 'register-info' ? handleSendOtp : handleSubmit}
              style={{
                background: 'linear-gradient(135deg, #E86A53 0%, #D65A44 100%)',
                color: '#fff',
                fontSize: 'clamp(14px, 1rem, 16px)',
                fontWeight: 700,
                height: '54px',
                border: 'none',
                boxShadow: 'var(--lm-shadow-orange)',
                transition: 'all 0.35s cubic-bezier(0.2,0.8,0.2,1)',
                letterSpacing: '0.3px',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'linear-gradient(135deg, #D65A44 0%, #c04a38 100%)',
                    transform: 'translateY(-3px)',
                  },
                  '&:active': {
                    transform: 'translateY(-1px)',
                  }
                }
              }}
            >
              {step === 'login' ? 'Увійти' : step === 'register-info' ? 'Далі' : 'Приєднатися'}
            </Button>
          </Stack>

          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '28px 0 4px',
          }}>
            <Box style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--lm-border), transparent)' }} />
          </Box>

          <Group justify="center" mt="sm">
            <Text size="sm" style={{ color: 'var(--lm-muted)', fontSize: '14px', fontWeight: 500 }}>
              {step === 'login' ? 'Немає акаунту? ' : 'Вже маєте акаунт? '}
              <Anchor
                component="button"
                fw={700}
                onClick={() => { 
                  setStep(step === 'login' ? 'register-info' : 'login'); 
                  setOtp(''); 
                }}
                style={{
                  color: 'var(--lm-orange)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  borderBottom: '1.5px solid rgba(232,106,83,0.3)',
                  paddingBottom: '1px',
                  transition: 'all 0.25s ease',
                }}
              >
                {step === 'login' ? 'Зареєструйтесь' : 'Авторизуйтесь'}
              </Anchor>
            </Text>
          </Group>
        </Box>
      </Box>
    </Box>
  );
}