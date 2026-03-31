import type { TimeSlotInfo } from '../types/database'

interface TimeSlotCardProps {
  slot: TimeSlotInfo
  onTap: (slot: TimeSlotInfo) => void
}

// 時間スロットカード：状態に応じた色分けとタッチ操作を提供
export function TimeSlotCard({ slot, onTap }: TimeSlotCardProps) {
  const getStyles = () => {
    switch (slot.status) {
      case 'available':
        return {
          card: 'bg-white border-2 border-gray-200 hover:border-cyan-400 hover:shadow-lg active:bg-cyan-50 cursor-pointer',
          time: 'text-gray-800',
          label: 'text-green-600',
          labelText: '空き',
          icon: '○',
        }
      case 'mine':
        return {
          card: 'bg-cyan-500 border-2 border-cyan-600 hover:bg-cyan-600 active:bg-cyan-700 cursor-pointer',
          time: 'text-white',
          label: 'text-cyan-100',
          labelText: '✅ 予約済',
          icon: '',
        }
      case 'reserved':
        return {
          card: 'bg-red-400 border-2 border-red-500 cursor-not-allowed opacity-80',
          time: 'text-white',
          label: 'text-red-100',
          labelText: '✕',
          icon: '',
        }
    }
  }

  const styles = getStyles()

  return (
    <button
      onClick={() => onTap(slot)}
      disabled={slot.status === 'reserved'}
      className={`${styles.card} rounded-xl p-3 transition-all duration-150 active:scale-95 select-none flex flex-col items-center justify-center min-h-[90px] shadow-sm`}
    >
      <span className={`text-base font-bold ${styles.time} leading-tight`}>
        {slot.label}
      </span>
      <span className={`text-sm font-medium mt-1 ${styles.label}`}>
        {styles.icon} {styles.labelText}
      </span>
    </button>
  )
}
