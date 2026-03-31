import { supabase, isSupabaseConfigured } from './supabase'
import type { Member } from '../types/database'

// デモモード用のインメモリストレージ
const demoMembers: Member[] = []

// 会員番号でログイン（存在確認）
export async function loginMember(
  memberId: string
): Promise<Member | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('member_id', memberId)
      .limit(1)

    if (error) throw new Error(`会員データの取得に失敗: ${error.message}`)
    return (data as Member[])[0] ?? null
  }
  return demoMembers.find((m) => m.member_id === memberId) ?? null
}

// 会員を新規登録する
export async function registerMember(
  memberId: string,
  name: string
): Promise<void> {
  // 重複チェック
  const existing = await loginMember(memberId)
  if (existing) {
    throw new Error('この会員番号は既に登録されています。')
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('members').insert({
      member_id: memberId,
      name,
    })
    if (error) {
      if (error.code === '23505') {
        throw new Error('この会員番号は既に登録されています。')
      }
      throw new Error(`会員登録に失敗しました: ${error.message}`)
    }
  } else {
    demoMembers.push({
      member_id: memberId,
      name,
      created_at: new Date().toISOString(),
    })
  }
}
