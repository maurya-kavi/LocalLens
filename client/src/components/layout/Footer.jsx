function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-shell flex flex-col gap-2 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} LocalLens</p>
        <p>Helping you discover what is available nearby.</p>
      </div>
    </footer>
  );
}

export default Footer;
