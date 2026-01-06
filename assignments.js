// frontend/src/forms/AssignmentForm.jsx
import { useState, useEffect } from "react";
import axios from "axios";

function AssignmentForm() {
  const [bases, setBases] = useState([]);
  const [formData, setFormData] = useState({
    baseId: "",
    equipmentType: "",
    quantity: "",
    assignedTo: "",
    reason: "",
  });
  const [message, setMessage] = useState("");

  // Fetch bases from backend
  useEffect(() => {
    const fetchBases = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/bases", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBases(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBases();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/assignments",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setFormData({
        baseId: "",
        equipmentType: "",
        quantity: "",
        assignedTo: "",
        reason: "",
      });
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Error submitting assignment"
      );
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto" }}>
      <h2>Assignment / Expenditure Form</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Base:
          <select name="baseId" value={formData.baseId} onChange={handleChange} required>
            <option value="">Select Base</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Equipment Type:
          <input type="text" name="equipmentType" value={formData.equipmentType} onChange={handleChange} required />
        </label>
        <br />

        <label>
          Quantity:
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required />
        </label>
        <br />

        <label>
          Assigned To / Reason:
          <input type="text" name="assignedTo" value={formData.assignedTo} onChange={handleChange} required />
        </label>
        <br />

        <label>
          Description:
          <input type="text" name="reason" value={formData.reason} onChange={handleChange} required />
        </label>
        <br />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AssignmentForm;


