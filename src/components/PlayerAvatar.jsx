export default function PlayerAvatar({ nombre, foto_url, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-20 h-20 text-lg",
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (foto_url) {
    return (
      <img
        src={foto_url}
        alt={nombre}
        className={`${sizes[size]} rounded-full object-cover border-2 border-purple-200`}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold border-2 border-purple-200`}
    >
      {getInitials(nombre)}
    </div>
  );
}