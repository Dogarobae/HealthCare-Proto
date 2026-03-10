export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brandIcon">✚</span>
        <span className="brandText">Receta de Pacientes</span>
      </div>

      <div className="tabs">
        <button className="tab active">API Pública</button>
        <button className="tab">API Privada</button>
      </div>

      <div className="user">
        <div className="avatar">UCA</div>
        <span>Equipo Caguama</span>
      </div>
    </header>
  );
}