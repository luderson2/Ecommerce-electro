export default function Footer() {
  return (
    <footer className="border-t bg-primary text-white">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-sm text-white/70">
          © {new Date().getFullYear()} ElectroMétropolitain. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
