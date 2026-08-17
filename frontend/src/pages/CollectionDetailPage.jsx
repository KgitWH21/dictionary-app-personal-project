import { useState } from 'react'
import { Link, useLoaderData, useRevalidator } from 'react-router-dom'
import { createEntry, deleteEntry, pronounceEntry } from '../api/utilities.js'
import { lookupWord } from '../api/dictionaryApi.js'

const BLANK_ENTRY = {
    word: '',
    phonetic: '',
    part_of_speech: '',
    definition: '',
    example_sentence: '',
    usage_note: '',
}

const CollectionDetailPage = () => {
    const { collectionId, entries } = useLoaderData()
    const revalidator = useRevalidator()
    const [form, setForm] = useState(BLANK_ENTRY)
    const [speakingId, setSpeakingId] = useState(null)
    const [looking, setLooking] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleCreate = async (event) => {
        event.preventDefault()
        const created = await createEntry({ ...form, collection: collectionId })
        if (created) {
            setForm(BLANK_ENTRY)
            revalidator.revalidate()
        }
    }
    
    const handlePronounce = async (entryId, source) => {
        setSpeakingId(entryId)
        const updated = await pronounceEntry(entryId, source)
        setSpeakingId(null)
        if (updated) {
            revalidator.revalidate()
        }
    }

    const handleDelete = async (entryId) => {
        if (!confirm('Delete this entry?')) return
        const ok = await deleteEntry(entryId)
        if (ok) revalidator.revalidate()
    }

    const handleLookup = async () => {
        if (!form.word.trim()) return
        setLooking(true)
        const found = await lookupWord(form.word)
        setLooking(false)
        if (found) {
            setForm((prev) => ({
                ...prev,
                word: found.word,
                phonetic: found.phonetic,
                part_of_speech: found.part_of_speech,
                definition: found.definition,
                example_sentence: found.example_sentence || prev.example_sentence,
            }))
        }
    }                           

    return (
        <div className="mx-auto max-w-sm p-6">
            <Link to="/home">&larr; Return to collections</Link>
            <h1 className="mb-4 text-2xl font-bold">Entries</h1>
            <form onSubmit={handleCreate} className="rounded border border-slate-300 bg-white p-4">
                <label 
                  htmlFor='word' 
                  className="block text-sm font-medium mb-1"
                  >Word
                </label>
                <input 
                  id="word" 
                  name="word" 
                  value={form.word} 
                  onChange={handleChange} 
                  required 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <button 
                  type="button" 
                  onClick={handleLookup} 
                  disabled={looking} 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    {looking ? 'Looking up...' : 'Look up'}
                </button>                

                <label 
                  htmlFor="phonetic" 
                  className="block text-sm font-medium mb-1">Phonetic</label>
                <input 
                  id="phonetic" 
                  name="phonetic" 
                  value={form.phonetic} 
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />

                <label 
                  htmlFor="part_of_speech" 
                  className="block text-sm font-medium mb-1"
                  >
                    Part of speech
                </label>
                <input
                  id="part_of_speech"
                  name="part_of_speech"
                  value={form.part_of_speech}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />

                <label 
                  htmlFor="definition" 
                  className="block text-sm font-medium mb-1"
                >
                    Definition
                </label>
                <textarea 
                  id="definition"
                  name="definition"
                  value={form.definition}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />

                <label 
                  htmlFor="example_sentence" 
                  className="block text-sm font-medium mb-1"
                >
                    Example Sample
                </label>
                <textarea
                  id="example_sentence" 
                  name="example_sentence"
                  value={form.example_sentence}
                  onChange={handleChange}
                />

                <label 
                  htmlFor="usage_note" 
                  className="block text-sm font-medium mb-1"
                >
                    Usage note
                </label>
                <textarea
                  id="usage_note"
                  name="usage_note"
                  value={form.usage_note}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add entry
                </button>                
            </form>

            {entries.length === 0 ? (
                <p>No entries in this collection yet.</p>
            ) : (
                <ul className="mt-6 space-y-3">
                    {entries.map((entry) => (
                        <li key={entry.id} className="rounded border border-slate-300 bg-white p-4">
                            <h2>
                                {entry.word}
                                {entry.phonetic && <em>{entry.phonetic}</em>}
                            </h2> 
                            {entry.part_of_speech && <p>{entry.part_of_speech}</p>}
                            <p>{entry.definition}</p>
                            {entry.example_sentence && <blockquote>{entry.example_sentence}</blockquote>}
                            {entry.usage_note && <p>Note: {entry.usage_note}</p>}

                            {entry.audio_url && (
                                <audio controls src={entry.audio_url} />
                            )}


                            <button
                                onClick={() => handlePronounce(entry.id, 'word')}
                                disabled={speakingId === entry.id}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {speakingId === entry.id ? 'Generating...' : 'Pronounce word'}
                            </button>

                            {entry.example_sentence && (
                                <button
                                    onClick={() => handlePronounce(entry.id, 'example')}
                                    disabled={speakingId === entry.id}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Pronounce example
                                </button>
                            )}                                                                         
                            <button onClick={() => handleDelete(entry.id)}>Delete</button> 

                        </li>
                    ))}
                </ul>
            )}                                                                          
        </div>
    )
}

export default CollectionDetailPage