import { useState } from 'react'
import { LoginScreen } from './components/LoginScreen'
import { ReservationScreen } from './components/ReservationScreen'
import { Toaster } from 'react-hot-toast'

function App() {
  const [memberId, setMemberId] = useState<string | null>(null)

  return (
    <>
      {/* トースト通知 */}
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

      {/* ログイン前：ログイン画面 / ログイン後：予約画面 */}
      {memberId ? (
        <ReservationScreen
          memberId={memberId}
          onLogout={() => setMemberId(null)}
        />
      ) : (
        <LoginScreen onLogin={setMemberId} />
      )}
    </>
  )
}

export default App
