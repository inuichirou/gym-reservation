import { useState } from 'react'
import { loginMember } from '../lib/members'

interface LoginScreenProps {
  onLogin: (memberId: string, memberName: string) => void
  onRegister: () => void
}

// ログイン画面：会員番号を入力してログインする（DB照合あり）
export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const trimmed = memberId.trim()
    if (!trimmed) {
      setError('会員番号を入力してください。')
      return
    }
    if (!/^\d{1,5}$/.test(trimmed)) {
      setError('会員番号は1〜5桁の数字で入力してください。')
      return
    }

    setError('')
    setLoading(true)

    try {
      const member = await loginMember(trimmed)
      if (!member) {
        setError('この会員番号は登録されていません。')
        return
      }
      onLogin(member.member_id, member.name)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ログインに失敗しました'
      )
    } finally {
      setLoading(false)
    }
  }

  // テンキー入力
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg text-center">
        {/* ロゴ・タイトル */}
        <div className="mb-8">
          <div className="text-6xl mb-4">🏋️</div>
          <h1 className="text-3xl font-bold text-gray-800">
            ジム ワンタッチ予約
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            会員番号を入力してください
          </p>
        </div>

        {/* 会員番号表示 */}
        <div className="mb-6">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl py-5 px-6 text-4xl font-mono tracking-[0.5em] text-gray-800 min-h-[72px] flex items-center justify-center">
            {memberId || (
              <span className="text-gray-300 tracking-normal text-2xl">
                会員番号
              </span>
            )}
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 rounded-xl py-3 px-4 text-lg font-medium">
            {error}
          </div>
        )}

        {/* テンキー */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 text-3xl font-bold rounded-2xl py-5 transition-all duration-100 active:scale-95 select-none"
            >
              {key}
            </button>
          ))}
          <button
            onClick={() => handleKeyPress('clear')}
            className="bg-orange-100 hover:bg-orange-200 active:bg-orange-300 text-orange-600 text-xl font-bold rounded-2xl py-5 transition-all duration-100 active:scale-95 select-none"
          >
            クリア
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 text-3xl font-bold rounded-2xl py-5 transition-all duration-100 active:scale-95 select-none"
          >
            0
          </button>
          <button
            onClick={() => handleKeyPress('delete')}
            className="bg-orange-100 hover:bg-orange-200 active:bg-orange-300 text-orange-600 text-xl font-bold rounded-2xl py-5 transition-all duration-100 active:scale-95 select-none"
          >
            ←
          </button>
        </div>

        {/* ログインボタン */}
        <button
          onClick={handleSubmit}
          disabled={!memberId || loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-2xl font-bold rounded-2xl py-5 transition-all duration-100 active:scale-[0.98] select-none shadow-lg mb-4"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>

        {/* 新規登録リンク */}
        <button
          onClick={onRegister}
          className="w-full bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-700 text-xl font-bold rounded-2xl py-4 transition-all duration-100 active:scale-[0.98] select-none"
        >
          📝 新規会員登録はこちら
        </button>
      </div>
    </div>
  )
}
