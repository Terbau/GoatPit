import { writable, type Writable } from "svelte/store";

export const loginModalOpen = writable(false);


export const toggleModal = (modalStore: Writable<boolean>): void => {
  modalStore.update((value) => !value);
}


export const openModal = (modalStore: Writable<boolean>): void => {
  modalStore.set(true);
}


export const closeModal = (modalStore: Writable<boolean>): void => {
  modalStore.set(false);
}