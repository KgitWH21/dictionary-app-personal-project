import axios from 'axios'

const FREE_DICTIONARY_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en'

export const lookupWord = async (word) => {
    const cleaned = word.trim()
    if (!cleaned) {
        return null
    }

    try {
        const response = await axios.get(`${FREE_DICTIONARY_URL}/${encodeURIComponent(cleaned)}`)
        const [first] = response.data
        if (!first) return null

        // according to the docs phonetics is on the root, sometimes in the list, I'll account for both
        let phonetic = first.phonetic || ''
        if (!phonetic) {
            const withText = first.phonetics?.find((p) => p.text)
            phonetic = withText?.text || ''
        }

        const meaning = first.meanings?.[0]
        const definition = meaning?.definitions?.[0]

        return {
            word: first.word || cleaned,
            phonetic: phonetic.slice(0, 100),
            part_of_speech: (meaning?.partOfSpeech || '').slice(0, 50),
            definition: definition?.definition || '',
            example_sentence: definition?.example || '',            
        }
    } catch (error) {
        if (error.response?.status === 404) {
            alert(`No definition found for "${cleaned}".`)
        } else {
            alert('Could not reach the dictionary service.')
        }
        return null
    }
}