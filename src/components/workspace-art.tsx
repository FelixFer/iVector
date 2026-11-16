import styles from "./artwork.module.css";

export function WorkspaceArt() {
  return <svg viewBox="0 0 120 90" width="480" height="360" shapeRendering="crispEdges" aria-hidden="true" className={styles.workspace} data-artwork="workspace">
  <rect width="120" height="90" fill="#e9ded0"/>
  <path fill="var(--workspace-wall, #f3e9d9)" d="M0 0h120v57H0z"/>
  <path fill="#dbc5af" d="M0 57h120v4H0z"/>
  <path fill="var(--workspace-floor, #e3cfbb)" d="M0 61h120v29H0z"/>
  <path fill="#d7c0aa" d="M0 70h120v1H0zm0 9h120v1H0zm0 8h120v1H0zM20 61h1v9h-1zm48 10h1v8h-1zm24 9h1v7h-1z"/>
  <path fill="#cbb3a0" d="M75 11h34v36H75z"/>
  <path fill="#fff7e9" d="M73 9h34v36H73z"/>
  <path fill="var(--workspace-sky, #cddfec)" d="M76 12h28v30H76z"/>
  <path className={styles.day} fill="#ecdeb8" d="M96 15h5v5h-5z"/>
  <path className={styles.night} fill="#fff1c2" d="M96 15h4v1h-2v3h2v1h-4zM79 16h1v1h-1zm5 3h1v1h-1zm18 4h1v1h-1z" />
  <path fill="var(--workspace-hills, #96acb4)" d="M76 30h4v-3h4v-4h4v-3h4v5h4v4h4v3h4v10H76z"/>
  <path fill="var(--workspace-trees, #77988b)" d="M76 34h7v-2h7v4h6v-5h8v11H76z"/>
  <path fill="#fff7e9" d="M89 12h2v30h-2zM76 27h28v2H76z"/>
  <path fill="#d8c2a8" d="M74 44h33v3H74z"/>
  <path fill="#b7977d" d="M13 22h45v4H13z"/>
  <path fill="#c9aa90" d="M14 21h44v2H14z"/>
  <path fill="#80979c" d="M17 9h4v12h-4zm17 3h4v9h-4z"/>
  <path fill="#a08a9f" d="M22 11h4v10h-4zm17-2h5v12h-5z"/>
  <path fill="#a6b499" d="M27 8h5v13h-5zm18 4h4v9h-4z"/>
  <path fill="#eee7d5" d="M17 12h4v1h-4zm10 1h5v1h-5zm12-1h5v1h-5z"/>
  <path fill="#d0ad92" d="M17 53h87v5H17z"/>
  <path fill="#a78069" d="M17 58h87v4H17zm6 4h4v21h-4zm70 0h4v21h-4z"/>
  <path fill="#bc997d" d="M26 63h22v14H26z"/>
  <path fill="#dbc0a5" d="M28 65h18v5H28zm0 7h18v3H28z"/>
  <path fill="#826755" d="M34 67h6v1h-6zm0 6h6v1h-6z"/>
  <path fill="#586973" d="M37 34h24v15H37zm10 15h4v3h-4zm-3 3h10v1H44z"/>
  <path fill="#dbe8eb" d="M39 36h20v11H39z"/>
  <path fill="#809fa8" d="M42 43h3v-2h3v-2h3v2h3v-3h3v1h-2v3h-5v-2h-1v2h-3v2h-4z"/>
  <path fill="#ece7d8" d="M42 54h16v2H42zm19 0h3v2h-3z"/>
  <path fill="#a4956e" d="M78 39h2v13h-2zm-5 13h12v1H73z"/>
  <path fill="var(--workspace-lamp, #f5dc9f)" d="M75 34h8v2h2v6H73v-6h2z"/>
  <path fill="#d8bd88" d="M73 41h12v2H73z"/>
  <path fill="#f7efe3" d="M67 53h7v3h-7z"/>
  <path fill="#ad8a77" d="M68 54h4v1h-4z"/>
  <path fill="#748e79" d="M92 47h1v6h-1zm-4-4h4v4h-4zm5-2h4v5h-4zm1 6h4v2h-4z"/>
  <path fill="#bd8977" d="M89 49h7v2h-1v3h-5v-3h-1z"/>
  <path fill="#a88b86" d="M54 69h23v4H54z"/>
  <path fill="#7b7a82" d="M58 62h18v11H58zm7 11h3v8h-3zm-7 8h16v2H58z"/>
  <path fill="#a6a0a7" d="M60 64h14v6H60z"/>
  <path fill="#b6a096" d="M9 80h13v2H9zm89 2h12v2H98z"/>
</svg>;
}
