import { useAuth } from "../contexts/AuthContext";

export default function Admin({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="text-lg font-bold">Welcome {user?.name}</h1>
        <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">
          Logout
        </button>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
