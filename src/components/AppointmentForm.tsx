import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { getAppointments, getTimeSlots } from "../db/database";
import { generateTimeSlots } from "../utils/timeUtils";

interface Props {
  date: string;
  onSave: (name: string, time: string) => void;
}

const AppointmentForm: React.FC<Props> = ({ date, onSave }) => {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    async function loadTimes() {
      const slots = await getTimeSlots(date);
      if (slots.length > 0) {
        const { startTime, endTime } = slots[0];
        let allSlots = generateTimeSlots(startTime, endTime, 15);
        const booked = await getAppointments(date);
        const bookedTimes = booked.map((b: any) => b.time);
        allSlots = allSlots.filter((t) => !bookedTimes.includes(t));
        setAvailableTimes(allSlots);
      } else {
        setAvailableTimes([]);
      }
    }
    loadTimes();
  }, [date]);

  return (
    <View>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 10 }}
      />

      <Picker selectedValue={time} onValueChange={(val) => setTime(val)}>
        <Picker.Item label="Select time" value="" />
        {availableTimes.map((slot) => (
          <Picker.Item key={slot} label={slot} value={slot} />
        ))}
      </Picker>

      <Button
        mode="contained"
        onPress={() => {
          if (name && time) onSave(name, time);
        }}
        style={{ marginTop: 10 }}
      >
        Save Appointment
      </Button>
    </View>
  );
};

export default AppointmentForm;
