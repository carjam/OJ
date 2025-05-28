import { Fragment, useState, useMemo, useCallback } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import debounce from 'lodash/debounce'

export type Track = {
  id: string
  artist: string
  title: string
  distance?: number
}

type SearchProps = {
  tracks: Track[]
  onTrackSelect: (track: Track | null) => void
}

const MAX_RESULTS = 50 // Limit number of displayed results

export default function Search({ tracks = [], onTrackSelect }: SearchProps) {
  const [selected, setSelected] = useState<Track | null>(null)
  const [query, setQuery] = useState('')

  // Memoize the search function
  const getFilteredTracks = useMemo(() => {
    if (query === '') return tracks.slice(0, MAX_RESULTS)

    const searchTerms = query.toLowerCase().split(' ')
    return tracks
      .filter(track => {
        const searchStr = `${track.artist} ${track.title}`.toLowerCase()
        return searchTerms.every(term => searchStr.includes(term))
      })
      .slice(0, MAX_RESULTS)
  }, [tracks, query])

  // Debounce the query update
  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setQuery(value)
    }, 300),
    []
  )

  const handleSelect = (track: Track | null) => {
    setSelected(track)
    onTrackSelect(track)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    debouncedSetQuery(value)
    if (value === '') {
      handleSelect(null)
    }
  }

  return (
    <div className="w-full max-w-xl">
      <Combobox value={selected} onChange={handleSelect}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(track: Track | null) =>
                track ? `${track.artist} - ${track.title}` : ''
              }
              onChange={handleInputChange}
              placeholder="Search for artists or tracks..."
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {getFilteredTracks.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  {query !== '' ? 'Nothing found.' : 'Start typing to search...'}
                </div>
              ) : (
                getFilteredTracks.map((track) => (
                  <Combobox.Option
                    key={track.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-teal-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={track}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {track.artist} - {track.title}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-teal-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
} 