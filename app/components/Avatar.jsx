// Avatar — image with deterministic gradient fallback. Each name produces
// a distinct hue so user chips don't all look identical.

const HUES = [12, 32, 50, 130, 168, 195, 215, 250, 280, 320, 345];

function hashHue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  }
  return HUES[h % HUES.length];
}

export default function Avatar({ src, name, size = 32 }) {
  const initial = (name || "?").trim().slice(0, 1).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }

  const hue = hashHue(name || "anon");
  const bg = `linear-gradient(135deg, hsl(${hue} 60% 56%), hsl(${(hue + 28) % 360} 70% 48%))`;

  return (
    <div
      className="dashboard-avatar-fallback"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, size * 0.42),
        background: bg,
      }}
    >
      {initial}
    </div>
  );
}
