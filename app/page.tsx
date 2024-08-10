"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import Login from './home/login';
import SignUp from './home/signup';
import ForgotPassword from './home/forgot';

export default function Home() {
  const { isAuthenticated: isAuthenticatedClient } = useAuth();

  const [isSignUp, setIsSignUp] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  useEffect(() => {
    if (isAuthenticatedClient) {
      window.location.href = '/chat';
    }
  }, [isAuthenticatedClient]);

  const toggleToSignUp = () => {
    setIsSignUp(true);
    setIsLogin(false);
    setIsForgot(false);
  };

  const toggleToLogin = () => {
    setIsSignUp(false);
    setIsLogin(true);
    setIsForgot(false);
  };

  const toggleToForgotPassword = () => {
    setIsSignUp(false);
    setIsLogin(false);
    setIsForgot(true);
  };

  return (
    <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:py-10">
      <div className="w-full md:w-1/2">
        {isLogin && <Login toggleToSignUp={toggleToSignUp} toggleToForgotPassword={toggleToForgotPassword} />}
        {isSignUp && <SignUp toggleToLogin={toggleToLogin} />}
        {isForgot && <ForgotPassword toggleToLogin={toggleToLogin} />}
      </div>
    </section>
  );
}
