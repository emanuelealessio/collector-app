import SearchComponent from './components/SearchComponent';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Collector's Vault
          </h1>
          <p className="text-xl text-gray-400">
            Track your high-value Pokémon cards. Only cards worth $5+ are shown.
          </p>
        </header>

        <SearchComponent />
      </div>
    </main>
  );
}
