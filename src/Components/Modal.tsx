import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { ModalProps } from '../types';

export const ModalComponent: React.FC<ModalProps> = ({ closeModal, visible, children }) => {
  return (
    <Modal visible={visible} transparent={true} onRequestClose={closeModal}>
      <View style={Styles.modalContainer}>
        {children}
      </View>
    </Modal>
  )
};

const Styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});