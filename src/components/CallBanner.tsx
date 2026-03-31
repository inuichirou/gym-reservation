import { useEffect, useState, useCallback } from 'react'
import { fetchTodaySlots } from '../lib/reservations'
import type { TimeSlotInfo } from '../types/database'

interface CallBannerProps {
  memberId: string
  memberName: string
}

// 時間ベースの自動呼び出しバナー
// 予約時間ちょうどになったら全タブレットに通知を表示する
export function CallBanner({ memberId, memberName }: CallBannerProps) {
  const [activeSlot, setActiveSlot] = useState<TimeSlotInfo | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // 現在時刻が予約スロットの開始時刻と一致するか判定
  const checkNotifications = useCallback(async () => {
    try {
      const slots = await fetchTodaySlots(memberId)
      const now = new Date()
      const currentHH = String(now.getHours()).padStart(2, '0')
      const currentMM = String(now.getMinutes()).padStart(2, '0')
      const currentTime = `${currentHH}:${currentMM}`

      // 自分の予約の中で、開始時刻が現在時刻と一致するものを探す
      const mySlot = slots.find((s) => {
        if (s.status !== 'mine') return false
        const startTime = s.slot.split('-')[0] // "09:00-09:30" → "09:00"
        return startTime === currentTime
      })

      if (mySlot && !dismissed.has(mySlot.slot)) {
        setActiveSlot(mySlot)
      } else {
        setActiveSlot(null)
      }
    } catch {
      // 通知チェック失敗は静かに無視
    }
  }, [memberId, dismissed])

  useEffect(() => {
    checkNotifications()

    // 1分ごとにチェック
    const interval = setInterval(checkNotifications, 60_000)
    return () => clearInterval(interval)
  }, [checkNotifications])

  const handleDismiss = () => {
    if (activeSlot) {
      setDismissed((prev) => new Set(prev).add(activeSlot.slot))
      setActiveSlot(null)
    }
  }

  if (!activeSlot) return null

  return (
    <div className="px-6 pt-4">
      <div className="bg-amber-400 rounded-2xl px-6 py-5 flex items-center justify-between shadow-lg animate-pulse-slow">
        <div className="flex items-center gap-4">
          <span className="text-5xl">📢</span>
          <div>
            <p className="text-2xl font-bold text-amber-900">
              {memberName} さん、予約時間です！
            </p>
            <p className="text-xl text-amber-800 font-medium">
              {activeSlot.label} の予約時間になりました
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-lg font-bold rounded-xl px-6 py-3 transition-all duration-100 active:scale-95 select-none"
        >
          確認しました
        </button>
      </div>
    </div>
  )
}
