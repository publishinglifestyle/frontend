"use client"

import React, { useState, useMemo, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Spacer } from "@nextui-org/spacer"
import { changePassword } from "@/managers/userManager";
import { getTranslations } from '../../managers/languageManager';
import { Translations } from '../../translations.d';

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
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="apply-modal">
            <ModalContent>
                <ModalHeader className="modal-header">{translations?.change_password}</ModalHeader>
                <ModalBody>
                    <Input
                        value={password}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => {
                            setServerError(null)
                            setPassword(e.target.value)
                        }}
                        fullWidth
                        labelPlacement="outside"
                        label={translations?.new_password}
                        type="password"
                        placeholder={translations?.enter_password}
                        isRequired
                        isInvalid={isInvalidPassword == null ? undefined : isInvalidPassword}
                        errorMessage={isInvalidPassword && translations?.password_invalid_format}
                        color={isInvalidPassword == null ? undefined : (isInvalidPassword ? "danger" : "success")}
                    />
                    <Spacer y={4} />
                    <Input
                        value={password_2}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setPassword_2(e.target.value)}
                        fullWidth
                        labelPlacement="outside"
                        label={translations?.confirm_new_password}
                        type="password"
                        placeholder={translations?.re_enter_password}
                        isRequired
                        isInvalid={isInvalidPassword_2 == null ? undefined : isInvalidPassword_2}
                        errorMessage={isInvalidPassword_2 && translations?.password_mismatch}
                        color={isInvalidPassword_2 == null ? undefined : (isInvalidPassword_2 ? "danger" : "success")}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="ghost"
                        color="secondary"
                        style={{ width: "150px" }}
                        radius="lg"
                        size="md"
                        onPress={onClose}>
                        {translations?.cancel}
                    </Button>
                    <Button
                        color="secondary"
                        onPress={changePasswordAction}
                        style={{ color: "white", width: "150px" }}
                        radius="lg"
                        size="md"
                    >
                        {translations?.confirm}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default PasswordModal;
