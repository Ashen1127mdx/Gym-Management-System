import React, { useState } from "react";
import {
  Search,
  Bell,
  Settings,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

export default function Trainers() {

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [trainers, setTrainers] = useState([
    {
      id: 1,
      name: "Mike Tyson",
      role: "Lead Instructor",
      specialization: "Cardio",
      email: "mike.t@fitzone.com",
      phone: "+1 (555) 012-3456",
      members: 12,
      image: "https://i.pravatar.cc/150?img=12",
    },

    {
      id: 2,
      name: "Sarah Jenkins",
      role: "Senior Coach",
      specialization: "Strength",
      email: "s.jenkins@fitzone.com",
      phone: "+1 (555) 987-6543",
      members: 8,
      image: "https://i.pravatar.cc/150?img=5",
    },

    {
      id: 3,
      name: "David Chen",
      role: "Flexibility Expert",
      specialization: "Yoga",
      email: "d.chen@fitzone.com",
      phone: "+1 (555) 444-2222",
      members: 20,
      image: "https://i.pravatar.cc/150?img=15",
    },
  ]);

  const badgeStyle = (type) => {
    switch (type) {
      case "Cardio":
        return {
          backgroundColor: "#FFE5D6",
          color: "#E56C2F",
        };

      case "Strength":
        return {
          backgroundColor: "#DDE7FF",
          color: "#3E63DD",
        };

      case "Yoga":
        return {
          backgroundColor: "#DFFBE8",
          color: "#2FAF68",
        };

      case "CrossFit":
        return {
          backgroundColor: "#FFE3F6",
          color: "#D92C9D",
        };

      default:
        return {
          backgroundColor: "#EEEEEE",
          color: "#555555",
        };
    }
  };

  // Search Filter
  const filteredTrainers = trainers.filter((trainer) => {
    const search = searchTerm.toLowerCase();

    return (
      trainer.name.toLowerCase().includes(search) ||
      trainer.specialization.toLowerCase().includes(search) ||
      trainer.email.toLowerCase().includes(search) ||
      trainer.phone.toLowerCase().includes(search)
    );
  });

  // Clear Form
  const clearForm = () => {
    setTrainerName("");
    setSpecialization("");
    setEmail("");
    setPhone("");
  };

  // Close Popup
  const closePopup = () => {
    clearForm();
    setShowPopup(false);
  };

  const handleEditClick = (trainer) => {
    setSelectedTrainerId(trainer.id);

    setTrainerName(trainer.name);
    setSpecialization(trainer.specialization);
    setEmail(trainer.email);
    setPhone(trainer.phone);

    setShowEditPopup(true);
  };

  // Add Trainer
  const handleAddTrainer = () => {
    if (
      !trainerName ||
      !specialization ||
      !email ||
      !phone
    ) {
      alert("Please fill all fields.");
      return;
    }

    const newTrainer = {
      id: Date.now(),
      name: trainerName,
      role: "Gym Trainer",
      specialization: specialization,
      email: email,
      phone: phone,
      members: 0,
      image: "https://i.pravatar.cc/150",
    };

    setTrainers((previous) => [...previous, newTrainer]);

    clearForm();
    setShowPopup(false);
  };

  const handleUpdateTrainer = () => {
    if (
        !trainerName.trim() ||
        !specialization.trim() ||
        !email.trim() ||
        !phone.trim()
    ) {
        alert("Please fill all fields.");
        return;
    }

    const updatedTrainers = trainers.map((trainer) => {
        if (trainer.id === selectedTrainerId) {
        return {
            ...trainer,
            name: trainerName,
            specialization,
            email,
            phone,
        };
        }

        return trainer;
    });

    setTrainers(updatedTrainers);

    clearForm();
    setShowEditPopup(false);
  };

  const closeEditPopup = () => {
    clearForm();
    setShowEditPopup(false);
    };

  return (
    <div style={styles.container}>

      {/* Top Bar */}

      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#777" />

          <input
            type="text"
            placeholder="Search trainers..."
            style={styles.input}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.icons}>
          <Bell size={20} />
          <Settings size={20} />
          <img src="https://i.pravatar.cc/150?img=30" alt="Profile" style={styles.profile}/>
        </div>
      </div>

      {/* Heading */}

      <div style={styles.heading}>
        <div>
          <h1 style={styles.title}>
            Trainers
          </h1>
          <p style={styles.subtitle}>
            Manage your professional training staff and member assignments.
          </p>
        </div>
        <button
          style={styles.addButton}
          onClick={() => setShowPopup(true)}
        >
          <Plus size={18} />
          Add Trainer
        </button>
      </div>

      {/* Trainers Table */}

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeading}>
                PHOTO & NAME
              </th>
              <th style={styles.tableHeading}>
                SPECIALIZATION
              </th>
              <th style={styles.tableHeading}>
                CONTACT INFO
              </th>
              <th style={styles.tableHeading}>
                MEMBERS
              </th>
              <th style={styles.tableHeading}>
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTrainers.length > 0 ? (
              filteredTrainers.map((trainer) => (

                <tr key={trainer.id}>
                  <td style={styles.cell}>
                    <div style={styles.trainerInfo}>
                      <img
                        src={trainer.image}
                        alt={trainer.name}
                        style={styles.avatar}
                      />

                      <div>
                        <h4 style={styles.trainerName}>
                          {trainer.name}
                        </h4>
                        <p style={styles.smallText}>
                          {trainer.role}
                        </p>
                      </div>

                    </div>
                  </td>
                  <td style={styles.cell}>
                    <span
                      style={{
                        ...styles.badge,
                        ...badgeStyle(
                          trainer.specialization
                        ),
                      }}
                    >
                      {trainer.specialization}
                    </span>
                  </td>
                  <td style={styles.cell}>
                    <p style={{ margin: 0 }}>
                      {trainer.email}
                    </p>
                    <span style={styles.smallText}>
                      {trainer.phone}
                    </span>
                  </td>

                  <td style={styles.cell}>
                    <div style={styles.members}>
                      <span>
                        {trainer.members}
                      </span>
                      <span style={styles.smallText}>
                        Assigned
                      </span>
                    </div>
                  </td>

                  <td style={styles.cell}>
                    <div style={styles.actions}>
                      <Pencil
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEditClick(trainer)}
                      />
                      <Trash2
                        size={18}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={styles.noResults}>
                  No trainers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Trainer Popup */}

      {showPopup && (

        <div style={styles.popupOverlay}>
          <div style={styles.popupContainer}>
            <h2 style={styles.popupTitle}>
              Add Trainer
            </h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Trainer Name
              </label>
              <input
                type="text"
                placeholder="Enter trainer name"
                style={styles.popupInput}
                value={trainerName}
                onChange={(e) =>
                  setTrainerName(e.target.value)
                }
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Specialization
              </label>
              <select
                style={styles.popupInput}
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)
                }>
                <option value="">
                  Select Specialization
                </option>
                <option value="Cardio">
                  Cardio
                </option>
                <option value="Strength">
                  Strength
                </option>
                <option value="Yoga">
                  Yoga
                </option>
                <option value="CrossFit">
                  CrossFit
                </option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter email address"
                style={styles.popupInput}
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter phone number"
                style={styles.popupInput}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
              />
            </div>

            <div style={styles.formButtons}>
              <button
                style={styles.cancelButton}
                onClick={closePopup}>
                Cancel
              </button>
              <button
                style={styles.saveButton}
                onClick={handleAddTrainer}>
                Save Trainer
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditPopup && (
        <div style={styles.popupOverlay}>
            <div style={styles.popupContainer}>

            <h2 style={styles.popupTitle}>
                Edit Trainer
            </h2>

            <div style={styles.formGroup}>
                <label style={styles.label}>
                Trainer Name
                </label>

                <input
                type="text"
                value={trainerName}
                onChange={(e) =>
                    setTrainerName(e.target.value)
                }
                style={styles.popupInput}
                />
            </div>


            <div style={styles.formGroup}>
                <label style={styles.label}>
                Specialization
                </label>

                <select
                value={specialization}
                onChange={(e) =>
                    setSpecialization(e.target.value)
                }
                style={styles.popupInput}
                >
                <option value="Cardio">
                    Cardio
                </option>

                <option value="Strength">
                    Strength
                </option>

                <option value="Yoga">
                    Yoga
                </option>

                <option value="CrossFit">
                    CrossFit
                </option>

                </select>

            </div>


            <div style={styles.formGroup}>
                <label style={styles.label}>
                Email Address
                </label>

                <input
                type="email"
                value={email}
                onChange={(e) =>
                    setEmail(e.target.value)
                }
                style={styles.popupInput}
                />
            </div>


            <div style={styles.formGroup}>
                <label style={styles.label}>
                Phone Number
                </label>

                <input
                type="text"
                value={phone}
                onChange={(e) =>
                    setPhone(e.target.value)
                }
                style={styles.popupInput}
                />
            </div>


            <div style={styles.formButtons}>

                <button
                style={styles.cancelButton}
                onClick={closeEditPopup}
                >
                Cancel
                </button>

                <button
                style={styles.saveButton}
                onClick={handleUpdateTrainer}
                >
                Update Trainer
                </button>

            </div>

            </div>
        </div>
    )}
    </div>
  );
}

