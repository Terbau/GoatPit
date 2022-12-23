<script lang="ts">
	import EmailInput from "$lib/components/input/EmailInput.svelte";
	import { addAlert } from "$lib/stores/alert";

  let email: string;
  let emailError: string;
  let generalError: string;

  const resetForm = (resetContent: boolean = true) => {
    if (resetContent) {
      email = "";
    }

    emailError = "";
    generalError = "";
  };

  const handleError = (data: {type: string, error: App.Error}) => {
    const error = data.error;

    if (error.message && error.field) {
      generalError = error.message;
      return;
    }

    if (error.alertMessage) {
      addAlert({
        type: "error",
        message: error.alertMessage,
      });
    }

    switch (error.field) {
      case "email":
        emailError = error.message;
        break;
    }
  }

  const handleSubmit = async () => {
    resetForm(false);

    const data = new FormData();
    data.append("email", email);

    const res = await fetch("/api/forgot", {
      method: "POST",
      body: data,
    });

    if (res.ok) {
      console.log("Sent email")
      addAlert({
        type: "success",
        message: "Successfully sent email",
      });
    } else {
      handleError(await res.json());
    }
  };
</script>

<div class="flex flex-col items-center mt-8">
  <h1 class="text-indigo-12 font-bold text-2xl text-center">Password reset</h1>
  
  <form
    class="flex flex-col w-96 gap-5 px-8 py-6"
    on:submit|preventDefault="{handleSubmit}"
  >
    <EmailInput bind:value={email} error={emailError} required>Email</EmailInput>
    <!-- <p class="text-indigo-11 text-sm">Please note that the application won't tell you if your email is correct.</p> -->
    {#if generalError}
      <p class="text-red-11 text-sm mb-[-0.5rem]">{generalError}</p>
    {/if}
    <button class="bordered-button-indigo">Send reset mail</button>
  </form>
</div>