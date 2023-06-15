<script lang="ts">
  import InfoIcon from "../icons/InfoIcon.svelte";

  let clazz = "";
  export { clazz as class };
  export let label: string;

</script>

<span data-tip={label} class="tooltip tooltip-info text-blue-11 stroke-current {clazz}">
  <InfoIcon />
</span>