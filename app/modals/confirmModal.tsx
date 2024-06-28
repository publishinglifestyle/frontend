"use client"

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button"

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    message: string;
}

import {
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, message, onSuccess }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" isDismissable={false} isKeyboardDismissDisabled={true}>
            <ModalContent>
                <ModalHeader className="modal-header justify-center"><h1 style={{ fontSize: "26px" }}>Attention</h1></ModalHeader>
                <ModalBody style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: "center" }}>
                    <ExclamationTriangleIcon color="red" style={{ width: "30%" }} />
                    <p>
                        {message}
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="ghost"
                        fullWidth
                        color="secondary"
                        radius="lg"
                        size="md"
                        onPress={onClose}>
                        Cancel
                    </Button>
                    <Button
                        fullWidth
                        color="secondary"
                        radius="lg"
                        size="md"
                        onPress={() => {
                            onSuccess()
                        }}>
                        Confirm
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ConfirmModal;
