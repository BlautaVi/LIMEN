import { useEffect, useState } from 'react';
import { Container, Title, Text, Paper, Textarea, Button, Group, Stack, Badge, Select, ActionIcon, Box, Loader, Center, Divider, Grid, Indicator, ThemeIcon } from '@mantine/core';
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
      const dateToSave = selectedDate
        ? dayjs(selectedDate).hour(12).minute(0).second(0).toISOString()
        : dayjs().toISOString();

      if (editingId) {
        await api.put(`/diaries/${editingId}`, { emotion, content, date: dateToSave });
      } else {
        await api.post('/diaries', { emotion, content, date: dateToSave });
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
    return dayjs(entryDate).format('YYYY-MM-DD') === dayjs(selectedDate).format('YYYY-MM-DD');
  });

  const inputStyles = {
    input: {
      backgroundColor: 'var(--lm-bg-input)',
      borderColor: 'transparent',
      color: 'var(--lm-dark)',
      fontWeight: 500,
      fontSize: '16px',
      padding: '20px 24px',
      transition: 'all 0.3s var(--lm-ease)',
      '&:focus': {
        borderColor: 'var(--lm-orange)',
        backgroundColor: '#fff',
        boxShadow: '0 0 0 3px rgba(232, 106, 83, 0.12)'
      }
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />
      <Container size="lg" pt={{ base: 30, md: 60 }} pb={80}>

        <Group justify="center" mb={50} className="animate-slideUp">
          <ThemeIcon size={60} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)' }}>
            <IconBook size={32} stroke={2.5} />
          </ThemeIcon>
          <Title ta="center" order={1} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: '34px' }}>
            Щоденник емоцій
          </Title>
        </Group>

        <Grid gutter={{ base: 30, md: 60 }}>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper
              shadow="none" radius="xl" p={30}
              className="animate-slideUp-delay-1"
              style={{ border: '1px solid var(--lm-border)', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', boxShadow: 'var(--lm-shadow-sm)' }}
            >
              <Calendar
                maxDate={new Date()}
                size="md"
                styles={{
                  day: { borderRadius: '50%', fontWeight: 600, color: 'var(--lm-dark-soft)', '&[data-selected]': { backgroundColor: 'var(--lm-orange)', color: '#fff' }, '&[data-selected]:hover': { backgroundColor: 'var(--lm-orange-hover)' } },
                  calendarHeader: { color: 'var(--lm-dark)', fontWeight: 700 }
                }}
                getDayProps={(date) => ({
                  selected: selectedDate ? dayjs(date).format('YYYY-MM-DD') === dayjs(selectedDate).format('YYYY-MM-DD') : false,
                  onClick: () => {
                    setSelectedDate(date);
                    resetForm();
                  },
                })}
                renderDay={(date) => {
                  const day = dayjs(date).date();
                  const dateStr = dayjs(date).format('YYYY-MM-DD');
                  const hasEntry = entries.some(e => dayjs(e.date || e.createdAt).format('YYYY-MM-DD') === dateStr);

                  return (
                    <Indicator size={6} color="orange" offset={-2} disabled={!hasEntry}>
                      <div>{day}</div>
                    </Indicator>
                  );
                }}
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>

            <Paper
              shadow="none" radius="xl" p={{ base: 24, md: 40 }} mb={40}
              className="animate-slideUp-delay-2"
              style={{
                border: editingId ? '1px solid #F5D3CE' : '1px solid var(--lm-border)',
                backgroundColor: editingId ? '#FFFBF8' : '#fff',
                transition: 'all 0.3s var(--lm-ease)',
                boxShadow: 'var(--lm-shadow-sm)'
              }}
            >
              <Group justify="space-between" mb="xl">
                <Title order={3} style={{ color: 'var(--lm-dark)', fontWeight: 800 }}>
                  {editingId ? 'Редагування запису' : `Як ви почуваєтесь ${selectedDate && dayjs(selectedDate).isSame(new Date(), 'day') ? 'сьогодні' : 'в цей день'}?`}
                </Title>
                {editingId && (
                  <Button variant="subtle" color="gray" size="sm" radius="xl" onClick={resetForm} leftSection={<IconX size={16} />} style={{ color: 'var(--lm-muted)' }}>
                    Скасувати
                  </Button>
                )}
              </Group>

              <Stack gap="lg">
                <Select placeholder="Оберіть емоцію..." data={EMOTIONS} value={emotion} onChange={setEmotion} radius="xl" size="lg" styles={inputStyles} />
                <Textarea
                  placeholder="Запишіть свої думки, деталі чи переживання..." minRows={4} radius="xl" size="lg"
                  value={content} onChange={(e) => setContent(e.currentTarget.value)}
                  styles={{ ...inputStyles, input: { ...inputStyles.input, borderRadius: '24px', paddingTop: '20px', paddingBottom: '20px' } }}
                />
                <Group justify="flex-end" mt="sm">
                  <Button
                    radius="xl" size="lg" rightSection={<IconSend size={18} />} loading={saving} onClick={handleSubmit}
                    style={{
                      backgroundColor: 'var(--lm-orange)', color: '#fff', fontWeight: 700,
                      boxShadow: 'var(--lm-shadow-orange)', transition: 'transform 0.25s var(--lm-ease)'
                    }}
                    styles={{ root: { '&:hover': { transform: 'translateY(-2px)', backgroundColor: 'var(--lm-orange-hover)' } } }}
                  >
                    {editingId ? 'Зберегти зміни' : 'Зберегти в щоденник'}
                  </Button>
                </Group>
              </Stack>
            </Paper>

            <Divider my="xl" label={<Text size="sm" fw={700} c="var(--lm-muted)">{selectedDate ? `Записи за ${dayjs(selectedDate).format('DD.MM.YYYY')}` : 'Оберіть дату'}</Text>} labelPosition="center" color="var(--lm-border)" />

            {loading ? (
              <Center mt={50}><Loader color="orange" /></Center>
            ) : filteredEntries.length === 0 ? (
              <Paper p={40} radius="xl" ta="center" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent' }}>
                <Text size="lg" fw={500} style={{ color: 'var(--lm-muted)' }}>
                  У цей день немає записів.
                </Text>
              </Paper>
            ) : (
              <Stack gap="lg">
                {filteredEntries.map((entry) => (
                  <Paper
                    key={entry._id} shadow="none" p={30} radius="xl"
                    className="card-hover"
                    style={{ border: '1px solid var(--lm-border)', backgroundColor: '#fff', position: 'relative', boxShadow: 'var(--lm-shadow-sm)' }}
                  >
                    <Group style={{ position: 'absolute', top: 20, right: 20 }} gap={5}>
                      <ActionIcon color="gray" variant="subtle" radius="xl" size="lg" onClick={() => handleEdit(entry)} style={{ transition: 'color 0.2s', '&:hover': { color: 'var(--lm-orange)', backgroundColor: 'var(--lm-orange-light)' } }}>
                        <IconPencil size={20} stroke={1.5} />
                      </ActionIcon>
                      <ActionIcon color="red" variant="subtle" radius="xl" size="lg" onClick={() => handleDelete(entry._id)} style={{ '&:hover': { backgroundColor: 'var(--lm-orange-light)' } }}>
                        <IconTrash size={20} stroke={1.5} />
                      </ActionIcon>
                    </Group>

                    <Group mb="md">
                      <Badge size="lg" color="orange" variant="light" radius="sm">{entry.emotion}</Badge>
                      <Text size="sm" fw={600} style={{ color: 'var(--lm-muted)' }}>
                        {new Date(entry.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Group>
                    <Text size="md" style={{ whiteSpace: 'pre-wrap', color: 'var(--lm-dark-soft)', lineHeight: 1.6 }}>{entry.content}</Text>
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