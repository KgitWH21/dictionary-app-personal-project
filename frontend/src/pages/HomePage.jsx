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
        <div>
            <h1>My Collections</h1>

            <form onSubmit={handleCreate}>
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label htmlFor="description">Description</label>
                <input
                    id="description"
                    value={description}  
                    onChange={(e) => setDescription(e.target.value)}
                />

                <button type="submit">Add collection</button>
            </form> 

            {collections.length === 0 ? (
                <p>No collections yet. Create one above.</p>
            ) : (
                <ul>
                    {collections.map((collection) => (
                        <li key={collection.id}>
                            <Link to={`/collections/${collection.id}`}>
                                {collection.name}
                            </Link>     
                            <span> ({collection.entry_count} entries)</span>
                            {/*collection.description prevents an empty paragraph from rendering when a description is blank */}
                            {collection.description && <p>{collection.description}</p>}
                            <button onClick={() => handleDelete(collection.id)}>
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


                                                         