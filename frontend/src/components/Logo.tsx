import logoImage from '../images/passvault_logo_transparent.png';


export default function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
      <img src={logoImage} alt="PassVault Logo" />
    </div>
  );
}