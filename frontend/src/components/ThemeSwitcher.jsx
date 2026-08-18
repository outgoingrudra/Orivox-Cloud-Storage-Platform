"use client";

import {
  Check,
  Moon,
  Palette,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

const themes = [
  "light",
  "dark",
  "cupcake",
  "retro",
  "garden",
  "forest",
  "luxury",
];

export default function ThemeSwitcher() {
  const [theme, setTheme] =
    useState("light");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "orivox-theme"
      );

    if (
      savedTheme &&
      themes.includes(savedTheme)
    ) {
      setTheme(savedTheme);

      document.documentElement.setAttribute(
        "data-theme",
        savedTheme
      );
    }
  }, []);

  function changeTheme(newTheme) {
    setTheme(newTheme);

    localStorage.setItem(
      "orivox-theme",
      newTheme
    );

    document.documentElement.setAttribute(
      "data-theme",
      newTheme
    );
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-circle"
        aria-label="Change theme"
      >
        {theme === "dark" ? (
          <Moon size={19} />
        ) : (
          <Palette size={19} />
        )}
      </button>

      <div
        tabIndex={0}
        className="
          dropdown-content
          z-50
          mt-3
          w-52
          rounded-2xl
          border
          border-base-300
          bg-base-100
          p-2
          shadow-xl
        "
      >
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider opacity-50">
          Theme
        </p>

        {themes.map((item) => (
          <button
            key={item}
            onClick={() =>
              changeTheme(item)
            }
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-xl
              px-3
              py-2
              text-sm
              capitalize
              transition
              hover:bg-base-200
            "
          >
            {item}

            {theme === item && (
              <Check size={16} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}