import logoImage from '../images/passvault_logo_transparent.png';

interface LogoProps {
  size?: 'small' | 'default';
}

export default function Logo({ size = 'default' }: LogoProps) {
  const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: size === 'default' ? "1rem" : "0",
  };

  const imgStyle = {
    width: size === 'small' ? '40px' : 'auto',
    height: size === 'small' ? '40px' : 'auto',
  };

  return (
    <div style={style}>
      <img src={logoImage} alt="PassVault Logo" style={imgStyle} />
    </div>
  );
}