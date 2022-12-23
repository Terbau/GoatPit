<script lang="ts">
	import WarningIcon from "../icons/WarningIcon.svelte";
	import BaseAlert from "./BaseAlert.svelte";

  export let message: string;
  export let id: number;
</script>

<BaseAlert
  class="alert-warning"
  message={message}
  id={id}
>
  <div class="stroke-current flex-shrink-0 h-6 w-6">
    <WarningIcon />
  </div>
</BaseAlert>
