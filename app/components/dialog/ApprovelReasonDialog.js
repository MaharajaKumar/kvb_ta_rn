import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { CustomColors } from "../../utilities/CustomColors";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  Pressable,
} from "react-native";

export default function ApprovelReasonDialog({
  dialogStatus,
  setDialogStatus,
  tittle,
  value,
  setValue,
  selectedPosition,
  onPressEvent,
  from,
  buttontext,
}) {
  const [isModalVisible, setModalVisible] = useState(dialogStatus);

  const toggleModalVisibility = () => {
    setModalVisible(!isModalVisible);
    setDialogStatus(!dialogStatus);
    if (!from) {
      selectedPosition("");
    }
  };

  return (
    <View style={styles.screen}>
      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        presentationStyle="overFullScreen"
        onDismiss={toggleModalVisibility}
      >
        <View style={styles.viewWrapper}>
          <View style={styles.modalView}>
            <View style={styles.icon}>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 19,
                }}
              >
                {tittle}
              </Text>

              <MaterialIcons
                name={"close"}
                size={24}
                color="#FFBB4F"
                onPress={toggleModalVisibility}
              />
            </View>
            <TextInput
              placeholder="Reason"
              value={value}
              placeholderTextColor="#818c84"
              style={styles.textInput}
              onChangeText={setValue}
            />
            <Pressable
              style={({pressed}) =>
                pressed ? [styles.button, styles.pressed] : styles.button
              }
              onPress={onPressEvent}
              android_ripple={{ color: CustomColors.ripple_color }}
            >
              <Text style={styles.textbutton}>{buttontext}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  viewWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalView: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    elevation: 5,
    backgroundColor: "#fff",
    borderRadius: 7,
  },
  icon: {
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
    flexDirection: "row",
  },
  textInput: {
    width: "90%",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderRadius: 9,
    marginBottom: 25,
  },
  button: {
    width: "80%",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 5,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: CustomColors.primary_yellow,
  },
  textbutton: {
    textAlign: "center",
    color: "white",
  },
  pressed: {
    backgroundColor: CustomColors.ripple_color,
    opacity: 0.75,
  },
});
