import MyThree from "./three";
import { useEffect, useState } from "react";
import { Vector3 } from "three";

function App() {
  const [data, setData] = useState<Vector3[]>([]);

  useEffect(() => {
    const connection = new WebSocket("/ws");

    //Convert the data from the server to a Vector3 object array and set it to the state
    connection.onmessage = (e) =>
      setData(JSON.parse(e.data).map((point: { id: number, x: number, y: number, z: number }) => { return new Vector3(point.x, point.y, point.z) }));
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <MyThree positions={data} />
      <div style={{ width: '15%' }}>
        <h1>GPS Location:</h1>
        <p>Latitude: 0</p>
        <p>Longitude: 0</p>
        <p>Height: {data.length ? data[data.length - 1].y : "unknown"}</p>
      </div>
    </div>
  );
}

export default App
