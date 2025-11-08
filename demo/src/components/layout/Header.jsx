import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css"; // 确保导入了CSS
import logo from "@/assets/logo.png";
import { getCookie, extractCloudflareUserName } from "@/utils/auth";

const Header = () => {
  const [char, setChar] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // 此ref现在用于header-right div，以检测点击外部

  useEffect(() => {
    const cloudflareJwtCookie = getCookie("CF_Authorization");
    if (cloudflareJwtCookie) {
      const extractedName = extractCloudflareUserName(cloudflareJwtCookie);
      if (extractedName && extractedName.length > 0) {
        setChar(extractedName.charAt(0).toUpperCase());
      }
    }
  }, []);

  // 点击页面其他地方关闭下拉
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 确保点击事件不在dropdownRef（即header-right div及其子元素）内部
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Purrf Logo" className="logo" />
        <span className="logo-text">Purrf</span>
      </div>
      {/* 将dropdownRef绑定到 header-right，这样点击此区域内（包括头像和下拉菜单本身）不会关闭下拉 */}
      <div className="header-right" ref={dropdownRef}>
        <div
          className="user-name cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {char}
        </div>

        {dropdownOpen && (
          <div className="profile-dropdown"> {/* 移除行内样式，使用CSS类 */}
            <div
              className="dropdown-item" // 移除行内样式和onMouseEnter/onMouseLeave，使用CSS的:hover
              onClick={() => {
                setDropdownOpen(false);
                navigate("/profile");
              }}
            >
              View Profile
            </div>
            {/* 可以在这里添加更多下拉菜单项 */}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;