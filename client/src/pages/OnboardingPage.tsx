import { useState } from 'react';
import {
  Title,
  Container,
  Text,
  Grid,
  Button,
  Paper,
  Stack,
  Group,
  Image,
  Center,
  Box,
  ThemeIcon
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

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
    options: ['Так, я відкрита книга', 'Тільки з близькими', 'Мені важко відкриватись', 'Тримаю все в собі'],
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUESTIONS.length - 1;

  const handleNext = () => {
    if (!selectedOption) return;

    if (isLastQuestion) {
      navigate('/dashboard'); 
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelectedOption(null); 
    }
  };

  return (
    <Box style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '40px 0' }}>
      <Container size="lg">
        
        <Title ta="center" order={1} style={{ color: '#0F7EAA', marginBottom: '10px' }}>
          Дайте відповідь на кілька питань
        </Title>
        <Text ta="center" size="lg" c="dimmed" mb={50} style={{ color: '#0F7EAA' }}>
          Це допоможе нам покращити ваш досвід
        </Text>

        <Grid align="center" gutter={50}>
          
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Center>
              <Image 
                src="https://img.freepik.com/free-vector/colleagues-giving-high-five_23-2148380453.jpg"
                alt="High five"
                style={{ maxWidth: '400px', width: '100%' }} 
              />
            </Center>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box style={{ maxWidth: '500px', margin: '0 auto' }}>
              
              <Paper 
                shadow="md" 
                radius="md" 
                style={{ overflow: 'hidden', border: '1px solid #eee' }}
              >
                
                <Box p="xl" bg="white">
                  <Text fw={700} size="lg" style={{ color: '#0F7EAA' }}>
                    {currentQuestion.id}. {currentQuestion.question}
                  </Text>
                </Box>

                <Box p="xl" style={{ backgroundColor: '#E0F7FA' }}> 
                  <Stack gap="sm">
                    {currentQuestion.options.map((option) => {
                      const isSelected = selectedOption === option;
                      return (
                        <Box
                          key={option}
                          onClick={() => setSelectedOption(option)}
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            border: isSelected ? '2px solid #0F7EAA' : '2px solid transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          <ThemeIcon 
                            size={24} 
                            radius="md" 
                            variant="filled" 
                            color={isSelected ? 'cyan' : 'gray.3'}
                            style={{ marginRight: '15px' }}
                          >
                             {isSelected && <IconCheck size={16} />}
                          </ThemeIcon>
                          
                          <Text style={{ color: '#0F7EAA', fontWeight: 500 }}>{option}</Text>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Paper>

              {/* КНОПКА ПІДТВЕРДЖЕННЯ */}
              <Button 
                fullWidth 
                size="lg" 
                radius="xl" 
                mt="xl"
                onClick={handleNext}
                disabled={!selectedOption} 
                style={{ 
                  backgroundColor: '#4FCDFF',
                  boxShadow: '0 4px 10px #0F7EAA',
                  color: '#fff',
                  transition: 'opacity 0.2s'
                }}
              >
                {isLastQuestion ? 'Завершити' : 'Підтвердити відповідь'}
              </Button>

            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}