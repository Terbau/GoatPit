<script>
  export let color = "indigo";

</script>

<button 
  class={`px-8 py-2 rounded-md text-${color}-11
         border border-solid border-${color}-7 hover:border-${color}-8`}
  on:click
>
  <slot></slot>
</button>