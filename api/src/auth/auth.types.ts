export type ThemePreference = 'signal' | 'modern';

export type AuthProvider = 'google';

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
