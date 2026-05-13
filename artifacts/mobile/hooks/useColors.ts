import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 * Theme is managed via ThemeContext (defaults to light mode).
 */
export function useColors() {
  const { theme } = useContext(ThemeContext);
  const palette =
    theme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
