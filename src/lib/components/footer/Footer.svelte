<script>
	import GithubIcon from "../icons/GithubIcon.svelte";
	import TwitterIcon from "../icons/TwitterIcon.svelte";

</script>
<div class="w-full bg-indigo-4 mt-auto flex flex-col text-indigo-12 box-border p-16 justify-center gap-y-6">
  <div class="flex flex-col text-center">
    <h3 class="font-bold text-[#7a93fa]">Resources provided by</h3>
    <div class="flex flex-row justify-center gap-x-4">
      <a href="https://icons8.com" class="">Icons8</a>
      <a href="https://fontawesome.com/">Font Awesome</a>
      <a href="https://www.flaticon.com/">flaticon</a>
      <a href="https://imdb.com">IMDb</a>
    </div>
  </div>

  <div class="icon-container flex flex-col text-center items-center gap-y-1">
    <div class="flex flex-row gap-x-2 items-center">
      <a href="https://github.com/terbau">
        <GithubIcon />
      </a>

      <a href="https://twitter.com/terbau">
        <TwitterIcon />
      </a>
    </div>

  </div>
  
</div>

<style lang="postcss">
  a {
    @apply text-indigo-11 hover:underline;
  }

  .icon-container a {
    @apply h-10 w-10;
  }

</style>