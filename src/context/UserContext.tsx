'use client'
import { createContext, Dispatch, useEffect, useReducer } from 'react';

export const LOCAL_STORAGE_CONTEXT = 'filplus-verifier-context';

export enum UserContextActionTypes {
  SetGHAccount = 'SET_GH_ACCOUNT',
  GHLogout = 'LOG_OUT',
  Initialize = "INITIALIZE"
}

export interface UserContextState {
  ghToken?: string;
}

export interface ContextAction {
  type: UserContextActionTypes;
  value?: any;
}

const userContextReducer = (
  state: UserContextState,
  action: ContextAction
): UserContextState => {
  
  let newState = state;
  switch (action.type) {
    case UserContextActionTypes.SetGHAccount:
      newState = {
        ...state,
        ghToken: action.value,
      };
      break;
    case UserContextActionTypes.GHLogout:
      newState = {
        ...state,
        ghToken: undefined,
      };
      break;
    case UserContextActionTypes.Initialize:
      newState = action.value;
      break;
  }
  localStorage.setItem(LOCAL_STORAGE_CONTEXT, JSON.stringify(newState));

  return { ...newState };
};

const initialState = {
  ghToken: undefined
};

const getInitialContext = (): UserContextState => {
  let context = initialState;
  const storedContextString = localStorage.getItem(LOCAL_STORAGE_CONTEXT);

  if (storedContextString) {
    const storedContext = JSON.parse(storedContextString);
    context = {
      ...context,
      ...storedContext,
    };
  }

  return context;
};

// @ts-ignore
export const UserContext = createContext<{
  state: UserContextState;
  dispatch: Dispatch<ContextAction>;
}>({
  state: getInitialContext(),
  dispatch: () => null,
});

export const UserContextProvider = (props: any): JSX.Element => {
  const [state, dispatch] = useReducer(userContextReducer, getInitialContext());

  useEffect(() => {
    const storedContextString = localStorage.getItem(LOCAL_STORAGE_CONTEXT);
    if (storedContextString) {
      const storedContext = JSON.parse(storedContextString);
      dispatch({ type: UserContextActionTypes.Initialize, value: storedContext });
    }
  }, []);

  return (
    <UserContext.Provider value={{ state: state, dispatch: dispatch }}>
      {props.children}
    </UserContext.Provider>
  );
};
