"use client";

type Props = {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: number;
};

export default function StarRating({ value, onChange, readOnly, size = 24 }: Props) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => !readOnly && onChange?.(s)}
          aria-label={`Estrella ${s}`}
          className="focus:outline-none"
          style={{ cursor: readOnly ? "default" : "pointer" }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={s <= value ? "#F59E0B" : "none"}
            stroke={s <= value ? "#F59E0B" : "#9CA3AF"}
            strokeWidth="2"
          >
            <path d="M12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
