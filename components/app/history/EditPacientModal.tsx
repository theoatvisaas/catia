import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

type EditPatientModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave?: (payload: { patientName: string; responsibleName: string }) => void;
    initialPatientName?: string;
    initialResponsibleName?: string;
};

export default function EditPatientModal({
    visible,
    onClose,
    onSave,
    initialPatientName = "",
    initialResponsibleName = "",
}: EditPatientModalProps) {
    const [patientName, setPatientName] = useState(initialPatientName);
    const [responsibleName, setResponsibleName] = useState(initialResponsibleName);

    useEffect(() => {
        if (!visible) return;
        setPatientName(initialPatientName);
        setResponsibleName(initialResponsibleName);
    }, [visible, initialPatientName, initialResponsibleName]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={globalStyles.editPatientBackdrop}>
                <Pressable style={globalStyles.editPatientBackdropPressable} />

                <View style={globalStyles.editPatientSheet}>
                    <View style={globalStyles.editPatientHeader}>
                        <Text style={globalStyles.editPatientTitle}>{t("editPatient", "title")}</Text>

                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [
                                globalStyles.editPatientCloseBtn,
                                pressed && globalStyles.editPatientCloseBtnPressed,
                            ]}
                            hitSlop={10}
                        >
                            <Text style={globalStyles.editPatientCloseIcon}>×</Text>
                        </Pressable>
                    </View>

                    <View style={globalStyles.editPatientDivider} />

                    <View style={globalStyles.editPatientBody}>
                        <Text style={globalStyles.editPatientLabel}>{t("editPatient", "patientNameLabel")}</Text>
                        <TextInput
                            value={patientName}
                            onChangeText={setPatientName}
                            placeholder={t("editPatient", "patientNamePlaceholder")}
                            placeholderTextColor={globalStyles.editPatientPlaceholder.color as string}
                            style={globalStyles.editPatientInput}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />

                        <Text style={globalStyles.editPatientLabel}>{t("editPatient", "responsibleNameLabel")}</Text>
                        <TextInput
                            value={responsibleName}
                            onChangeText={setResponsibleName}
                            placeholder={t("editPatient", "responsibleNamePlaceholder")}
                            placeholderTextColor={globalStyles.editPatientPlaceholder.color as string}
                            style={globalStyles.editPatientInput}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />

                        <View style={globalStyles.editPatientFooter}>
                            <Pressable
                                onPress={() => onSave?.({ patientName, responsibleName })}
                                style={({ pressed }) => [
                                    globalStyles.editPatientSaveButton,
                                    pressed && globalStyles.editPatientSaveButtonPressed,
                                ]}
                            >
                                <Text style={globalStyles.editPatientSaveText}>{t("editPatient", "save")}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
