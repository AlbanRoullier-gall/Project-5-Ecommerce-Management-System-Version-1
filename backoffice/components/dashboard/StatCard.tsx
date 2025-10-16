import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p className="stat-number">{typeof value === "number" ? value : value}</p>
      {subtitle ? <p className="stat-label">{subtitle}</p> : null}
    </div>
  );
};

export default StatCard;
