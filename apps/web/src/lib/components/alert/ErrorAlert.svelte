<script lang="ts">
	import { removeAlert } from "$lib/stores/alert";
	import { scale } from "svelte/transition";
	import ErrorIcon from "../icons/ErrorIcon.svelte";
	import BaseAlert from "./BaseAlert.svelte";

  export let message: string;
  export let id: number;
</script>

<BaseAlert
  class="alert-error"
  message={message}
  id={id}
>
  <div class="stroke-current flex-shrink-0 h-6 w-6">
    <ErrorIcon />
  </div>
</BaseAlert>