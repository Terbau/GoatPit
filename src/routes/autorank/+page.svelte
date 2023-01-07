<script lang="ts">

</script>

<div class="mx-auto mt-16 mb-32 w-3/5 flex flex-col items-center gap-y-20">
  <h1 class="text-4xl blue-gradient-text font-bold text-center">AutoRank</h1>
  <div class="text-container flex flex-row w-full justify-evenly">
    <div>
      <h2 class="blue-gradient-text">Why?</h2>
      <p>Do you find rating and ranking movies boring? Well, you aren't alone. It's often difficult to truly rate movies by giving them a fixed score, and - at least in my opinion - its often even harder to decide which movies should be at the top, and which ones should be at the bottom. AutoRank solves this problem </p>
    </div>

    <div>
      <h2 class="blue-gradient-text">How?</h2>
      <p>Despite its name, AutoRank isn't really... auto. It's more of a fun game that sets two movies up against each other. All you do is decide which one you think is better based on a given common factor. Over time, AutoRank can accurately rank these movies for you using an ELO algorithm.</p>
    </div>
  </div>

  <div class="flex flex-col gap-y-3 items-center">
    <!-- <h2 class="text-xl font-bold">Want to try out AutoRank?</h2> -->
    <a href="/autorank/setup" class="rounded-lg px-6 py-4 bg-blue-9 text-md w-fit hover:bg-blue-10 active:bg-indigo-10">Try out AutoRank</a>
  </div>
</div>

<style lang="postcss">
  .text-container > div {
    @apply flex flex-col items-center gap-y-2 w-[21rem] text-center;
  }

  .text-container > div > h2 {
    @apply text-2xl font-bold;
  }

  .text-container > div > p {
    
  }

</style>