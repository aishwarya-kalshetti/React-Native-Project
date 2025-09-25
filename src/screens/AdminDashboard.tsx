import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Text,
  Button,
  TextInput,
  Card,
  IconButton,
  Dialog,
  Portal,
  Snackbar,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import {
  getAppointments,
  deleteAppointment,
  updateAppointment,
  saveTimeSlot,
} from "../db/database";
import { useIsFocused } from "@react-navigation/native";

interface Appointment {
  id: number;
  name: string;
  date: string;
  time: string;
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

 
  const [editVisible, setEditVisible] = useState(false);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);

 
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadAppointments();
    }
  }, [filterDate, isFocused]);

  const showSnackbar = (msg: string) => {
    setSnackbarMsg(msg);
    setSnackbarVisible(true);
  };

  const loadAppointments = async () => {
    if (filterDate) {
      const formatted = format(filterDate, "dd-MM-yyyy");
      const appts = await getAppointments(formatted);
      setAppointments(appts);
    } else {
      const appts = await getAppointments();
      setAppointments(appts);
    }
  };

  const removeAppointment = async (id: number) => {
    await deleteAppointment(id);
    await loadAppointments();
    showSnackbar("Appointment deleted");
  };

  const saveRange = async () => {
    if (!filterDate) {
      showSnackbar("Pick a date to save the time range");
      return;
    }
    const formatted = format(filterDate, "dd-MM-yyyy");
    await saveTimeSlot(formatted, startTime, endTime);
    showSnackbar("Time range saved for " + formatted);
  };

  const openEdit = (appt: Appointment) => {
    setEditAppt(appt);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!editAppt) return;
    await updateAppointment(
      editAppt.id,
      editAppt.name,
      editAppt.date,
      editAppt.time
    );
    setEditVisible(false);
    await loadAppointments();
    showSnackbar("Appointment updated");
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Admin Dashboard
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={[styles.input, { flex: 1, marginRight: 5 }]}
        >
          {filterDate ? format(filterDate, "dd-MM-yyyy") : "All Appointments"}
        </Button>

        {filterDate && (
          <Button
            mode="outlined"
            onPress={() => setFilterDate(null)}
            style={[styles.input, { flex: 1, marginLeft: 5 }]}
          >
            Clear Filter
          </Button>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, selected) => {
            setShowDatePicker(false);
            if (selected) setFilterDate(selected);
          }}
        />
      )}

      {filterDate && (
        <>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TextInput
              label="Start Time (HH:mm)"
              value={startTime}
              onChangeText={setStartTime}
              style={[styles.input, { flex: 1, marginRight: 5 }]}
            />
            <TextInput
              label="End Time (HH:mm)"
              value={endTime}
              onChangeText={setEndTime}
              style={[styles.input, { flex: 1, marginLeft: 5 }]}
            />
          </View>

          <Button mode="contained" onPress={saveRange} style={styles.input}>
            Save Available Range
          </Button>
        </>
      )}

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title title={`${item.name} (${item.date} @ ${item.time})`} />
            <Card.Actions>
              <IconButton icon="pencil" onPress={() => openEdit(item)} />
              <IconButton icon="delete" onPress={() => removeAppointment(item.id)} />
            </Card.Actions>
          </Card>
        )}
      />

      <Portal>
        <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)}>
          <Dialog.Title>Edit Appointment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={editAppt?.name || ""}
              onChangeText={(t) =>
                setEditAppt((prev) => (prev ? { ...prev, name: t } : prev))
              }
              style={styles.input}
            />
            <TextInput
              label="Date (dd-MM-yyyy)"
              value={editAppt?.date || ""}
              onChangeText={(t) =>
                setEditAppt((prev) => (prev ? { ...prev, date: t } : prev))
              }
              style={styles.input}
            />
            <TextInput
              label="Time (HH:mm)"
              value={editAppt?.time || ""}
              onChangeText={(t) =>
                setEditAppt((prev) => (prev ? { ...prev, time: t } : prev))
              }
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditVisible(false)}>Cancel</Button>
            <Button onPress={saveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMsg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { textAlign: "center", marginBottom: 20 },
  input: { marginVertical: 10 },
  card: { marginVertical: 5 },
});
