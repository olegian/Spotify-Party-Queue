import Login from "./components/Login";
import QueueDisplay from "./components/QueueDisplay";
import 'bootstrap/dist/css/bootstrap.min.css'

const code = new URLSearchParams(window.location.search).get("code");

function App() {
  return (
    code ? <QueueDisplay code={code}/> : <Login />
  );
}

export default App;
