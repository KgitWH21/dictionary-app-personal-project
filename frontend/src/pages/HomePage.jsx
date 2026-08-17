import { useState } from 'react';
import { Link, useLoaderData, useRevalidator } from 'react-router-dom';
import { createCollection, deleteCollection } from '../api/utilities.js';

const HomePage = ()=> {
    //useLoaderData returns what homeloager got
    const collections = useLoaderData()
    //discovered that this re-runs the loader when a collection is created or deleted
    const revalidator = useRevalidator()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const handleCreate = async (event) => {
        event.preventDefault()
        const created = await createCollection({ name, description })
        if (created) {
            setName('')
            setDescription('')
            revalidator.revalidate()           
        }
    }
    const handleDelete = async (collectionId) => {
        if (!confirm('Delete this collection and all its entries?')) return
        const ok = await deleteCollection(collectionId)
        if (ok) revalidator.revalidate()
    }

    return (
        <div className="mx-auto max-w-sm p-6">
            <h1 className="mb-4 text-2xl font-bold">My Collections</h1>

            <form onSubmit={handleCreate} className="rounded border border-slate-300 bg-white p-4">
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />

                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <input
                    id="description"
                    value={description}  
                    onChange={(e) => setDescription(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />

                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add collection</button>
            </form> 

            {collections.length === 0 ? (
                <p>No collections yet. Create one above.</p>
            ) : (
                <ul className="mt-6 space-y-3">
                    {collections.map((collection) => (
                        <li key={collection.id} className="rounded border border-slate-300 bg-white p-4">
                            <Link to={`/collections/${collection.id}`}>
                                {collection.name}
                            </Link>     
                            <span> ({collection.entry_count} entries)</span>
                            {/*collection.description prevents an empty paragraph from rendering when a description is blank */}
                            {collection.description && <p>{collection.description}</p>}
                            <button onClick={() => handleDelete(collection.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Delete
                            </button>
                        </li>
                    ))}  
                </ul>
            )}
        </div>
    )
} 

export default HomePage


                                                         