import { useState } from 'react'
import { Link, useLoaderData, useRevalidator } from 'react-router-dom'
import { createEntry, deleteEntry, pronounceEntry } from '../api/utilities.js'

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

    return (
        <div>
            <Link to="/home">&larr; Return to collections</Link>
            <h1>Entries</h1>
            <form onSubmit={handleCreate}>
                <label htmlFor='word'>Word</label>
                <input id="word" name="word" value={form.word} onChange={handleChange} required/>

                <label htmlFor="phonetic">Phonetic</label>
                <input id="phonetic" name="phonetic" value={form.phonetic} onChange={handleChange}/>

                <label htmlFor="part_of_speech">Part of speech</label>
                <input
                  id="part_of_speech"
                  name="part_of_speech"
                  value={form.part_of_speech}
                  onChange={handleChange}
                />

                <label htmlFor="definition">Definition</label>
                <textarea 
                  id="definition"
                  name="definition"
                  value={form.definition}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="example_sentence">Example Sample</label>
                <textarea
                  id="example_sentence" 
                  name="example_sentence"
                  value={form.example_sentence}
                  onChange={handleChange}
                />

                <label htmlFor="usage_note">Usage note</label>
                <textarea
                  id="usage_note"
                  name="usage_note"
                  value={form.usage_note}
                  onChange={handleChange}
                />
                <button type="submit">Add entry</button>                
            </form>

            {entries.length === 0 ? (
                <p>No entries in this collection yet.</p>
            ) : (
                <ul>
                    {entries.map((entry) => (
                        <li key={entry.id}>
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
                            >
                                {speakingId === entry.id ? 'Generating...' : 'Pronounce word'}
                            </button>

                            {entry.example_sentence && (
                                <button
                                    onClick={() => handlePronounce(entry.id, 'example')}
                                    disabled={speakingId === entry.id}
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