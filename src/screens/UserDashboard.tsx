import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, TextInput, Snackbar } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { addAppointment, getAppointments, getTimeSlots } from "../db/database";
import { generateTimeSlots } from "../utils/timeUtils";

export default function UserDashboard() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    loadSlots();
  }, [date]);

  const loadSlots = async () => {
    const formattedDate = format(date, "dd-MM-yyyy");
    const slots = await getTimeSlots(formattedDate);

    if (slots.length > 0) {
      const { startTime, endTime } = slots[0];
      let allSlots = generateTimeSlots(startTime, endTime, 15);

      const booked = await getAppointments(formattedDate);
      const bookedTimes = booked.map((b: any) => b.time);

      allSlots = allSlots.filter((t) => !bookedTimes.includes(t));
      setAvailableSlots(allSlots);
    } else {
      setAvailableSlots([]);
    }
  };

  const bookAppointment = async () => {
    if (!name || !timeSlot) return;
    const formattedDate = format(date, "dd-MM-yyyy");
    await addAppointment(name, formattedDate, timeSlot);
    setName("");
    setTimeSlot("");
    await loadSlots();
    setSnackbarVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Book Appointment
      </Text>

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
      >
        {format(date, "dd-MM-yyyy")}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(e, selected) => {
            setShowDatePicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      <Picker
        selectedValue={timeSlot}
        onValueChange={(val) => setTimeSlot(val)}
        style={styles.input}
      >
        <Picker.Item label="Select Time" value="" />
        {availableSlots.length === 0 ? (
          <Picker.Item label="No slots available (Ask Admin)" value="" />
        ) : (
          availableSlots.map((slot) => (
            <Picker.Item key={slot} label={slot} value={slot} />
          ))
        )}
      </Picker>

      <Button
        mode="contained"
        onPress={bookAppointment}
        disabled={!name || !timeSlot}
        style={styles.input}
      >
        Book Appointment
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1800}
      >
        Appointment booked successfully
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { textAlign: "center", marginBottom: 20 },
  input: { marginVertical: 10 },
});
