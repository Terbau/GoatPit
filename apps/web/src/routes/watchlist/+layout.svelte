<script lang="ts">
	import { watchlistItemIsHighlighted } from '$lib/stores/watchlist';
</script>

<button
	class="z-20 fixed h-screen w-screen bg-black/80 inset-x-0 inset-y-0 {$watchlistItemIsHighlighted
		? ''
		: 'invisible'}"
  on:click|self="{() => {
    watchlistItemIsHighlighted.set(false);
  }}"
/>
<slot />
