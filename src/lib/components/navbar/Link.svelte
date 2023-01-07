<script lang="ts">
  export let href: string;
</script>

<a class="px-2 py-2 hover:text-blue-11 flex gap-x-1" href="{href}">
  <slot />
</a>