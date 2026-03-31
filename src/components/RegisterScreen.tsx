import { useState } from 'react'
import { registerMember } from '../lib/members'
import toast from 'react-hot-toast'

interface RegisterScreenProps {
  onRegistered: () => void
  onBack: () => void
}

// 会員登録画面：会員番号と名前を入力して新規登録
export function RegisterScreen({ onRegistered, onBack }: RegisterScreenProps) {
  const [memberId, setMemberId] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async () => {
    const trimmedId = memberId.trim()
    const trimmedName = name.trim()

    if (!trimmedId) {
      setError('会員番号を入力してください。')
      return
    }
    if (!/^\d{1,5}$/.test(trimmedId)) {
      setError('会員番号は1〜5桁の数字で入力してください。')
      return
    }
    if (!trimmedName) {
      setError('名前を入力してください。')
      return
    }

    setError('')
    setProcessing(true)

    try {
      await registerMember(trimmedId, trimmedName)
      toast.success(`会員番号 ${trimmedId} で登録しました！`)
      onRegistered()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '登録に失敗しました'
      )
    } finally {
      setProcessing(false)
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg text-center">
        {/* タイトル */}
        <div className="mb-6">
          <div className="text-5xl mb-3">📝</div>
          <h1 className="text-3xl font-bold text-gray-800">新規会員登録</h1>
          <p className="text-gray-500 mt-2 text-lg">
            会員番号と名前を入力してください
          </p>
        </div>

        {/* 会員番号表示 */}
        <div className="mb-4">
          <label className="block text-left text-gray-600 font-medium mb-1 text-lg">
            会員番号
          </label>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 px-6 text-3xl font-mono tracking-[0.5em] text-gray-800 min-h-[60px] flex items-center justify-center">
            {memberId || (
              <span className="text-gray-300 tracking-normal text-xl">
                5桁の数字
              </span>
            )}
          </div>
        </div>

        {/* テンキー */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'].map(
            (key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`${
                  key === 'clear' || key === 'delete'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-800'
                } hover:bg-gray-200 active:bg-gray-300 text-xl font-bold rounded-xl py-3 transition-all active:scale-95 select-none`}
              >
                {key === 'delete' ? '←' : key === 'clear' ? 'C' : key}
              </button>
            )
          )}
        </div>

        {/* 名前入力 */}
        <div className="mb-4">
          <label className="block text-left text-gray-600 font-medium mb-1 text-lg">
            名前
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="例：山田 太郎"
            className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-xl focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 rounded-xl py-3 px-4 text-lg font-medium">
            {error}
          </div>
        )}

        {/* 登録ボタン */}
        <button
          onClick={handleSubmit}
          disabled={!memberId || !name.trim() || processing}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-2xl font-bold rounded-2xl py-5 transition-all duration-100 active:scale-[0.98] select-none shadow-lg mb-4"
        >
          {processing ? '登録中...' : '登録する'}
        </button>

        {/* 戻るボタン */}
        <button
          onClick={onBack}
          className="w-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 text-xl font-bold rounded-2xl py-4 transition-all duration-100 active:scale-[0.98] select-none"
        >
          ← ログイン画面に戻る
        </button>
      </div>
    </div>
  )
}
