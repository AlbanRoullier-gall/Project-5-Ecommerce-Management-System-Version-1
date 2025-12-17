import React from "react";
import styles from "../../styles/components/QuantitySelector.module.css";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  isLoading?: boolean;
}

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
    <div className={styles.root}>
      <button
        onClick={handleDecrease}
        disabled={isDecreaseDisabled}
        className={`${styles.button} ${styles.minus}`}
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
        className={styles.input}
      />
      <button
        onClick={handleIncrease}
        disabled={isIncreaseDisabled}
        className={`${styles.button} ${styles.plus}`}
      >
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

export default QuantitySelector;
