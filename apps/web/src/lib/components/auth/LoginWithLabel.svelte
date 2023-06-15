<script lang="ts">
  export let label: string;
  export let href: string;
</script>

<a 
  href={href}
  class="flex flex-row px-6 py-2 items-center gap-4
         border border-solid border-indigo-8 hover:border-indigo-9 rounded-xl
         cursor-pointer text-indigo-11 h-16">
  <div class="">
    <slot />
  </div>
  <p class="ml-1">{label}</p>
</a>