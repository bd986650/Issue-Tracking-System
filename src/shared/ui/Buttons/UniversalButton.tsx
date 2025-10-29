"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface UniversalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string; // Опциональная ссылка для навигации
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  // Кастомные цвета
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
}

export default function UniversalButton({
  children,
  onClick,
  href,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
  backgroundColor,
  textColor,
  borderColor,
  hoverBackgroundColor,
  hoverTextColor,
}: UniversalButtonProps) {
  const router = useRouter();

  const baseClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:opacity-95 disabled:opacity-50",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50",
    outline: "border border-gray-300 text-gray-700 hover:opacity-90 disabled:opacity-50"
  };

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  // Создаем кастомные стили если переданы цвета
  const customStyles: React.CSSProperties = {};
  if (backgroundColor) customStyles.backgroundColor = backgroundColor;
  if (textColor) customStyles.color = textColor;
  if (borderColor) customStyles.borderColor = borderColor;

  // Создаем кастомные классы для hover эффектов
  const customHoverClasses = [];
  if (hoverBackgroundColor) {
    customHoverClasses.push(`hover:bg-[${hoverBackgroundColor}]`);
  }
  if (hoverTextColor) {
    customHoverClasses.push(`hover:text-[${hoverTextColor}]`);
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      style={customStyles}
      className={`${baseClasses} ${variantClasses[variant]} ${customHoverClasses.join(' ')} ${className}`}
    >
      {children}
    </button>
  );
}
