import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p>View all trips, expenses, and group activities here.</p>
      </main>
      <Footer />
    </div>
  );
}
