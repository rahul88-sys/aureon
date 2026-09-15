export type ThemePreference = 'signal' | 'modern';

export type AuthProvider = 'google' | 'microsoft';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: AuthProvider;
  theme: ThemePreference;
};

export type GoogleProfile = {
  id: string;
  emails?: Array<{ value: string }>;
  displayName?: string;
  photos?: Array<{ value: string }>;
};

export type MicrosoftProfile = {
  id: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
  userPrincipalName?: string;
  _json?: {
    mail?: string;
    userPrincipalName?: string;
    displayName?: string;
  };
};
