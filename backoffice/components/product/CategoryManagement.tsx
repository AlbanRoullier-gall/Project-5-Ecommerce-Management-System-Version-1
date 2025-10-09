import React, { useState, useEffect } from "react";
import {
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
} from "../../dto";

interface CategoryManagementProps {
  categories: CategoryPublicDTO[];
  onAddCategory: (data: CategoryCreateDTO) => void;
  onUpdateCategory: (id: number, data: CategoryUpdateDTO) => void;
  onDeleteCategory: (id: number) => void;
  isLoading?: boolean;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isLoading = false,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryPublicDTO | null>(null);
  const [formData, setFormData] = useState<
    CategoryCreateDTO | CategoryUpdateDTO
  >({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || "",
      });
      setIsFormOpen(true);
    }
  }, [editingCategory]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Le nom de la catégorie est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, formData);
    } else {
      onAddCategory(formData as CategoryCreateDTO);
    }

    handleCancel();
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setErrors({});
  };

  const handleEdit = (category: CategoryPublicDTO) => {
    setEditingCategory(category);
  };

  const handleDelete = (categoryId: number, categoryName: string) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ? Tous les produits de cette catégorie devront être réassignés.`
      )
    ) {
      onDeleteCategory(categoryId);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("fr-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem 1.25rem",
    border: "2px solid #e1e5e9",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: "#f8f9fa",
    fontFamily: "inherit",
    boxSizing: "border-box",
    maxWidth: "100%",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#13686a",
    marginBottom: "0.75rem",
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "3px solid #d9b970",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#13686a",
            margin: 0,
          }}
        >
          🏷️ Catégories
        </h2>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 2rem",
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(19, 104, 106, 0.2)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(19, 104, 106, 0.35)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(19, 104, 106, 0.2)";
            }}
          >
            <i className="fas fa-plus" style={{ fontSize: "1.1rem" }}></i>
            <span>Nouvelle catégorie</span>
          </button>
        )}
      </div>

      {/* Formulaire */}
      {isFormOpen && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "2rem",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: "12px",
            border: "2px solid rgba(19, 104, 106, 0.2)",
            width: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "1.5rem",
              color: "#13686a",
            }}
          >
            {editingCategory
              ? "✏️ Modifier la catégorie"
              : "➕ Nouvelle catégorie"}
          </h3>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "1.5rem",
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <label htmlFor="name" style={labelStyle}>
                Nom *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  borderColor: errors.name ? "#dc2626" : "#e1e5e9",
                }}
                placeholder="Ex: Pierres précieuses"
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = "#13686a";
                    e.target.style.background = "white";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(19, 104, 106, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.name
                    ? "#dc2626"
                    : "#e1e5e9";
                  e.target.style.background = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                }}
              />
              {errors.name && (
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    color: "#dc2626",
                  }}
                >
                  ⚠️ {errors.name}
                </p>
              )}
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <label htmlFor="description" style={labelStyle}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                style={inputStyle}
                placeholder="Description de la catégorie..."
                onFocus={(e) => {
                  e.target.style.borderColor = "#13686a";
                  e.target.style.background = "white";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(19, 104, 106, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e1e5e9";
                  e.target.style.background = "#f8f9fa";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                paddingTop: "1rem",
                borderTop: "2px solid rgba(19, 104, 106, 0.1)",
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "2px solid #e1e5e9",
                  background: "white",
                  color: "#6b7280",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.borderColor = "#13686a";
                    e.currentTarget.style.color = "#13686a";
                    e.currentTarget.style.background = "#f8f9fa";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#e1e5e9";
                  e.currentTarget.style.color = "#6b7280";
                  e.currentTarget.style.background = "white";
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  background:
                    "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(19, 104, 106, 0.2)",
                  opacity: isLoading ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(19, 104, 106, 0.35)";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(19, 104, 106, 0.2)";
                }}
              >
                {isLoading
                  ? "⏳ En cours..."
                  : editingCategory
                  ? "💾 Mettre à jour"
                  : "➕ Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des catégories */}
      <div>
        {categories.length === 0 ? (
          <div
            style={{
              background: "#f8f9fa",
              padding: "3rem 2rem",
              borderRadius: "12px",
              textAlign: "center",
              border: "2px dashed #d1d5db",
            }}
          >
            <i
              className="fas fa-tags"
              style={{
                fontSize: "3rem",
                color: "#d1d5db",
                marginBottom: "1rem",
              }}
            ></i>
            <p style={{ fontSize: "1.1rem", color: "#6b7280" }}>
              Aucune catégorie créée
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                fontSize: "1rem",
              }}
            >
              <thead
                style={{
                  background:
                    "linear-gradient(135deg, #d9b970 0%, #f4d03f 100%)",
                  color: "#13686a",
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      textAlign: "left",
                      fontSize: "1rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Nom
                  </th>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      textAlign: "left",
                      fontSize: "1rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      textAlign: "left",
                      fontSize: "1rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Produits
                  </th>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      textAlign: "left",
                      fontSize: "1rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Date création
                  </th>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      textAlign: "left",
                      fontSize: "1rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    style={{
                      borderBottom: "1px solid #e1e5e9",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(90deg, rgba(217, 185, 112, 0.05) 0%, rgba(244, 208, 63, 0.05) 100%)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            background:
                              "linear-gradient(135deg, #d9b970 0%, #f4d03f 100%)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#13686a",
                          }}
                        >
                          <i
                            className="fas fa-tag"
                            style={{ fontSize: "1.2rem" }}
                          ></i>
                        </div>
                        <span
                          style={{
                            fontSize: "1rem",
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          fontSize: "1rem",
                          color: "#6b7280",
                          maxWidth: "300px",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {category.description || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 1rem",
                          background: "#f3f4f6",
                          borderRadius: "20px",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          color: "#13686a",
                        }}
                      >
                        <i className="fas fa-box"></i>
                        {category.productCount || 0}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "1.25rem 1.5rem",
                        fontSize: "1rem",
                        color: "#6b7280",
                      }}
                    >
                      {formatDate(category.createdAt)}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() => handleEdit(category)}
                          title="Modifier"
                          style={{
                            padding: "0.75rem",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "#3b82f6",
                            transition: "all 0.2s ease",
                            borderRadius: "8px",
                            fontSize: "1.2rem",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background =
                              "rgba(59, 130, 246, 0.1)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(category.id, category.name)
                          }
                          title="Supprimer"
                          style={{
                            padding: "0.75rem",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            transition: "all 0.2s ease",
                            borderRadius: "8px",
                            fontSize: "1.2rem",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background =
                              "rgba(239, 68, 68, 0.1)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
