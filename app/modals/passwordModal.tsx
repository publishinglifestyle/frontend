"use client"

import React, { useState, useMemo, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spacer } from "@heroui/spacer"

import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

import { changePassword } from "@/managers/userManager";

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState('');
    const [password_2, setPassword_2] = useState('');
    const [serverError, setServerError] = useState(null);
    const [translations, setTranslations] = useState<Translations | null>(null);

    const validatePassword = (password: string): boolean => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        return passwordRegex.test(password);
    };

    const isInvalidPassword = useMemo(() => password === "" ? null : !validatePassword(password), [password]);
    const isInvalidPassword_2 = useMemo(() => {
        if (password_2 === "") return null;

        return password !== password_2 || !validatePassword(password_2) ? true : false;
    }, [password, password_2]);

    const changePasswordAction = async () => {
        await changePassword(password, password_2)
        onClose()
    };

    const [language, setLanguage] = useState('');

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

    return (
        <Modal className="apply-modal" isOpen={isOpen} size="2xl" onClose={onClose}>
            <ModalContent>
                <ModalHeader className="modal-header">{translations?.change_password}</ModalHeader>
                <ModalBody>
                    <Input
                        fullWidth
                        isRequired
                        color={isInvalidPassword == null ? undefined : (isInvalidPassword ? "danger" : "success")}
                        errorMessage={isInvalidPassword && translations?.password_invalid_format}
                        isInvalid={isInvalidPassword == null ? undefined : isInvalidPassword}
                        label={translations?.new_password}
                        labelPlacement="outside"
                        placeholder={translations?.enter_password}
                        type="password"
                        value={password}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => {
                            setServerError(null)
                            setPassword(e.target.value)
                        }}
                    />
                    <Spacer y={4} />
                    <Input
                        fullWidth
                        isRequired
                        color={isInvalidPassword_2 == null ? undefined : (isInvalidPassword_2 ? "danger" : "success")}
                        errorMessage={isInvalidPassword_2 && translations?.password_mismatch}
                        isInvalid={isInvalidPassword_2 == null ? undefined : isInvalidPassword_2}
                        label={translations?.confirm_new_password}
                        labelPlacement="outside"
                        placeholder={translations?.re_enter_password}
                        type="password"
                        value={password_2}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setPassword_2(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary"
                        radius="lg"
                        size="md"
                        style={{ width: "150px" }}
                        variant="ghost"
                        onPress={onClose}>
                        {translations?.cancel}
                    </Button>
                    <Button
                        color="secondary"
                        radius="lg"
                        size="md"
                        style={{ color: "white", width: "150px" }}
                        onPress={changePasswordAction}
                    >
                        {translations?.confirm}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default PasswordModal;