const styles = {

  // Main Container
  container: {
    padding: "30px",
    minHeight: "100vh",
    backgroundColor: "#f7f5f2",
  },

  // Top Bar
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "320px",
    padding: "12px 18px",
    backgroundColor: "#FFFFFF",
    borderRadius: "30px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },

  input: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "15px",
    color: "#000",
    backgroundColor: "#FFFFFF",
  },

  icons: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    cursor: "pointer",
  },

  profile: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },

  // Heading
  heading: {
    marginTop: "35px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    color: "#111",
  },

  subtitle: {
    marginTop: "8px",
    color: "#777",
    fontSize: "15px",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "13px 24px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#c1440e",
    color: "#FFFFFF",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
  },

  // Table Card
  card: {
    marginTop: "30px",
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tableHeading: {
    padding: "22px",
    backgroundColor: "#F8F9FC",
    textAlign: "left",
    color: "#666",
    fontSize: "13px",
    letterSpacing: "0.5px",
  },

  cell: {
    padding: "22px",
    borderTop: "1px solid #EEEEEE",
  },

  // Trainer Info
  trainerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  avatar: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  smallText: {
    color: "#777",
    fontSize: "13px",
    marginTop: "4px",
  },

  badge: {
    padding: "8px 16px",
    borderRadius: "30px",
    fontWeight: "600",
    fontSize: "13px",
  },

  members: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  trainerName: {
    margin: 0,
    color: "#000000",
    fontWeight: "bold",
    fontSize: "16px",
  },

  actions: {
    display: "flex",
    gap: "18px",
    color: "#666",
  },

  noResults: {
    textAlign: "center",
    padding: "35px",
    color: "#888",
    fontSize: "16px",
  },

  // Popup
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  popupContainer: {
    width: "520px",
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    padding: "35px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
  },

  popupTitle: {
    marginTop: 0,
    marginBottom: "30px",
    color: "#111",
    fontSize: "28px",
  },

  // Form
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },

  label: {
    fontWeight: "600",
    color: "#111",
    marginBottom: "8px",
  },

  popupInput: {
    width: "100%",
    padding: "14px",
    boxSizing: "border-box",
    borderRadius: "10px",
    border: "1px solid #D8D8D8",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontSize: "15px",
    outline: "none",
  },

  // Buttons
  formButtons: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
  },

  cancelButton: {
    padding: "12px 22px",
    borderRadius: "8px",
    border: "1px solid #CCCCCC",
    backgroundColor: "#FFFFFF",
    color: "#444",
    cursor: "pointer",
    fontWeight: "600",
  },

  saveButton: {
    padding: "12px 22px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#c1440e",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: "600",
  },
};
