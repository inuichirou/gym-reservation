import { useState } from 'react'
import { LoginScreen } from './components/LoginScreen'
import { RegisterScreen } from './components/RegisterScreen'
import { ReservationScreen } from './components/ReservationScreen'
import { Toaster } from 'react-hot-toast'

type Screen = 'login' | 'register' | 'reservation'

function App() {
  const [screen, setScreen] = useState<Screen>('login')
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
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '1.25rem',
            padding: '16px 24px',
            borderRadius: '16px',
          },
        }}
      />

      {screen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onRegister={() => setScreen('register')}
        />
      )}

      {screen === 'register' && (
        <RegisterScreen
          onRegistered={() => setScreen('login')}
          onBack={() => setScreen('login')}
        />
      )}

      {screen === 'reservation' && (
        <ReservationScreen
          memberId={memberId}
          memberName={memberName}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}

export default App
