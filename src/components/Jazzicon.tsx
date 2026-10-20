import JazziconDefault from 'react-jazzicon';

// react-jazzicon 1.0.4 is CommonJS: it sets __esModule and exports the
// component on .default. Vite 8's consistent-CJS-interop rule hands a
// default import the whole module.exports object when the importer's
// closest package.json sets "type": "module", which this one does, so
// the component arrives on .default rather than being the binding.
// React then receives an object and throws error #130.
// The ?? keeps this correct if interop is ever fixed upstream.
const Jazzicon = ((JazziconDefault as { default?: unknown }).default ??
  JazziconDefault) as typeof JazziconDefault;

export default Jazzicon;