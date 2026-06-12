import { cn, truncate } from '@/utils/cn'
import type { Club } from '../../../utils/types'

type CardClubProps = {
  club: Club
  onEdit: (club: Club) => void
}

export default function CardClub({ club, onEdit }: CardClubProps) {
  const location = club.state !== club.country ? `${club.state} - ${club.country}` : club.country

  return (
    <div className="relative rounded-[4px] flex flex-col bg-gray-300 gap-1 text-white w-50 max-w-50 max-h-55 rounded-[8x] items-center justify-between">
      <button
        onClick={() => onEdit(club)}
        className={cn("absolute cursor-pointer right-0 top-0 rounded-bl-full",
          "bg-green-800 p-1 text-white/80 shadow transition-colors hover:bg-green-600 hover:text-white/60"
        )}
        aria-label="Edit club"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 translate-x-[0px] -translate-y-[4px]">
          <path
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
      <img src={club.shield} alt={'shield team'} className="h-auto max-h-28 cursor-pointer pt-1" />
      <div className="flex flex-col w-full max-h-16  text-md bg-green-900 rounded-[2px] p-2">
        <p className="font-medium text-gray-200 tracking-[1.12px]">{truncate(club.name, 19)}</p>
        <p className="whitespace-nowrap text-gray-400">{truncate(location, 23)}</p>
      </div>
    </div>
  )
}
