import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage'; 
import { CreatePostPage } from './pages/CreatePostPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyPostsPage } from './pages/MyPostsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { EditPostPage } from './pages/EditPostPage';
import { SpecialistProfilePage } from './pages/SpecialistProfilePage';
import { SpecialistsPage } from './pages/SpecialistsPage';
import { DiaryPage } from './pages/DiaryPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ChatsPage } from './pages/ChatsPage';
import { AiChatPage } from './pages/AiChatPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage'; 

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
      <Route path="/specialists/:id" element={<SpecialistProfilePage />} />
      <Route path="/specialists" element={<SpecialistsPage />} />
      <Route path="/diary" element={<DiaryPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/user/:id" element={<UserProfilePage />} />
      <Route path="/edit-post/:id" element={<EditPostPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/chats" element={<ChatsPage />} />
      <Route path="/ai-chat" element={<AiChatPage />} />
      <Route path="/chats/:id" element={<ChatsPage />} />
    </Routes>
  );
}

export default App;