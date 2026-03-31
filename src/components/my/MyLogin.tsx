import { useState } from 'react'
import { loginMember } from '../../lib/members'

interface MyLoginProps {
  onLogin: (memberId: string, name: string) => void
}

// 会員パーソナルページのログイン（スマホ向け）
export function MyLogin({ onLogin }: MyLoginProps) {
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const trimmed = memberId.trim()
    if (!trimmed || !/^\d{1,5}$/.test(trimmed)) {
      setError('会員番号を正しく入力してください。')
      return
    }

    setLoading(true)
    try {
      const member = await loginMember(trimmed)
      if (!member) {
        setError('この会員番号は登録されていません。')
        return
      }
      onLogin(member.member_id, member.name)
    } catch {
      setError('ログインに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      setMemberId((prev) => prev.slice(0, -1))
    } else if (key === 'clear') {
      setMemberId('')
    } else if (memberId.length < 5) {
      setMemberId((prev) => prev + key)
    }
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-3">📊</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">マイページ</h1>
        <p className="text-gray-500 mb-6">会員番号を入力してください</p>

        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 px-6 text-3xl font-mono tracking-[0.4em] text-gray-800 min-h-[56px] flex items-center justify-center mb-4">
          {memberId || (
            <span className="text-gray-300 tracking-normal text-lg">会員番号</span>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 rounded-xl py-2 px-3 text-base font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1','2','3','4','5','6','7','8','9'].map((key) => (
            <button key={key} onClick={() => handleKeyPress(key)}
              className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 text-2xl font-bold rounded-xl py-3 transition-all active:scale-95 select-none">
              {key}
            </button>
          ))}
          <button onClick={() => handleKeyPress('clear')}
            className="bg-orange-100 text-orange-600 text-base font-bold rounded-xl py-3 transition-all active:scale-95 select-none">
            クリア
          </button>
          <button onClick={() => handleKeyPress('0')}
            className="bg-gray-100 text-gray-800 text-2xl font-bold rounded-xl py-3 transition-all active:scale-95 select-none">
            0
          </button>
          <button onClick={() => handleKeyPress('delete')}
            className="bg-orange-100 text-orange-600 text-base font-bold rounded-xl py-3 transition-all active:scale-95 select-none">
            ←
          </button>
        </div>

        <button onClick={handleSubmit} disabled={!memberId || loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white text-xl font-bold rounded-2xl py-4 transition-all active:scale-[0.98] select-none shadow-lg">
          {loading ? '読み込み中...' : 'マイページを見る'}
        </button>
      </div>
    </div>
  )
}
