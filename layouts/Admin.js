 
export default function Admin({ children }) { 

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between"> 
         
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
