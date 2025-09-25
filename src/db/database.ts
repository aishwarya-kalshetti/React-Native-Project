import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("appointments.db");


export async function initDB() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      time TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS timeslots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      startTime TEXT,
      endTime TEXT
    );
  `);
}



export async function addAppointment(name: string, date: string, time: string) {
  await db.runAsync(
    "INSERT INTO appointments (name, date, time) VALUES (?, ?, ?)",
    [name, date, time]
  );
}

export async function getAppointments(date?: string) {
  if (date) {
    return await db.getAllAsync(
      "SELECT * FROM appointments WHERE date = ? ORDER BY time",
      [date]
    );
  }
  return await db.getAllAsync(
    "SELECT * FROM appointments ORDER BY date ASC, time ASC"
  );
}

export async function deleteAppointment(id: number) {
  await db.runAsync("DELETE FROM appointments WHERE id = ?", [id]);
}

export async function updateAppointment(
  id: number,
  name: string,
  date: string,
  time: string
) {
  await db.runAsync(
    "UPDATE appointments SET name = ?, date = ?, time = ? WHERE id = ?",
    [name, date, time, id]
  );
}



export async function saveTimeSlot(
  date: string,
  startTime: string,
  endTime: string
) {
  await db.runAsync("DELETE FROM timeslots WHERE date = ?", [date]); 
  await db.runAsync(
    "INSERT INTO timeslots (date, startTime, endTime) VALUES (?, ?, ?)",
    [date, startTime, endTime]
  );
}

export async function getTimeSlots(date: string) {
  return await db.getAllAsync("SELECT * FROM timeslots WHERE date = ?", [date]);
}
