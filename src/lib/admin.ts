import { supabase, isSupabaseConfigured } from './supabase'
import type { Reservation, Member } from '../types/database'

// 管理者パスワード（環境変数、デフォルト: 0000）
const ADMIN_PASSWORD: string =
  (import.meta.env.VITE_ADMIN_PASSWORD as string) ?? '0000'

// 管理者パスワードを照合
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

// 指定日の予約一覧を取得（会員名付き）
export interface ReservationWithName extends Reservation {
  member_name: string
}

export async function fetchReservationsByDate(
  date: string
): Promise<ReservationWithName[]> {
  if (isSupabaseConfigured && supabase) {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', date)
      .order('time_slot')

    if (error) throw new Error(`予約データの取得に失敗: ${error.message}`)

    const { data: members } = await supabase.from('members').select('*')
    const memberMap = new Map(
      (members as Member[])?.map((m) => [m.member_id, m.name]) ?? []
    )

    return (reservations as Reservation[]).map((r) => ({
      ...r,
      member_name: memberMap.get(r.member_id) ?? '不明',
    }))
  }
  return []
}

// 全会員の出席統計を取得
export interface MemberStats {
  member_id: string
  name: string
  total_reservations: number
  this_month: number
}

export async function fetchAllMemberStats(): Promise<MemberStats[]> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data: members } = await supabase.from('members').select('*')
  const { data: reservations } = await supabase
    .from('reservations')
    .select('*')

  if (!members || !reservations) return []

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  return (members as Member[]).map((m) => {
    const memberRes = (reservations as Reservation[]).filter(
      (r) => r.member_id === m.member_id
    )
    return {
      member_id: m.member_id,
      name: m.name,
      total_reservations: memberRes.length,
      this_month: memberRes.filter((r) => r.date.startsWith(thisMonth))
        .length,
    }
  }).sort((a, b) => b.total_reservations - a.total_reservations)
}
