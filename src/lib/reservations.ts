import { supabase, isSupabaseConfigured } from './supabase'
import type { Reservation, TimeSlotInfo } from '../types/database'

// 営業時間の時間スロット定義（9:00〜19:00）
const TIME_SLOTS = [
  { slot: '09:00-10:00', label: '9:00 〜 10:00' },
  { slot: '10:00-11:00', label: '10:00 〜 11:00' },
  { slot: '11:00-12:00', label: '11:00 〜 12:00' },
  { slot: '12:00-13:00', label: '12:00 〜 13:00' },
  { slot: '13:00-14:00', label: '13:00 〜 14:00' },
  { slot: '14:00-15:00', label: '14:00 〜 15:00' },
  { slot: '15:00-16:00', label: '15:00 〜 16:00' },
  { slot: '16:00-17:00', label: '16:00 〜 17:00' },
  { slot: '17:00-18:00', label: '17:00 〜 18:00' },
  { slot: '18:00-19:00', label: '18:00 〜 19:00' },
]

// ============================================================
// デモモード用のインメモリストレージ（Supabase未設定時に使用）
// ============================================================
const demoReservations: Reservation[] = []

// 今日の日付をYYYY-MM-DD形式で取得
export function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 今日の予約一覧を取得し、各スロットの状態を返す
export async function fetchTodaySlots(
  memberId: string
): Promise<TimeSlotInfo[]> {
  const today = getTodayDate()
  let reservations: Reservation[]

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', today)

    if (error) throw new Error(`予約データの取得に失敗しました: ${error.message}`)
    reservations = data as Reservation[]
  } else {
    // デモモード：インメモリデータを使用
    reservations = demoReservations.filter((r) => r.date === today)
  }

  // 各スロットの状態を判定
  return TIME_SLOTS.map(({ slot, label }) => {
    const reservation = reservations.find((r) => r.time_slot === slot)
    if (!reservation) {
      return { slot, label, status: 'available' as const }
    }
    if (reservation.member_id === memberId) {
      return {
        slot,
        label,
        status: 'mine' as const,
        reservedBy: reservation.member_id,
      }
    }
    return {
      slot,
      label,
      status: 'reserved' as const,
      reservedBy: reservation.member_id,
    }
  })
}

// 予約を作成する
export async function createReservation(
  memberId: string,
  timeSlot: string
): Promise<void> {
  const today = getTodayDate()

  if (isSupabaseConfigured && supabase) {
    // 重複チェック
    const { data: existing } = await supabase
      .from('reservations')
      .select('id')
      .eq('date', today)
      .eq('time_slot', timeSlot)
      .limit(1)

    if (existing && existing.length > 0) {
      throw new Error('この時間帯は既に予約されています。')
    }

    const { error } = await supabase.from('reservations').insert({
      member_id: memberId,
      date: today,
      time_slot: timeSlot,
    })

    if (error) {
      if (error.code === '23505') {
        throw new Error('この時間帯は既に予約されています。')
      }
      throw new Error(`予約に失敗しました: ${error.message}`)
    }
  } else {
    // デモモード
    const existing = demoReservations.find(
      (r) => r.date === today && r.time_slot === timeSlot
    )
    if (existing) {
      throw new Error('この時間帯は既に予約されています。')
    }
    demoReservations.push({
      id: crypto.randomUUID(),
      member_id: memberId,
      date: today,
      time_slot: timeSlot,
      created_at: new Date().toISOString(),
    })
  }
}

// 自分の予約をキャンセルする
export async function cancelReservation(
  memberId: string,
  timeSlot: string
): Promise<void> {
  const today = getTodayDate()

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('member_id', memberId)
      .eq('date', today)
      .eq('time_slot', timeSlot)

    if (error) {
      throw new Error(`予約のキャンセルに失敗しました: ${error.message}`)
    }
  } else {
    // デモモード
    const idx = demoReservations.findIndex(
      (r) =>
        r.member_id === memberId &&
        r.date === today &&
        r.time_slot === timeSlot
    )
    if (idx !== -1) {
      demoReservations.splice(idx, 1)
    }
  }
}

// Realtimeサブスクリプションを開始（予約変更をリアルタイムで検知）
export function subscribeToReservations(onUpdate: () => void): () => void {
  if (!isSupabaseConfigured || !supabase) {
    // デモモードではRealtimeなし
    return () => {}
  }

  const channel = supabase
    .channel('reservations-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservations',
      },
      () => {
        onUpdate()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
