export const Footer = () => {
  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-variant/30 py-6 text-center text-xs text-on-surface-variant font-medium mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex justify-center">
        <p className="text-[11px] opacity-75">
          &copy; {new Date().getFullYear()} FitZone Gym. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
