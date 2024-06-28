"use client"

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";

import {
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                <ModalHeader className="modal-header justify-center"><h1 style={{ fontSize: "26px", textAlign: "center", justifyContent: "center" }}>Attention!</h1></ModalHeader>
                <ModalBody style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ExclamationTriangleIcon color="red" style={{ width: "30%" }} />
                    <p className="text-center">
                        {message}
                    </p>
                </ModalBody>
                <ModalFooter className="mt-4 mb-2 justify-center">
                    <Button
                        color="secondary"
                        style={{ color: "white", width: "150px" }}
                        onPress={onClose}>
                        Understood
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ErrorModal;