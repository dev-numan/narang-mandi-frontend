import { useAuth } from '../../context/AuthContext.jsx';

// Shown across the top of the admin/shop panels while an admin is "logged in
// as" another user, with one click to return to their own admin session.
export default function ImpersonationBanner() {
  const { impersonating, user, returnToAdmin } = useAuth();
  if (!impersonating) return null;

  const back = async () => {
    await returnToAdmin();
    window.location.assign('/admin/users');
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-black">
      <span>
        You are logged in as <strong>{user?.name}</strong>
        {user?.email ? ` (${user.email})` : ''}.
      </span>
      <button
        onClick={back}
        className="rounded bg-black/80 px-3 py-1 text-xs font-semibold text-white hover:bg-black"
      >
        ← Return to admin
      </button>
    </div>
  );
}
