import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Building2, User } from 'lucide-react';
import logo from "../assets/logo.png";

interface HeaderProps {
  userName?: string;
  userRole?: string;
}

export function Header({ userName = '用户', userRole = 'Employee' }: HeaderProps) {
  const navigate = useNavigate();

  // Get initials from userName
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left - Company Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Purrf Logo" className="h-6 w-6 text-white" />
          <div>

            <div className="text-sm font-semibold text-gray-900">CircleCat</div>
            <div className="text-xs text-gray-500 font-medium">Purrf</div>
          </div>
        </div>

        {/* Right - User Avatar with Dropdown */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{userName}</div>
            <div className="text-xs text-gray-500">{userRole}</div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-[#6035F3] focus:ring-offset-2 rounded-full">
                <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-all hover:shadow-md">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-[#6035F3] to-[#8B6EF7] text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
