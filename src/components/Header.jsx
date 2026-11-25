
import { Bell, UserCircle } from "lucide-react";

export default function Header({ title }) {
  return (
    <header className="header">
      <h1>{title}</h1>

      <div className="header-actions">
        <Bell size={20} />
        <UserCircle size={28} />
      </div>
    </header>
  );
}
