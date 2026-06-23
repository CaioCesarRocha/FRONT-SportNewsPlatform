import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/button'
import CardChampionship from './components/cardChampionship'
import useGetChampionships from '../../hooks/useGetChampionships'
import AddChampionshipModal from './components/addChampionshipModal'
import type { Championship } from '../../utils/types'

function formatChampionshipKey(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function Championships() {
  const [searchParams] = useSearchParams()
  const [isAddChampionshipModalOpen, setIsAddChampionshipModalOpen] = useState(false)
  const [editingChamp, setEditingChamp] = useState<Championship | undefined>(undefined)
  const championshipKey = searchParams.get('key')
  const { championships, error, isLoading } = useGetChampionships(championshipKey)

  return (
    <>
      <div className="w-full p-2">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-800/70">
              Championships
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-green-950">
              {championshipKey
                ? formatChampionshipKey(championshipKey)
                : 'Choose a championship in the menu'}
            </h2>
          </div>

          <Button
            onClick={() => setIsAddChampionshipModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            <span>Add Championship</span>
          </Button>
        </div>

        {!championshipKey ? (
          <div className="w-full rounded-3xl border border-green-100 bg-green-50 p-6 text-green-900">
            Select `Mineiro` or `Catarinense` from `Nationals` → `Regionals` to load championships.
          </div>
        ) : null}

        {isLoading ? <div className="w-full p-4 text-green-900">Loading championships...</div> : null}
        {error ? <div className="w-full p-4 text-red-700">{error}</div> : null}

        {championshipKey && !isLoading && !error ? (
          <div className="flex flex-row flex-wrap w-full gap-2">
            {championships.map((item) => (
              <CardChampionship key={item.id} champ={item} onEdit={setEditingChamp} />
            ))}
          </div>
        ) : null}
      </div>

      <AddChampionshipModal
        editingChamp={editingChamp}
        isOpen={isAddChampionshipModalOpen || !!editingChamp}
        onClose={() => {
          setIsAddChampionshipModalOpen(false)
          setEditingChamp(undefined)
        }}
      />
    </>
  )
}
