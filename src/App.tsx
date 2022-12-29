import { useEffect, useState } from 'react';
import './App.css';
import { css } from '@emotion/css'

const cardStyle = css`
  grid-column-end: span 3;
  cursor: pointer;
  text-decoration: none;
  &:hover {
    border-color: gray;
  }
  transition: border 500ms ease-out;
`
const cardGridStyle = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 2rem;
`

const subtitleStyle = css`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`

function App() {
  const [displayData, setDisplayData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSortAscending, setIsSortAscending] = useState(true)
  const [topics, setTopics] = useState<string[]>([])
  const [subTopics, setSubTopics] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [selectedSubTopic, setSelectedSubTopic] = useState<string>('')
  const [selectedSource, setSelectedSource] = useState<string>('')

  useEffect(() => {
    if (displayData.length === 0) {
      fetch("https://datausa.io/api/cubes")
        .then(response => response.json())
        .then(data => {
          setDisplayData(Object.values(data.measures))

          // Set filters
          const topicSet = new Set<string>()
          Object.values(data.measures).forEach((value: any) => {
            const temp = value.cubes[0].annotations.topic || ''
            if (temp)
              topicSet.add(value.cubes[0].annotations.topic)
          })
          setTopics(Array.from(topicSet).sort())

          const subTopicSet = new Set<string>()
          Object.values(data.measures).forEach((value: any) => {
            const temp = value.cubes[0].annotations.subtopic || ''
            if (temp)
              subTopicSet.add(value.cubes[0].annotations.subtopic)
          })
          setSubTopics(Array.from(subTopicSet).sort())

          const sourceSet = new Set<string>()
          Object.values(data.measures).forEach((value: any) => {
            const temp = value.cubes[0].annotations.source_name || ''
            if (temp)
              sourceSet.add(value.cubes[0].annotations.source_name)
          })
          setSources(Array.from(sourceSet).sort())
        })
    }
  }, [displayData])

  const handleSearchBox = (value: string) => {
    setIsSortAscending(true)
    setSearchTerm(value)
  }

  const handleSortAscending = (a: any, b: any) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  }

  const handleSortDescending = (a: any, b: any) => {
    if (a.name > b.name) return -1;
    if (a.name < b.name) return 1;
    return 0;
  }

  const handleSortButton = (isAscending: boolean) => {
    setIsSortAscending(isAscending)
  }

  const dataFilter = (element: any) => {
    const value = element.cubes[0].annotations;
    return (selectedTopic !== '' ? value.topic === selectedTopic : true)
      && (selectedSubTopic !== '' ? value.subtopic === selectedSubTopic : true)
      && (selectedSource !== '' ? value.source_name === selectedSource : true)
      && (element.name.toLowerCase().includes(searchTerm) || value.source_description.includes(searchTerm))
  }

  const getData = () => {
    return displayData.filter(dataFilter).sort(isSortAscending ? handleSortAscending : handleSortDescending)
  }

  return displayData ? (
    <div className='container mb-5'>
      <h1 className='my-4'>Data USA</h1>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <div className="w-75 input-group">
          <input type="input" className="form-control" id="searchBox" placeholder="Search by name" onChange={(event) => handleSearchBox(event.target.value)} value={searchTerm} />
          <button className='btn btn-outline-secondary' onClick={() => handleSearchBox('')}>&#10005;</button>
        </div>
        <div>
          <label className='me-2'>Sort direction:</label>
          <button className={`btn ${!isSortAscending ? 'btn-light' : 'btn-dark'}`} onClick={() => handleSortButton(true)}>A &rarr; Z</button>
          <button className={`btn ${isSortAscending ? 'btn-light' : 'btn-dark'}`} onClick={() => handleSortButton(false)}>Z &rarr; A</button>
        </div>
      </div>
      <label>Filter by: </label>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <select className="form-select me-2" aria-label="Source filter" onChange={(event) => setSelectedSource(event?.target.value)}>
          <option defaultValue='' value=''>Select a source</option>
          {sources.map(source => <option value={source}>{source}</option>)}
        </select>
        <select className="form-select" aria-label="Topic filter" onChange={(event) => setSelectedTopic(event?.target.value)}>
          <option defaultValue='' value=''>Select a topic</option>
          {topics.map(topic => <option value={topic}>{topic}</option>)}
        </select>
        <select className="form-select ms-2" aria-label="SubTopic filter" onChange={(event) => setSelectedSubTopic(event?.target.value)}>
          <option defaultValue='' value=''>Select a subtopic</option>
          {subTopics.map(subTopic => <option value={subTopic}>{subTopic}</option>)}
        </select>
      </div>
      {getData().length > 0 ?
        <div className={cardGridStyle} title="Open in a new tab">
          {getData().map((value: any, key) =>
            <a href={value.cubes[0].annotations.dataset_link} target='_blank' rel="noreferrer" className={`card  ${cardStyle}`} key={key}>
              <div className="card-body">
                <h5 className="card-title">{value.name}</h5>
                <h6 className={`card-subtitle mb-2 text-muted ${subtitleStyle}`}>{value.cubes[0].annotations.source_description}</h6>
                <p className="card-text text-body">
                  <strong>Source Name: </strong>{value.cubes[0].annotations.source_name} <br />
                  <strong>Topic: </strong>{value.cubes[0].annotations.topic} <br />
                  <strong>Subtopic: </strong>{value.cubes[0].annotations.subtopic}
                </p>
              </div>
              <div className='card-footer'>
                <a href={value.cubes[0].annotations.dataset_link} className="card-link float-end">View Source &raquo;</a>
              </div>
            </a>
          )
          }
        </div>
        :
        <div className="alert alert-warning" role="alert">
          No data found
        </div>}

    </div>
  ) : <></>;
}

export default App;
