// Ambil URL dari .env
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL;

export function runServer(fnName /*, ...args */) {
  const args = Array.prototype.slice.call(arguments, 1);
  return new Promise((resolve, reject) => {
    try {
      // Ambil list provinsi lewat WebApp proxy
      if (fnName === 'getProvinces') {
        fetch(WEB_APP_URL + '?action=getProvinces')
          .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(json => resolve((Array.isArray(json) ? json : []).map(p => ({ id: p.id, name: p.name }))))
          .catch(err => reject(err));
        return;
      }

      // Ambil regencies (kab/kota) lewat WebApp proxy
      if (fnName === 'getRegencies') {
        const provId = args[0];
        if (!provId) { resolve([]); return; }
        fetch(WEB_APP_URL + '?action=getRegencies&provId=' + encodeURIComponent(provId))
          .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(json => resolve((Array.isArray(json) ? json : []).map(it => ({ id: it.id, name: it.name }))))
          .catch(err => reject(err));
        return;
      }

      // Ambil countries lewat WebApp proxy
      if (fnName === 'getCountries') {
        fetch(WEB_APP_URL + '?action=getCountries')
          .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(arr => {
            const mapped = (Array.isArray(arr) ? arr : []).map(c => ({ id: (c.cca2||c.ccn3||c.cca3||c.cioc||c.cca2), name: (c.name && (c.name.common || c.name.official)) || c.name }));
            mapped.sort((a,b) => String(a.name).localeCompare(String(b.name)));
            resolve(mapped);
          })
          .catch(err => reject(err));
        return;
      }

      // Simpan form -> POST ke WebApp (doPost)
      if (fnName === 'saveForm' || fnName === 'save' || fnName === 'saveResponse') {
        const payload = args[0] || {};
        const body = 'payload=' + encodeURIComponent(JSON.stringify(payload));
        fetch(WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: body,
          mode: 'cors'
        })
        .then(res => {
          if (!res.ok) return res.text().then(t => { throw new Error('HTTP ' + res.status + ': ' + t); });
          return res.json().catch(()=>({ ok:true, message:'OK (no-json)' }));
        })
        .then(json => resolve(json))
        .catch(err => reject(err));
        return;
      }

      // fallback
      console.warn('runServer: unknown fnName', fnName);
      resolve(null);
    } catch (err) {
      reject(err);
    }
  });
}