import React, { useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    LayoutRectangle,
    Modal,
    Pressable,
    Text,
    View,
} from "react-native";

import { globalStyles } from "@/styles/theme"; // <- onde fica seu StyleSheet.create global
import { colors } from "@/styles/theme/colors";

type ContextMenuItem = {
    key: string;
    label: string;
    onPress: () => void;
    icon?: React.ReactNode;
    danger?: boolean;
    disabled?: boolean;
};

type ContextMenuProps = {
    visible: boolean;
    onClose: () => void;
    anchorRect: LayoutRectangle | null;
    items: ContextMenuItem[];
    width?: number;
};

export function ContextMenu({
    visible,
    onClose,
    anchorRect,
    items,
    width = 185,
}: ContextMenuProps) {
    const [menuHeight, setMenuHeight] = useState<number>(0);

    useEffect(() => {
        if (!visible) setMenuHeight(0);
    }, [visible]);

    const position = useMemo(() => {
        const screen = Dimensions.get("window");
        const margin = 16;

        if (!anchorRect) {
            return {
                left: margin,
                top: 218,
            };
        }

        let left = anchorRect.x;
        let top = anchorRect.y + anchorRect.height + 6;

        if (left + width > screen.width - margin) {
            left = screen.width - width - margin;
        }

        top = Math.max(margin, top);

        return { left, top };
    }, [anchorRect, width]);


    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Pressable style={globalStyles.contextMenuBackdrop} onPress={onClose}>
                <Pressable
                    onPress={() => { }}
                    onLayout={(e) => setMenuHeight(e.nativeEvent.layout.height)}
                    style={[
                        globalStyles.contextMenuCard,
                        { width, left: position.left, top: position.top },
                    ]}
                >
                    {items.map((item) => {
                        const labelStyle = [
                            globalStyles.contextMenuLabel, ,
                            item.disabled ? { color: colors.textDisabled } : null,
                        ];

                        return (
                            <Pressable
                                key={item.key}
                                disabled={item.disabled}
                                onPress={() => {
                                    onClose();
                                    item.onPress();
                                }}
                                style={({ pressed }) => [
                                    globalStyles.contextMenuRow,
                                    pressed && !item.disabled ? globalStyles.contextMenuRowPressed : null,
                                    item.disabled ? globalStyles.contextMenuRowDisabled : null,
                                ]}
                            >
                                <View style={globalStyles.contextMenuRowContent}>
                                    {item.icon ? (
                                        <View style={globalStyles.contextMenuIconSlot}>{item.icon}</View>
                                    ) : null}

                                    <Text style={labelStyle}>{item.label}</Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </Pressable>
            </Pressable>
        </Modal>
    );
}
