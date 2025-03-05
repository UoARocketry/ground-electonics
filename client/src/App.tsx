import MyThree from "./three";
import { useEffect, useState } from "react";
import { Vector3 } from "three";

function App() {
  const [data, setData] = useState<Vector3[]>([]);
  const [gps, setGps] = useState<{ lat: number, lon: number, alt: number } | null>(null);

  useEffect(() => {
    const connection = new WebSocket("/ws");

    //Convert the data from the server to a Vector3 object array and set it to the state
    connection.addEventListener("message", (e) => {
      const temp = JSON.parse(e.data);

      setData(data => [...data, ...temp.relitive.map((point: { id: number, x: number, y: number, z: number }) => { return new Vector3(point.x, point.y, point.z) })]);

      console.log(temp.gps);
      setGps({ lat: temp.gps.lat, lon: temp.gps.lon, alt: temp.gps.alt });
    });
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <MyThree positions={data} />
      <div style={{ width: '15%' }}>
        <h1>GPS Location:</h1>
        <p>Latitude: {gps ? gps?.lat || "unknown" : "Unknown"}</p>
        <p>Longitude: {gps ? gps?.lon || "unknown" : "Unknown"}</p>
        <p>Height: {gps ? gps?.alt || "unknown" : "Unknown"}</p>
      </div>
    </div>
  );
}

export default App
