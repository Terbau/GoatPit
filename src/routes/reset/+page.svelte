<script lang="ts">
	import type { PageData } from "./[token]/$types";
  import { addAlert } from "$lib/stores/alert";
	import PasswordInput from "$lib/components/input/PasswordInput.svelte";

  export let data: PageData;

  let password1: string;
  let password2: string;

  let password1Error: string | boolean;
  let password2Error: string | boolean;
  let generalError: string;

  const resetForm = (resetContent: boolean = true) => {
    if (resetContent) {
      password1 = "";
      password2 = "";
    }

    password1Error = "";
    password2Error = "";
    generalError = "";
  };

  const handleError = (data: {type: string, error: App.Error}) => {
    const error = data.error;

    if (error.message && error.field) {
      generalError = error.message;
    }

    if (error.alertMessage) {
      addAlert({
        type: "error",
        message: error.alertMessage,
      });
    }

    switch (error.field) {
      case "password":
        password1Error = true;
        password2Error = true;
        break;
    }
  }

  const handleSubmit = async () => {
    resetForm(false);

    if (password1 !== password2) {
      generalError = "Passwords do not match";
      return;
    }

    const fdata = new FormData();
    fdata.append("password", password1);
    fdata.append("token", data.token);

    const res = await fetch("/api/reset", {
      method: "POST",
      body: fdata,
    });

    if (res.ok) {
      console.log("Sent email")
      addAlert({
        type: "success",
        message: "Successfully reset password",
      });
    } else {
      handleError(await res.json());
    }
  };
</script>

<div class="flex flex-col items-center mt-8">
  <h1 class="text-indigo-12 font-bold text-2xl text-center">Enter a new password</h1>
  
  <form
    class="flex flex-col w-96 gap-5 px-8 py-6"
    on:submit|preventDefault="{handleSubmit}"
  >
    <PasswordInput bind:value={password1} error={password1Error} required>Password</PasswordInput>
    <PasswordInput bind:value={password2} error={password2Error} required>Confirm Password</PasswordInput>

    {#if generalError}
      <p class="text-red-11 text-sm mb-[-0.5rem]">{generalError}</p>
    {/if}
    <button class="bordered-button-indigo">Reset password</button>
  </form>
</div>