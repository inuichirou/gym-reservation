import { useEffect, useState } from 'react'
import { fetchMemberDashboard, type MemberDashboardData } from '../../lib/stats'

interface MyDashboardProps {
  memberId: string
  memberName: string
  onLogout: () => void
}

// 会員パーソナルダッシュボード（スマホ最適化）
export function MyDashboard({ memberId, memberName, onLogout }: MyDashboardProps) {
  const [data, setData] = useState<MemberDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemberDashboard(memberId)
      .then(setData)
      .finally(() => setLoading(false))
  }, [memberId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <p className="text-xl text-gray-400 animate-pulse">読み込み中...</p>
      </div>
    )
  }

  if (!data) return null

  const maxMonthly = Math.max(...data.monthlyHistory.map((m) => m.count), 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* ヘッダー */}
      <header className="bg-indigo-600 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm">会員番号 {memberId}</p>
            <h1 className="text-xl font-bold">{memberName} さん</h1>
          </div>
          <button onClick={onLogout}
            className="bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-lg px-4 py-2 transition-all active:scale-95">
            戻る
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* モチベーションメッセージ */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-lg font-bold">{data.motivationMessage}</p>
        </div>

        {/* 主要指標 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-indigo-600">{data.thisMonthCount}</p>
            <p className="text-sm text-gray-500 mt-1">今月の出席</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-emerald-600">{data.thisMonthRate}%</p>
            <p className="text-sm text-gray-500 mt-1">出席率</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-amber-600">{data.streak}</p>
            <p className="text-sm text-gray-500 mt-1">連続日数</p>
          </div>
        </div>

        {/* 累計 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <span className="text-gray-600 font-medium">累計出席回数</span>
          <span className="text-2xl font-bold text-indigo-600">{data.totalCount} 回</span>
        </div>

        {/* 月別グラフ */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-base font-bold text-gray-700 mb-3">月別出席回数</h3>
          <div className="flex items-end gap-2 h-32">
            {data.monthlyHistory.map((month) => (
              <div key={month.label} className="flex-1 flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">{month.count}</span>
                <div
                  className="w-full bg-indigo-400 rounded-t-lg transition-all"
                  style={{
                    height: `${(month.count / maxMonthly) * 100}%`,
                    minHeight: month.count > 0 ? '8px' : '2px',
                    backgroundColor: month.count > 0 ? undefined : '#e5e7eb',
                  }}
                />
                <span className="text-xs text-gray-500 mt-1">{month.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 今月のカレンダー */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-base font-bold text-gray-700 mb-3">
            今月の出席カレンダー
          </h3>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
              <span key={d} className="text-xs text-gray-400 font-medium py-1">
                {d}
              </span>
            ))}
            {/* 月初の曜日分の空セル */}
            {(() => {
              const now = new Date()
              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
              return Array.from({ length: firstDay }, (_, i) => (
                <span key={`empty-${i}`} />
              ))
            })()}
            {data.calendarDays.map((day) => (
              <div
                key={day.day}
                className={`text-sm font-medium rounded-lg py-1.5 ${
                  day.isToday
                    ? 'ring-2 ring-indigo-400'
                    : ''
                } ${
                  day.attended
                    ? 'bg-indigo-500 text-white'
                    : day.isFuture
                      ? 'text-gray-300'
                      : 'text-gray-500 bg-gray-50'
                }`}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
