import MyThree from "./three";

const wsURL = "/ws";
const connection = new WebSocket(wsURL);

connection.onopen = () => {
  console.log("Connected to the server");
  connection.send("Hello from the client!");
};

connection.onmessage = (e) => {
  console.log('Message from the server: ', e.data);
}

function App() {

  return (<MyThree />);
}

export default App
