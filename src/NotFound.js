import React from 'react';

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center text-gray-800 text-center">
      <h1 className="text-4xl font-bold mb-4">API Key Not Found</h1>
      <p className="text-lg mb-6">
        To use this service, please install your API key. You can input one by clicking on the key pad icon.
      </p>
    </div>
  );
}

export default NotFound;
