import { useEffect, useState } from 'react'
import {
  fetchReservationsByDate,
  fetchAllMemberStats,
  type ReservationWithName,
  type MemberStats,
} from '../../lib/admin'
import { getTodayDate } from '../../lib/reservations'

interface AdminDashboardProps {
  onLogout: () => void
}

// 管理者ダッシュボード：予約一覧と出席統計
export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [date, setDate] = useState(getTodayDate())
  const [reservations, setReservations] = useState<ReservationWithName[]>([])
  const [memberStats, setMemberStats] = useState<MemberStats[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'today' | 'stats'>('today')

  useEffect(() => {
    loadData()
  }, [date])

  const loadData = async () => {
    setLoading(true)
    try {
      const [res, stats] = await Promise.all([
        fetchReservationsByDate(date),
        fetchAllMemberStats(),
      ])
      setReservations(res)
      setMemberStats(stats)
    } catch {
      // エラー
    } finally {
      setLoading(false)
    }
  }

  // 表示用の日付フォーマット
  const formatDisplayDate = (d: string) => {
    const [y, m, day] = d.split('-')
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][
      new Date(Number(y), Number(m) - 1, Number(day)).getDay()
    ]
    return `${Number(y)}年${Number(m)}月${Number(day)}日（${dayOfWeek}）`
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔐 管理者ダッシュボード</h1>
          <p className="text-slate-300 mt-1">ジム ワンタッチ予約システム</p>
        </div>
        <button onClick={onLogout}
          className="bg-slate-600 hover:bg-slate-500 text-white text-lg font-bold rounded-xl px-6 py-3 transition-all active:scale-95 select-none">
          ログアウト
        </button>
      </header>

      {/* タブ */}
      <div className="flex border-b bg-white">
        <button
          onClick={() => setTab('today')}
          className={`flex-1 py-4 text-lg font-bold text-center transition-colors ${
            tab === 'today'
              ? 'text-slate-800 border-b-3 border-slate-800'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          📅 予約一覧
        </button>
        <button
          onClick={() => setTab('stats')}
          className={`flex-1 py-4 text-lg font-bold text-center transition-colors ${
            tab === 'stats'
              ? 'text-slate-800 border-b-3 border-slate-800'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          📊 会員統計
        </button>
      </div>

      <main className="p-6 max-w-5xl mx-auto">
        {tab === 'today' && (
          <>
            {/* 日付選択 */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => {
                  const d = new Date(date)
                  d.setDate(d.getDate() - 1)
                  setDate(d.toISOString().split('T')[0])
                }}
                className="bg-white border rounded-xl px-4 py-2 text-xl font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
              >
                ←
              </button>
              <h2 className="text-xl font-bold text-slate-700 flex-1 text-center">
                {formatDisplayDate(date)}
              </h2>
              <button
                onClick={() => {
                  const d = new Date(date)
                  d.setDate(d.getDate() + 1)
                  setDate(d.toISOString().split('T')[0])
                }}
                className="bg-white border rounded-xl px-4 py-2 text-xl font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
              >
                →
              </button>
              <button
                onClick={() => setDate(getTodayDate())}
                className="bg-cyan-500 text-white text-base font-bold rounded-xl px-4 py-2 hover:bg-cyan-600 active:scale-95"
              >
                今日
              </button>
            </div>

            {/* 予約一覧テーブル */}
            {loading ? (
              <p className="text-center text-slate-400 py-12 text-xl">読み込み中...</p>
            ) : reservations.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-xl text-slate-400">この日の予約はありません</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left px-6 py-4 text-base font-bold text-slate-600">時間</th>
                      <th className="text-left px-6 py-4 text-base font-bold text-slate-600">会員番号</th>
                      <th className="text-left px-6 py-4 text-base font-bold text-slate-600">名前</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 text-lg font-mono text-slate-800">
                          {r.time_slot.replace('-', ' 〜 ')}
                        </td>
                        <td className="px-6 py-4 text-lg text-slate-700">{r.member_id}</td>
                        <td className="px-6 py-4 text-lg font-medium text-slate-800">
                          {r.member_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-3 bg-slate-50 text-right text-slate-500">
                  合計: {reservations.length} 件
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'stats' && (
          <>
            <h2 className="text-xl font-bold text-slate-700 mb-4">
              会員別出席統計
            </h2>
            {loading ? (
              <p className="text-center text-slate-400 py-12 text-xl">読み込み中...</p>
            ) : memberStats.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-xl text-slate-400">登録会員がいません</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left px-6 py-4 text-base font-bold text-slate-600">順位</th>
                      <th className="text-left px-6 py-4 text-base font-bold text-slate-600">会員番号</th>
                      <th className="text-left px-6 py-4 text-base font-bold text-slate-600">名前</th>
                      <th className="text-right px-6 py-4 text-base font-bold text-slate-600">今月</th>
                      <th className="text-right px-6 py-4 text-base font-bold text-slate-600">累計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberStats.map((m, i) => (
                      <tr key={m.member_id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 text-lg text-slate-500">
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
                        </td>
                        <td className="px-6 py-4 text-lg text-slate-700">{m.member_id}</td>
                        <td className="px-6 py-4 text-lg font-medium text-slate-800">{m.name}</td>
                        <td className="px-6 py-4 text-lg text-right font-bold text-cyan-600">
                          {m.this_month} 回
                        </td>
                        <td className="px-6 py-4 text-lg text-right font-bold text-slate-700">
                          {m.total_reservations} 回
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
