const LoadingPages = () => {
  return (
    <div className='fixed flex justify-center items-center w-full h-screen bg-white/75 backdrop-filter backdrop-blur-md z-50 animate-in fade-in duration-700'>
      <div className='flex flex-row relative pb-1'>
        <a href='/'>
          <img src='/img/logo.png' width={190} />
        </a>
        <div className='flex flex-row space-x-2 absolute right-3 bottom-0'>
          <div className='bg-blue-900 w-3 h-3 rounded-full animate-bounce delay-75'></div>
          <div className='bg-blue-800 w-3 h-3 rounded-full animate-bounce delay-150'></div>
          <div className='bg-blue-700  w-3 h-3 rounded-full animate-bounce delay-300'></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPages;
