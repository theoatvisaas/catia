import { t } from "@/i18n";
import { useConsultationsStore } from "@/stores/consultation/useConsultationsStore";
import { globalStyles } from "@/styles/theme";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from "react-native";


type EditPatientModalProps = {
    visible: boolean;
    onClose: () => void;

    // mantém compatibilidade caso você ainda use isso em algum lugar
    onSave?: (payload: { patientName: string; responsibleName: string }) => void;

    initialPatientName?: string;
    initialResponsibleName?: string;

    consultationId: string;
};

export default function EditPatientModal({
    visible,
    onClose,
    onSave,
    initialPatientName = "",
    initialResponsibleName = "",
    consultationId,
}: EditPatientModalProps) {
    const {
        consultation,
        loading,
        error,
        getConsultation,
        updateConsultation,
        resetError,
    } = useConsultationsStore();

    const [patientName, setPatientName] = useState(initialPatientName);
    const [responsibleName, setResponsibleName] = useState(initialResponsibleName);
    const [saving, setSaving] = useState(false);

    // Quando abre: tenta puxar do backend.
    // Se falhar/retornar null, cai pro initial* (sem quebrar o layout).
    useEffect(() => {
        if (!visible) return;

        resetError();

        // seta imediatamente com os iniciais pra não dar "flash" de vazio
        setPatientName(initialPatientName);
        setResponsibleName(initialResponsibleName);

        if (!consultationId) return;

        (async () => {
            const data = await getConsultation({ id: consultationId });
            console.log("DATA", data)
            if (!data) return;

            setPatientName(String(data.patient_name ?? ""));
            setResponsibleName(String(data.guardian_name ?? ""));
        })();

    }, [visible, consultationId]);


    useEffect(() => {
        if (!visible) return;
        if (!consultation) return;

        setPatientName(String(consultation.patient_name ?? ""));
        setResponsibleName(String(consultation.guardian_name ?? ""));
    }, [consultation, visible]);

    const originalPatient = useMemo(
        () => String(consultation?.patient_name ?? initialPatientName ?? ""),
        [consultation?.patient_name, initialPatientName]
    );

    const originalResponsible = useMemo(
        () => String(consultation?.guardian_name ?? initialResponsibleName ?? ""),
        [consultation?.guardian_name, initialResponsibleName]
    );

    const dirty =
        patientName.trim() !== originalPatient.trim() ||
        responsibleName.trim() !== originalResponsible.trim();

    const canSave = !!consultationId && dirty && !loading && !saving;

    async function handleSave() {
        // mantém o callback antigo funcionando, se você ainda usa em algum lugar
        onSave?.({ patientName, responsibleName });

        if (!canSave) return;

        const payload: Partial<{ patient_name: string; guardian_name: string }> = {};
        if (patientName.trim() !== originalPatient.trim()) payload.patient_name = patientName.trim();
        if (responsibleName.trim() !== originalResponsible.trim())
            payload.guardian_name = responsibleName.trim();

        if (!Object.keys(payload).length) return;

        try {
            setSaving(true);
            await updateConsultation({ id: consultationId, data: payload });
            onClose();
        } finally {
            setSaving(false);
        }
    }

    function handleClose() {
        resetError();
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={globalStyles.editPatientBackdrop}>
                <Pressable style={globalStyles.editPatientBackdropPressable} onPress={handleClose} />

                <View style={globalStyles.editPatientSheet}>
                    <View style={globalStyles.editPatientHeader}>
                        <Text style={globalStyles.editPatientTitle}>{t("editPatient", "title")}</Text>

                        <Pressable
                            onPress={handleClose}
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
                        <Text style={globalStyles.editPatientLabel}>
                            {t("editPatient", "patientNameLabel")}
                        </Text>
                        <TextInput
                            value={patientName}
                            onChangeText={setPatientName}
                            placeholder={t("editPatient", "patientNamePlaceholder")}
                            placeholderTextColor={globalStyles.editPatientPlaceholder.color as string}
                            style={globalStyles.editPatientInput}
                            autoCapitalize="words"
                            autoCorrect={false}
                            editable={!loading && !saving}
                        />

                        <Text style={globalStyles.editPatientLabel}>
                            {t("editPatient", "responsibleNameLabel")}
                        </Text>
                        <TextInput
                            value={responsibleName}
                            onChangeText={setResponsibleName}
                            placeholder={t("editPatient", "responsibleNamePlaceholder")}
                            placeholderTextColor={globalStyles.editPatientPlaceholder.color as string}
                            style={globalStyles.editPatientInput}
                            autoCapitalize="words"
                            autoCorrect={false}
                            editable={!loading && !saving}
                        />

                        {error ? (
                            <Text style={[globalStyles.editPatientLabel, { marginTop: 8 }]}>
                                {error}
                            </Text>
                        ) : null}

                        <View style={globalStyles.editPatientFooter}>
                            <Pressable
                                onPress={handleSave}
                                disabled={!canSave}
                                style={({ pressed }) => [
                                    globalStyles.editPatientSaveButton,
                                    pressed && globalStyles.editPatientSaveButtonPressed,
                                    !canSave ? { opacity: 0.6 } : null,
                                ]}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                    {saving ? <ActivityIndicator /> : null}
                                    <Text style={globalStyles.editPatientSaveText}>{t("editPatient", "save")}</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
