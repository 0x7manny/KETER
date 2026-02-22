'use client';

export default function Footer() {
  return (
    <footer className="border-t border-keter-border-light mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-serif text-keter-text">Keter</span>
          <span className="text-keter-text-muted">&middot;</span>
          <span className="text-keter-text-muted">Hackin'dau 2026</span>
        </div>
        <span className="text-keter-text-muted text-sm">Paris-Dauphine</span>
      </div>
    </footer>
  );
}
