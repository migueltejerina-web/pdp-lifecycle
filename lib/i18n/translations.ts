export type Language = "es" | "en";

export interface Translations {
  common: {
    loading: string;
    save: string;
    cancel: string;
    demoMode: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    signIn: string;
    enterDemo: string;
    support: string;
    privacy: string;
    terms: string;
  };
  home: {
    title: string;
    subtitle: string;
    goToLogin: string;
    signedInAs: string;
  };
  nav: {
    home: string;
    logout: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    common: {
      loading: "Cargando…",
      save: "Guardar",
      cancel: "Cancelar",
      demoMode: "Modo demo (sin Supabase)",
    },
    login: {
      title: "PDP Lifecycle",
      subtitle: "Inicia sesión para continuar",
      email: "Correo",
      password: "Contraseña",
      signIn: "Entrar",
      enterDemo: "Entrar en modo demo",
      support: "Soporte",
      privacy: "Privacidad",
      terms: "Términos",
    },
    home: {
      title: "PDP Lifecycle",
      subtitle: "Plantilla Vistral — listo para construir tu producto.",
      goToLogin: "Ir a login",
      signedInAs: "Sesión:",
    },
    nav: {
      home: "Inicio",
      logout: "Cerrar sesión",
    },
  },
  en: {
    common: {
      loading: "Loading…",
      save: "Save",
      cancel: "Cancel",
      demoMode: "Demo mode (no Supabase)",
    },
    login: {
      title: "PDP Lifecycle",
      subtitle: "Sign in to continue",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      enterDemo: "Enter demo mode",
      support: "Support",
      privacy: "Privacy",
      terms: "Terms",
    },
    home: {
      title: "PDP Lifecycle",
      subtitle: "Vistral template — ready to build your product.",
      goToLogin: "Go to login",
      signedInAs: "Session:",
    },
    nav: {
      home: "Home",
      logout: "Log out",
    },
  },
};
