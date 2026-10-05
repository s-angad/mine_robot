import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#030712] text-slate-100 font-mono p-4">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">404 - SECTOR NOT FOUND</h2>
      <p className="text-slate-400 text-sm mb-4">The requested telemetry route or page does not exist.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 rounded font-bold text-xs transition-colors"
      >
        RETURN TO COMMAND CENTER
      </Link>
    </div>
  );
}
