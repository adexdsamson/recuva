import { create } from "zustand";
import { persist, combine, PersistOptions } from "zustand/middleware";
import {
  createSelectorHooks,
  ZustandHookSelectors,
  createSelectorFunctions,
  ZustandFuncSelectors,
} from "auto-zustand-selectors-hook";
import { User } from "../types";

type InitialState = {
  user: User | null;
  token: string | null;
  refresh: string | null;
  authorities: string[];
  verificationToken: string | null;
};

type Actions = {
  setReset: () => void;
  setUser: (user: InitialState["user"]) => void;
  setToken: (user: InitialState["token"]) => void;
  setRefreshToken: (user: InitialState["refresh"]) => void;
  setAuthorities: (user: InitialState["authorities"]) => void;
  setVerificationToken: (user: InitialState["verificationToken"]) => void;
};

const initialState: InitialState = {
  user: null,
  token: null,
  refresh: null,
  authorities: [],
  verificationToken: null,
};

const reducer = combine(initialState, (set) => ({
  setUser: (user: InitialState["user"]) => set({ user }),
  setToken: (token: InitialState["token"]) => set({ token }),
  setVerificationToken: (
    verificationToken: InitialState["verificationToken"]
  ) => set({ verificationToken }),
  setRefreshToken: (refresh: InitialState["refresh"]) => set({ refresh }),
  setAuthorities: (authorities: InitialState["authorities"]) => {
    set({ authorities });
  },
  setReset: () => {
    set(initialState);
  },
}));

// const logger = (config) => (set, get, api) => {
//   return config(
//     (args) => {
//       // console.log("studio  applying", args);
//       set(args);
//       // console.log("studio  new state", get());
//     },
//     get,
//     api
//   );
// };
// const getUrlSearch = () => {
//   return window.location.search.slice(1);
// };

// const persistentStorage: StateStorage = {
//   getItem: (key): string => {
//    return JSON.parse(localStorage.getItem(key) as string);
//   },
//   setItem: (key, newValue): void => {
//     // Check if query params exist at all, can remove check if always want to set URL
//     // if (getUrlSearch()) {
//     //   const searchParams = new URLSearchParams(getUrlSearch());
//     //   searchParams.set(key, JSON.stringify(newValue));
//     //   window.history.replaceState(null, "", `?${searchParams.toString()}`);
//     // }
//     console.log("key",key, newValue);
    

//     localStorage.setItem(key, JSON.stringify(newValue));
//   },
//   removeItem: (key): void => {
//     const searchParams = new URLSearchParams(getUrlSearch());
//     searchParams.delete(key);
//     window.location.search = searchParams.toString();
//   },
// };

type Selectors = InitialState & Actions;

const persistConfig: PersistOptions<Selectors> = {
  name: "auth",
  // storage: createJSONStorage(() => persistentStorage),
};

const baseReducer = create(persist(reducer, persistConfig));

export const {
  useUser,
  useSetUser,
  useToken,
  useRefresh,
  useSetToken,
  useAuthorities,
  useSetReset,
  useSetRefreshToken,
  useVerificationToken,
  useSetAuthorities,
  useSetVerificationToken
} = createSelectorHooks(baseReducer) as typeof baseReducer &
  ZustandHookSelectors<Selectors>;

export const authSlice = createSelectorFunctions(
  baseReducer
) as typeof baseReducer & ZustandFuncSelectors<Selectors>;

export const storeFunctions = createSelectorFunctions(
  baseReducer
) as typeof baseReducer & ZustandFuncSelectors<Selectors>;
