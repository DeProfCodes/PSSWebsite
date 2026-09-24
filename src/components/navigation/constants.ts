/**
 * Mount point for the mobile menu sheet, rendered by the root layout directly
 * after the header so the Tab order is always: menu toggle → menu links.
 * (Kept outside the "use client" module so the server layout can import it.)
 */
export const MOBILE_MENU_ROOT_ID = "mobile-menu-root";
