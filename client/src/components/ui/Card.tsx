import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6 md:p-8 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
