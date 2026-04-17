import { useEffect, useState } from 'react';
import { Container, Title, Text, Paper, Textarea, Button, Group, Stack, Badge, Select, ActionIcon, Box, Loader, Center, Divider, Grid, Indicator, ThemeIcon, Modal } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconTrash, IconBook, IconSend, IconPencil, IconX, IconChartBar, IconPrinter, IconDownload } from '@tabler/icons-react';
import { Header } from '../components/Header';
import api from '../services/api';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import html2pdf from 'html2pdf.js';

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

const ASPECTS = [
  { value: 'Робота/Навчання', label: 'Робота/Навчання' },
  { value: 'Стосунки', label: 'Стосунки' },
  { value: 'Війна/Новини', label: 'Війна/Новини' },
  { value: 'Внутрішній стан', label: 'Внутрішній стан' },
  { value: 'Сім\'я', label: 'Сім\'я' },
  { value: 'Здоров\'я', label: 'Здоров\'я' },
  { value: 'Інше', label: 'Інше' },
];

export function DiaryPage() {
  const [entries, setEntries] = useState<any[]>([]);
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
      fetchDiaries();
    } catch (error: any) {
      console.error('Помилка від сервера:', error.response?.data || error.message);
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
      margin:       15,
      filename:     `LIMEN_Звіт_${dayjs().format('MM_YYYY')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
      
      <Modal 
        opened={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        title={
          <Group gap="sm">
            <ThemeIcon color="orange" variant="light" radius="xl" size="lg" style={{ backgroundColor: 'var(--lm-warm)' }}><IconChartBar size={20} /></ThemeIcon>
            <Text fw={800} size="xl" style={{ color: 'var(--lm-dark)', letterSpacing: '-0.5px' }}>Ваш емоційний підсумок</Text>
          </Group>
        }
        centered radius="xl" size="lg" overlayProps={{ blur: 4, opacity: 0.4 }}
        styles={{ content: { padding: '24px', border: '1px solid var(--lm-border)', boxShadow: 'var(--lm-shadow-lg)' } }}
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

            <Group grow>
              <Button variant="light" color="orange" radius="xl" size="md" leftSection={<IconPrinter size={18} />} onClick={() => window.print()}>
                Роздрукувати
              </Button>
              <Button 
                color="violet" 
                radius="xl" 
                size="md" 
                leftSection={<IconDownload size={18} />} 
                onClick={handleDownloadPdf}
                loading={isDownloading}
              >
                Зберегти PDF
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Box id="report-print-area" style={{ display: 'none', background: '#fff', color: '#2b454e', fontFamily: 'sans-serif', padding: '20px' }}>
        <div className="print-header">
          <h2>Емоційний підсумок LIMEN</h2>
          <p>Звіт за {dayjs().format('MM.YYYY')}</p>
        </div>
        
        <div className="print-ai-report">
          <ReactMarkdown>{reportContent}</ReactMarkdown>
        </div>
        
        <hr className="print-divider" />
        
        <div className="print-entries-section">
          <h3>Ваші детальні записи за місяць:</h3>
          {reportEntries.map((entry, idx) => (
            <div key={idx} className="print-entry">
              <div className="print-entry-header">
                <strong>{dayjs(entry.date || entry.createdAt).format('DD.MM.YYYY')}</strong> 
                <span> • {entry.emotion} {entry.aspect ? `(${entry.aspect})` : ''}</span>
              </div>
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

        @media print {
          body * { 
            visibility: hidden; 
          }
          
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: #fff !important;
          }

          #report-print-area { 
            display: block !important; 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            visibility: visible; 
          }
          
          #report-print-area * { 
            visibility: visible; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <Container size="lg" pt={{ base: 30, md: 60 }} pb={80}>

        <Group justify="space-between" align="center" mb={50} className="animate-slideUp">
          <Group>
            <ThemeIcon size={60} radius="100%" variant="light" style={{ backgroundColor: 'var(--lm-warm)', color: 'var(--lm-orange)' }}>
              <IconBook size={32} stroke={2.5} />
            </ThemeIcon>
            <Title order={1} style={{ color: 'var(--lm-dark)', fontWeight: 800, fontSize: '34px' }}>
              Щоденник емоцій
            </Title>
          </Group>
          <Button 
            variant="light" color="orange" radius="xl" size="md" leftSection={<IconChartBar size={18} />}
            onClick={generateMonthlyReport}
            style={{ fontWeight: 700 }}
          >
            Підсумок місяця
          </Button>
        </Group>

        <Grid gutter={{ base: 30, md: 60 }}>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper
              shadow="none" radius="xl" p={30} className="animate-slideUp-delay-1"
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
              shadow="none" radius="xl" p={{ base: 24, md: 40 }} mb={40} className="animate-slideUp-delay-2"
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
                <Group grow>
                  <Select placeholder="Емоція..." data={EMOTIONS} value={emotion} onChange={setEmotion} radius="xl" size="lg" styles={inputStyles} />
                  <Select placeholder="Сфера життя..." data={ASPECTS} value={aspect} onChange={setAspect} radius="xl" size="lg" styles={inputStyles} />
                </Group>
                
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
                    key={entry._id} shadow="none" p={30} radius="xl" className="card-hover"
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

                    <Group mb="md" gap="xs">
                      <Badge size="lg" color="orange" variant="light" radius="sm">{entry.emotion}</Badge>
                      {entry.aspect && <Badge size="lg" color="gray" variant="outline" radius="sm">{entry.aspect}</Badge>}
                      <Text size="sm" fw={600} ml="xs" style={{ color: 'var(--lm-muted)' }}>
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