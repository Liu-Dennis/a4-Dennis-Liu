import { useState } from "react";
import "./App.css";
// import Form from "./Form.jsx";
// import Table from "./Table.jsx";
import List from "./List.jsx";

function App() {  
  let [username, setUsername] = useState(null)
  
  fetch("/user/username")
      .then(response => response.json())
      .then(data => {
        setUsername(data)
  });
  
  if (username) {
    return (
      <div className="App">
        <p>Welcome, {username}</p>
        <a type="button" href="/logout"> Logout </a>
        <h1>Todo List!</h1>
        <List />
      </div>
    )
  } else {
    return <a type="button" href="/auth/github"> Login with Github </a>
  }

}

export default App;
