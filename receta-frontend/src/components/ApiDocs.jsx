export default function ApiDocs() {
  return (
    <div className="card">
      <h3>Documentación de APIs</h3>

      <div className="tabs">
        <span className="tab active">API Pública</span>
        <span className="tab">API Privada</span>
      </div>

      <div className="apiList">
        <div className="apiItem ok">
          <div className="apiMethod">GET</div>
          <div className="apiPath">/api/recommendations?query=...</div>
          <div className="apiMeta">Creador: Backend (Spring Boot) + OpenFDA</div>
        </div>

        <div className="apiItem warn">
          <div className="apiMethod">GET</div>
          <div className="apiPath">/api/patients</div>
          <div className="apiMeta">Creador: Backend (Spring Boot) + H2</div>
        </div>

        <div className="apiItem private">
          <div className="apiMethod">POST</div>
          <div className="apiPath">/api/patients</div>
          <div className="apiMeta">Creador: Backend (ADMIN)</div>
        </div>

        <div className="apiItem private">
          <div className="apiMethod">PUT</div>
          <div className="apiPath">/api/patients/{`{id}`}</div>
          <div className="apiMeta">Creador: Backend (ADMIN)</div>
        </div>

        <div className="apiItem private">
          <div className="apiMethod">DELETE</div>
          <div className="apiPath">/api/patients/{`{id}`}</div>
          <div className="apiMeta">Creador: Backend (ADMIN)</div>
        </div>

        <div className="apiItem info">
          <div className="apiMethod">EXT</div>
          <div className="apiPath">https://api.fda.gov/drug/label.json</div>
          <div className="apiMeta">Creador: OpenFDA (FDA)</div>
        </div>
      </div>
    </div>
  );
}