import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "../css/UserForm.css";

const API_URL = "https://jsonplaceholder.typicode.com/users";

Modal.setAppElement("#root");

const UserForm = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    username: "",
    email: "",
    phone: "",
    website: "",
    company: { name: "" },
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("company")) {
      setFormData({ ...formData, company: { ...formData.company, name: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openModal = (user = null) => {
    setIsEditing(!!user);
    setFormData(
      user || { id: "", name: "", username: "", email: "", phone: "", website: "", company: { name: "" } }
    );
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({ id: "", name: "", username: "", email: "", phone: "", website: "", company: { name: "" } });
  };

  const handleSubmit = () => {
    if (isEditing) {
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
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((newUser) => {
          setUsers([...users, { ...newUser, id: users.length + 1 }]);
          closeModal();
        });
    }
  };

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

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <h2>User Management</h2>
      <button className="add-btn" onClick={() => openModal()}>+ Add User</button>

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

      <div className="pagination">
        {[...Array(Math.ceil(users.length / usersPerPage)).keys()].map((number) => (
          <button key={number + 1} onClick={() => paginate(number + 1)}>
            {number + 1}
          </button>
        ))}
      </div>

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
