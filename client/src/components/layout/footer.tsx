import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-4 px-4 text-center border-t border-gray-800">
      <div className="container mx-auto">
        <p className="text-sm">&copy; {currentYear} - Hospital Laundry Management System. All rights reserved.</p>
        <p className="text-xs text-gray-400 mt-1">&#8902; LMS-React v1.0</p>
      </div>
    </footer>
  );
}