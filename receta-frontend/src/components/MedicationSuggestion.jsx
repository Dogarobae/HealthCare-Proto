export default function MedicationSuggestion({ items = [], loading = false, error = "" }) {
  return (
    <div className="card">
      <div className="cardHeader">
        <h3>Sugerir Medicamento</h3>
      </div>

      {loading && <p className="muted">Buscando recomendaciones...</p>}
      {!loading && error && <div className="alert error">{error}</div>}
      {!loading && !error && items.length === 0 && <p className="muted">No hay recomendaciones aún.</p>}

      {!loading && !error && items.length > 0 && (
        <div className="medList">
          {items.map((m, i) => (
            <div key={i} className="medItem">
              <div>
                <div className="medName">{m.name}</div>
                <div className="muted">{m.generic || m.function || ""}</div>
              </div>
              <button className="btnOutline" type="button">Sugerir</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}