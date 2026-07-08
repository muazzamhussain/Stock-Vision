import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black/20 mt-12">
      <div className="container flex flex-col gap-4 py-6 text-sm text-gray-400 md:flex-row md:items-center md:justify-between">
        <p>© 2026 Stock Vision. Stay ahead of the market.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="transition hover:text-yellow-500">
            Dashboard
          </Link>
          <Link href="/watchlist" className="transition hover:text-yellow-500">
            Watchlist
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
