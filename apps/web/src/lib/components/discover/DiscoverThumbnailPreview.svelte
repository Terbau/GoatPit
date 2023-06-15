<script lang="ts">
  let imagesLinks: string[] | null = null;
</script>

<div class="">
  {#if !imagesLinks}
    <div class="h-16 w-12 skeleton-bar rounded-none"></div>
  {/if}
</div>