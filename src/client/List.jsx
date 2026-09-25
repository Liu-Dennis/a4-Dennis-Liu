// import { useState } from "react";
import { useState, useEffect } from 'react';
import Form from "./Form.jsx";
import Table from "./Table.jsx";

function List() {  
  const [data, setData] = useState([])
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState(null)
  const [editDuration, setEditDuration] = useState(null)
  const [editDue, setEditDue] = useState(null)

  useEffect(() => {
    fetch("/entries")
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setData(data)
    });
  }, []);

  const handleEdit = (id, name, duration, due) => {
    if (editing === id) {
      setEditing(null)
      setEditName(null)
      setEditDuration(null)
      setEditDue(null)
      return
    }
    setEditing(id)
    setEditName(name)
    setEditDuration(duration)
    setEditDue(due)
  }

  const handleDelete = async (id) => {
    console.log("Delete: ", id)

    const body = JSON.stringify({id:id, name:""})
    console.log(`posting: ${body}`)

    const response = await fetch( '/submit', {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })

    const res = await response.json()
    console.log(res)
    setData(res)
  }

  const handleSubmit = async (formData) => {
    const name = formData.get("entry-name")
    const duration = formData.get("entry-duration")
    const due = formData.get("entry-due")

    console.log("Submit:", name, duration, due)
    const json = { id: (editing ? editing : -1), name: name, duration: duration, due: due },
          body = JSON.stringify( json )
    
    const response = await fetch( '/submit', {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body 
    })

    const res = await response.json()
    setData(res)
    handleEdit(editing, null, null, null)
  }

  return (
    <div>
      <Table data={data} handleEdit={handleEdit} handleDelete={handleDelete} editing={editing} />
      <Form handleSubmit={handleSubmit} fillName={editName} fillLength={editDuration} fillDue={editDue}/>
    </div>
  );
}

export default List;
