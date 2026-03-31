// Supabase データベースの型定義

export interface Reservation {
  id: string
  member_id: string
  date: string          // YYYY-MM-DD 形式
  time_slot: string     // "09:00-10:00" 形式
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      reservations: {
        Row: Reservation
        Insert: Omit<Reservation, 'id' | 'created_at'>
        Update: Partial<Omit<Reservation, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// 時間スロットの表示用型
export interface TimeSlotInfo {
  slot: string           // "09:00-10:00"
  label: string          // "9:00 〜 10:00"
  status: 'available' | 'reserved' | 'mine'
  reservedBy?: string    // 予約した会員番号
}
