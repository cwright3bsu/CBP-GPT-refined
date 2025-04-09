import React from 'react';

const ProgressIndicator = ({ phase, count }) => {
  return (
    <div className="mb-2 text-sm text-gray-700">
      <p><strong>Phase:</strong> {phase === 'interview' ? 'Interview in Progress' : 'Interview Completed'}</p>
      <p><strong>Number of Exchanges:</strong> {count}</p>
    </div>
  );
};

export default ProgressIndicator;
