import { createContext, useContext } from 'react';
import type { User } from './types';
import { DEMO_USERS } from './mockData';

export interface UserContextType {
  user: User;
  switchRole: (roleKey: string) => void;
}

export const UserContext = createContext<UserContextType>({
  user: DEMO_USERS['farm'],
  switchRole: () => {},
});

export function useUser() {
  return useContext(UserContext);
}
