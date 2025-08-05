// frontend/src/app/layout/Layout.tsx
import React from 'react';
import Header from './Header';
import SubHeader from './SubHeader';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <SubHeader />
    <main className="flex-1 bg-gray-50 py-6">
      <div className="container mx-auto px-4">{children}</div>
    </main>
  </div>
);

export default Layout;
