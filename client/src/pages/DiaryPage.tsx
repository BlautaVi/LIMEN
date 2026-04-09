import { useEffect, useState } from 'react';
import { Container, Title, Text, Paper, Textarea, Button, Group, Stack, Badge, Select, ActionIcon, Box, Loader, Center, Divider, Grid, Indicator } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconTrash, IconBook, IconSend, IconPencil, IconX } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';
import dayjs from 'dayjs';

const EMOTIONS = [
  { value: '😊 Радість', label: '😊 Радість' },
  { value: '😌 Спокій', label: '😌 Спокій' },
  { value: '😢 Сум', label: '😢 Сум' },
  { value: '😰 Тривога', label: '😰 Тривога' },
  { value: '😡 Злість', label: '😡 Злість' },
  { value: '🪫 Втома', label: '🪫 Втома' },
  { value: '😶‍🌫️ Мінливість', label: '😶‍🌫️ Мінливість' },
  { value: '🫤 Апатія', label: '🫤 Апатія' },
];

export function DiaryPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const [emotion, setEmotion] = useState<string | null>('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDiaries();
  }, []);

  const fetchDiaries = async () => {
    try {
      const response = await api.get('/diaries');
      setEntries(response.data);
    } catch (error) {
      console.error('Помилка завантаження щоденника', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!emotion || !content.trim()) return alert('Оберіть емоцію та напишіть текст!');
    
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/diaries/${editingId}`, { emotion, content });
      } else {
       await api.post('/diaries', { 
          emotion, 
          content, 
          date: selectedDate ? dayjs(selectedDate).toISOString() : dayjs().toISOString() 
        });
      }
      
      resetForm();
      fetchDiaries(); 
    } catch (error: any) {
      console.error('Помилка від сервера:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || 'Невідома помилка';
      alert(`Помилка при збереженні: ${JSON.stringify(errorMessage)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry._id);
    setEmotion(entry.emotion);
    setContent(entry.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setEmotion('');
    setContent('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей запис?')) return;
    try {
      await api.delete(`/diaries/${id}`);
      setEntries(entries.filter(entry => entry._id !== id));
      if (editingId === id) resetForm(); 
    } catch (error) {
      alert('Помилка при видаленні');
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (!selectedDate) return false;
    const entryDate = entry.date || entry.createdAt; 
    return dayjs(entryDate).isSame(selectedDate, 'day');
  });

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F5FDFF' }}>
      <Header />
      <Container size="lg" py="xl">
        <Group justify="center" mb="lg">
          <IconBook size={40} color="#0F7EAA" />
          <Title ta="center" order={1} style={{ color: '#0F7EAA' }}>
            Мій щоденник емоцій
          </Title>
        </Group>

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper shadow="md" radius="md" p="xl" style={{ border: '1px solid #E1F5FE', backgroundColor: '#fff', display: 'flex', justifyContent: 'center' }}>
              <Calendar
                maxDate={new Date()} 
                getDayProps={(date) => ({
                  selected: selectedDate ? dayjs(date).isSame(selectedDate, 'day') : false,
                  onClick: () => {
                    setSelectedDate(date);
                    resetForm();
                  },
                })}
                renderDay={(date) => {
                  const day = dayjs(date).date();
                  const hasEntry = entries.some(e => dayjs(e.date || e.createdAt).isSame(date, 'day'));
                  
                  return (
                    <Indicator size={6} color="cyan" offset={-2} disabled={!hasEntry}>
                      <div>{day}</div>
                    </Indicator>
                  );
                }}
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            
            <Paper shadow="md" radius="md" p="xl" mb="xl" style={{ border: '1px solid #E1F5FE', backgroundColor: editingId ? '#FFF9E6' : '#fff', transition: 'background-color 0.3s' }}>
              <Group justify="space-between" mb="md">
                <Title order={4} style={{ color: '#0F7EAA' }}>
                  {editingId ? 'Редагування запису' : `Як ви почуваєтесь ${selectedDate && dayjs(selectedDate).isSame(new Date(), 'day') ? 'сьогодні' : 'в цей день'}?`}
                </Title>
                {editingId && (
                  <Button variant="subtle" color="gray" size="xs" onClick={resetForm} leftSection={<IconX size={14} />}>
                    Скасувати
                  </Button>
                )}
              </Group>

              <Stack>
                <Select placeholder="Оберіть емоцію..." data={EMOTIONS} value={emotion} onChange={setEmotion} radius="md" />
                <Textarea placeholder="Запишіть свої думки..." minRows={3} radius="md" value={content} onChange={(e) => setContent(e.currentTarget.value)} />
                <Group justify="flex-end">
                  <Button color={editingId ? "yellow" : "cyan"} radius="md" rightSection={<IconSend size={16} />} loading={saving} onClick={handleSubmit}>
                    {editingId ? 'Зберегти зміни' : 'Додати запис'}
                  </Button>
                </Group>
              </Stack>
            </Paper>

            <Divider my="lg" label={selectedDate ? `Записи за ${dayjs(selectedDate).format('DD.MM.YYYY')}` : 'Оберіть дату'} labelPosition="center" />

            {loading ? (
              <Center mt={50}><Loader color="cyan" /></Center>
            ) : filteredEntries.length === 0 ? (
              <Text ta="center" c="dimmed" mt={30} fs="italic">У цей день немає записів.</Text>
            ) : (
              <Stack gap="md">
                {filteredEntries.map((entry) => (
                  <Paper key={entry._id} shadow="sm" p="lg" radius="md" style={{ border: '1px solid #E1F5FE', position: 'relative' }}>
                    <Group style={{ position: 'absolute', top: 15, right: 15 }} gap={5}>
                      <ActionIcon color="yellow" variant="subtle" onClick={() => handleEdit(entry)}>
                        <IconPencil size={18} />
                      </ActionIcon>
                      <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(entry._id)}>
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>

                    <Group mb="sm">
                      <Badge size="lg" color="cyan" variant="light">{entry.emotion}</Badge>
                      <Text size="xs" c="dimmed">
                        {new Date(entry.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Group>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', color: '#444' }}>{entry.content}</Text>
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}