// Temporary placeholder - will be removed in Phase 6
// MUI uses sx prop instead of className utilities
export function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter((input) => typeof input === "string").join(" ");
}
