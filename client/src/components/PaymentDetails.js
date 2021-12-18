import React from 'react';
import {
  FormLabel,
  Button,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  useClipboard,
} from '@chakra-ui/react';

export default function PaymentDetails({ cost, address, disclosure }) {
  const { hasCopied, onCopy } = useClipboard(address);
  return (
    <>
      <Modal
        blockScrollOnMount={false}
        isOpen={disclosure.isOpen}
        onClose={disclosure.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Item Created!</ModalHeader>
          <ModalCloseButton onClick={disclosure.onClose} />
          <ModalBody>
            <Text fontWeight="bold" mb="1rem">
              Find the payment details below:
            </Text>
            <FormLabel htmlFor="item-cost" fontWeight="bold">
              Item Cost in Wei
            </FormLabel>
            <Text id="item-cost" mb="1rem">
              {cost}
            </Text>
            <FormLabel htmlFor="item-address" fontWeight="bold">
              Payment Address
            </FormLabel>
            <Text id="item-address" mb="1rem">
              {' '}
              {address}{' '}
              <Button onClick={onCopy} as="button">
                {hasCopied ? 'Copied' : 'Copy'}
              </Button>
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
