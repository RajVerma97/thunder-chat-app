import { createContext } from 'react';
import React from 'react'
export const LoginContext = React.createContext({
    currentUser: 'jarvis',
    setCurrentUser:()=>{}
});