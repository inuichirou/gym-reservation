import { supabase, isSupabaseConfigured } from './supabase'
import type { Reservation } from '../types/database'

// 会員の全予約データを取得
async function fetchMemberReservations(
  memberId: string
): Promise<Reservation[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false })

    if (error) throw new Error(`データ取得に失敗: ${error.message}`)
    return data as Reservation[]
  }
  return []
}

// 会員の出席統計をまとめて計算
export interface MemberDashboardData {
  thisMonthCount: number         // 今月の出席回数
  thisMonthRate: number          // 今月の出席率（%）
  totalCount: number             // 累計出席回数
  streak: number                 // 連続出席日数
  monthlyHistory: MonthData[]    // 過去6ヶ月の月別データ
  calendarDays: CalendarDay[]    // 今月のカレンダーデータ
  motivationMessage: string      // モチベーションメッセージ
}

export interface MonthData {
  label: string    // "3月" など
  count: number
}

export interface CalendarDay {
  day: number
  attended: boolean
  isToday: boolean
  isFuture: boolean
}

export async function fetchMemberDashboard(
  memberId: string
): Promise<MemberDashboardData> {
  const reservations = await fetchMemberReservations(memberId)
  const now = new Date()
  const today = formatDate(now)

  // 出席日のセット（日付の重複を排除）
  const attendedDates = new Set(reservations.map((r) => r.date))

  // 今月の計算
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth()
  const thisMonthStr = `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`
  const thisMonthDates = [...attendedDates].filter((d) =>
    d.startsWith(thisMonthStr)
  )
  const thisMonthCount = thisMonthDates.length
  const dayOfMonth = now.getDate()
  const thisMonthRate =
    dayOfMonth > 0 ? Math.round((thisMonthCount / dayOfMonth) * 100) : 0

  // 累計
  const totalCount = attendedDates.size

  // 連続出席日数（今日から遡って連続した日数）
  let streak = 0
  const checkDate = new Date(now)
  while (true) {
    const dateStr = formatDate(checkDate)
    if (attendedDates.has(dateStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // 過去6ヶ月の月別データ
  const monthlyHistory: MonthData[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(thisYear, thisMonth - i, 1)
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const count = [...attendedDates].filter((date) =>
      date.startsWith(monthStr)
    ).length
    monthlyHistory.push({
      label: `${d.getMonth() + 1}月`,
      count,
    })
  }

  // 今月のカレンダー
  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate()
  const calendarDays: CalendarDay[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    calendarDays.push({
      day,
      attended: attendedDates.has(dateStr),
      isToday: dateStr === today,
      isFuture: dateStr > today,
    })
  }

  // モチベーションメッセージ
  const motivationMessage = getMotivationMessage(thisMonthRate, streak)

  return {
    thisMonthCount,
    thisMonthRate,
    totalCount,
    streak,
    monthlyHistory,
    calendarDays,
    motivationMessage,
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMotivationMessage(rate: number, streak: number): string {
  if (streak >= 7) return '1週間連続出席！素晴らしい継続力です！'
  if (streak >= 3) return `${streak}日連続出席中！この調子で続けましょう！`
  if (rate >= 80) return '出席率80%超え！とても頑張っています！'
  if (rate >= 50) return '良いペースです！もう少し頻度を上げてみましょう！'
  if (rate >= 20) return 'ジムに来てくれてありがとう！少しずつ増やしていきましょう！'
  return '今日からがスタート！まずは週1回を目標にしましょう！'
}
