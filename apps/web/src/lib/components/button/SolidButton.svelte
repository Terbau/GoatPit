<script>
  export let color = "indigo";
  export let darkText = false;

  let clazz = "";
  export { clazz as class };
</script>

<button 
  class={`px-8 py-2 rounded-md text-${color}-${darkText ? '1' : '12'}
          bg-${color}-9 hover:bg-${color}-10
          ${clazz}`}
  on:click
>
  <slot></slot>
</button>