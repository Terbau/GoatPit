import { generateRandomId } from '../utils';
import { writable, type Writable } from "svelte/store";

interface AlertData {
  message: string;
  type: "info" | "success" | "error" | "warning";
}


interface ActiveAlertData extends AlertData {
  id: number;
}


export const alerts: Writable<ActiveAlertData[]> = writable([]);


export const addAlert = (data: AlertData) => {
  const id = generateRandomId();

  const defaults: ActiveAlertData = {
    id,
    type: "info",
    message: "Empty alert",
  };
  
  const alertData = { ...defaults, ...data };
  alerts.update((a) => [...a, alertData])

  return id;
};

export const removeAlert = (id: number) => {
  alerts.update((a) => a.filter((alert) => alert.id !== id));
};