import React, { useState, useEffect } from 'react';
import { Screen, Task } from './types';
import { storage } from './storage';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TaskScreen } from './screens/TaskScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';
import { AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './Toast';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);

  useEffect(() => {
    const isDark = storage.getIsDarkMode();
    document.documentElement.classList.toggle('dark', isDark);

    // Detect Firebase password reset link: ?mode=resetPassword&oobCode=xxx
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'resetPassword' && params.get('oobCode')) {
      setOobCode(params.get('oobCode'));
      setCurrentScreen('ResetPassword');
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!loading && currentScreen !== 'ResetPassword') {
      setCurrentScreen(user ? 'Home' : 'Login');
    }
  }, [user, loading]);

  const navigateTo = (screen: Screen, task?: Task) => {
    if (screen === 'AddEditTask') setEditingTask(task || null);
    setCurrentScreen(screen);
  };

  if (loading && currentScreen !== 'ResetPassword') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden text-gray-900 dark:text-white font-sans selection:bg-blue-200 dark:selection:bg-blue-900 relative">
      <AnimatePresence mode="wait">
        {currentScreen === 'ResetPassword' && oobCode && (
          <ResetPasswordScreen key="reset" oobCode={oobCode}
            onDone={() => { setOobCode(null); navigateTo('Login'); }} />
        )}

        {currentScreen !== 'ResetPassword' && !user && (
          <LoginScreen key="login" onLogin={() => navigateTo('Home')} />
        )}

        {currentScreen !== 'ResetPassword' && user && currentScreen === 'Home' && (
          <HomeScreen key="home"
            onNavigateAdd={() => navigateTo('AddEditTask')}
            onNavigateEdit={(task) => navigateTo('AddEditTask', task)}
            onNavigateProfile={() => navigateTo('Profile')} />
        )}

        {currentScreen !== 'ResetPassword' && user && currentScreen === 'AddEditTask' && (
          <TaskScreen key="task" task={editingTask}
            onBack={() => navigateTo('Home')}
            onSave={() => navigateTo('Home')} />
        )}

        {currentScreen !== 'ResetPassword' && user && currentScreen === 'Profile' && (
          <ProfileScreen key="profile"
            onBack={() => navigateTo('Home')}
            onLogout={() => navigateTo('Login')} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
