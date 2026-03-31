# ジム ワンタッチ予約システム - セットアップガイド

## 1. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスし、アカウントを作成
2. 「New Project」をクリック
3. プロジェクト名（例：`gym-reservation`）とデータベースパスワードを設定
4. リージョンは **Northeast Asia (Tokyo)** を推奨
5. 「Create new project」をクリック

## 2. テーブルの作成

Supabase ダッシュボード → **SQL Editor** で以下のSQLを実行：

```sql
-- 予約テーブルを作成
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id VARCHAR(5) NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(11) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 同日・同スロットの重複予約を防止するユニーク制約
ALTER TABLE reservations
  ADD CONSTRAINT unique_date_time_slot UNIQUE (date, time_slot);

-- 同日・同会員の重複予約を防止するユニーク制約（1日1予約の場合）
-- 必要に応じてコメントを外してください：
-- ALTER TABLE reservations
--   ADD CONSTRAINT unique_date_member UNIQUE (date, member_id);

-- 検索用インデックス
CREATE INDEX idx_reservations_date ON reservations (date);
CREATE INDEX idx_reservations_member ON reservations (member_id);

-- Row Level Security（RLS）を有効化
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能なポリシー（anon keyでアクセスするため）
CREATE POLICY "allow_read" ON reservations
  FOR SELECT USING (true);

-- 全ユーザーが挿入可能なポリシー
CREATE POLICY "allow_insert" ON reservations
  FOR INSERT WITH CHECK (true);

-- 全ユーザーが削除可能なポリシー（自分の予約キャンセル用）
CREATE POLICY "allow_delete" ON reservations
  FOR DELETE USING (true);
```

## 3. Realtime を有効化

1. Supabase ダッシュボード → **Database** → **Replication**
2. `reservations` テーブルの Realtime を **ON** にする

## 4. API キーの取得

1. Supabase ダッシュボード → **Settings** → **API**
2. 以下の値をコピー：
   - **Project URL**（例：`https://xxxxx.supabase.co`）
   - **anon public key**

## 5. 環境変数の設定

プロジェクトルートの `.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

`.env` を編集：

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...（あなたのanon key）
```

## 6. 開発サーバーの起動

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開くと予約システムが表示されます。

## 7. Vercel へデプロイ

```bash
npm install -g vercel
vercel
```

Vercel ダッシュボードで環境変数（`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`）を設定してください。

## 将来的な拡張案

- **QRコード読み取り**: 会員カードのQRコードで自動ログイン
- **予約キャンセル機能**: ✅ 実装済み（自分の予約をタップでキャンセル可能）
- **管理者画面**: 予約一覧の管理・会員管理
- **1日あたりの予約上限**: `reservations` テーブルへのクエリでカウントチェック
- **予約履歴**: 過去の予約を閲覧
- **複数日予約**: 日付選択機能の追加
