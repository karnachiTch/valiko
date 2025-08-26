import React from 'react';

const LoginBackground = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden min-h-screen" style={{ minHeight: '100vh' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-purple-500/50"></div>
      <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
        <div className="mb-8">
          <h1 
            className="text-8xl font-extrabold text-white mb-8 drop-shadow-lg animate-bounce font-sans"
            style={{ animationDuration: '3s' }}
          >
            Valikoo
          </h1>
        </div>
        
        
       
      </div>
    </div>
  );
};

export default LoginBackground;