import { useState } from 'react'
import { verifyAdminPassword } from '../../lib/admin'

interface AdminLoginProps {
  onLogin: () => void
}

// 管理者ログイン画面
export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (verifyAdminPassword(password)) {
      onLogin()
    } else {
      setError('パスワードが正しくありません。')
      setPassword('')
    }
  }

  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      setPassword((prev) => prev.slice(0, -1))
    } else if (key === 'clear') {
      setPassword('')
    } else if (password.length < 8) {
      setPassword((prev) => prev + key)
    }
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">管理者ログイン</h1>
        <p className="text-gray-500 mb-6 text-lg">パスワードを入力してください</p>

        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 px-6 text-3xl font-mono tracking-[0.5em] text-gray-800 min-h-[56px] flex items-center justify-center mb-4">
          {password ? '●'.repeat(password.length) : (
            <span className="text-gray-300 tracking-normal text-xl">パスワード</span>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 rounded-xl py-3 px-4 text-lg font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          {['1','2','3','4','5','6','7','8','9'].map((key) => (
            <button key={key} onClick={() => handleKeyPress(key)}
              className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 text-2xl font-bold rounded-2xl py-4 transition-all active:scale-95 select-none">
              {key}
            </button>
          ))}
          <button onClick={() => handleKeyPress('clear')}
            className="bg-orange-100 text-orange-600 text-lg font-bold rounded-2xl py-4 transition-all active:scale-95 select-none">
            クリア
          </button>
          <button onClick={() => handleKeyPress('0')}
            className="bg-gray-100 text-gray-800 text-2xl font-bold rounded-2xl py-4 transition-all active:scale-95 select-none">
            0
          </button>
          <button onClick={() => handleKeyPress('delete')}
            className="bg-orange-100 text-orange-600 text-lg font-bold rounded-2xl py-4 transition-all active:scale-95 select-none">
            ←
          </button>
        </div>

        <button onClick={handleSubmit} disabled={!password}
          className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300 text-white text-xl font-bold rounded-2xl py-4 transition-all active:scale-[0.98] select-none shadow-lg">
          ログイン
        </button>
      </div>
    </div>
  )
}
