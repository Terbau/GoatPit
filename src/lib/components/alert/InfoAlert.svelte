<script lang="ts">
	import { removeAlert } from "$lib/stores/alert";
	import { scale } from "svelte/transition";
	import InfoIcon from "../icons/InfoIcon.svelte";
	import BaseAlert from "./BaseAlert.svelte";

  export let message: string;
  export let id: number;
</script>

<BaseAlert
  class="alert-info"
  message={message}
  id={id}
>
  <div class="stroke-current flex-shrink-0 h-6 w-6">
    <InfoIcon />
  </div>
</BaseAlert>
