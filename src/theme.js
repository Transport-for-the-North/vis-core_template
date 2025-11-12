const tfnPurple = "#7317de";

/**
 * Theme object containing common style values.
 * Update this theme with additional properties that
 * any styled components can use.
 */
export const theme = {
  activeBg: "#7317de", // Used for any active (or hovered) nav backgrounds.
  standardFontFamily: "'Hanken Grotesk', sans-serif", // The standard font.
  navbarBg: "#f8f9fa", // Background for the top navbar.
  navText: "#4b3e91", // Default text colour for nav items.
  activeNavText: "#ffffff", // Text colour for active nav items.
  activeNavDropdownText: "#4b3e91", // Text colour for active dropdown items.
  boxShadow: "0px 3px 5px gray", // Shadow for the top navbar.  
  borderRadius: "5px", // A common border radius to apply.
  logoutButtonWidth: "75%", // Width for the logout icon.
  // Breakpoints (single source of truth)
  breakpoints: {
    mobile: 900,
    tablet: 1200,
    desktop: 1440,
  },

  // Ready-to-use media query strings
  mq: {
    mobile: "(max-width: 900px)",
    tablet: "(max-width: 1200px)",
    desktopUp: "(min-width: 1201px)",
  },
};
