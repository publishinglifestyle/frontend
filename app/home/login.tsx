"use client"

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Spinner } from "@nextui-org/spinner"
import { useAuth } from '../auth-context';
import ErrorModal from "@/app/modals/errorModal";
import { logIn } from '../../managers/userManager';

type LoginProps = {
    toggleToSignUp: () => void;
    toggleToForgotPassword: () => void;
};

const Login: React.FC<LoginProps> = ({ toggleToSignUp, toggleToForgotPassword }) => {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');

    const validateEmail = (email: string): boolean => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
    const validatePassword = (password: string): boolean => password.length > 0;

    const isInvalidEmail = useMemo(() => email === "" ? null : !validateEmail(email), [email]);
    const isInvalidPassword = useMemo(() => password === "" ? null : !validatePassword(password), [password]);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            const authToken = await logIn(email, password);
            login(authToken, 1);
            router.push('/chat');
        } catch (e) {
            setIsLoading(false);
            const error = e as any;
            if (error.response) {
                setErrorModalMessage(error.response.data.response);
                setIsErrorModalOpen(true);
            }
        }
    };

    return (
        <div style={{ height: '100%', width: "100%" }}>
            {isLoading ? (
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:py-10" style={{ marginTop: "10%" }}>
                    <Spinner color="secondary" />
                </div>
            ) : (
                <Card>
                    <CardBody>
                        <CardHeader className='flex flex-col'>
                            <h1 className="text-4xl font-bold">Login</h1>
                            <br />
                            <div className="flex gap-2">
                                <span>Are you new here?</span>
                                <span style={{ cursor: 'pointer', color: "#9353D3" }} onClick={toggleToSignUp}>Sign Up</span>
                            </div>
                        </CardHeader>

                        <Input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            fullWidth
                            label="Enter your email"
                            type="email"
                            isRequired
                            size='sm'
                            radius='lg'
                            variant="bordered"
                            className='mt-16'
                            isInvalid={isInvalidEmail == null ? undefined : isInvalidEmail}
                            errorMessage={isInvalidEmail && "Please enter a valid email"}
                            color={isInvalidEmail == null ? undefined : (isInvalidEmail ? "danger" : "success")}
                        />
                        <Input
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            fullWidth
                            label="Enter your password"
                            type="password"
                            isRequired
                            size='sm'
                            radius='lg'
                            variant="bordered"
                            className='mt-4'
                            isInvalid={isInvalidPassword == null ? undefined : isInvalidPassword}
                            errorMessage={isInvalidPassword && "Please enter your password"}
                            color={isInvalidPassword == null ? undefined : (isInvalidPassword ? "danger" : "success")}
                        />
                        {/*<a href="#" style={{ fontSize: "14px", color: "#9353D3" }} className="ml-2 mt-2" onClick={toggleToForgotPassword}>Forgot password</a>*/}
                        <Button
                            fullWidth
                            color="secondary"
                            style={{ color: "white" }}
                            radius='lg'
                            className='mt-12 mb-6'
                            onClick={async () => await handleLogin()}
                            isDisabled={Boolean((!validateEmail(email) || !validatePassword(password)))}
                        >
                            Login
                        </Button>
                    </CardBody>
                </Card>
            )}
            <ErrorModal
                isOpen={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                message={errorModalMessage}
            />
        </div>
    );
};

export default Login;
