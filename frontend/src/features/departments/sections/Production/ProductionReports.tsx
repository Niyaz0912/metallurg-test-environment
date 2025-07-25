// src/features/departments/sections/Production/ProductionReports.tsx
import React from 'react';

interface Report {
  id: number;
  title: string;
}

export const ProductionReports = ({ reports }: { reports: Report[] }) => {
  return (
    <div>
      <h2>Отчёты</h2>
      {reports.map(report => (
        <div key={report.id}>{report.title}</div>
      ))}
    </div>
  );
};