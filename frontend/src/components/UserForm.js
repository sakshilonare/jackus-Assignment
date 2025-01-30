import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "../css/UserForm.css";

// API endpoint for fetching users (Placeholder API)
const API_URL = "https://jsonplaceholder.typicode.com/users";

// Set root element for accessibility (for react-modal)
Modal.setAppElement("#root");

const UserForm = () => {
  // State to store user data
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Modal control states
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for user data
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    username: "",
    email: "",
    phone: "",
    website: "",
    company: { name: "" },
  });

  // Fetch users from API on component mount
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If modifying company name, update it separately
    if (name.includes("company")) {
      setFormData({ ...formData, company: { ...formData.company, name: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Open modal for adding or editing a user
  const openModal = (user = null) => {
    setIsEditing(!!user); // If user exists, it's editing mode
    setFormData(
      user || { id: "", name: "", username: "", email: "", phone: "", website: "", company: { name: "" } }
    );
    setModalIsOpen(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({ id: "", name: "", username: "", email: "", phone: "", website: "", company: { name: "" } });
  };

  // Handle form submission (Create or Update user)
  const handleSubmit = () => {
    if (isEditing) {
      // Update existing user
      fetch(`${API_URL}/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((updatedUser) => {
          setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
          closeModal();
        });
    } else {
      // Create a new user
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((newUser) => {
          setUsers([...users, { ...newUser, id: users.length + 1 }]); // Assign a unique ID
          closeModal();
        });
    }
  };

  // Handle user deletion
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then((res) => {
          if (res.ok) {
            setUsers(users.filter((user) => user.id !== id));
          }
        })
        .catch((err) => console.error("Error deleting user:", err));
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <h2>User Management</h2>
      
      {/* Button to add a new user */}
      <button className="add-btn" onClick={() => openModal()}>+ Add User</button>

      {/* User Table */}
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Website</th>
            <th>Company</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.website}</td>
              <td>{user.company?.name}</td>
              <td>
                <button className="edit-btn" onClick={() => openModal(user)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        {[...Array(Math.ceil(users.length / usersPerPage)).keys()].map((number) => (
          <button key={number + 1} onClick={() => paginate(number + 1)}>
            {number + 1}
          </button>
        ))}
      </div>

      {/* User Form Modal */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal">
        <h3>{isEditing ? "Edit User" : "Add User"}</h3>

        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        <input name="website" placeholder="Website" value={formData.website} onChange={handleChange} />
        <input name="company.name" placeholder="Company Name" value={formData.company.name} onChange={handleChange} />

        <button className="save-btn" onClick={handleSubmit}>{isEditing ? "Update" : "Save"}</button>
        <button className="close-btn" onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default UserForm;
