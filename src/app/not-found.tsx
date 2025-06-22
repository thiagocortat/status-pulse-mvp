import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Página não encontrada</h1>
        <p>A página que você procura não existe.</p>
        <Link href="/" className="text-blue-600 underline">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
