import { useState, useEffect } from 'react'

function App() {
  interface Data {
    id: number;
    data: number;
    label: string;
  }

  const [data, setData] = useState<Data[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/all")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <>
      <h1> Hello world </h1>
      {data.length > 0 ? data.map((item) => (
      <div key={item.id}>
        <p>count = {item.id}</p>
        <p>data = {item.data}</p>
        <p>label = {item.label}</p>
      </div>
    )) : 'No data'}
    </>
  )
}

export default App
