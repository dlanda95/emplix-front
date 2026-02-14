export interface ShellHeaderConfig {
  title: string;        // Ej: "Legajo: E-2024-99"
  subtitle?: string;    // Ej: "PORTAL DEL COLABORADOR"
  version?: string;     // Ej: "Versión 2.0"
  icon?: string;        // Ej: "folder_shared" (Material Icon)
  theme?: 'primary' | 'dark' | 'glass'; // Opcional: Para cambiar colores en el futuro
}

export interface ShellNavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean; // Para routerLinkActiveOptions
}