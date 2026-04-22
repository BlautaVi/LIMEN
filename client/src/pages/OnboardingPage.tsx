import { useState } from 'react';
import { Title, Container, Text, Grid, Button, Paper, Stack, Group, Image, Center, Box, ThemeIcon, LoadingOverlay, Anchor } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const QUESTIONS = [
  {
    id: 1,
    question: 'Як часто Ви відчуваєте стрес або тривогу?',
    options: ['Майже ніколи', 'Іноді (раз на тиждень)', 'Часто (кілька разів на тиждень)', 'Постійно'],
  },
  {
    id: 2,
    question: 'Як би Ви оцінили якість свого сну?',
    options: ['Сплю чудово', 'Іноді прокидаюсь вночі', 'Важко заснути', 'Страждаю від безсоння'],
  },
  {
    id: 3,
    question: 'Чи легко Вам ділитися своїми емоціями з іншими?',
    options: ['Так, я відверта/ий зі всіма', 'Тільки з близькими', 'Мені важко ділитись з іншими', 'Тримаю все в собі'],
  },
  {
    id: 4,
    question: 'Що зараз турбує Вас найбільше?',
    options: ['Робота / Навчання', 'Відносини / Сім’я', 'Самотність', 'Невпевненість у майбутньому'],
  },
  {
    id: 5,
    question: 'Як Ви зазвичай справляєтесь з поганим настроєм?',
    options: ['Спілкуюсь з друзями', 'Замикаюсь у собі', 'Займаюсь хобі / спортом', 'Шукаю підтримки у фахівців'],
  },
  {
    id: 6,
    question: 'Чи відчуваєте Ви підтримку від свого оточення?',
    options: ['Так, повну підтримку', 'Частково', 'Майже не відчуваю', 'Я зовсім один/одна'],
  },
  {
    id: 7,
    question: 'Чи був у Вас досвід роботи з психологом?',
    options: ['Так, регулярний', 'Був кілька разів', 'Ні, але хочу спробувати', 'Ні, і не планую'],
  },
  {
    id: 8,
    question: 'Як часто у Вас бувають різкі перепади настрою?',
    options: ['Настрій стабільний', 'Залежить від обставин', 'Досить часто', 'Кілька разів на день'],
  },
  {
    id: 9,
    question: 'Яка Ваша головна ціль на цій платформі?',
    options: ['Знайти друзів', 'Отримати пораду психолога', 'Вести щоденник емоцій', 'Просто виговоритись'],
  },
  {
    id: 10,
    question: 'Як Ви оцінюєте свій рівень енергії сьогодні?',
    options: ['Повний сил', 'Нормальний рівень', 'Трохи втомлений', 'Вичавлений як лимон'],
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ id: number, answer: string, index: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUESTIONS.length - 1;

  const handleNext = async () => {
    if (selectedOptionIndex === null) return;
    const updatedAnswers = [...answers, { id: currentQuestion.id, answer: currentQuestion.options[selectedOptionIndex], index: selectedOptionIndex }];
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      setLoading(true);
      try {
        const res = await api.post('/users/onboarding', { answers: updatedAnswers });
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.isOnboarded = true;
        user.personalityType = res.data.personalityType;
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } catch (error) { console.error(error); alert('Помилка збереження результатів'); } finally { setLoading(false); }
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelectedOptionIndex(null);
    }
  };

  const handleSkip = async () => {
    try {
      const response = await api.post('/users/onboarding', { answers: [] });
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (error) { navigate('/dashboard'); }
  };

  const progressPercent = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <Box pt={{ base: 30, md: 40 }} pb={{ base: 40, md: 60 }} style={{ backgroundColor: 'var(--lm-bg)', minHeight: '100vh', position: 'relative' }}>
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
      <Container size="lg" px={{ base: 'md', sm: 'xl' }}>

        <Box mb={{ base: 24, md: 40 }} style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Box style={{ height: '6px', backgroundColor: 'var(--lm-border)', borderRadius: 'var(--lm-radius-full)', overflow: 'hidden' }}>
            <Box style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'var(--lm-orange)', borderRadius: 'var(--lm-radius-full)', transition: 'width 0.5s var(--lm-spring)' }} />
          </Box>
        </Box>

        <Title ta="center" order={2} style={{ color: 'var(--lm-muted)', marginBottom: '8px', fontWeight: 600, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Крок {currentStep + 1} з {QUESTIONS.length}
        </Title>
        <Text ta="center" mb={{ base: 30, md: 50 }} fw={800} style={{ color: 'var(--lm-dark)', fontSize: 'clamp(24px, 5vw, 30px)' }}>
          Аналізуємо ваш стан...
        </Text>

        <Grid align="center" gutter={{ base: 30, md: 60 }}>
          <Grid.Col span={{ base: 12, md: 6 }} display={{ base: 'none', md: 'block' }}>
            <Center>
              <Image
                src="https://st4.depositphotos.com/17134304/26411/v/600/depositphotos_264114218-stock-illustration-friends-giving-high-five-flat.jpg"
                alt="Illustration"
                className="animate-float"
                style={{ maxWidth: '420px', width: '100%', borderRadius: 'var(--lm-radius-lg)', mixBlendMode: 'multiply', filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.06))' }}
              />
            </Center>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box className="animate-scaleIn" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <Paper shadow="md" radius="xl" style={{ overflow: 'hidden', border: '1px solid var(--lm-border)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--lm-shadow-md)' }}>
                <Box p={{ base: 20, sm: 30 }} bg="white" style={{ minHeight: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Text fw={800} style={{ color: 'var(--lm-dark)', lineHeight: 1.4, fontSize: 'clamp(18px, 4vw, 22px)' }}>
                    {currentQuestion.question}
                  </Text>
                </Box>

                <Box p={{ base: 20, sm: 30 }} style={{ backgroundColor: 'var(--lm-bg-alt)', flex: 1 }}>
                  <Stack gap={{ base: 'sm', sm: 'md' }}>
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedOptionIndex === index;
                      return (
                        <Box
                          key={option} onClick={() => setSelectedOptionIndex(index)}
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: '16px', 
                            padding: '14px 16px', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            border: isSelected ? '2px solid var(--lm-orange)' : '2px solid transparent',
                            boxShadow: isSelected ? '0 8px 24px rgba(232, 106, 83, 0.12)' : 'var(--lm-shadow-sm)',
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.25s var(--lm-spring)'
                          }}
                        >
                          <ThemeIcon size={26} radius="xl" variant="filled" color={isSelected ? 'orange' : 'gray.2'} style={{ marginRight: '12px', backgroundColor: isSelected ? 'var(--lm-orange)' : undefined, transition: 'all 0.2s', flexShrink: 0 }}>
                            {isSelected && <IconCheck size={16} stroke={3} />}
                          </ThemeIcon>
                          <Text style={{ color: isSelected ? 'var(--lm-dark)' : 'var(--lm-dark-soft)', fontWeight: isSelected ? 700 : 500, fontSize: '15px', lineHeight: 1.3 }}>{option}</Text>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Paper>

              <Button
                fullWidth size="lg" radius="xl" mt={{ base: 24, md: 40 }} onClick={handleNext} disabled={selectedOptionIndex === null}
                style={{
                  backgroundColor: selectedOptionIndex !== null ? 'var(--lm-orange)' : '#EAEAEA',
                  color: selectedOptionIndex !== null ? '#fff' : '#A0A0A0',
                  boxShadow: selectedOptionIndex !== null ? 'var(--lm-shadow-orange)' : 'none',
                  fontWeight: 700, fontSize: '16px', height: '54px', transition: 'all 0.3s var(--lm-ease)'
                }}
              >
                {isLastQuestion ? 'Отримати результат' : 'Продовжити'}
              </Button>

              <Center mt="lg">
                <Anchor component="button" onClick={handleSkip} style={{ color: 'var(--lm-muted)', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid var(--lm-muted)', transition: 'color 0.2s' }}>
                  Пропустити тест
                </Anchor>
              </Center>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}