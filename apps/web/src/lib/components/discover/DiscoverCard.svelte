<script lang="ts">
	import ProfileIcon from "../icons/ProfileIcon.svelte";
	import DiscoverThumbnailPreview from "./DiscoverThumbnailPreview.svelte";

</script>

<div class="bg-indigo-7 h-72 w-56 rounded-lg p-4 gap-y-12 cursor-pointer
            border border-transparent hover:border-indigo-10 border-solid shrink-0">
  <div class="flex items-center gap-x-2">
    <div class="h-10 w-10 rounded-full shrink-0">
      <ProfileIcon />
    </div>
    <h2 class="text-lg font-bold whitespace-nowrap truncate">Terbau</h2>
  </div>
  <div class="flex mt-4">
    <div>
      <p>My watchlist</p>
      <div class="grid grid-cols-2 gap-1">
        <DiscoverThumbnailPreview />
        <DiscoverThumbnailPreview />
        <DiscoverThumbnailPreview />
        <DiscoverThumbnailPreview />
      </div>
    </div>
  </div>
</div>