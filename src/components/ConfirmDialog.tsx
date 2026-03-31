import type { TimeSlotInfo } from '../types/database'

interface ConfirmDialogProps {
  slot: TimeSlotInfo
  processing: boolean
  onConfirm: () => void
  onCancel: () => void
}

// 確認ダイアログ：予約/キャンセルの最終確認
export function ConfirmDialog({
  slot,
  processing,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isCancel = slot.status === 'mine'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center animate-scale-in">
        {/* アイコン */}
        <div className="text-5xl mb-4">
          {isCancel ? '🗑️' : '📋'}
        </div>

        {/* メッセージ */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {isCancel ? '予約をキャンセルしますか？' : '予約を確定しますか？'}
        </h3>
        <p className="text-xl text-gray-600 mb-8">
          <span className="font-bold text-cyan-600">{slot.label}</span>
        </p>

        {/* ボタン */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 text-xl font-bold rounded-2xl py-5 transition-all duration-100 active:scale-95 select-none"
          >
            いいえ
          </button>
          <button
            onClick={onConfirm}
            disabled={processing}
            className={`flex-1 ${
              isCancel
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                : 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700'
            } text-white text-xl font-bold rounded-2xl py-5 transition-all duration-100 active:scale-95 select-none disabled:opacity-50`}
          >
            {processing ? '処理中...' : 'はい'}
          </button>
        </div>
      </div>
    </div>
  )
}
