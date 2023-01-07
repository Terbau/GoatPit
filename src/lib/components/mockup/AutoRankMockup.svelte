<script lang="ts">
	import { sleep, transformImdbImageSize } from "$lib/utils";
	import { onDestroy, onMount } from "svelte";
	import { fade } from "svelte/transition";

  let item1Classes: string;
  let item2Classes: string;

  const items = [
    {
      name: 'Up',
      url: 'https://m.media-amazon.com/images/M/MV5BMTk3NDE2NzI4NF5BMl5BanBnXkFtZTgwNzE1MzEyMTE@._V1_QL75_UX190_CR0,2,190,281_.jpg',
    },
    {
      name: 'Troll',
      url: 'https://m.media-amazon.com/images/M/MV5BOWQzMDc5OTMtMjFiMy00M2I3LWIyZWMtODM4NTRhMGI2ZTRkXkEyXkFqcGdeQXVyNDAxNzcyNw@@._V1_QL75_UX190_CR0,0,190,281_.jpg',
    },
    {
      name: 'Glass Onion',
      url: 'https://m.media-amazon.com/images/M/MV5BYmZlZDZkZjYtNzE5Mi00ODFhLTk2OTgtZWVmODBiZTI4NGFiXkEyXkFqcGdeQXVyMTE5MTg5NDIw._V1_QL75_UX190_CR0,2,190,281_.jpg',
    },
    {
      name: 'Inception',
      url: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX190_CR0,0,190,281_.jpg',
    },
  ]

  const preloadImages = async (urls: string[]): Promise<void> => {
    await Promise.all(
      urls.map((url) => {
        return new Promise((resolve) => {
          const image = new Image();
          image.src = url;
          image.onload = resolve;
        });
      })
    );
  }

  const preloadAllImages = async () => {
    const urls = items.map((item) => transformImdbImageSize(item.url, 100));
    await preloadImages(urls);
  }

  let currentIndex = 0;

  const resetImages = () => {
    item1Classes = "";
    item2Classes = "";
  }

  const runAnimation = async () => {
    if (Math.random() > 0.5) {
      item1Classes = "selected";
      item2Classes = "not-selected";
    } else {
      item1Classes = "not-selected";
      item2Classes = "selected";
    }

    await sleep(1000);
    resetImages();
    currentIndex = (currentIndex + 2) % items.length;
  }

  let interval: NodeJS.Timer;

  onDestroy(() => {
    clearInterval(interval);
    resetImages();
  });  

  onMount(async () => {
    await sleep(2000);
    runAnimation();

    setInterval(runAnimation, 3000);
  });

</script>


<div class="mx-auto flex flex-col items-center justify-center box-border gap-y-5">
  {#await preloadAllImages()}
    <!-- Loading... -->
  {:then}
    <h1 class="font-bold text-xl">Which movie is better?</h1>
    <div class="movie-container flex flex-row">
      <div
        class="movie rounded-l-2xl flex-row {item1Classes}"
      >
        <img transition:fade src={items[currentIndex].url} alt="" />
        <div>
          <h2>{items[currentIndex].name}</h2>
          <p class="text-sm">1000</p>
        </div>
      </div>

      <div class="divider divider-horizontal px-5">Or</div>

      <div
        class="movie rounded-r-2xl flex-row-reverse {item2Classes}"
      >
        <img transition:fade src={items[currentIndex + 1].url} alt="" />
        <div>
          <h2>{items[currentIndex + 1].name}</h2>
          <p class="text-sm">1000</p>
        </div>
      </div>
    </div>
  {/await}
</div>


<style lang="postcss">
  .selected {
		@apply scale-105;
	}

	.not-selected {
		@apply filter blur-[2px] scale-95;
	}

	.movie {
		@apply flex h-32 w-screen max-w-[14rem] min-w-min bg-base-200 overflow-hidden transition duration-500 shadow-2xl;
	}

	.movie > div {
		@apply flex flex-col items-center justify-center grow h-full w-full;
	}

	.movie h2 {
		@apply font-bold text-lg;
	}

	.movie-container img {
		@apply object-fill shrink-0 h-32 w-[5.5rem];
	}
</style>