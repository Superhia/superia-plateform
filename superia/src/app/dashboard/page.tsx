import UserList from '../components/UserList';

export default function Home() {
  return (
    <main className="flex text-black min-h-screen flex-col items-left p-14 bg-white">
    <div>
      <h1 className="text-4xl font-semibold text-center py-7">Bienvenue dans votre system de management</h1>
      <UserList />
    </div>
    </main>
  );
}