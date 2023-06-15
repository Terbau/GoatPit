<!-- <div class="mockup-window border border-blue-9 bg-black/20 w-[22rem] h-[14rem] md:w-[40rem] md:h-[20rem] flex flex-col shrink-0">
  <div class="flex px-4 bg-black/20 grow">
    <slot />
  </div>
</div> -->

<div class="border border-blue-9 w-[22rem] h-[14rem] md:w-[40rem] md:h-[20rem] flex flex-col shrink-0 rounded-xl">
  <div class="px-5 w-full h-12 bg-black/10 flex flex-row gap-x-3 items-center z-[2] shrink-0">
    <div class="circle bg-red-10"></div>
    <div class="circle bg-orange-11"></div> 
    <div class="circle bg-green-10"></div>
  </div>
  <div class="flex w-full grow bg-black/30 overflow-y-hidden">
    <slot />
  </div>
</div>

<style lang="postcss">
  .circle {
    @apply w-3 h-3 rounded-full opacity-80;
    
  }
</style>