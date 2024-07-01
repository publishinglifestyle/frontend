"use client"
import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Image } from "@nextui-org/image";
import { Spacer } from "@nextui-org/spacer";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { getUser, updateProfile, deleteUser, getProfilePic, uploadProfilePic } from "@/managers/userManager";
import { getSubscription, getPortal } from '@/managers/subscriptionManager'
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import SubscriptionModal from "../modals/subscriptionModal";
import PasswordModal from "@/app/modals/passwordModal";
import ErrorModal from "@/app/modals/errorModal";
import ConfirmModal from "@/app/modals/confirmModal";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

import {
    PencilSquareIcon,
    CheckCircleIcon,
    PencilIcon
} from "@heroicons/react/24/outline";

const defaultPic = "./profile.png";

export default function ProfilePage() {
    const [language, setLanguage] = useState('');
    const [translations, setTranslations] = useState<Translations | null>(null);
    const router = useRouter();

    const { isAuthenticated: isAuthenticatedClient, logout } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [subscriptionActive, setSubscriptionActive] = useState(false)

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [credits, setCredits] = useState("");

    const [initialFirstName, setInitialFirstName] = useState("");
    const [initialLastName, setInitialLastName] = useState("");
    const [initialEmail, setInitialEmail] = useState("");
    const [initialProfileImage, setInitialProfileImage] = useState(defaultPic);

    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileImage, setProfileImage] = useState(defaultPic);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        const detectLanguage = async () => {
            // Detect browser language
            const browserLanguage = navigator.language;
            setLanguage(browserLanguage);

            // Get translations for the detected language
            const translations = await getTranslations(browserLanguage);
            setTranslations(translations);
        };

        detectLanguage();
    }, []);

    useEffect(() => {
        if (!isAuthenticatedClient) {
            router.push('/');
        }
    }, [isAuthenticatedClient]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const result = await getUser();
                setFirstName(result.first_name);
                setLastName(result.last_name);
                setEmail(result.email);

                setInitialFirstName(result.first_name);
                setInitialLastName(result.last_name);
                setInitialEmail(result.email);

                const current_subscription = await getSubscription()
                console.log(current_subscription)
                setSubscriptionActive(current_subscription.is_active)

                setCredits(current_subscription.credits)

                const logoResponse = await getProfilePic();
                if (logoResponse) {
                    setProfileImage(logoResponse);
                    setInitialProfileImage(logoResponse);
                } else {
                    setProfileImage(defaultPic);
                    setInitialProfileImage(defaultPic);
                }

                setIsLoading(false);
            } catch (e) {
                setIsLoading(false);
                /*if (e == "AxiosError: Request failed with status code 401") {
                    logout()
                    window.location.href = '/';
                } else {
                    setIsLoading(false);
                    const error = e as any;
                    if (error.response) {
                        setErrorModalMessage(error.response.data);
                        setIsErrorModalOpen(true);
                    }
                }*/
            }
        };

        fetchData();
    }, []);

    const updateUserProfile = async () => {
        try {
            //setIsLoading(true);
            await updateProfile(firstName, lastName, email);
            setIsEdit(false);
            window.location.reload();
        } catch (e) {
            setIsLoading(false);
            const error = e as any;
            if (error.response) {
                setErrorModalMessage(error.response.data);
                setIsErrorModalOpen(true);
            }
        }
    };

    const deleteUserProfile = async () => {
        setIsConfirmModalOpen(false);

        try {
            setIsLoading(true);
            await deleteUser();
            logout();
            router.push('/');
        } catch (e) {
            setIsLoading(false);
            const error = e as any;
            if (error.response) {
                setErrorModalMessage(error.response.data);
                setIsErrorModalOpen(true);
            }
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProfileImage(reader.result as string);
                };
                reader.readAsDataURL(file);

                try {
                    setIsLoading(true);
                    await uploadProfilePic(file);
                    setIsEdit(false);
                    window.location.reload();
                } catch (error) {
                    setIsLoading(false);
                    const err = error as any;
                    if (err.response) {
                        setErrorModalMessage(err.response.data);
                        setIsErrorModalOpen(true);
                    }
                }
            }
        }
    };

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleCancel = () => {
        setIsEdit(false);
        setFirstName(initialFirstName);
        setLastName(initialLastName);
        setEmail(initialEmail);
        setProfileImage(initialProfileImage);
    };

    if (isLoading) {
        return <Spinner aria-label="Loading..." color="secondary" />;
    }

    return (
        <div className="flex flex-col md:flex-row w-full gap-4">
            <div className="md:w-1/2">
                <Card className="w-full md:w-[500px] lg:w-[500px]">
                    <CardHeader className="flex gap-3 justify-between px-2 md:px-6">
                        <div className="flex flex-col items-start">
                            <p className="text-lg">Account</p>
                        </div>
                        {
                            !isEdit && <Button isIconOnly variant="light" color="primary" size="sm" onClick={() => setIsEdit(true)}>
                                <PencilSquareIcon style={{ width: "70%", color: "#9353D3" }} />
                            </Button>
                        }
                    </CardHeader>
                    <Divider />
                    <CardBody className="pl-6">
                        <Spacer y={4} />
                        <div className="relative" style={{ width: 60, height: 60 }}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}>
                            <Image
                                alt="Profile picture"
                                height={60}
                                radius="sm"
                                src={profileImage}
                                width={60}
                            />
                            {isEdit && isHovering && (
                                <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
                                    <PencilIcon style={{ width: "40%", color: "#9353D3", zIndex: 9999 }} className="cursor-pointer" onClick={handleIconClick} />
                                </div>
                            )}
                            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
                        </div>
                        <Spacer y={6} />
                        <p style={{ fontSize: "14px" }}>
                            <b style={{ fontSize: "14px" }}>{translations?.first_name}</b>
                            <Spacer y={2} />
                            {
                                isEdit ?
                                    <Input
                                        size="sm"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        type="text"
                                        placeholder={translations?.enter_first_name}
                                    />
                                    :
                                    <span style={{ fontSize: "14px" }}>{firstName}</span>
                            }
                        </p>
                        <Spacer y={4} />
                        <p style={{ fontSize: "14px" }}>
                            <b style={{ fontSize: "14px" }}>{translations?.last_name}</b>
                            <Spacer y={2} />
                            {
                                isEdit ?
                                    <Input
                                        size="sm"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        type="text"
                                        placeholder={translations?.enter_last_name}
                                    />
                                    :
                                    <span style={{ fontSize: "14px" }}>{lastName}</span>
                            }
                        </p>
                        <Spacer y={4} />
                        <p style={{ fontSize: "14px" }}>
                            <b style={{ fontSize: "14px" }}>Email</b>
                            <Spacer y={2} />
                            {
                                isEdit ?
                                    <Input
                                        size="sm"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        type="email"
                                        placeholder="Enter your email"
                                    />
                                    :
                                    <span style={{ fontSize: "14px" }}>{email}</span>
                            }
                        </p>
                        <Spacer y={2} />
                    </CardBody>
                    <CardFooter className="pl-6 justify-end">
                        {
                            isEdit &&
                            <div className="flex gap-4">
                                <Button
                                    color="secondary"
                                    variant="ghost"
                                    style={{ width: "150px" }}
                                    radius="lg"
                                    size="md"
                                    onClick={handleCancel}
                                >{translations?.cancel}</Button>
                                <Button
                                    color="secondary"
                                    style={{ color: "white", width: "150px" }}
                                    radius="lg"
                                    size="md"
                                    onClick={async () => await updateUserProfile()}
                                >{translations?.update}</Button>
                            </div>
                        }
                    </CardFooter>
                </Card>
            </div>

            <div className="md:w-1/2 flex flex-col">
                <div>
                    <Card className="w-full md:w-[500px] lg:w-[500px]">
                        <CardHeader>
                            <div className="flex flex-col items-start">
                                <p className="text-lg">{translations?.my_plan}</p>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <div className="flex flex-col">
                                <div className="flex flex-row gap-4">
                                    <b>{translations?.status}:&nbsp;</b>{subscriptionActive ? <span style={{ color: "#9353D3" }}>{translations?.active}</span> : <span style={{ color: "#9353D3" }}>{translations?.inactive}</span>}
                                </div>
                                <div className="flex flex-row gap-4">
                                    <b>{translations?.credits}:&nbsp;</b>{credits}
                                </div>
                            </div>
                            <Spacer y={8} />
                            {
                                subscriptionActive ?
                                    <Button
                                        color="secondary"
                                        style={{ color: "white" }}
                                        onClick={async () => {
                                            setIsLoading(true)
                                            const url = await getPortal()
                                            if (url) {
                                                window.open(url, '_blank');
                                            }
                                            setIsLoading(false)
                                        }}
                                    >
                                        {translations?.manage_subscription}
                                    </Button>
                                    :
                                    <Button
                                        color="secondary"
                                        style={{ color: "white" }}
                                        onClick={async () => {
                                            setIsSubscriptionModalOpen(true)
                                        }}
                                    >
                                        {translations?.start_subscription}
                                    </Button>
                            }

                            <Spacer y={4} />
                        </CardBody>
                    </Card>
                </div>
                <Spacer y={4} />
                <div>
                    <Card className="w-full md:w-[500px] lg:w-[500px]">
                        <CardHeader className="flex gap-3 justify-between">
                            <div className="flex flex-col items-start">
                                <p className="text-lg">Password</p>
                            </div>
                            <Button isIconOnly variant="light" color="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                                <PencilSquareIcon style={{ width: "70%", color: "#9353D3" }} />
                            </Button>
                        </CardHeader>
                        <Divider />
                        <CardBody className="pl-6">
                            <Spacer y={4} />
                            <p style={{ fontSize: "14px" }}>
                                <b style={{ fontSize: "14px" }} className="flex"><CheckCircleIcon style={{ width: "5%", marginRight: "1%", color: "#9353D3" }} />{translations?.password_set}</b>
                                <Spacer y={2} />
                                <span style={{ fontSize: "14px" }}>{translations?.choose_password}</span>
                            </p>
                            <Spacer y={4} />
                        </CardBody>
                        <Divider />
                    </Card>
                </div>
            </div>

            <PasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <ErrorModal
                isOpen={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                message={errorModalMessage}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onSuccess={deleteUserProfile}
                message="Are you sure you want to close your account?"
            />

            <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
        </div>
    );
}
