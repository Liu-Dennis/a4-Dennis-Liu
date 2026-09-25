// import { useState } from "react";
// import "./Table.css";

function Table({ data, handleEdit, handleDelete, editing }) {  
  let entries = data.map(entry => 
    <tr key={entry._id}>
      <td>{entry.name}</td>
      <td>{entry.duration}</td>
      <td>{entry.due}</td>
      <td>{entry.urgency}</td>
      <td>
        <button className="btn" onClick={() => handleDelete(entry._id)}>Delete</button>
        <button className={editing === entry._id?"btn btn-primary":"btn"} onClick={() => handleEdit(entry._id, entry.name, entry.duration, entry.due)}>Edit</button>
      </td>
    </tr>
  );

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Duration</th>
          <th scope="col">Due date</th>
          <th scope="col">Urgency</th>
          <th scope="col">Controls</th>
        </tr>
      </thead>
      <tbody>
        {entries}
      </tbody>
    </table>
  );
}

export default Table;
