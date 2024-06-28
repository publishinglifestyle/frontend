"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../auth-context';
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Spinner } from "@nextui-org/spinner"
import ErrorModal from "@/app/modals/errorModal";
import { signUp } from '../../managers/userManager';
import { getSubscriptions, startSubscription } from '../../managers/subscriptionManager';

interface Subscription {
    id: string;
    name: string;
    price_id: string;
    price: number;
}

const SignUp = ({ toggleToLogin }: { toggleToLogin: () => void }) => {
    const { isAuthenticated: isAuthenticatedClient } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_2, setPassword_2] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [subscriptionsFetched, setSubscriptionsFetched] = useState(false);
    const [step, setStep] = useState(1);

    const validateEmail = (email: string): boolean => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
    const validatePassword = (password: string): boolean => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

    const isInvalidEmail = useMemo(() => email === "" ? null : !validateEmail(email), [email]);
    const isInvalidPassword = useMemo(() => password === "" ? null : !validatePassword(password), [password]);
    const isInvalidPassword_2 = useMemo(() => {
        if (password_2 === "") return null;
        return password !== password_2 || !validatePassword(password_2) ? true : false;
    }, [password, password_2]);

    useEffect(() => {
        if (isAuthenticatedClient) {
            window.location.href = '/chat';
        } else if (!subscriptionsFetched) {
            const fetchSubscriptions = async () => {
                try {
                    const all_subscriptions = await getSubscriptions();
                    console.log(all_subscriptions);
                    setSubscriptionsFetched(true);
                    setSubscriptions(all_subscriptions)

                } catch (error) {
                    console.error('Failed to fetch subscriptions:', error);
                }
            };

            fetchSubscriptions()
        }
    }, [isAuthenticatedClient, subscriptionsFetched]);

    const handleSignUp = async (price_id: string) => {
        try {
            console.log("hello")
            setIsLoading(true);
            const response = await signUp(firstName, lastName, email, password, password_2);
            const url = await startSubscription(response.token, price_id)
            window.location.href = url;
            console.log(`Selected subscription: ${selectedSubscription}`);
            // Add success modal logic if needed
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
                            <h1 className="text-4xl font-bold">Sign Up</h1>
                            <br />
                            <div className="flex gap-2">
                                <span>Already have an account?</span>
                                <span style={{ cursor: 'pointer', color: "#9353D3" }} onClick={toggleToLogin}>Login</span>
                            </div>
                        </CardHeader>
                        {step === 1 && (
                            <>
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
                                    errorMessage={isInvalidPassword && "The password must be at least 8 characters long and contain 1 capital letter and 1 number."}
                                    color={isInvalidPassword == null ? undefined : (isInvalidPassword ? "danger" : "success")}
                                />
                                <Input
                                    value={password_2}
                                    onChange={e => setPassword_2(e.target.value)}
                                    fullWidth
                                    label="Re-enter your password"
                                    type="password"
                                    isRequired
                                    size='sm'
                                    radius='lg'
                                    variant="bordered"
                                    className='mt-4'
                                    isInvalid={isInvalidPassword_2 == null ? undefined : isInvalidPassword_2}
                                    errorMessage={isInvalidPassword_2 && "Passwords do not match or do not meet requirements"}
                                    color={isInvalidPassword_2 == null ? undefined : (isInvalidPassword_2 ? "danger" : "success")}
                                />
                                <Button
                                    fullWidth
                                    color="secondary"
                                    style={{ color: "white" }}
                                    radius='lg'
                                    className='mt-12 mb-6'
                                    onClick={() => setStep(2)}
                                    isDisabled={Boolean((!validateEmail(email) || !validatePassword(password) || !validatePassword(password_2) || password !== password_2))}
                                >
                                    Next
                                </Button>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <Input
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    fullWidth
                                    label="Enter your first name"
                                    type="text"
                                    isRequired
                                    size='sm'
                                    radius='lg'
                                    variant="bordered"
                                    className='mt-16'
                                />
                                <Input
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    fullWidth
                                    label="Enter your last name"
                                    type="text"
                                    isRequired
                                    size='sm'
                                    radius='lg'
                                    variant="bordered"
                                    className='mt-4'
                                />
                                <Button
                                    fullWidth
                                    color="secondary"
                                    style={{ color: "white" }}
                                    radius='lg'
                                    className='mt-12 mb-6'
                                    onClick={() => setStep(3)}
                                    isDisabled={Boolean((firstName === "" || lastName === ""))}
                                >
                                    Next
                                </Button>
                            </>
                        )}
                        {step === 3 && (
                            <>
                                <div className="flex flex-col md:flex-row md:space-x-4 mt-8 mb-8">
                                    {subscriptions.map(sub => (
                                        <Card
                                            key={sub.id}
                                            isPressable
                                            isHoverable
                                            onPress={() => setSelectedSubscription(sub)}
                                            className={`w-full md:w-1/3 mb-4 md:mb-0 ${selectedSubscription === sub ? 'border-4 border-purple-500 shadow-lg shadow-purple-500/50' : ''}`} // Full width on mobile, one-third width on desktop
                                            style={{ height: '200px' }}
                                        >
                                            <CardHeader className="flex flex-col items-center justify-center" style={{ height: '100%' }}>
                                                <h2 className="text-3xl">{sub.name}</h2>
                                                <p style={{ color: "#9353D3" }}>$ {sub.price} / month</p>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>


                                {selectedSubscription && (
                                    <Button
                                        fullWidth
                                        color="secondary"
                                        style={{ color: "white" }}
                                        radius='lg'
                                        className='mt-12 mb-6'
                                        onClick={async () => await handleSignUp(selectedSubscription.price_id)}
                                    >
                                        Sign Up
                                    </Button>
                                )}
                            </>
                        )}
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

export default SignUp;
