import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage'; 
import { CreatePostPage } from './pages/CreatePostPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyPostsPage } from './pages/MyPostsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { EditPostPage } from './pages/EditPostPage';
const Placeholder = ({ title }: { title: string }) => (
    <h1 style={{ textAlign: 'center', marginTop: '50px', color: '#0F7EAA' }}>
        Сторінка "{title}" в розробці...
    </h1>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/my-posts" element={<MyPostsPage />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
     <Route path="/create-post" element={<CreatePostPage />} />
      <Route path="/specialists" element={<Placeholder title="Пошук спеціалістів" />} />
      <Route path="/ai-chat" element={<Placeholder title="AI Асистент" />} />
      <Route path="/edit-post/:id" element={<EditPostPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;