import { useEffect, useState, useCallback } from 'react'
import {
  fetchTodaySlots,
  createReservation,
  cancelReservation,
  subscribeToReservations,
  getTodayDate,
} from '../lib/reservations'
import type { TimeSlotInfo } from '../types/database'
import { TimeSlotCard } from './TimeSlotCard'
import { ConfirmDialog } from './ConfirmDialog'
import toast from 'react-hot-toast'

interface ReservationScreenProps {
  memberId: string
  onLogout: () => void
}

// 予約画面：時間スロット一覧を表示し、タッチで予約/キャンセルできる
export function ReservationScreen({
  memberId,
  onLogout,
}: ReservationScreenProps) {
  const [slots, setSlots] = useState<TimeSlotInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotInfo | null>(null)
  const [processing, setProcessing] = useState(false)

  // スロットデータを再読み込み
  const loadSlots = useCallback(async () => {
    try {
      const data = await fetchTodaySlots(memberId)
      setSlots(data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '予約データの取得に失敗しました'
      )
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    loadSlots()

    // Realtimeで他のタブレットからの変更をリアルタイム反映
    const unsubscribe = subscribeToReservations(() => {
      loadSlots()
    })

    return unsubscribe
  }, [loadSlots])

  // スロットをタッチしたとき
  const handleSlotTap = (slot: TimeSlotInfo) => {
    if (slot.status === 'reserved') return // 他人の予約はタップ不可
    setSelectedSlot(slot)
  }

  // 確認ダイアログで「はい」を押したとき
  const handleConfirm = async () => {
    if (!selectedSlot) return
    setProcessing(true)

    try {
      if (selectedSlot.status === 'available') {
        await createReservation(memberId, selectedSlot.slot)
        toast.success(`${selectedSlot.label} を予約しました！`)
      } else if (selectedSlot.status === 'mine') {
        await cancelReservation(memberId, selectedSlot.slot)
        toast.success(`${selectedSlot.label} の予約をキャンセルしました。`)
      }
      await loadSlots()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '操作に失敗しました'
      )
    } finally {
      setProcessing(false)
      setSelectedSlot(null)
    }
  }

  // 今日の日付を表示用にフォーマット
  const todayFormatted = (() => {
    const today = getTodayDate()
    const [y, m, d] = today.split('-')
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][
      new Date(Number(y), Number(m) - 1, Number(d)).getDay()
    ]
    return `${Number(m)}月${Number(d)}日（${dayOfWeek}）`
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            🏋️ ジム ワンタッチ予約
          </h1>
          <p className="text-lg text-cyan-600 font-medium mt-1">
            会員番号 {memberId} さん、こんにちは！
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg text-gray-600 font-medium">
            📅 {todayFormatted}
          </span>
          <button
            onClick={onLogout}
            className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 text-lg font-bold rounded-xl px-6 py-3 transition-all duration-100 active:scale-95 select-none"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
          予約したい時間をタッチしてください
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-2xl text-gray-400 animate-pulse">
              読み込み中...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {slots.map((slot) => (
              <TimeSlotCard
                key={slot.slot}
                slot={slot}
                onTap={handleSlotTap}
              />
            ))}
          </div>
        )}
      </main>

      {/* 凡例 */}
      <footer className="bg-white/80 px-6 py-3 flex items-center justify-center gap-8 text-base">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white border-2 border-gray-300" />
          <span className="text-gray-600">空き</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-cyan-500" />
          <span className="text-gray-600">あなたの予約</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-400" />
          <span className="text-gray-600">予約済み</span>
        </div>
      </footer>

      {/* 確認ダイアログ */}
      {selectedSlot && (
        <ConfirmDialog
          slot={selectedSlot}
          processing={processing}
          onConfirm={handleConfirm}
          onCancel={() => setSelectedSlot(null)}
        />
      )}
    </div>
  )
}
