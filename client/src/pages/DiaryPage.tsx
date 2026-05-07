import { useEffect, useState } from 'react';
import { Container, Title, Text, Paper, Textarea, Button, Group, Stack, Badge, Select, ActionIcon, Box, Loader, Center, Divider, Grid, Indicator, ThemeIcon, Modal, AspectRatio, Collapse } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconTrash, IconBook, IconSend, IconPencil, IconX, IconChartBar, IconPrinter, IconDownload, IconTrendingUp, IconBulb } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const EMOTIONS = [
  { value: '😊 Радість', label: '😊 Радість', score: 5 },
  { value: '😌 Спокій', label: '😌 Спокій', score: 4 },
  { value: '😶‍🌫️ Мінливість', label: '😶‍🌫️ Мінливість', score: 3 },
  { value: '🫤 Апатія', label: '🫤 Апатія', score: 2 },
  { value: '🪫 Втома', label: '🪫 Втома', score: 2 },
  { value: '😢 Сум', label: '😢 Сум', score: 1 },
  { value: '😰 Тривога', label: '😰 Тривога', score: 1 },
  { value: '😡 Злість', label: '😡 Злість', score: 1 },
];

const ASPECTS = [
  { value: 'Робота/Навчання', label: 'Робота/Навчання' },
  { value: 'Стосунки', label: 'Стосунки' },
  { value: 'Війна/Новини', label: 'Війна/Новини' },
  { value: 'Внутрішній стан', label: 'Внутрішній стан' },
  { value: 'Сім\'я', label: 'Сім\'я' },
  { value: 'Здоров\'я', label: 'Здоров\'я' },
  { value: 'Інше', label: 'Інше' },
];

const getCategoryByEmotion = (emotion: string) => {
  if (['😊 Радість', '😌 Спокій'].includes(emotion)) return 'positive';
  if (['😰 Тривога', '😡 Злість', '😶‍🌫️ Мінливість'].includes(emotion)) return 'anxiety';
  if (['😢 Сум', '🪫 Втома', '🫤 Апатія'].includes(emotion)) return 'lowEnergy';
  return null;
};

