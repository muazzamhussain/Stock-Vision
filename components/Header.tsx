import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
import { searchStocks } from "@/lib/actions/finnhub.actions";

const Header = async ({ user }: { user: User }) => {
  const initialStocks = await searchStocks();

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-800 border-b border-gray-700/50 shadow-md">
      <div className="container mx-auto max-w-screen-2xl flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 min-h-[90px]">
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/icons/logo.svg"
            alt="Stock Vision logo"
            width={200}
            height={60}
            className="h-14 w-auto cursor-pointer"
          />
        </Link>
        <nav className="hidden sm:block">
          <NavItems initialStocks={initialStocks} />
        </nav>

        <UserDropdown user={user} initialStocks={initialStocks} />
      </div>
    </header>
  );
};
export default Header;
