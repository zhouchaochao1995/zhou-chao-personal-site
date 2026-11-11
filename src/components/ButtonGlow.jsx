import BorderGlow from './BorderGlow.jsx';

export default function ButtonGlow({ children, className = '', style, role }) {
  return (
    <BorderGlow
      className={`button-glow${className ? ` ${className}` : ''}`}
      edgeSensitivity={60}
      glowColor="40 80 80"
      backgroundColor="#120F17"
      borderRadius={28}
      glowRadius={12}
      glowIntensity={0.4}
      coneSpread={10}
      animated={false}
      colors={['#c084fc', '#f472b6', '#38bdf8']}
      fillOpacity={0.1}
      style={style}
      role={role}
    >
      {children}
    </BorderGlow>
  );
}