export function DiaryPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [videosDb, setVideosDb] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const [emotion, setEmotion] = useState<string | null>('');
  const [aspect, setAspect] = useState<string | null>('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportEntries, setReportEntries] = useState<any[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [diariesRes, videosRes] = await Promise.all([
        api.get('/diaries'),
        api.get('/videos').catch(() => ({ data: [] }))
      ]);
      setEntries(diariesRes.data);
      setVideosDb(videosRes.data);
    } catch (error) {
      console.error('Помилка завантаження даних', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!emotion || videosDb.length === 0) {
      setRecommendation(null);
      return;
    }
    
    const category = getCategoryByEmotion(emotion);
    if (category) {
      const randomVid = videosDb[Math.floor(Math.random() * videosDb.length)];
      
      let message = "Ось корисне відео для вашого стану 🤍";
      if (category === 'positive') message = "Чудово, що ви почуваєтесь добре! ✨ Спробуйте насолодитися цією розслабляючою атмосферою.";
      if (category === 'anxiety') message = "Здається, ви відчуваєте напругу. 🫂 Спробуйте цю практику, щоб заспокоїти нервову систему.";
      if (category === 'lowEnergy') message = "Коли немає сил, дозвольте собі відпочити. ☁️ Це відео допоможе м'яко відновити ресурс.";
      
      setRecommendation({ ...randomVid, message });
    } else {
      setRecommendation(null);
    }
  }, [emotion, videosDb]);

  const handleSubmit = async () => {
    if (!emotion || !aspect || !content.trim()) return alert('Оберіть емоцію, аспект життя та напишіть текст!');

    setSaving(true);
    try {
      const dateToSave = selectedDate
        ? dayjs(selectedDate).hour(12).minute(0).second(0).toISOString()
        : dayjs().toISOString();

      if (editingId) {
        await api.put(`/diaries/${editingId}`, { emotion, aspect, content, date: dateToSave });
      } else {
        await api.post('/diaries', { emotion, aspect, content, date: dateToSave });
      }

      resetForm();
      const response = await api.get('/diaries');
      setEntries(response.data);
    } catch (error: any) {
      alert(`Помилка при збереженні: ${error.response?.data?.message || 'Невідома помилка'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry._id);
    setEmotion(entry.emotion);
    setAspect(entry.aspect || '');
    setContent(entry.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setEmotion('');
    setAspect('');
    setContent('');
    setRecommendation(null);
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

  const generateMonthlyReport = async () => {
    const currentMonthEntries = entries.filter(e => dayjs(e.date || e.createdAt).isSame(dayjs(), 'month'));

    if (currentMonthEntries.length === 0) {
      alert('У цьому місяці ще немає записів для аналізу.');
      return;
    }

    setGeneratingReport(true);
    setIsReportOpen(true);

    const sortedEntries = [...currentMonthEntries].sort((a, b) =>
      dayjs(a.date || a.createdAt).valueOf() - dayjs(b.date || b.createdAt).valueOf()
    );
    setReportEntries(sortedEntries);

    const entriesTextForAi = currentMonthEntries.map(e => `- ${dayjs(e.date || e.createdAt).format('DD.MM')}: ${e.emotion} (Сфера: ${e.aspect || 'Не вказано'})`).join('\n');
    const prompt = `Проаналізуй мої емоції за цей місяць. Ось мої записи:\n${entriesTextForAi}\n\nНапиши дуже теплий, емпатичний звіт. Скажи, з якою сферою пов'язано найбільше тривоги/смутку, або де було найбільше радості. Дай одну маленьку теплу пораду на наступний місяць. Використовуй Markdown (жирний шрифт для акцентів). Не пиши вступних фраз, тільки сам звіт.`;

    try {
      const response = await api.post('/ai/chat', { message: prompt });
      setReportContent(response.data.reply);
    } catch (error) {
      console.error(error);
      setReportContent('Ой, здається, мої нейронні зв\'язки трохи втомилися через навантаження на сервери. Спробуйте згенерувати звіт трохи пізніше. 🦊');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('report-print-area');
    if (!element) return;

    setIsDownloading(true);
    element.style.display = 'block';

    const opt = {
      margin: 15,
      filename: `LIMEN_Звіт_${dayjs().format('MM_YYYY')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
      setIsDownloading(false);
    }).catch((err: any) => {
      console.error('Помилка генерації PDF', err);
      element.style.display = 'none';
      setIsDownloading(false);
      alert('Не вдалося згенерувати PDF. Спробуйте ще раз.');
    });
  };

  const filteredEntries = entries.filter(entry => {
    if (!selectedDate) return false;
    const entryDate = entry.date || entry.createdAt;
    return dayjs(entryDate).format('YYYY-MM-DD') === dayjs(selectedDate).format('YYYY-MM-DD');
  });

  const inputStyles = {
    input: {
      backgroundColor: 'var(--lm-bg-input)', borderColor: 'transparent', color: 'var(--lm-dark)',
      fontWeight: 500, fontSize: '16px', padding: '16px 24px', transition: 'all 0.3s var(--lm-ease)',
      '&:focus': { borderColor: 'var(--lm-orange)', backgroundColor: 'var(--lm-card-bg)', boxShadow: '0 0 0 3px rgba(232, 106, 83, 0.12)' }
    }
  };

  const getChartData = () => {
    const thirtyDaysAgo = dayjs().subtract(30, 'day');
    const recentEntries = entries.filter(e => dayjs(e.date || e.createdAt).isAfter(thirtyDaysAgo));
    recentEntries.sort((a, b) => dayjs(a.date || a.createdAt).valueOf() - dayjs(b.date || b.createdAt).valueOf());

    return recentEntries.map(e => {
      const emotionObj = EMOTIONS.find(em => em.value === e.emotion);
      return {
        date: dayjs(e.date || e.createdAt).format('DD.MM'),
        score: emotionObj ? emotionObj.score : 3,
        emotion: e.emotion,
        aspect: e.aspect
      };
    });
  };

  const chartData = getChartData();

  return (
    <Box className="page-content" style={{ minHeight: '100vh', backgroundColor: 'var(--lm-bg)' }}>
      <Header />

      <Modal
        opened={isReportOpen} onClose={() => setIsReportOpen(false)}
        title={
          <Group gap="sm">
            <ThemeIcon color="orange" variant="light" radius="xl" size="lg" style={{ backgroundColor: 'var(--lm-warm)' }}><IconChartBar size={20} /></ThemeIcon>
            <Text fw={800} size="xl" style={{ color: 'var(--lm-dark)', letterSpacing: '-0.5px' }}>Ваш емоційний підсумок</Text>
          </Group>
        }
        centered radius="xl" size="lg" overlayProps={{ blur: 4, opacity: 0.4 }}
        styles={{ content: { padding: '24px', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-lg)', backgroundColor: 'var(--lm-card-bg)' } }}
      >
        {generatingReport ? (
          <Center h={150} flexDirection="column" gap="md">
            <Loader color="orange" type="dots" size="xl" />
            <Text size="sm" fw={600} c="dimmed">Штучний інтелект аналізує ваші записи...</Text>
          </Center>
        ) : (
          <Stack gap="xl">
            <Box style={{ fontSize: '16px', lineHeight: 1.6, color: 'var(--lm-dark-soft)', '& p': { margin: '0 0 10px 0' }, '& strong': { fontWeight: 800, color: 'var(--lm-dark)' } }}>
              <ReactMarkdown>{reportContent}</ReactMarkdown>
            </Box>

            <Group grow={true} preventGrowOverflow={false} wrap="wrap">
              <Button variant="light" color="orange" radius="xl" size="md" leftSection={<IconPrinter size={18} />} onClick={() => window.print()} style={{ flexBasis: '100%' }}>
                Роздрукувати
              </Button>
              <Button color="violet" radius="xl" size="md" leftSection={<IconDownload size={18} />} onClick={handleDownloadPdf} loading={isDownloading} style={{ flexBasis: '100%' }}>
                Зберегти PDF
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Box id="report-print-area" style={{ display: 'none', background: '#fff', color: '#2b454e', fontFamily: 'sans-serif', padding: '20px' }}>
        <div className="print-header"><h2>Емоційний підсумок LIMEN</h2><p>Звіт за {dayjs().format('MM.YYYY')}</p></div>
        <div className="print-ai-report"><ReactMarkdown>{reportContent}</ReactMarkdown></div>
        <hr className="print-divider" />
        <div className="print-entries-section">
          <h3>Ваші детальні записи за місяць:</h3>
          {reportEntries.map((entry, idx) => (
            <div key={idx} className="print-entry">
              <div className="print-entry-header"><strong>{dayjs(entry.date || entry.createdAt).format('DD.MM.YYYY')}</strong><span> • {entry.emotion} {entry.aspect ? `(${entry.aspect})` : ''}</span></div>
              <p className="print-entry-content">{entry.content}</p>
            </div>
          ))}
        </div>
      </Box>

      <style>{`
        #report-print-area .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f0ebe1; padding-bottom: 15px; }
        #report-print-area .print-header h2 { margin: 0 0 5px 0; color: #2b454e; font-size: 24px; }
        #report-print-area .print-header p { margin: 0; color: #85969c; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        #report-print-area .print-ai-report { font-size: 16px; line-height: 1.6; margin-bottom: 40px; color: #4a5b61; }
        #report-print-area .print-ai-report strong { color: #2b454e; }
        #report-print-area .print-divider { border: 0; border-top: 1px dashed #d9d9d9; margin: 30px 0; }
        #report-print-area .print-entries-section h3 { margin-bottom: 20px; color: #2b454e; font-size: 18px; }
        #report-print-area .print-entry { margin-bottom: 20px; page-break-inside: avoid; }
        #report-print-area .print-entry-header { margin-bottom: 5px; }
        #report-print-area .print-entry-header strong { color: #e86a53; }
        #report-print-area .print-entry-header span { color: #85969c; font-size: 14px; }
        #report-print-area .print-entry-content { margin: 0; padding: 12px 16px; border-left: 3px solid #e86a53; background-color: #faf9f6 !important; font-style: italic; color: #4a5b61; font-size: 15px; line-height: 1.5; }
        @media print { body * { visibility: hidden; } html, body { height: auto !important; overflow: visible !important; background: #fff !important; } #report-print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; visibility: visible; } #report-print-area * { visibility: visible; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      `}</style>

      <Container size="lg" pt={{ base: 20, md: 60 }} pb={{ base: 100, sm: 80 }} px={{ base: 'md', sm: 'xl' }}>

        <Group justify="space-between" align="center" mb={{ base: 30, md: 50 }} className="animate-slideUp" wrap="wrap">
          <Group gap="md">
            <ThemeIcon size={{ base: 45, md: 60 }} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)' }}>
              <IconBook size={26} stroke={2.5} />
            </ThemeIcon>
            <Title order={1} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 34px)' }}>
              Щоденник емоцій
            </Title>
          </Group>
          <Button
            variant="light" color="orange" radius="xl" size="md" leftSection={<IconChartBar size={18} />}
            onClick={generateMonthlyReport}
            style={{ fontWeight: 700, width: '100%', maxWidth: '300px' }}
          >
            Підсумок місяця
          </Button>
        </Group>

        <Grid gutter={{ base: 20, md: 60 }}>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper
              shadow="none" radius="xl" p={{ base: 16, sm: 30 }} className="animate-slideUp-delay-1"
              style={{ border: '1px solid var(--lm-border)', backgroundColor: 'var(--lm-card-bg)', display: 'flex', justifyContent: 'center', boxShadow: 'var(--lm-shadow-sm)' }}
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
              shadow="none" radius="xl" p={{ base: 20, md: 40 }} mb={40} className="animate-slideUp-delay-2"
              style={{ border: editingId ? '1px solid var(--lm-orange)' : '1px solid var(--lm-border)', backgroundColor: editingId ? 'var(--lm-orange-light)' : 'var(--lm-card-bg)', transition: 'all 0.3s var(--lm-ease)', boxShadow: 'var(--lm-shadow-sm)' }}
            >
              <Group justify="space-between" mb="xl" wrap="wrap">
                <Title order={3} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: 'clamp(18px, 3vw, 22px)' }}>
                  {editingId ? 'Редагування запису' : `Як ви почуваєтесь ${selectedDate && dayjs(selectedDate).isSame(new Date(), 'day') ? 'сьогодні' : 'в цей день'}?`}
                </Title>
                {editingId && (
                  <Button variant="subtle" color="gray" size="sm" radius="xl" onClick={resetForm} leftSection={<IconX size={16} />} style={{ color: 'var(--lm-muted)' }}>
                    Скасувати
                  </Button>
                )}
              </Group>

              <Stack gap="lg">
                <Group grow wrap="wrap">
                  <Select placeholder="Емоція..." data={EMOTIONS.map(e => ({ value: e.value, label: e.label }))} value={emotion} onChange={setEmotion} radius="xl" size="md" styles={inputStyles} style={{ minWidth: '150px' }} />
                  <Select placeholder="Сфера життя..." data={ASPECTS} value={aspect} onChange={setAspect} radius="xl" size="md" styles={inputStyles} style={{ minWidth: '150px' }} />
                </Group>

                <Collapse in={!!recommendation}>
                  {recommendation && (
                    <Paper p="lg" radius="xl" style={{ backgroundColor: 'var(--lm-bg-alt)', border: '1px solid var(--lm-border)' }}>
                      <Group gap="sm" mb="sm" wrap="nowrap" align="flex-start">
                        <ThemeIcon size={34} radius="xl" variant="light" style={{ backgroundColor: 'var(--lm-card-bg)', color: 'var(--lm-orange)', flexShrink: 0 }}>
                          <IconBulb size={18} stroke={2.5} />
                        </ThemeIcon>
                        <Text size="sm" fw={500} style={{ color: 'var(--lm-dark)', lineHeight: 1.5 }}>
                          {recommendation.message}
                        </Text>
                      </Group>
                      
                      <AspectRatio ratio={16 / 9} mx="auto" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--lm-border)' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${recommendation.youtubeId}`}
                          title={recommendation.title}
                          style={{ border: 0 }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </AspectRatio>
                    </Paper>
                  )}
                </Collapse>

                <Textarea
                  placeholder="Запишіть свої думки, деталі чи переживання..." minRows={4} radius="xl" size="md"
                  value={content} onChange={(e) => setContent(e.currentTarget.value)}
                  styles={{ ...inputStyles, input: { ...inputStyles.input, borderRadius: '24px', paddingTop: '16px', paddingBottom: '16px' } }}
                />
                
                <Group justify="flex-end" mt="sm">
                  <Button
                    radius="xl" size="md" rightSection={<IconSend size={18} />} loading={saving} onClick={handleSubmit} fullWidth={false}
                    style={{ backgroundColor: 'var(--lm-orange)', color: '#fff', fontWeight: 700, boxShadow: 'var(--lm-shadow-orange)', transition: 'transform 0.25s var(--lm-ease)' }}
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
              <Paper p={{ base: 30, md: 40 }} radius="xl" ta="center" style={{ border: '2px dashed var(--lm-border)', backgroundColor: 'transparent' }}>
                <Text size="md" fw={500} style={{ color: 'var(--lm-muted)' }}>
                  У цей день немає записів.
                </Text>
              </Paper>
            ) : (
              <Stack gap="lg">
                {filteredEntries.map((entry) => (
                  <Paper
                    key={entry._id} shadow="none" p={{ base: 20, md: 30 }} radius="xl" className="card-hover"
                    style={{ border: '1px solid var(--lm-border)', backgroundColor: 'var(--lm-card-bg)', position: 'relative', boxShadow: 'var(--lm-shadow-sm)' }}
                  >
                    <Group style={{ position: 'absolute', top: 16, right: 16 }} gap={5}>
                      <ActionIcon color="gray" variant="subtle" radius="xl" size="md" onClick={() => handleEdit(entry)} style={{ transition: 'color 0.2s', '&:hover': { color: 'var(--lm-orange)', backgroundColor: 'var(--lm-orange-light)' } }}>
                        <IconPencil size={18} stroke={1.5} />
                      </ActionIcon>
                      <ActionIcon color="red" variant="subtle" radius="xl" size="md" onClick={() => handleDelete(entry._id)} style={{ '&:hover': { backgroundColor: 'var(--lm-orange-light)' } }}>
                        <IconTrash size={18} stroke={1.5} />
                      </ActionIcon>
                    </Group>

                    <Group mb="md" gap="xs" style={{ paddingRight: '60px' }}>
                      <Badge size="md" color="orange" variant="light" radius="sm">{entry.emotion}</Badge>
                      {entry.aspect && <Badge size="md" color="gray" variant="outline" radius="sm">{entry.aspect}</Badge>}
                      <Text size="xs" fw={600} ml="xs" style={{ color: 'var(--lm-muted)' }}>
                        {new Date(entry.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Group>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', color: 'var(--lm-dark-soft)', lineHeight: 1.6 }}>{entry.content}</Text>
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid.Col>
        </Grid>

        {chartData.length >= 2 && (
          <Paper p={{ base: 24, md: 40 }} radius="30px" mt={60} className="animate-slideUp" style={{ border: '1px solid var(--lm-border)', backgroundColor: 'var(--lm-card-bg)', boxShadow: 'var(--lm-shadow-sm)' }}>
            <Group mb="xl" gap="sm">
              <ThemeIcon size={40} radius="xl" variant="light" style={{ backgroundColor: 'var(--lm-orange-light)', color: 'var(--lm-orange)' }}>
                <IconTrendingUp size={20} stroke={2.5} />
              </ThemeIcon>
              <Title order={3} style={{ color: 'var(--lm-dark)', fontWeight: 800 }}>Динаміка настрою (останні 30 днів)</Title>
            </Group>
            
            <Box h={{ base: 250, md: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--lm-orange)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--lm-orange)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--lm-border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--lm-muted)', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis hide domain={[0, 6]} />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Paper p="sm" radius="md" style={{ border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-md)', backgroundColor: 'var(--lm-card-bg)' }}>
                            <Text fw={800} size="sm" style={{ color: 'var(--lm-dark)' }}>{data.date}</Text>
                            <Text size="sm" mt={4} fw={600} style={{ color: 'var(--lm-orange)' }}>{data.emotion}</Text>
                            {data.aspect && <Text size="xs" mt={2} c="dimmed">Сфера: {data.aspect}</Text>}
                          </Paper>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="var(--lm-orange)" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

      </Container>
    </Box>
  );
}