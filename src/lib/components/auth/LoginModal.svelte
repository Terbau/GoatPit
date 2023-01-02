<script lang="ts">
  import LoginWithLabel from "../auth/LoginWithLabel.svelte";
  import Modal from "../modal/Modal.svelte";
  import { loginModalOpen, closeModal } from "$lib/stores/modal";
	import { invalidateAll } from "$app/navigation";
	import PasswordInput from "../input/PasswordInput.svelte";
	import EmailInput from "../input/EmailInput.svelte";
	import { addAlert } from "$lib/stores/alert";
  import { beforeNavigate } from "$app/navigation";
	import GoogleIcon from "../icons/GoogleIcon.svelte";
	import TwitterIcon from "../icons/TwitterIcon.svelte";

  beforeNavigate(() => {
    closeModal(loginModalOpen);
    console.log("Closed modal");
  });

  let email: string;
  let password: string;

  let emailError: string;
  let passwordError: string;
  let generalError: string;

  $: $loginModalOpen && resetForm();

  const resetForm = (resetContent: boolean = true) => {
    if (resetContent) {
      email = "";
      password = "";
    }

    emailError = "";
    passwordError = "";
    generalError = "";
  };

  const handleSubmit = (e: any) => {  // Stop crying, TypeScript
    resetForm(false);

    if (e.submitter?.id == "sign-in") {
      login();
    } else {
      signUp();
    }
  };

  const handleError = (data: {type: string, error: App.Error}) => {
    const error = data.error;

    if (error.message && !error.field) {
      generalError = error.message;
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
      case "password":
        passwordError = error.message;
        break;
    }
  }

  const login = async () => {
    const data = new FormData();
    data.append("email", email);
    data.append("password", password);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: data,
    });

    if (res.ok) {
      invalidateAll();
      closeModal(loginModalOpen);
    } else {
      handleError(await res.json());
    }
  };

  const signUp = async () => {
    const data = new FormData();
    data.append("email", email);

    data.append("password", password);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: data,
    });

    if (res.ok) {
      invalidateAll();
      closeModal(loginModalOpen);
    } else {
      handleError(await res.json());
    }
  };
</script>

<Modal store={loginModalOpen}>
  <h2 class="text-lg mb-5 text-indigo-12 text-center">Login or Sign Up</h2>

  <form
    class="form-control flex flex-col gap-4 w-72"
    on:submit|preventDefault="{handleSubmit}"
  >
    <div class="flex flex-col gap-4">
      <EmailInput bind:value={email} error={emailError} required>Email</EmailInput>
      <PasswordInput bind:value={password} error={passwordError} required>Password</PasswordInput>
    </div>

    {#if generalError}
      <p class="text-red-11 text-sm mb-[-0.5rem]">{generalError}</p>
    {/if}

    <a href="/forgot" class="text-sm text-blue-10 hover:text-blue-11">
      Forgot your password?
    </a>

    <div class="flex flex-row gap-x-2">
      <button id="sign-in" class="bordered-button-indigo flex-grow">Sign in</button>
      <button id="sign-up" class="bordered-button-indigo flex-grow">Sign up</button>
    </div>

    
  </form>

  <div class="divider my-8">OR</div>

  <div class="flex flex-col gap-4">
    <LoginWithLabel href="/api/oauth?provider=google" label="Login with Google">
      <GoogleIcon />
    </LoginWithLabel>

    <!-- <LoginWithLabel href="/" label="Login with Twitter">
      <TwitterIcon />
    </LoginWithLabel> -->
  </div>

</Modal>

<style lang="postcss">

</style>