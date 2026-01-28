'use client';

import { createContext, useContext } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface ConfigContextType {
    googleClientId: string;
}

const ConfigContext = createContext<ConfigContextType>({ googleClientId: '' });

export const useConfig = () => useContext(ConfigContext);

export default function GoogleProvider({
    children,
    clientId = ''
}: {
    children: React.ReactNode,
    clientId?: string
}) {
    return (
        <ConfigContext.Provider value={{ googleClientId: clientId }}>
            {clientId ? (
                <GoogleOAuthProvider clientId={clientId}>
                    {children}
                </GoogleOAuthProvider>
            ) : children}
        </ConfigContext.Provider>
    );
}
