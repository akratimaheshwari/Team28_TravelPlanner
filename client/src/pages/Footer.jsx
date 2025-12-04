import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-center p-6 mt-8">
      <p>&copy; {new Date().getFullYear()} TravelSync. All rights reserved.</p>
      <p>Made with ❤️ for group travelers</p>
    </footer>
  );
}
