import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// キオスク画面（タブレット用）
import { LoginScreen } from './components/LoginScreen'
import { RegisterScreen } from './components/RegisterScreen'
import { ReservationScreen } from './components/ReservationScreen'

// 管理者ダッシュボード
import { AdminLogin } from './components/admin/AdminLogin'
import { AdminDashboard } from './components/admin/AdminDashboard'

// 会員パーソナルページ
import { MyLogin } from './components/my/MyLogin'
import { MyDashboard } from './components/my/MyDashboard'

// タブレット用キオスクページ（/）
function KioskPage() {
  const [screen, setScreen] = useState<'login' | 'register' | 'reservation'>('login')
  const [memberId, setMemberId] = useState('')
  const [memberName, setMemberName] = useState('')

  const handleLogin = (id: string, name: string) => {
    setMemberId(id)
    setMemberName(name)
    setScreen('reservation')
  }

  const handleLogout = () => {
    setMemberId('')
    setMemberName('')
    setScreen('login')
  }

  return (
    <>
      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} onRegister={() => setScreen('register')} />
      )}
      {screen === 'register' && (
        <RegisterScreen onRegistered={() => setScreen('login')} onBack={() => setScreen('login')} />
      )}
      {screen === 'reservation' && (
        <ReservationScreen memberId={memberId} memberName={memberName} onLogout={handleLogout} />
      )}
    </>
  )
}

// 管理者ページ（/admin）
function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)

  return loggedIn ? (
    <AdminDashboard onLogout={() => setLoggedIn(false)} />
  ) : (
    <AdminLogin onLogin={() => setLoggedIn(true)} />
  )
}

// 会員マイページ（/my）
function MyPage() {
  const [memberId, setMemberId] = useState('')
  const [memberName, setMemberName] = useState('')

  const handleLogin = (id: string, name: string) => {
    setMemberId(id)
    setMemberName(name)
  }

  return memberId ? (
    <MyDashboard
      memberId={memberId}
      memberName={memberName}
      onLogout={() => { setMemberId(''); setMemberName('') }}
    />
  ) : (
    <MyLogin onLogin={handleLogin} />
  )
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '1.25rem', padding: '16px 24px', borderRadius: '16px' },
        }}
      />
      <Routes>
        <Route path="/" element={<KioskPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/my" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
