import React from "react";

/**
 * Props du composant QuantitySelector
 */
interface QuantitySelectorProps {
  /** Quantité actuelle */
  quantity: number;
  /** Callback appelé lors du changement de quantité */
  onChange: (newQuantity: number) => void;
  /** Quantité minimale (défaut: 1) */
  min?: number;
  /** Quantité maximale (optionnelle) */
  max?: number;
  /** Indique si le sélecteur est désactivé */
  disabled?: boolean;
  /** Indique si une action est en cours */
  isLoading?: boolean;
}

/**
 * Composant de sélection de quantité réutilisable
 * Affiche des boutons +/- et un input pour modifier la quantité
 *
 * @example
 * <QuantitySelector
 *   quantity={quantity}
 *   onChange={handleQuantityChange}
 *   min={1}
 *   disabled={isLoading}
 * />
 */
const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onChange,
  min = 1,
  max,
  disabled = false,
  isLoading = false,
}) => {
  const handleDecrease = () => {
    if (!disabled && !isLoading && quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (!disabled && !isLoading && (!max || quantity < max)) {
      onChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isLoading) return;
    const val = parseInt(e.target.value) || min;
    const newQuantity = Math.max(min, max ? Math.min(max, val) : val);
    onChange(newQuantity);
  };

  const isDecreaseDisabled = disabled || isLoading || quantity <= min;
  const isIncreaseDisabled =
    disabled || isLoading || (max !== undefined && quantity >= max);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <button
        onClick={handleDecrease}
        disabled={isDecreaseDisabled}
        style={{
          width: "44px",
          height: "44px",
          border: "2px solid #13686a",
          background: "white",
          color: "#13686a",
          borderRadius: "10px",
          cursor: isDecreaseDisabled ? "not-allowed" : "pointer",
          fontSize: "1.5rem",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isDecreaseDisabled ? 0.5 : 1,
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          if (!isDecreaseDisabled) {
            e.currentTarget.style.background = "#f0f9fa";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "white";
        }}
      >
        <i className="fas fa-minus"></i>
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled || isLoading}
        style={{
          width: "100px",
          height: "44px",
          textAlign: "center",
          border: "2px solid #ddd",
          fontSize: "1.4rem",
          borderRadius: "10px",
          fontWeight: "600",
          transition: "border-color 0.3s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#13686a";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#ddd";
        }}
      />
      <button
        onClick={handleIncrease}
        disabled={isIncreaseDisabled}
        style={{
          width: "44px",
          height: "44px",
          border: "2px solid #13686a",
          background: isIncreaseDisabled ? "#ccc" : "#13686a",
          color: "white",
          borderRadius: "10px",
          cursor: isIncreaseDisabled ? "not-allowed" : "pointer",
          fontSize: "1.5rem",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          if (!isIncreaseDisabled) {
            e.currentTarget.style.background = "#0dd3d1";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = isIncreaseDisabled
            ? "#ccc"
            : "#13686a";
        }}
      >
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

export default QuantitySelector;
