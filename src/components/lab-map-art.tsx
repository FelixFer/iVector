import styles from "./artwork.module.css";

export function LabMapArt() {
  return <svg width="960" height="560" viewBox="0 0 240 140" shapeRendering="crispEdges" aria-hidden="true" className={styles.labMap} data-artwork="lab-map">
  <defs>
    <pattern id="lab-tiles" width="12" height="12" patternUnits="userSpaceOnUse">
      <path fill="var(--lab-floor, #f3ead9)" d="M0 0h12v12H0z"/>
      <path fill="var(--lab-grout, #e8dcc8)" d="M0 11h12v1H0zM11 0h1v12h-1z"/>
    </pattern>
    <g id="lab-desk">
      <path fill="#9c795f" d="M0 2h35v14H0z"/>
      <path fill="#c6a186" d="M0 0h35v12H0z"/>
      <path fill="#d2b193" d="M2 2h31v8H2z"/>
    </g>
    <g id="lab-screen">
      <path fill="#5e7079" d="M0 0h13v9H0zM5 9h3v2H5zM3 11h7v1H3z"/>
      <path fill="var(--lab-screen, #bdd9e1)" d="M1 1h11v6H1z"/>
      <path fill="#6b94a3" d="M3 5h2V3h3v1h2v1H7V4H6v2H3z"/>
    </g>
    <g id="lab-chair">
      <path fill="#7b8286" d="M0 1h8v7H0zM2 8h4v2H2z"/>
      <path fill="#a6a9aa" d="M1 0h6v5H1z"/>
    </g>
    <g id="lab-plant">
      <path fill="#9e7461" d="M1 7h9v5H1z"/>
      <path fill="#799880" d="M0 3h4v4H0zm4-3h4v8H4zm4 2h3v4H8z"/>
      <path fill="#a7b49b" d="M4 0h3v3H4zm-4 3h3v2H0z"/>
    </g>
    <g id="lab-shelf">
      <path fill="#9b7961" d="M0 0h38v18H0z"/>
      <path fill="#c4a58c" d="M1 1h36v15H1z"/>
      <path fill="#846a5b" d="M3 3h32v10H3z"/>
      <path fill="#c5bca2" d="M5 5h3v8H5zm17 0h4v8h-4z"/>
      <path fill="#9eb1b3" d="M9 4h5v9H9zm18 3h5v6h-5z"/>
      <path fill="#b89fb7" d="M15 6h4v7h-4zm18-2h2v9h-2z"/>
      <path fill="#ded2ad" d="M20 6h2v7h-2z"/>
    </g>
  </defs>

  <path fill="var(--lab-surround, #dcd1bf)" d="M0 0h240v140H0z"/>
  <path fill="#bba88e" d="M8 9h224v124H8z"/>
  <path fill="#a78d73" d="M8 6h224v123H8z"/>
  <path fill="url(#lab-tiles)" d="M12 9h216v116H12z"/>
  <path fill="var(--lab-wall, #efe5d4)" d="M16 11h88v48H16zm120 0h88v48h-88zM16 81h88v40H16zm120 0h88v40h-88z"/>
  
  <path fill="#d4c1a7" d="M104 9h4v34h-4zM132 9h4v34h-4zM104 81h4v9h-4zm0 29h4v15h-4zM132 81h4v9h-4zm0 29h4v15h-4zM12 59h96v3H12zm120 0h96v3H132zM12 78h96v3H12zm120 0h96v3H132z"/>
  <path fill="var(--lab-research, #d4e1ea)" d="M23 15h78v44H23z"/>
  <path fill="var(--lab-projects, #dbe6d9)" d="M139 15h78v44h-78z"/>
  <path fill="var(--lab-people, #ead9ca)" d="M23 81h78v40H23z"/>
  <path fill="var(--lab-publications, #e7dcea)" d="M139 81h78v40h-78z"/>
  <path fill="#adc6d7" d="M23 15h78v2H23z"/>
  <path fill="#b4c7af" d="M139 15h78v2h-78z"/>
  <path fill="#d3b79e" d="M23 81h78v2H23z"/>
  <path fill="#c3acc8" d="M139 81h78v2h-78z"/>

  <g transform="translate(0 10) scale(1 .8)">
  
  <use href="#lab-desk" x="29" y="24"/>
  <use href="#lab-screen" x="35" y="20"/>
  <use href="#lab-chair" x="43" y="42"/>
  <path fill="#f7efe2" d="M50 27h9v6h-9zm32-4h12v8H82z"/>
  <path fill="#8aa4b2" d="M52 29h5v1h-5zm32-4h8v1h-8zm0 2h5v1h-5z"/>
  <use href="#lab-desk" x="68" y="33"/>
  <path fill="#6d8490" d="M73 35h15v7H73z"/>
  <path fill="var(--lab-screen, #bed9dd)" d="M75 36h8v4h-8z"/>
  <path fill="#e7dbad" d="M85 37h1v1h-1zm4-2h9v5h-9z"/>
  <use href="#lab-plant" x="16" y="49"/>

  
  <use href="#lab-desk" x="139" y="25"/>
  <use href="#lab-screen" x="149" y="21"/>
  <use href="#lab-chair" x="153" y="43"/>
  <use href="#lab-desk" x="176" y="25"/>
  <use href="#lab-screen" x="185" y="21"/>
  <use href="#lab-chair" x="190" y="43"/>
  <path fill="#eee6d6" d="M163 31h7v3h-7zm34 0h7v3h-7z"/>
  <path fill="#83968a" d="M139 45h8v3h-8zm64 0h8v3h-8z"/>
  <use href="#lab-plant" x="211" y="48"/>

  </g>
  <g transform="translate(0 43.35) scale(1 .65)">
  
  <path fill="#9f7c69" d="M40 88h46v15H40z"/>
  <path fill="#c8a58a" d="M39 86h48v14H39z"/>
  <path fill="#d7b89b" d="M41 88h44v10H41z"/>
  <use href="#lab-chair" x="49" y="81"/>
  <use href="#lab-chair" x="68" y="81"/>
  <use href="#lab-chair" x="49" y="102"/>
  <use href="#lab-chair" x="68" y="102"/>
  <path fill="#f8eee1" d="M53 91h7v5h-7zm11 0h8v5h-8z"/>
  <path fill="#a57f7b" d="M75 91h3v3h-3zM56 93h3v1h-3z"/>
  <use href="#lab-plant" x="17" y="106"/>

  
  <use href="#lab-shelf" x="143" y="84"/>
  <use href="#lab-shelf" x="184" y="84"/>
  <path fill="#bea9c4" d="M153 105h21v9h-21zm38 0h18v9h-18z"/>
  <path fill="#d2bfd3" d="M155 106h17v5h-17zm38 0h14v5h-14z"/>
  <path fill="#f8f0e3" d="M159 106h9v4h-9zm37 0h7v4h-7z"/>
  <path fill="#b1a7b1" d="M163 106h1v4h-1zm36 0h1v4h-1z"/>
  <use href="#lab-plant" x="213" y="107"/>
  </g>
</svg>;
}
