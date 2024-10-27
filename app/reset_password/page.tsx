"use client"

import { useEffect, useState, useMemo } from "react";
import { Spacer } from '@nextui-org/spacer'
import { Input } from '@nextui-org/input'
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from '@nextui-org/button';
import { Spinner } from '@nextui-org/spinner';
import { useRouter } from 'next/navigation'
import { resetPassword } from "@/managers/userManager";

import ErrorModal from "../modals/errorModal";
import SuccessModal from "../modals/successModal";

export default function ResetPasswordPage() {
    const [language, setLanguage] = useState('');

    const [isLoading, setIsLoading] = useState(false)
    const [password, setPassword] = useState('');
    const [password_2, setPassword_2] = useState('');
    const [token, setToken] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successModalMessage, setSuccessModalMessage] = useState('');
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');

    const validatePassword = (password: string): boolean => {
        // You can add specific criteria here, for now, we're just checking length
        return password.length >= 8;
    };

    const isInvalidPassword = useMemo(() => password === "" ? null : !validatePassword(password), [password]);
    const isInvalidPassword_2 = useMemo(() => {
        if (password_2 === "") return null;
        return password !== password_2 || !validatePassword(password_2) ? true : false;
    }, [password, password_2]);

    const resetPasswordAction = async () => {
        try {
            setIsLoading(true)
            await resetPassword(token, password, password_2)
            setIsLoading(false)
            setSuccessModalMessage("Password changed with success!")
            setIsSuccessModalOpen(true)
        } catch (e) {
            setIsLoading(false);
            const error = e as any;
            if (error.response) {
                setErrorModalMessage(error.response.data)
                setIsErrorModalOpen(true)
            }
        }
    };

    const router = useRouter()

    useEffect(() => {
        // Detect browser language
        const browserLanguage = navigator.language;
        console.log(browserLanguage)
        setLanguage(browserLanguage);
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const resetToken = urlParams.get('resetToken');
        if (resetToken) setToken(resetToken)
    }, []);

    if (isLoading) {
        return <Spinner color="secondary" aria-label="Loading..." />
    }

    return (
        <div>
            <Card className="w-[500px]">
                <CardHeader className="flex gap-3 justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-lg">Reset Password</p>
                    </div>
                </CardHeader>
                <CardBody className="pl-6">
                    <Input
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value)
                        }}
                        fullWidth
                        labelPlacement="outside"
                        label="New Password"
                        type="password"
                        placeholder="Enter your password"
                        isRequired
                        isInvalid={isInvalidPassword == null ? undefined : isInvalidPassword}
                        errorMessage={isInvalidPassword && "Password must be at least 8 characters long with 1 capital letter and 1 number"}
                        color={isInvalidPassword == null ? undefined : (isInvalidPassword ? "danger" : "success")}
                    />
                    <Spacer y={4} />
                    <Input
                        value={password_2}
                        onChange={e => setPassword_2(e.target.value)}
                        fullWidth
                        labelPlacement="outside"
                        label="Confirm New Password"
                        type="password"
                        placeholder="Re-enter your password"
                        isRequired
                        isInvalid={isInvalidPassword_2 == null ? undefined : isInvalidPassword_2}
                        errorMessage={isInvalidPassword_2 && "Passwords do not match or does not meet requirements"}
                        color={isInvalidPassword_2 == null ? undefined : (isInvalidPassword_2 ? "danger" : "success")}
                    />
                    <Spacer y={14} />
                    <Button
                        color="secondary"
                        style={{ color: "white" }}
                        size='md'
                        fullWidth
                        onClick={resetPasswordAction}
                    >Reset Password</Button>
                    <Spacer y={4} />
                </CardBody>
            </Card>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                message={successModalMessage}
                onClose={() => {
                    setIsSuccessModalOpen(false)
                    router.push('/')
                }}
            />

            <ErrorModal
                isOpen={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                message={errorModalMessage}
            />
        </div>
    );
}