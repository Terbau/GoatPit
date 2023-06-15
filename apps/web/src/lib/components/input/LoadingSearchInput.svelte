<script>
	import SearchIcon from "../icons/SearchIcon.svelte";
  import Spinner from "../icons/Spinner.svelte";
	import RightIconTextInput from "./RightIconTextInput.svelte";

  export let value = "";
  export let props = {};
  export let loading = false;

</script>

<RightIconTextInput
  value={value}
  props={props}
  on:input
  on:focusin
  on:focusout
>
  {#if loading}
    <Spinner animated />
  {:else}
    <SearchIcon />
  {/if}

</RightIconTextInput>