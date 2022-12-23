<script lang="ts">
  export let href: string;
</script>

<a class="px-2 py-2 hover:text-indigo-11" href="{href}">
  <slot />
</a>