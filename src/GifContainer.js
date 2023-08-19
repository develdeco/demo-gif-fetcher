import { useState, useEffect } from 'react';

const GIPHY_API_KEY = 'pLURtkhVrUXr3KG25Gy5IvzziV5OrZGa'
const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs/search'
const PAGE_SIZE = 10;

const getGiphyUrl = (keyword, offset) => {
    return `${GIPHY_API_URL}?api_key=${GIPHY_API_KEY}&q=${keyword}&offset=${offset}&limit=${PAGE_SIZE}`
}

const getOffset = (page) => {
    return page * PAGE_SIZE;
}

const getHistory = () => {
    const history = window.localStorage.getItem('history');
    return history !== null ? JSON.parse(history) : []
}

const updateHistory = (keyword) => {
    const historySet = new Set(getHistory());
    if (keyword !== '') historySet.add(keyword);
    const history = [...historySet];
    window.localStorage.setItem('history', JSON.stringify(history));
    return history;
}

const cleanHistory = () => {
    window.localStorage.removeItem('history');
    return [];
}

const fetchGifResults = async (keyword, page) => {
    const result = await fetch(getGiphyUrl(keyword, getOffset(page)));
    const data = await result.json();
    return data;
}

const GifContainer = () => {
    const [keywordInput, setKeywordInput] = useState('');
    const [keyword, setKeyword] = useState(null);
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [history, setHistory] = useState(getHistory());

    useEffect(() => {
        if (page == null || keyword == null) return;
        fetchGifResults(keyword, page).then(resp => {
            setResults(resp.data.map(gif => gif.images.original.url));
            setTotalCount(resp.pagination.total_count)    
        })
    }, [page, keyword])

    const handleSearch = (keywordInput) => () => {
        setHistory(updateHistory(keywordInput))
        setPage(0)
        setKeyword(keywordInput)
    }

    const handlePageChange = (newPage) => () => {
        if (newPage >= 0 && getOffset(newPage) <= totalCount) {
            setPage(newPage)
        }
    }

    const handleCleanHistory = () => {
        setHistory(cleanHistory())
    }

    return (
        <div className='gif-container'>
            <div className='gif-viewer'>
                <div className='gif-search'>
                    <input type="text" value={ keywordInput } onChange={(e)=>setKeywordInput(e.target.value)} placeholder='Search gifs...' />
                    <button onClick={handleSearch(keywordInput)}>Search</button>
                    <button onClick={handleSearch('')}>Clear results</button>
                </div>
                <div className='pagination-buttons'>
                    <button onClick={handlePageChange(page - 1)}>Previous</button>
                    <button onClick={handlePageChange(page + 1)}>Next</button>
                </div>
                <div className='gif-results'>
                    {results.map(url => (
                        <div key={url} className='gif-item'>
                            <img src={url} alt={url}/>
                        </div>
                    ))}
                </div>
            </div>
            <div className='gif-history'>
                <h5>History</h5>
                <ul>
                    {history.map(keyword => (
                        <li key={keyword}>{keyword}</li>
                    ))}
                </ul>
                <button onClick={handleCleanHistory}>Clean history</button>
            </div>
        </div>
    )
}

export default GifContainer;