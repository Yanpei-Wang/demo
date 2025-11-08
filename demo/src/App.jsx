import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import "@/App.css";
import { useState } from "react";
import { mockUsers } from "@/utils/mockData";
import Header from "@/components/layout/Header";
import Profile from "@/pages/Profile";
// 占位组件，用于尚未开发的页面
const Placeholder = ({ title }) => (
  <div style={{ padding: 20 }}>
    <h2>{title}</h2>
    <p>页面尚未开发</p>
  </div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(mockUsers[0]);
  const [showUserSelector, setShowUserSelector] = useState(false);

  // 判断内部账号
  const isInternal = currentUser.role.some(r =>
    ["circlecat_employee", "circlecat_intern", "circlecat_volunteer"].includes(r)
  );

  // 判断管理员
  const isAdmin = currentUser.role.includes("admin");

  // 判断 mentor / mentee
  const isMentorOrMentee = ["mentor", "mentee"].includes(currentUser.participant_role);

  return (
    <Router>
      <div className="app-container">
        <Header />

        <div className="app-body">
          {/* Sidebar */}
          <div className="sidebar">
            <nav className="sidebar-nav">
              <ul>
                <li>
                  <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active-link" : ""}>
                    Dashboard
                  </NavLink>
                </li>

                {/* DataSearch 仅内部账号可见 */}
                {isInternal && (
                  <li>
                    <NavLink to="/datasearch" className={({ isActive }) => isActive ? "active-link" : ""}>
                      DataSearch
                    </NavLink>
                  </li>
                )}

                {/* Admin routes */}
                {isAdmin && (
                  <>
                    <li>
                      <NavLink to="/admin/users" className={({ isActive }) => isActive ? "active-link" : ""}>
                        User Management
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/matching" className={({ isActive }) => isActive ? "active-link" : ""}>
                        Match Management
                      </NavLink>
                    </li>
                  </>
                )}

                {/* Mentor / Mentee routes */}
                {isMentorOrMentee && (
                  <>
                    <li>
                      <NavLink to="/meetings" className={({ isActive }) => isActive ? "active-link" : ""}>
                        Meetings
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/history" className={({ isActive }) => isActive ? "active-link" : ""}>
                        History
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            {/* User selector */}
            <div className="p-4 border-t">
              <button
                onClick={() => setShowUserSelector(!showUserSelector)}
                className="w-full border rounded p-2 mb-2 text-sm"
              >
                切换角色 (演示)
              </button>

              {showUserSelector && (
                <div className="grid gap-2">
                  {mockUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => { setCurrentUser(user); setShowUserSelector(false); }}
                      className={`border rounded p-2 text-left transition-colors ${
                        currentUser.id === user.id ? 'border-blue-500 bg-blue-50' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-sm">{user.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Placeholder title="Dashboard" />} />
              <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />

              {/* DataSearch 仅内部账号 */}
              {isInternal && <Route path="/datasearch" element={<Placeholder title="DataSearch" />} />}

              {/* 占位组件代替尚未开发的页面 */}
              <Route path="/profile" element={<Profile/>} />
              {isMentorOrMentee && (
                <>
                  <Route path="/meetings" element={<Placeholder title="Meetings" />} />
                  <Route path="/history" element={<Placeholder title="History" />} />
                </>
              )}
              {isAdmin && (
                <>
                  <Route path="/admin/users" element={<Placeholder title="User Management" />} />
                  <Route path="/admin/matching" element={<Placeholder title="Match Management" />} />
                </>
              )}

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
