"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Spinner } from "@nextui-org/spinner"
import ErrorModal from "@/app/modals/errorModal";
// import { initiatePasswordReset } from '../managers/userManager'; // Add this function in your userManager

const ForgotPassword = ({ toggleToLogin }: { toggleToLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');

    const validateEmail = (email: string): boolean => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

    const isInvalidEmail = useMemo(() => email === "" ? null : !validateEmail(email), [email]);

    const handleForgotPassword = async () => {
        try {
            setIsLoading(true);
            // await initiatePasswordReset(email); // Implement this function in your userManager
            setIsLoading(false);
            setEmail("");
            toggleToLogin();
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
                            <h1 className="text-4xl font-bold">Reset Password</h1>
                            <br />
                            <div className="flex gap-2">
                                <span>Remember your password?</span>
                                <span style={{ cursor: 'pointer', color: "#9353D3" }} onClick={toggleToLogin}>Login</span>
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
                        <Button
                            fullWidth
                            color="secondary"
                            style={{ color: "white" }}
                            radius='lg'
                            className='mt-12 mb-6'
                            onClick={async () => await handleForgotPassword()}
                            isDisabled={Boolean(!validateEmail(email))}
                        >
                            Reset Password
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

export default ForgotPassword;
