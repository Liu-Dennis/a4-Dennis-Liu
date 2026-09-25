// import { useState } from "react";
// import "./Form.css";

function Form({ handleSubmit, fillName, fillDuration, fillDue }) {
  // const [count, setCount] = useState(0);
  
  return (
    <form action={handleSubmit}>
      <input name="entry-name" className="form-control" type="text" placeholder="Name" defaultValue={fillName ? fillName : ""} required/>
      
      <select name="entry-duration" className="form-select" defaultValue={fillDuration?fillDuration:"Normal"}>
        <option value="Short">Short</option>
        <option value="Normal">Normal</option>
        <option value="Long">Long</option>
      </select>

      {/* <label htmlFor="hw_due">Due: </label> */}
      <input name="entry-due" className="form-control" type="date" defaultValue={fillDue ? fillDue : ""} />

      <button className="form-control btn btn-primary" type="submit">{fillName?"Edit":"Submit"}</button>
    </form>
  );
}

export default Form;
