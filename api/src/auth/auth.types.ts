export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google';
};

export type GoogleProfile = {
  id: string;
  emails?: Array<{ value: string }>;
  displayName?: string;
  photos?: Array<{ value: string }>;
};
