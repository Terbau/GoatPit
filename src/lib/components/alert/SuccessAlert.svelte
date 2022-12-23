<script lang="ts">
	import SuccessIcon from "../icons/SuccessIcon.svelte";
	import BaseAlert from "./BaseAlert.svelte";

  export let message: string;
  export let id: number;
</script>

<BaseAlert
  class="alert-success"
  message={message}
  id={id}
>
  <div class="stroke-current flex-shrink-0 h-6 w-6">
    <SuccessIcon />
  </div>
</BaseAlert>
