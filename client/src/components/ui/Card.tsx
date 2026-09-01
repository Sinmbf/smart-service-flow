import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
