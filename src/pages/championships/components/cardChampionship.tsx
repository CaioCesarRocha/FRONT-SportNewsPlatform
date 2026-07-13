import { useNavigate } from 'react-router-dom'
import { cn } from '../../../utils/cn'
import { ChampionshipType } from '../../../utils/types'
import type { Championship } from '../../../utils/types'

type CardChampionshipProps = {
  champ: Championship
  onEdit: (champ: Championship) => void
}

export default function CardChampionship({ champ, onEdit }: CardChampionshipProps) {
  const navigate = useNavigate()
  const isClickable = champ.type === ChampionshipType.League || champ.type === ChampionshipType.EliminationRounds || champ.type === ChampionshipType.Groups

  const handleCardClick = () => {
    if (isClickable) {
      navigate(`/championship/${champ.id}`)
    }
  }

  return (
    <div
      className={cn(
        'relative flex flex-col gap-2 bg-gray-200 text-white w-40 max-w-40 min-h-45 rounded-[8px] items-center justify-between overflow-hidden',
        isClickable && 'cursor-pointer',
      )}
      onClick={handleCardClick}
    >
      <div className="absolute left-0 top-0 flex p-1">
        {Array.from({ length: champ.weight }).map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-yellow-400">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit(champ)
        }}
        className={cn("absolute cursor-pointer right-0 top-0 rounded-bl-full",
          "bg-blue-900 p-1 text-gray-300 shadow transition-colors hover:bg-blue-600"
        )}
        aria-label="Edit championship"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 translate-x-[2px] -translate-y-[4px]">
          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
      <div className="flex-1 flex items-center justify-center overflow-hidden p-1 pt-7">
        <img src={champ.emblem} alt={champ.name} className="w-full max-w-26 h-auto max-h-26 cursor-pointer" />
      </div>
      <div className="flex flex-col w-full h-16 justify-center text-gray-300 text-md bg-blue-900 rounded-[2px] p-2">
        <p className="font-medium leading-tight">{champ.name}</p>
      </div>
    </div>
  )
}
