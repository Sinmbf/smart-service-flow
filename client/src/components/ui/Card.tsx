import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
