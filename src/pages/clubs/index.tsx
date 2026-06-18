import { useState } from 'react'
import Button from '../../components/button'
import useListAllClubs from '../../hooks/useListAllClubs'
import AddClubModal from './components/addClubModal'
import FilterClubModal from './components/filterClub'
import CardClub from './components/cardClub'
import type { Club } from '../../utils/types'

export default function Clubs() {
  const [isAddClubModalOpen, setIsAddClubModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterCountry, setFilterCountry] = useState('')
  const [filterState, setFilterState] = useState('')
  const [editingClub, setEditingClub] = useState<Club | undefined>(undefined)
  const { clubs, error, isLoading } = useListAllClubs(filterCountry, filterState)

  const handleFilterConfirm = (country: string, state: string) => {
    setFilterCountry(country)
    setFilterState(state)
  }

  return (
    <>
      <div className="w-full p-2 flex flex-col justify-center">
        <div className="mb-4 flex items-center justify-end gap-2">
          <Button
            onClick={() => setIsFilterModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-green-700 px-5 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
          >
            <span>{filterCountry ? (filterCountry === 'Brazil' ? `${filterCountry} / ${filterState}` : filterCountry) : 'No filter'}</span>
          </Button>
          <Button
            onClick={() => setIsAddClubModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            <span>Add Club</span>
          </Button>
        </div>

        {isLoading ? <div className="w-full p-4 text-green-900">Loading clubs...</div> : null}
        {error ? <div className="w-full p-4 text-red-700">{error}</div> : null}

        {!isLoading && !error ? (
          <div className="flex flex-row flex-wrap w-full gap-2 justify-center max-h-[700px] overflow-auto">
            {clubs.map((item) => (
              <CardClub key={item.id} club={item} onEdit={setEditingClub} />
            ))}
          </div>
        ) : null}
      </div>

      <FilterClubModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onConfirm={handleFilterConfirm}
      />

      <AddClubModal
        editingClub={editingClub}
        isOpen={isAddClubModalOpen || !!editingClub}
        onClose={() => {
          setIsAddClubModalOpen(false)
          setEditingClub(undefined)
        }}
      />
    </>
  )
}
