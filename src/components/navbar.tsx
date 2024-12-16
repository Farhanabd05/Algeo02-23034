
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "./ui/navigation-menu";
import Link from 'next/link';
export default function Navbar() {
    return (
    <div className="container mx-auto p-4 bg-gray-100 dark:bg-gray-800 flex justify-center">
        <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
                <Link className="text-l font-bold bg-gray-500 hover:bg-white hover:text-gray-900 text-white py-2 px-4 rounded" href="/">Upload</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
                <Link className="text-l font-bold bg-gray-500 hover:bg-white hover:text-gray-900 text-white py-2 px-4 rounded" href="/gallery/image">Image</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
                <Link className="text-l font-bold bg-gray-500 hover:bg-white hover:text-gray-900 text-white py-2 px-4 rounded" href="/gallery/audio">Audio</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
    );
}
